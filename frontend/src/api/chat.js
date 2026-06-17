import api from "./axios";

export function listConversations() {
    return api.get('sockets/conversations/');
}

export function list_personal_messages(conversationId) {
    return api.get(`sockets/chats/${conversationId}/`);
}

export function uploadPersonalChatAttachment(conversationId, data) {
    return api.post(`sockets/${conversationId}/chats/upload/`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}