import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { ROUTES } from '../../config/routes'

export function RequireAuth() {
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

export function RequireAdmin() {
    const location = useLocation()
    const { accessToken, isAuthenticated, isCurrentUserLoading, isAdmin } = useAuth()

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

    if (!isAdmin) {
        return <Navigate to={ROUTES.myTasks} replace />
    }

    return <Outlet />
}

export function PublicOnlyRoute() {
    const { accessToken, isAuthenticated, isCurrentUserLoading, isAdmin } = useAuth()

    if (accessToken && isCurrentUserLoading) {
        return <div className="loading-state">Loading profile...</div>
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to={isAdmin ? ROUTES.adminUsers : ROUTES.myTasks}
                replace
            />
        )
    }

    return <Outlet />
}