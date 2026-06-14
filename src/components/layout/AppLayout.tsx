import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS, ROUTES } from '../../config/routes'

export function AppLayout() {
    return (
        <div className="app-shell">
            <header className="app-header">
                <NavLink className="logo-link" to={ROUTES.home}>
                    Tasks
                </NavLink>

                <nav className="main-navigation" aria-label="Main navigation">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                            to={item.path}
                            end={item.path === ROUTES.home}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </header>

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    )
}