import api from "./axios";

export function listTasks(teamId) {
    return api.get(`teams/${teamId}/tasks/`);
}

export function getTask(teamId, taskId) {
    return api.get(`teams/${teamId}/tasks/${taskId}/`);
}

export function createTask(teamId, data) {
    return api.post(`teams/${teamId}/tasks/create/`, data);
}

export function updateTask(teamId, taskId, data) {
    return api.patch(`teams/${teamId}/tasks/${taskId}/update/`, data);
}

export function updateTaskStatus(teamId, taskId, data) {
    return api.patch(`teams/${teamId}/tasks/${taskId}/update/status/`, data);
}

export function deleteTask(teamId, taskId) {
    return api.delete(`teams/${teamId}/tasks/${taskId}/delete/`);
}

export function addMemberToTask(teamId, taskId, memberId) {
    return api.post(`teams/${teamId}/tasks/${taskId}/members/${memberId}/add/`);
}

export function removeMemberFromTask(teamId, taskId, memberId) {
    return api.delete(`teams/${teamId}/tasks/${taskId}/members/${memberId}/remove/`);
}
