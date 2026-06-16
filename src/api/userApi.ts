import { httpClient } from './httpClient'
import type {
    PageResponse,
    UserProfileUpdateRequest,
    UserResponse,
    UserShortResponse,
} from '../types/user'

type UserCatalogResponse = PageResponse<UserShortResponse> | UserShortResponse[]

export async function fetchUserCatalog(): Promise<UserShortResponse[]> {
    const response = await httpClient.get<UserCatalogResponse>('/api/users')

    if (Array.isArray(response.data)) {
        return response.data
    }

    return response.data.content
}

export async function fetchCurrentUser(): Promise<UserResponse> {
    const response = await httpClient.get<UserResponse>('/api/users/me')

    return response.data
}

export async function updateCurrentUser(
    request: UserProfileUpdateRequest,
): Promise<UserResponse> {
    const response = await httpClient.put<UserResponse>('/api/users/me', request)

    return response.data
}

export async function deleteCurrentUser(): Promise<void> {
    await httpClient.delete('/api/users/me')
}

export async function fetchPublicUserById(userId: number): Promise<UserShortResponse> {
    const response = await httpClient.get<UserShortResponse>(`/api/users/${userId}`)

    return response.data
}