import { httpClient } from './httpClient'
import type { PageResponse } from '../types/user'
import type {
    CreateTaskRequest,
    TaskListItemResponse,
    TaskResponse,
} from '../types/task'

type TasksApiResponse = PageResponse<TaskListItemResponse> | TaskListItemResponse[]

export async function fetchUserTasks(userId: number): Promise<TaskListItemResponse[]> {
    const response = await httpClient.get<TasksApiResponse>(`/api/admin/users/${userId}/tasks`)

    if (Array.isArray(response.data)) {
        return response.data
    }

    return response.data.content
}

export async function createTask(userId: number, request: CreateTaskRequest): Promise<TaskResponse> {
    const response = await httpClient.post<TaskResponse>(
        `/api/admin/users/${userId}/tasks`,
        request,
    )

    return response.data
}

export async function removeTask(taskId: number): Promise<void> {
    await httpClient.delete(`/api/admin/tasks/${taskId}`)
}