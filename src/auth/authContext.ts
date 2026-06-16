import { createContext } from 'react'
import type { UserResponse } from '../types/user'

export interface AuthContextValue {
    accessToken: string | null
    currentUser: UserResponse | null
    isAuthenticated: boolean
    isCurrentUserLoading: boolean
    isAdmin: boolean
    login: (accessToken: string) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)