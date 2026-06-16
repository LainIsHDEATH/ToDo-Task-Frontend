import { Link } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function CreateMyTaskPage() {
    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Create My Task</h1>
                    <p>Create task for the current authenticated user.</p>
                </div>

                <Link className="button" to={ROUTES.myTasks}>
                    Back to My Tasks
                </Link>
            </div>
        </section>
    )
}