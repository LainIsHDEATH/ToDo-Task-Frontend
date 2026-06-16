import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { resolveApiErrorMessage } from '../api/httpClient'
import { fetchAdminUsers, removeAdminUser } from '../api/adminUsersApi'
import { ROUTES } from '../config/routes'
import type { UserResponse } from '../types/user'

export function UsersPage() {
    const queryClient = useQueryClient()

    const {
        data: users = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['users'],
        queryFn: fetchAdminUsers,
    })

    const removeUserMutation = useMutation({
        mutationFn: removeAdminUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>Registered users from the backend.</p>
                </div>

                <Link className="button primary" to={ROUTES.createUser}>
                    Create New User
                </Link>
            </div>

            {error && <div className="error-state">{resolveApiErrorMessage(error)}</div>}

            {removeUserMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(removeUserMutation.error)}
                </div>
            )}

            {isLoading && <div className="loading-state">Loading users...</div>}

            {!isLoading && users.length === 0 && (
                <div className="empty-state">No users were found.</div>
            )}

            {!isLoading && users.length > 0 && (
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Full name</th>
                        <th>Email</th>
                        <th>Operations</th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.map((user: UserResponse, index: number) => (
                        <tr key={user.id}>
                            <td>{index + 1}</td>
                            <td>{getFullName(user)}</td>
                            <td>{user.email}</td>
                            <td className="actions-cell">
                                <Link className="button" to={ROUTES.userTasks(user.id)}>
                                    Tasks
                                </Link>

                                <Link className="button" to={ROUTES.editUser(user.id)}>
                                    Edit
                                </Link>

                                <button
                                    className="button danger"
                                    type="button"
                                    disabled={removeUserMutation.isPending}
                                    onClick={() => removeUserMutation.mutate(user.id)}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </section>
    )
}

function getFullName(user: UserResponse): string {
    return `${user.firstName} ${user.lastName}`.trim()
}