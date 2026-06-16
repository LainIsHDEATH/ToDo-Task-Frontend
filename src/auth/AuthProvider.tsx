import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setAuthFailureHandler } from '../api/httpClient'
import { fetchCurrentUser } from '../api/userApi'
import { AuthContext, type AuthContextValue } from './authContext'
import { getAccessToken, removeAccessToken, saveAccessToken } from './authTokenStorage'

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const queryClient = useQueryClient()
    const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken())

    const currentUserQuery = useQuery({
        queryKey: ['currentUser'],
        queryFn: fetchCurrentUser,
        enabled: Boolean(accessToken),
        retry: false,
    })

    const clearAuthState = useCallback(() => {
        removeAccessToken()
        setAccessToken(null)
        queryClient.clear()
    }, [queryClient])

    useEffect(() => {
        setAuthFailureHandler(clearAuthState)

        return () => {
            setAuthFailureHandler(null)
        }
    }, [clearAuthState])

    const login = useCallback((newAccessToken: string) => {
        saveAccessToken(newAccessToken)
        setAccessToken(newAccessToken)
    }, [])

    const logout = useCallback(() => {
        clearAuthState()
    }, [clearAuthState])

    const currentUser = accessToken ? currentUserQuery.data ?? null : null
    const isCurrentUserLoading = Boolean(accessToken) && currentUserQuery.isLoading
    const isAuthenticated = Boolean(accessToken) && !currentUserQuery.isError
    const isAdmin = currentUser?.role === 'ADMIN'

    const value = useMemo<AuthContextValue>(
        () => ({
            accessToken,
            currentUser,
            isAuthenticated,
            isCurrentUserLoading,
            isAdmin,
            login,
            logout,
        }),
        [
            accessToken,
            currentUser,
            isAuthenticated,
            isCurrentUserLoading,
            isAdmin,
            login,
            logout,
        ],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}