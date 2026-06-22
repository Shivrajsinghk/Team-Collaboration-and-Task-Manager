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

export function list_notifications() {
    return api.get(`sockets/notifications/`);
}

export function mark_notification_read(notificationId) {
    return api.patch(`sockets/notifications/${notificationId}/`);
}

const markAsSeen = async (conversationId) => {
    await api.post(`sockets/conversation/${conversationId}/mark-read/`)
    socket.send(JSON.stringify({ type: 'seen' }))
}