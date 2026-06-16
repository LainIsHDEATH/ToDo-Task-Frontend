import { httpClient } from './httpClient'
import type {
    PageResponse,
    UpdateUserRequest,
    UserResponse,
} from '../types/user'

type AdminUsersResponse = PageResponse<UserResponse> | UserResponse[]

export async function fetchAdminUsers(): Promise<UserResponse[]> {
    const response = await httpClient.get<AdminUsersResponse>('/api/admin/users')

    if (Array.isArray(response.data)) {
        return response.data
    }

    return response.data.content
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