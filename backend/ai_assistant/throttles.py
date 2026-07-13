from rest_framework.throttling import UserRateThrottle

class AIAssistantThrottle(UserRateThrottle):
    scope = 'ai_assistant'