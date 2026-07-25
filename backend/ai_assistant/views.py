import os, json, traceback
from google import genai
from google.genai import types
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .throttles import AIAssistantThrottle
from .tools import get_overdue_tasks, get_task_priorities, get_team_workload, search_tasks
from .tool_schemas import TOOL_SCHEMAS
from tasks.models import Task
from teams.models import TeamMembership
from django.utils.dateparse import parse_datetime
from google.genai.errors import ClientError

DEFAULT_SUBTASK_TEMPLATES = [
    (
        "Clarify requirements and success criteria",
        "Review the requirements and define what successful completion looks like.",
    ),
    (
        "Prepare resources and dependencies",
        "Gather the required tools, documents, and team members before starting.",
    ),
    (
        "Implement the main work for {task}",
        "Complete the primary work needed to finish the task.",
    ),
    (
        "Review, test, and polish the result",
        "Verify quality, fix issues, and ensure the work meets expectations.",
    ),
]

def get_genai_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)

def build_fallback_subtasks(task_title, task_description=""):
    description_lines = [
        line.strip(" -\t")
        for line in task_description.splitlines()
        if line.strip()
    ]

    subtasks = []
    for line in description_lines[:2]:
        subtasks.append({
            "title": line[:80],
            "description": line,
        })

    for title_template, description in DEFAULT_SUBTASK_TEMPLATES:
        if len(subtasks) >= 4:
            break
        subtasks.append({
        "title": title_template.format(task=task_title.lower()),
        "description": description,
    })

    seen_titles = set()
    unique_subtasks = []
    for item in subtasks:
        title = item["title"].strip()
        if not title:
            continue
        normalized = title.lower()
        if normalized in seen_titles:
            continue
        seen_titles.add(normalized)
        unique_subtasks.append({
            "title": title,
            "description": item.get("description", ""),
        })

    return unique_subtasks[:6]

TOOL_FUNCTIONS = {
    "get_overdue_tasks": get_overdue_tasks,
    "get_task_priorities": get_task_priorities,
    "get_team_workload": get_team_workload,
    "search_tasks": search_tasks,
}

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AIAssistantThrottle])
def ai_query(request):
    user_message = request.data.get("message")
    known_team_id = request.data.get("team_id")
    if not user_message:
        return Response({"error": "message is required"}, status=400)

    client = get_genai_client()
    if client is None:
        return Response({"error": "GEMINI_API_KEY is not configured"}, status=503)

    tools = types.Tool(function_declarations=TOOL_SCHEMAS)

    system_instruction = (
        "You are a team management assistant for a team collaboration app. "
        "Only answer questions related to tasks, deadlines, team activity, and productivity within this app. "
        "If asked about anything unrelated (general knowledge, personal advice, etc.), "
        "politely decline and explain you can only help with tasks and team activity in this workspace. "
        + (f" You are assisting a user inside team {known_team_id}. "
        f"For any tool that requires a team_id, use {known_team_id} unless the user explicitly names a different team."
        if known_team_id is not None else "")
    )

    contents = [user_message]
    MAX_TOOL_CALLS = 4  # hard cap so a confused model can't loop forever / burn quota

    for call_count in range(MAX_TOOL_CALLS + 1):
        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=contents,
                config=types.GenerateContentConfig(
                    tools=[tools],
                    system_instruction=system_instruction
                ),
            )
        except ClientError as exc:
            if exc.code == 429:
                return Response({"error": "AI usage quota exceeded. Please try again later."}, status=429)
            print(f"=== GEMINI CALL FAILED (round {call_count}) ===")
            traceback.print_exc()
            return Response({"error": f"AI request failed: {exc}"}, status=502)
        except Exception as exc:
            print(f"=== GEMINI CALL FAILED (round {call_count}) ===")
            traceback.print_exc()
            return Response({"error": f"AI request failed: {exc}"}, status=502)

        part = response.candidates[0].content.parts[0]

        if not part.function_call:
            final_text = part.text
            if not final_text:
                print("=== GEMINI RETURNED EMPTY TEXT ===")
                return Response({"error": "AI returned an empty response"}, status=502)
            return Response({"answer": final_text})

        # Model wants to call a tool
        if call_count == MAX_TOOL_CALLS:
            print("=== MAX TOOL CALL LIMIT HIT ===")
            return Response(
                {"error": "That request needed too many steps to answer. Try asking one thing at a time."},
                status=502,
            )

        fn_name = part.function_call.name
        fn_args = dict(part.function_call.args)

        if known_team_id is not None and "team_id" in fn_args:
            fn_args["team_id"] = known_team_id

        fn = TOOL_FUNCTIONS.get(fn_name)
        if not fn:
            return Response({"error": f"Unknown tool: {fn_name}"}, status=400)

        try:
            result = fn(requesting_user=request.user, **fn_args)
        except Exception as exc:
            print(f"=== TOOL EXECUTION FAILED ({fn_name}) ===")
            traceback.print_exc()
            return Response({"error": f"Tool execution failed: {exc}"}, status=500)

        # Append this round's model turn + tool result, then loop again
        contents.append(part)
        contents.append(
            types.Part.from_function_response(name=fn_name, response={"result": result})
        )

    # Should be unreachable, but just in case
    return Response({"error": "Unexpected AI response state"}, status=502)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AIAssistantThrottle])
def generate_subtasks(request):
    task_title = request.data.get("title")
    task_description = request.data.get("description", "")

    if not task_title:
        return Response({"error": "title is required"}, status=400)

    client = get_genai_client()
    if client is None:
        return Response(
            {
                "subtasks": build_fallback_subtasks(task_title, task_description),
                "fallback": True,
                "message": "GEMINI_API_KEY is not configured. Using fallback subtasks.",
            }
        )

    prompt = f"""Break down this task into 3-6 concrete, actionable subtasks.
    Task: {task_title}
    Description: {task_description or "No description provided"}
    Return only the subtasks, ordered logically."""

    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                        },
                        "required": ["title"],
                    },
                },
            ),
        )
    except Exception as exc:
        return Response(
            {
                "subtasks": build_fallback_subtasks(task_title, task_description),
                "fallback": True,
                "message": f"AI request failed. Using fallback subtasks. Details: {exc}",
            }
        )

    try:
        subtasks = json.loads(response.text)
    except (TypeError, json.JSONDecodeError):
        return Response(
            {
                "subtasks": build_fallback_subtasks(task_title, task_description),
                "fallback": True,
                "message": "AI returned malformed output. Using fallback subtasks.",
            }
        )

    return Response({"subtasks": subtasks})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subtasks(request):
    parent_task_id = request.data.get("parent_task_id")
    subtasks = request.data.get("subtasks", [])

    if not parent_task_id or not subtasks:
        return Response({"error": "parent_task_id and subtasks are required"}, status=400)

    try:
        parent = Task.objects.get(id=parent_task_id)
    except Task.DoesNotExist:
        return Response({"error": "Parent task not found"}, status=404)

    is_member = TeamMembership.objects.filter(
        user=request.user, team_id=parent.team_id
    ).exists()
    if not is_member:
        return Response({"error": "You don't have access to this task"}, status=403)

    if len(subtasks) > 20:
        return Response({"error": "Too many subtasks in one request"}, status=400)

    created = []
    for item in subtasks:
        title = item.get("title", "").strip()
        if not title:
            continue

        due_date = None
        raw_due_date = item.get("due_date")
        if raw_due_date:
            due_date = parse_datetime(raw_due_date)
            if due_date is None:
                return Response(
                    {"error": f"Invalid due_date format for '{title}'"}, status=400
                )

        task = Task.objects.create(
            title=title,
            description=item.get("description", ""),
            team=parent.team,
            parent_task=parent,
            created_by=request.user,
            due_date=due_date,
        )
        created.append({"id": task.id, "title": task.title})

    return Response({"created": created}, status=201)
