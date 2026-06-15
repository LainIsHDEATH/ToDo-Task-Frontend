import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function CreateTaskPage() {
    const { userId } = useParams()

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Create New Task</h1>
                    <p>Create task page for user #{userId}</p>
                </div>

                <Link className="button" to={userId ? ROUTES.userTasks(userId) : ROUTES.users}>
                    Back to Tasks
                </Link>
            </div>
        </section>
    )
}