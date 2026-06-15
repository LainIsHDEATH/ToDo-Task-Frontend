import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function UpdateTaskPage() {
    const { userId, taskId } = useParams()

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Update Task</h1>
                    <p>
                        Update task #{taskId} for user #{userId}
                    </p>
                </div>

                <Link className="button" to={userId ? ROUTES.userTasks(userId) : ROUTES.users}>
                    Back to Tasks
                </Link>
            </div>
        </section>
    )
}