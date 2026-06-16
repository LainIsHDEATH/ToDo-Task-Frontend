import { Link } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export function ProfilePage() {
    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Profile</h1>
                    <p>Current user profile page.</p>
                </div>

                <Link className="button" to={ROUTES.myTasks}>
                    Back to My Tasks
                </Link>
            </div>
        </section>
    )
}