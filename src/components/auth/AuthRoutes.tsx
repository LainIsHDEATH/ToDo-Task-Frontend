import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { ROUTES } from '../../config/routes'

export function ProtectedRoute() {
    const location = useLocation()
    const { accessToken, isAuthenticated, isCurrentUserLoading } = useAuth()

    if (!accessToken) {
        return (
            <Navigate
                to={ROUTES.login}
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    if (isCurrentUserLoading) {
        return <div className="loading-state">Loading profile...</div>
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.login}
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    return <Outlet />
}

export function PublicOnlyRoute() {
    const { accessToken, isAuthenticated, isCurrentUserLoading } = useAuth()

    if (accessToken && isCurrentUserLoading) {
        return <div className="loading-state">Loading profile...</div>
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.users} replace />
    }

    return <Outlet />
}