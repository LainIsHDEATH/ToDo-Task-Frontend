import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { NAV_ITEMS, ROUTES, type NavItem } from '../../config/routes'

export function AppLayout() {
    const navigate = useNavigate()
    const { isAuthenticated, isAdmin, logout } = useAuth()

    function handleLogout() {
        logout()
        navigate(ROUTES.login)
    }

    function shouldShowNavItem(item: NavItem): boolean {
        if (item.requiresAuth && !isAuthenticated) {
            return false
        }

        if (item.requiresAdmin && !isAdmin) {
            return false
        }

        return true
    }

    return (
        <div className="app-shell">
            <header className="app-header">
                <NavLink className="logo-link" to={ROUTES.home}>
                    Home
                </NavLink>

                <nav className="main-navigation" aria-label="Main navigation">
                    {NAV_ITEMS
                        .filter(shouldShowNavItem)
                        .map((item) => (
                            <NavLink
                                key={item.path}
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
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
                        <>
                            <NavLink
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                                to={ROUTES.register}
                            >
                                Register
                            </NavLink>

                            <NavLink
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                                to={ROUTES.login}
                            >
                                Login
                            </NavLink>
                        </>
                    )}
                </nav>
            </header>

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    )
}