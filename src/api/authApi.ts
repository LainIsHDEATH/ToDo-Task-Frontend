import { httpClient } from './httpClient'
import type { LoginRequest, LoginResponse } from '../types/auth'
import type { RegisterUserRequest, UserResponse } from '../types/user'

export async function loginUser(request: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/api/auth/login', request)

    return response.data
}

export async function registerUser(request: RegisterUserRequest): Promise<UserResponse> {
    const response = await httpClient.post<UserResponse>('/api/auth/register', request)

    return response.data
}