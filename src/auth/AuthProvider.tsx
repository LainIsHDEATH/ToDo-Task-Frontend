import { useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './authContext'
import { getAccessToken, removeAccessToken, saveAccessToken } from './authTokenStorage'

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken())

    function login(newAccessToken: string) {
        saveAccessToken(newAccessToken)
        setAccessToken(newAccessToken)
    }

    function logout() {
        removeAccessToken()
        setAccessToken(null)
    }

    const value = useMemo<AuthContextValue>(
        () => ({
            accessToken,
            isAuthenticated: Boolean(accessToken),
            login,
            logout,
        }),
        [accessToken],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}