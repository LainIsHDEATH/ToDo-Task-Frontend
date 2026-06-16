import { httpClient } from './httpClient'
import type { UserResponse } from '../types/user'

export async function fetchCurrentUser(): Promise<UserResponse> {
    const response = await httpClient.get<UserResponse>('/api/users/me')

    return response.data
}