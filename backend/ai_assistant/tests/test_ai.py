from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from teams.models import Team, TeamMembership
from tasks.models import Task

from ai_assistant.tools import (
    get_overdue_tasks,
    get_task_priorities,
    get_team_workload,
    search_tasks,
    _compute_priority_score,
)


class AIToolTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="user",
            password="password123"
        )

        self.member = User.objects.create_user(
            username="member",
            password="password123"
        )

        self.outsider = User.objects.create_user(
            username="outsider",
            password="password123"
        )

        self.team = Team.objects.create(
            name="Backend",
            description="Backend Team",
            created_by=self.user
        )

        TeamMembership.objects.create(
            user=self.user,
            team=self.team,
            role="admin"
        )

        TeamMembership.objects.create(
            user=self.member,
            team=self.team,
            role="member"
        )

    def create_task(
        self,
        title,
        status="todo",
        priority="medium",
        due_date=None,
        created_by=None,
        assigned_to=None,
        parent_task=None,
        description=""
    ):
        task = Task.objects.create(
            title=title,
            description=description,
            team=self.team,
            created_by=created_by or self.user,
            status=status,
            priority=priority,
            due_date=due_date,
            parent_task=parent_task,
        )

        if assigned_to:
            task.assigned_to.add(assigned_to)

        return task

    # ---------------------------------------------------------
    # get_overdue_tasks
    # ---------------------------------------------------------

    def test_get_overdue_tasks_rejects_non_member(self):
        result = get_overdue_tasks(
            self.team.id,
            self.outsider
        )

        self.assertEqual(
            result,
            {"error": "You don't have access to this team."}
        )

    def test_get_overdue_tasks_returns_overdue_tasks(self):
        overdue = self.create_task(
            title="Fix API",
            due_date=timezone.now() - timedelta(days=2),
            priority="high",
            assigned_to=self.member,
        )

        self.create_task(
            title="Future Task",
            due_date=timezone.now() + timedelta(days=2),
        )

        result = get_overdue_tasks(
            self.team.id,
            self.user
        )

        self.assertEqual(result["count"], 1)
        self.assertEqual(result["tasks"][0]["title"], "Fix API")
        self.assertEqual(
            result["tasks"][0]["assigned_to"],
            ["member"]
        )
        self.assertEqual(
            result["tasks"][0]["priority"],
            "high"
        )

    def test_get_overdue_tasks_excludes_completed_tasks(self):
        self.create_task(
            title="Completed Task",
            status="done",
            due_date=timezone.now() - timedelta(days=2),
        )

        result = get_overdue_tasks(
            self.team.id,
            self.user
        )

        self.assertEqual(result["count"], 0)
        self.assertEqual(result["tasks"], [])

    def test_get_overdue_tasks_marks_unassigned_tasks(self):
        self.create_task(
            title="Unassigned Task",
            due_date=timezone.now() - timedelta(days=1),
        )

        result = get_overdue_tasks(
            self.team.id,
            self.user
        )

        self.assertEqual(
            result["tasks"][0]["assigned_to"],
            ["Unassigned"]
        )

    # ---------------------------------------------------------
    # _compute_priority_score
    # ---------------------------------------------------------

    def test_priority_score_overdue_task(self):
        task = self.create_task(
            title="Overdue",
            due_date=timezone.now() - timedelta(days=2),
            priority="high",
        )

        score = _compute_priority_score(
            task,
            timezone.now()
        )

        self.assertEqual(score, 100)

    def test_priority_score_due_within_one_day(self):
        now = timezone.now()

        task = self.create_task(
            title="Urgent",
            due_date=now + timedelta(hours=12),
            priority="high",
        )

        score = _compute_priority_score(task, now)

        self.assertEqual(score, 89)

    def test_priority_score_in_progress_bonus(self):
        now = timezone.now()

        task = self.create_task(
            title="In Progress",
            status="in_progress",
            due_date=now + timedelta(days=10),
            priority="low",
        )

        score = _compute_priority_score(task, now)

        self.assertEqual(score, 14)

    def test_priority_score_far_future_low_priority(self):
        now = timezone.now()

        task = self.create_task(
            title="Future",
            due_date=now + timedelta(days=30),
            priority="low",
        )

        score = _compute_priority_score(task, now)

        self.assertEqual(score, 9)

    # ---------------------------------------------------------
    # get_task_priorities
    # ---------------------------------------------------------

    def test_get_task_priorities_rejects_non_member(self):
        result = get_task_priorities(
            self.team.id,
            self.outsider
        )

        self.assertEqual(
            result,
            {"error": "You don't have access to this team."}
        )

    def test_get_task_priorities_excludes_done_tasks(self):
        self.create_task(
            title="Done",
            status="done",
            due_date=timezone.now() + timedelta(days=1),
        )

        self.create_task(
            title="Active",
            status="todo",
            due_date=timezone.now() + timedelta(days=1),
        )

        result = get_task_priorities(
            self.team.id,
            self.user
        )

        self.assertEqual(result["count"], 1)
        self.assertEqual(
            result["tasks"][0]["title"],
            "Active"
        )

    def test_get_task_priorities_orders_highest_score_first(self):
        self.create_task(
            title="Low Priority",
            priority="low",
            due_date=timezone.now() + timedelta(days=30),
        )

        self.create_task(
            title="High Priority",
            priority="high",
            due_date=timezone.now() - timedelta(days=1),
        )

        result = get_task_priorities(
            self.team.id,
            self.user
        )

        self.assertEqual(
            result["tasks"][0]["title"],
            "High Priority"
        )

    # ---------------------------------------------------------
    # get_team_workload
    # ---------------------------------------------------------

    def test_get_team_workload_rejects_non_member(self):
        result = get_team_workload(
            self.team.id,
            self.outsider
        )

        self.assertEqual(
            result,
            {"error": "You don't have access to this team."}
        )

    def test_get_team_workload_counts_tasks_by_member(self):
        self.create_task(
            title="Task 1",
            status="todo",
            assigned_to=self.member,
        )

        self.create_task(
            title="Task 2",
            status="in_progress",
            assigned_to=self.member,
        )

        result = get_team_workload(
            self.team.id,
            self.user
        )

        self.assertEqual(
            result["workload_by_member"][0]["member"],
            "member"
        )

        self.assertEqual(
            result["workload_by_member"][0]["todo"],
            1
        )

        self.assertEqual(
            result["workload_by_member"][0]["in_progress"],
            1
        )

        self.assertEqual(
            result["workload_by_member"][0]["total_active"],
            2
        )

        self.assertFalse(
            result["workload_by_member"][0]["overloaded"]
        )

    def test_get_team_workload_counts_unassigned_tasks(self):
        self.create_task(
            title="Unassigned",
            status="todo",
        )

        result = get_team_workload(
            self.team.id,
            self.user
        )

        self.assertEqual(
            result["unassigned_tasks"],
            1
        )

    def test_get_team_workload_excludes_done_tasks(self):
        self.create_task(
            title="Done",
            status="done",
            assigned_to=self.member,
        )

        result = get_team_workload(
            self.team.id,
            self.user
        )

        self.assertEqual(
            result["workload_by_member"],
            []
        )

    def test_get_team_workload_flags_overloaded_member(self):
        for i in range(6):
            self.create_task(
                title=f"Task {i}",
                status="todo",
                assigned_to=self.member,
            )

        result = get_team_workload(
            self.team.id,
            self.user
        )

        workload = result["workload_by_member"][0]

        self.assertEqual(
            workload["total_active"],
            6
        )

        self.assertTrue(
            workload["overloaded"]
        )

    # ---------------------------------------------------------
    # search_tasks
    # ---------------------------------------------------------

    def test_search_tasks_returns_only_user_team_tasks(self):
        other_team = Team.objects.create(
            name="Frontend",
            description="Frontend Team",
            created_by=self.outsider
        )

        TeamMembership.objects.create(
            user=self.outsider,
            team=other_team,
            role="admin"
        )

        self.create_task(
            title="Backend API",
            description="Build REST API",
        )

        Task.objects.create(
            title="Frontend UI",
            description="React work",
            team=other_team,
            created_by=self.outsider,
        )

        result = search_tasks(
            self.user,
            query=""
        )

        self.assertEqual(result["count"], 1)
        self.assertEqual(
            result["tasks"][0]["title"],
            "Backend API"
        )

    def test_search_tasks_filters_by_query(self):
        self.create_task(
            title="Build Authentication",
            description="JWT implementation",
        )

        self.create_task(
            title="Fix Dashboard",
            description="Charts and analytics",
        )

        result = search_tasks(
            self.user,
            query="authentication"
        )

        self.assertEqual(result["count"], 1)
        self.assertEqual(
            result["tasks"][0]["title"],
            "Build Authentication"
        )

    def test_search_tasks_searches_description(self):
        self.create_task(
            title="Backend Work",
            description="Implement JWT authentication",
        )

        result = search_tasks(
            self.user,
            query="JWT"
        )

        self.assertEqual(result["count"], 1)

    def test_search_tasks_filters_by_status(self):
        self.create_task(
            title="Todo Task",
            status="todo",
        )

        self.create_task(
            title="Active Task",
            status="in_progress",
        )

        result = search_tasks(
            self.user,
            status="in_progress"
        )

        self.assertEqual(result["count"], 1)
        self.assertEqual(
            result["tasks"][0]["title"],
            "Active Task"
        )

    def test_search_tasks_filters_by_priority(self):
        self.create_task(
            title="High Priority",
            priority="high",
        )

        self.create_task(
            title="Low Priority",
            priority="low",
        )

        result = search_tasks(
            self.user,
            priority="high"
        )

        self.assertEqual(result["count"], 1)
        self.assertEqual(
            result["tasks"][0]["title"],
            "High Priority"
        )

    def test_search_tasks_rejects_non_member_team(self):
        result = search_tasks(
            self.outsider,
            team_id=self.team.id
        )

        self.assertEqual(
            result,
            {"error": "You don't have access to this team."}
        )

    def test_search_tasks_filters_by_team(self):
        second_team = Team.objects.create(
            name="Frontend",
            description="Frontend",
            created_by=self.user,
        )

        TeamMembership.objects.create(
            user=self.user,
            team=second_team,
            role="member",
        )

        self.create_task(
            title="Backend Task"
        )

        Task.objects.create(
            title="Frontend Task",
            team=second_team,
            created_by=self.user,
        )

        result = search_tasks(
            self.user,
            team_id=second_team.id
        )

        self.assertEqual(result["count"], 1)
        self.assertEqual(
            result["tasks"][0]["title"],
            "Frontend Task"
        )


class AIFallbackTests(TestCase):

    def test_build_fallback_subtasks_uses_description_lines(self):
        from ai_assistant.views import build_fallback_subtasks

        result = build_fallback_subtasks(
            "Build Authentication",
            """
            - Define API requirements
            - Implement JWT authentication
            """
        )

        self.assertGreaterEqual(len(result), 2)

        self.assertEqual(
            result[0]["title"],
            "Define API requirements"
        )

        self.assertEqual(
            result[1]["title"],
            "Implement JWT authentication"
        )

    def test_build_fallback_subtasks_creates_default_templates(self):
        from ai_assistant.views import build_fallback_subtasks

        result = build_fallback_subtasks(
            "Build Dashboard"
        )

        self.assertGreaterEqual(len(result), 4)
        self.assertLessEqual(len(result), 6)

    def test_build_fallback_subtasks_removes_duplicate_titles(self):
        from ai_assistant.views import build_fallback_subtasks

        result = build_fallback_subtasks(
            "Build API",
            """
            Build API
            Build API
            """
        )

        titles = [
            item["title"].lower()
            for item in result
        ]

        self.assertEqual(
            len(titles),
            len(set(titles))
        )


class AIAssistantAdvancedTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="user",
            password="password123"
        )

        self.member = User.objects.create_user(
            username="member",
            password="password123"
        )

        self.team = Team.objects.create(
            name="Backend",
            description="Demo",
            created_by=self.user
        )

        TeamMembership.objects.create(
            user=self.user,
            team=self.team,
            role="admin"
        )

        TeamMembership.objects.create(
            user=self.member,
            team=self.team,
            role="member"
        )

        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "user",
                "password": "password123"
            }
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )

    # ---------------------------------------------------------
    # ai_query
    # ---------------------------------------------------------

    @patch("ai_assistant.views.get_genai_client")
    def test_ai_query_success(self, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        part = SimpleNamespace(
            function_call=None,
            text="You have 3 active tasks."
        )

        response = SimpleNamespace(
            candidates=[
                SimpleNamespace(
                    content=SimpleNamespace(
                        parts=[part]
                    )
                )
            ]
        )

        mock_client.models.generate_content.return_value = response

        result = self.client.post(
            reverse("ai_query"),
            {"message": "How many active tasks do I have?"},
            format="json"
        )

        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.data["answer"],
            "You have 3 active tasks."
        )

    @patch("ai_assistant.views.get_genai_client")
    def test_ai_query_empty_ai_response(self, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        part = SimpleNamespace(
            function_call=None,
            text=""
        )

        mock_client.models.generate_content.return_value = (
            SimpleNamespace(
                candidates=[
                    SimpleNamespace(
                        content=SimpleNamespace(
                            parts=[part]
                        )
                    )
                ]
            )
        )

        response = self.client.post(
            reverse("ai_query"),
            {"message": "Hello"},
            format="json"
        )

        self.assertEqual(response.status_code, 502)

    @patch("ai_assistant.views.get_genai_client")
    def test_ai_query_generic_ai_error(self, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        mock_client.models.generate_content.side_effect = Exception(
            "Gemini unavailable"
        )

        response = self.client.post(
            reverse("ai_query"),
            {"message": "Hello"},
            format="json"
        )

        self.assertEqual(response.status_code, 502)
        self.assertIn(
            "AI request failed",
            response.data["error"]
        )

    @patch("ai_assistant.views.get_genai_client")
    def test_ai_query_unknown_tool(self, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        function_call = SimpleNamespace(
            name="unknown_tool",
            args={}
        )

        part = SimpleNamespace(
            function_call=function_call,
            text=None
        )

        mock_client.models.generate_content.return_value = (
            SimpleNamespace(
                candidates=[
                    SimpleNamespace(
                        content=SimpleNamespace(
                            parts=[part]
                        )
                    )
                ]
            )
        )

        response = self.client.post(
            reverse("ai_query"),
            {
                "message": "Do something strange"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn(
            "Unknown tool",
            response.data["error"]
        )

    @patch("ai_assistant.views.get_genai_client")
    @patch("ai_assistant.views.TOOL_FUNCTIONS")
    def test_ai_query_tool_execution_error(
        self,
        mock_tools,
        mock_get_client
    ):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        mock_tools.get.return_value = MagicMock(
            side_effect=Exception("Tool failed")
        )

        function_call = SimpleNamespace(
            name="get_overdue_tasks",
            args={"team_id": self.team.id}
        )

        part = SimpleNamespace(
            function_call=function_call,
            text=None
        )

        mock_client.models.generate_content.return_value = (
            SimpleNamespace(
                candidates=[
                    SimpleNamespace(
                        content=SimpleNamespace(
                            parts=[part]
                        )
                    )
                ]
            )
        )

        response = self.client.post(
            reverse("ai_query"),
            {
                "message": "Show overdue tasks"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 500)
        self.assertIn(
            "Tool execution failed",
            response.data["error"]
        )

    # ---------------------------------------------------------
    # generate_subtasks
    # ---------------------------------------------------------

    @patch("ai_assistant.views.get_genai_client")
    def test_generate_subtasks_success(self, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.models.generate_content.return_value = SimpleNamespace(
            text='[{"title": "Design API", "description": "Create endpoints"}, '
                '{"title": "Write tests", "description": "Add test coverage"}]'
        )
        response = self.client.post(
            reverse("generate_subtasks"),
            {
                "title": "Build Backend",
                "description": "Create the backend API"
            },
            format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("fallback", response.data)
        self.assertEqual(len(response.data["subtasks"]), 2)

    @patch("ai_assistant.views.get_genai_client")
    def test_generate_subtasks_ai_failure_uses_fallback(
        self,
        mock_get_client
    ):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        mock_client.models.generate_content.side_effect = Exception(
            "Gemini failed"
        )
        response = self.client.post(
            reverse("generate_subtasks"),
            {
                "title": "Build Backend"
            },
            format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["fallback"])
        self.assertGreater(
            len(response.data["subtasks"]),
            0
        )

    @patch("ai_assistant.views.get_genai_client")
    def test_generate_subtasks_malformed_json_uses_fallback(
        self,
        mock_get_client
    ):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        mock_client.models.generate_content.return_value = (
            SimpleNamespace(
                text="not valid json"
            )
        )

        response = self.client.post(
            reverse("generate_subtasks"),
            {
                "title": "Build Backend"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["fallback"])

    # ---------------------------------------------------------
    # create_subtasks
    # ---------------------------------------------------------

    def test_create_subtasks_skips_empty_titles(self):
        parent = Task.objects.create(
            title="Parent Task",
            description="Parent",
            team=self.team,
            created_by=self.user
        )

        response = self.client.post(
            reverse("ai-create-subtasks"),
            {
                "parent_task_id": parent.id,
                "subtasks": [
                    {"title": ""},
                    {"title": "Valid Task"},
                ]
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)

        self.assertEqual(
            Task.objects.filter(
                parent_task=parent
            ).count(),
            1
        )

        self.assertEqual(
            response.data["created"][0]["title"],
            "Valid Task"
        )

    def test_create_subtasks_with_due_date(self):
        parent = Task.objects.create(
            title="Parent Task",
            description="Parent",
            team=self.team,
            created_by=self.user
        )

        response = self.client.post(
            reverse("ai-create-subtasks"),
            {
                "parent_task_id": parent.id,
                "subtasks": [
                    {
                        "title": "API",
                        "description": "Build API",
                        "due_date": "2026-09-01T12:00:00Z"
                    }
                ]
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)

        subtask = Task.objects.get(
            parent_task=parent
        )

        self.assertEqual(
            subtask.title,
            "API"
        )

        self.assertIsNotNone(
            subtask.due_date
        )

    def test_create_subtasks_requires_parent_and_subtasks(self):
        response = self.client.post(
            reverse("ai-create-subtasks"),
            {},
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_create_subtasks_requires_authentication(self):
        self.client.credentials()

        response = self.client.post(
            reverse("ai-create-subtasks"),
            {
                "parent_task_id": 1,
                "subtasks": [{"title": "API"}]
            },
            format="json"
        )

        self.assertEqual(response.status_code, 403)
