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

export async function fetchAdminTasks(
    params: PageRequestParams = DEFAULT_PAGE_REQUEST,
): Promise<PageResponse<TaskListItemResponse>> {
    const response = await httpClient.get<TasksResponse>('/api/admin/tasks', {
        params,
    })

    if (Array.isArray(response.data)) {
        return toPageResponse(response.data, params)
    }

    return response.data
}

export async function fetchAdminUserTasks(
    userId: number,
    params: PageRequestParams = DEFAULT_PAGE_REQUEST,
): Promise<PageResponse<TaskListItemResponse>> {
    const response = await httpClient.get<TasksResponse>(
        `/api/admin/users/${userId}/tasks`,
        {
            params,
        },
    )

    if (Array.isArray(response.data)) {
        return toPageResponse(response.data, params)
    }

    return response.data
}

export async function createAdminUserTask(
    userId: number,
    request: CreateTaskRequest,
): Promise<TaskResponse> {
    const response = await httpClient.post<TaskResponse>(
        `/api/admin/users/${userId}/tasks`,
        request,
    )

    return response.data
}

export async function fetchAdminTaskById(taskId: number): Promise<TaskResponse> {
    const response = await httpClient.get<TaskResponse>(`/api/admin/tasks/${taskId}`)

    return response.data
}

export async function updateAdminTask(
    taskId: number,
    request: UpdateTaskRequest,
): Promise<TaskResponse> {
    const response = await httpClient.put<TaskResponse>(
        `/api/admin/tasks/${taskId}`,
        request,
    )

    return response.data
}

export async function removeAdminTask(taskId: number): Promise<void> {
    await httpClient.delete(`/api/admin/tasks/${taskId}`)
}