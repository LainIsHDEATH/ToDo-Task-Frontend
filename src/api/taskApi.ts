import type { PageRequestParams } from './pagination'
import { DEFAULT_PAGE_REQUEST, toPageResponse } from './pagination'
import { httpClient } from './httpClient'
import type { PageResponse } from '../types/user'
import type {
    CreateTaskRequest,
    TaskListItemResponse,
    TaskResponse,
    UpdateTaskRequest,
} from '../types/task'

type TasksResponse = PageResponse<TaskListItemResponse> | TaskListItemResponse[]

export async function fetchMyTasks(
    params: PageRequestParams = DEFAULT_PAGE_REQUEST,
): Promise<PageResponse<TaskListItemResponse>> {
    const response = await httpClient.get<TasksResponse>('/api/tasks', {
        params,
    })

    if (Array.isArray(response.data)) {
        return toPageResponse(response.data, params)
    }

    return response.data
}

export async function createMyTask(request: CreateTaskRequest): Promise<TaskResponse> {
    const response = await httpClient.post<TaskResponse>('/api/tasks', request)

    return response.data
}

export async function fetchMyTaskById(taskId: number): Promise<TaskResponse> {
    const response = await httpClient.get<TaskResponse>(`/api/tasks/${taskId}`)

    return response.data
}

export async function updateMyTask(
    taskId: number,
    request: UpdateTaskRequest,
): Promise<TaskResponse> {
    const response = await httpClient.put<TaskResponse>(`/api/tasks/${taskId}`, request)

    return response.data
}

export async function removeMyTask(taskId: number): Promise<void> {
    await httpClient.delete(`/api/tasks/${taskId}`)
}