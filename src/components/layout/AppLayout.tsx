import type { ReactNode } from 'react'
import { NAV_ITEMS, ROUTES } from '../../config/routes'

interface AppLayoutProps {
    children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="app-shell">
            <header className="app-header">
                <a className="logo-link" href={ROUTES.home}>
                    Tasks
                </a>

                <nav className="main-navigation" aria-label="Main navigation">
                    {NAV_ITEMS.map((item) => (
                        <a key={item.path} className="nav-link" href={item.path}>
                            {item.label}
                        </a>
                    ))}
                </nav>
            </header>

            <main className="app-main">{children}</main>
        </div>
    )
}