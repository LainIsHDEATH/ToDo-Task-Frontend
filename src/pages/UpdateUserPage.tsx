import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function UpdateUserPage() {
    const { userId } = useParams()

    return (
        <section>
            <h1>Update User</h1>

            <p>User update form for user #{userId}</p>

            <Link className="button" to={ROUTES.users}>
                Back to Users
            </Link>
        </section>
    )
}