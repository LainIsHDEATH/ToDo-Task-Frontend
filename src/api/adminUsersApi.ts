import type { PageRequestParams } from './pagination'
import { DEFAULT_PAGE_REQUEST, toPageResponse } from './pagination'
import { httpClient } from './httpClient'
import type {
    PageResponse,
    UpdateUserRequest,
    UserResponse,
} from '../types/user'

type AdminUsersResponse = PageResponse<UserResponse> | UserResponse[]

export async function fetchAdminUsers(
    params: PageRequestParams = DEFAULT_PAGE_REQUEST,
): Promise<PageResponse<UserResponse>> {
    const response = await httpClient.get<AdminUsersResponse>('/api/admin/users', {
        params,
    })

    if (Array.isArray(response.data)) {
        return toPageResponse(response.data, params)
    }

    return response.data
}

export async function fetchAdminUserById(userId: number): Promise<UserResponse> {
    const response = await httpClient.get<UserResponse>(`/api/admin/users/${userId}`)

    return response.data
}

export async function updateAdminUser(
    userId: number,
    request: UpdateUserRequest,
): Promise<UserResponse> {
    const response = await httpClient.put<UserResponse>(
        `/api/admin/users/${userId}`,
        request,
    )

    return response.data
}

export async function removeAdminUser(userId: number): Promise<void> {
    await httpClient.delete(`/api/admin/users/${userId}`)
}