import api from "./axios";

export function listTeams() {
    return api.get("teams/");
}

export function getTeam(teamId) {
    return api.get(`teams/${teamId}`);
}

export function createTeam(data) {
    return api.post("teams/create/", data);
}

export function updateTeam(teamId, data) {
    return api.patch(`teams/${teamId}/update/`, data);
}

export function deleteTeam(teamId) {
    return api.delete(`teams/${teamId}/delete/`);
}

export function joinTeam(data) {
    return api.post("teams/join/", data);
}

export function leaveTeam(teamId) {
    return api.delete(`teams/${teamId}/leave/`);
}

export function removeUserFromTeam(teamId, userId) {
    return api.delete(`teams/${teamId}/remove-user/${userId}`);
}

export function promoteMember(teamId, userId) {
    return api.patch(`teams/${teamId}/promote/${userId}`);
}

export function demoteMember(teamId, userId) {
    return api.patch(`teams/${teamId}/demote/${userId}`);
}

export function listMembers(teamId) {
    return api.get(`teams/${teamId}/members`);
}

export function getMemberDetails(teamId, memberId) {
    return api.get(`teams/${teamId}/members/${memberId}`);
}

export function teamChats(teamId) {
    return api.get(`sockets/${teamId}/chats/`);
}

export function uploadTeamChatAttachment(teamId, data) {
    return api.post(`sockets/${teamId}/chats/upload/`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}
