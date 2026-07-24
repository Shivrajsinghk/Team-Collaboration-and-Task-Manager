TOOL_SCHEMAS = [
    {
        "name": "get_overdue_tasks",
        "description": "Get overdue tasks for a specific team, including who they're assigned to and their priority.",
        "parameters": {
            "type": "object",
            "properties": {
                "team_id": {
                    "type": "integer",
                    "description": "The ID of the team to check"
                }
            },
            "required": ["team_id"]
        }
    },

    {
        "name": "get_task_priorities",
        "description": "Get all non-completed tasks for a team ranked by urgency, factoring in due date, user-assigned priority, and status.",
        "parameters": {
            "type": "object",
            "properties": {
                "team_id": {
                    "type": "integer",
                    "description": "The ID of the team to check"
                }
            },
            "required": ["team_id"]
        }
    },

    {
        "name": "get_team_workload",
        "description": "Get the current task workload per team member, showing active (non-done) task counts by status and flagging members who may be overloaded.",
        "parameters": {
            "type": "object",
            "properties": {
                "team_id": {
                    "type": "integer",
                    "description": "The ID of the team to check"
                }
            },
            "required": ["team_id"]
        }
    },

    {
        "name": "search_tasks",
        "description": "Search for tasks by keyword and/or filter by status or priority, across the user's teams or within a specific team. Use this when the user asks to find, look up, or filter tasks by a topic, keyword, status, or priority — not for general 'what's overdue' or 'what should I prioritize' questions, which have their own tools.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Free-text keyword to search in task title, description, or team name. Leave empty to search all tasks matching the other filters."
                },
                "status": {
                    "type": "string",
                    "enum": ["todo", "in_progress", "done"],
                    "description": "Filter by task status"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Filter by task priority"
                },
                "team_id": {
                    "type": "integer",
                    "description": "The ID of the team to restrict the search to. Omit to search across all teams the user belongs to."
                }
            },
            "required": []
        }
    },
]