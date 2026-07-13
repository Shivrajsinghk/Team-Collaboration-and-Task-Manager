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
    }
]
