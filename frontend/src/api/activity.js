import api from './axios'

export function listTeamActivities(teamId) {
    return api.get(`activity/teams/${teamId}/activities/`)
}

export function listTaskActivities(teamId, taskId) {
    return api.get(`activity/teams/${teamId}/tasks/${taskId}/activities/`)
}
