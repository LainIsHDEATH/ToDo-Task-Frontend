import { useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { NAV_ITEMS, ROUTES } from '../../config/routes'

export function AppLayout() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { isAuthenticated, logout } = useAuth()

    function handleLogout() {
        logout()
        queryClient.clear()
        navigate(ROUTES.login)
    }

    return (
        <div className="app-shell">
            <header className="app-header">
                <NavLink className="logo-link" to={ROUTES.home}>
                    Tasks
                </NavLink>

                <nav className="main-navigation" aria-label="Main navigation">
                    {NAV_ITEMS
                        .filter((item) => !item.requiresAuth || isAuthenticated)
                        .map((item) => (
                            <NavLink
                                key={item.path}
                                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                                to={item.path}
                                end={item.path === ROUTES.home}
                            >
                                {item.label}
                            </NavLink>
                        ))}

                    {isAuthenticated ? (
                        <button className="nav-button" type="button" onClick={handleLogout}>
                            Logout
                        </button>
                    ) : (
                        <NavLink
                            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                            to={ROUTES.login}
                        >
                            Login
                        </NavLink>
                    )}
                </nav>
            </header>

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    )
}