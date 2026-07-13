import api from './axios'

export function generateSubtasks(data) {
    return api.post('ai/generate-subtasks/', data)
}

export function createSubtasks(data) {
    return api.post('ai/create-subtasks/', data)
}