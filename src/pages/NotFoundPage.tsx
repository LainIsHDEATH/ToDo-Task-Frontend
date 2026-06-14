import { Link } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function NotFoundPage() {
    return (
        <section>
            <h1>Page not found</h1>

            <p>The requested page does not exist.</p>

            <Link className="button" to={ROUTES.home}>
                Go Home
            </Link>
        </section>
    )
}