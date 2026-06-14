import { Link } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function CreateUserPage() {
    return (
        <section>
            <h1>Create New User</h1>

            <Link className="button" to={ROUTES.users}>
                Back to Users
            </Link>
        </section>
    )
}