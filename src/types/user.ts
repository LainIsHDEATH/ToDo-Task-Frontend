export type UserRole = 'USER' | 'ADMIN'

export interface UserResponse {
    id: number
    firstName: string
    lastName: string
    email: string
    role: UserRole
}

export interface RegisterUserRequest {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface UpdateUserRequest {
    firstName: string
    lastName: string
    email: string
    role: UserRole
}

export interface PageResponse<T> {
    content: T[]
    page?: number
    size?: number
    totalElements?: number
    totalPages?: number
    first?: boolean
    last?: boolean
}