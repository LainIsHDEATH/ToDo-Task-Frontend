import { httpClient } from './httpClient'
import type { PageResponse, UserResponse } from '../types/user'

type UsersApiResponse = PageResponse<UserResponse> | UserResponse[]

export async function fetchUsers(): Promise<UserResponse[]> {
    const response = await httpClient.get<UsersApiResponse>('/api/admin/users')

    if (Array.isArray(response.data)) {
        return response.data
    }

    return response.data.content
}

export async function removeUser(userId: number): Promise<void> {
    await httpClient.delete(`/api/admin/users/${userId}`)
}