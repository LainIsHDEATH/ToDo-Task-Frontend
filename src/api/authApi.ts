import { httpClient } from './httpClient'
import type { LoginRequest, LoginResponse } from '../types/auth'

export async function loginUser(request: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/api/auth/login', request)

    return response.data
}