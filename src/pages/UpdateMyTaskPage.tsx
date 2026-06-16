import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function UpdateMyTaskPage() {
    const { taskId } = useParams()

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Update My Task</h1>
                    <p>Update current user task #{taskId}.</p>
                </div>

                <Link className="button" to={ROUTES.myTasks}>
                    Back to My Tasks
                </Link>
            </div>
        </section>
    )
}