import { httpClient } from './httpClient'
import type {
    PageResponse,
    RegisterUserRequest,
    UpdateUserRequest,
    UserResponse,
} from '../types/user'

type UsersApiResponse = PageResponse<UserResponse> | UserResponse[]

export async function fetchUsers(): Promise<UserResponse[]> {
    const response = await httpClient.get<UsersApiResponse>('/api/admin/users')

    if (Array.isArray(response.data)) {
        return response.data
    }

    return response.data.content
}

export async function fetchUserById(userId: number): Promise<UserResponse> {
    const response = await httpClient.get<UserResponse>(`/api/admin/users/${userId}`)

    return response.data
}

export async function registerUser(request: RegisterUserRequest): Promise<UserResponse> {
    const response = await httpClient.post<UserResponse>('/api/auth/register', request)

    return response.data
}

export async function updateUser(userId: number, request: UpdateUserRequest): Promise<UserResponse> {
    const response = await httpClient.put<UserResponse>(`/api/admin/users/${userId}`, request)

    return response.data
}

export async function removeUser(userId: number): Promise<void> {
    await httpClient.delete(`/api/admin/users/${userId}`)
}