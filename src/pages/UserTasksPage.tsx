import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function UserTasksPage() {
    const { userId } = useParams()

    return (
        <section>
            <h1>User Tasks</h1>

            <p>Tasks page for user #{userId}</p>

            <Link className="button" to={ROUTES.users}>
                Back to Users
            </Link>
        </section>
    )
}