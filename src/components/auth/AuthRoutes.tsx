import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { ROUTES } from '../../config/routes'

export function ProtectedRoute() {
    const location = useLocation()
    const { isAuthenticated } = useAuth()

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
    const { isAuthenticated } = useAuth()

    if (isAuthenticated) {
        return <Navigate to={ROUTES.users} replace />
    }

    return <Outlet />
}