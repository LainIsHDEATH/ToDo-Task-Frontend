import { Link } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function MyTasksPage() {
    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>My Tasks</h1>
                    <p>Current user task list.</p>
                </div>

                <Link className="button primary" to={ROUTES.createMyTask}>
                    Create New Task
                </Link>
            </div>
        </section>
    )
}