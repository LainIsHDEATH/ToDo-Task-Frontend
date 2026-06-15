import { httpClient } from './httpClient'
import type { PageResponse } from '../types/user'
import type { TaskListItemResponse } from '../types/task'

type TasksApiResponse = PageResponse<TaskListItemResponse> | TaskListItemResponse[]

export async function fetchUserTasks(userId: number): Promise<TaskListItemResponse[]> {
    const response = await httpClient.get<TasksApiResponse>(`/api/admin/users/${userId}/tasks`)

    if (Array.isArray(response.data)) {
        return response.data
    }

    return response.data.content
}

export async function removeTask(taskId: number): Promise<void> {
    await httpClient.delete(`/api/admin/tasks/${taskId}`)
}