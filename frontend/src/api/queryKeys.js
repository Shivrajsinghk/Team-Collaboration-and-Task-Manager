export const authKeys = {
    all: ['auth'],
    me: ['auth', 'me'],
    publicProfile: (username) => ['auth', 'public-profile', username],
    search: (query, filters = {}) => ['auth', 'search', query, filters],
}

export const teamKeys = {
    all: ['teams'],
    list: ['teams', 'list'],
    detail: (teamId) => ['teams', 'detail', teamId],
    members: (teamId) => ['teams', 'members', teamId],
    memberDetail: (teamId, memberId) => ['teams', 'members', teamId, memberId],
    chats: (teamId) => ['teams', 'chats', teamId],
    activities: (teamId) => ['teams', 'activities', teamId],
    membersPresence: (teamId) => ['teams', 'members', teamId, 'presence'],
}

export const taskKeys = {
    all: ['tasks'],
    list: (teamId) => ['tasks', 'list', teamId],
    detail: (teamId, taskId) => ['tasks', 'detail', teamId, taskId],
    activities: (teamId, taskId) => ['tasks', 'activities', teamId, taskId],
}

export const chatKeys = {
    all: ['chat'],
    conversations: ['chat', 'conversations'],
    personalMessages: (conversationId) => ['chat', 'messages', conversationId],
    directConversation: (userId) => ['chat', 'direct-conversation', userId],
}

export const notificationKeys = {
    all: ['notifications'],
    list: ['notifications', 'list'],
}
