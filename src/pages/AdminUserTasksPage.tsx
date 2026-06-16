import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { resolveApiErrorMessage } from '../api/httpClient'
import { fetchAdminUserTasks, removeAdminTask } from '../api/adminTasksApi'
import { ROUTES } from '../config/routes'
import type { TaskListItemResponse } from '../types/task'

export function AdminUserTasksPage() {
    const { userId } = useParams()
    const userIdNumber = Number(userId)
    const isValidUserId = Number.isInteger(userIdNumber) && userIdNumber > 0

    const queryClient = useQueryClient()

    const {
        data: tasks = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['admin', 'users', userIdNumber, 'tasks'],
        queryFn: () => fetchAdminUserTasks(userIdNumber),
        enabled: isValidUserId,
    })

    const removeTaskMutation = useMutation({
        mutationFn: removeAdminTask,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['admin', 'users', userIdNumber, 'tasks'],
            })
        },
    })

    if (!isValidUserId) {
        return (
            <section>
                <h1>User Tasks</h1>

                <div className="error-state">Invalid user id.</div>

                <Link className="button" to={ROUTES.adminUsers}>
                    Back to Users
                </Link>
            </section>
        )
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Admin User Tasks</h1>
                    <p>Tasks of user #{userIdNumber}.</p>
                </div>

                <div className="page-actions">
                    <Link className="button" to={ROUTES.adminUsers}>
                        Back to Users
                    </Link>

                    <Link className="button primary" to={ROUTES.adminCreateUserTask(userIdNumber)}>
                        Create New Task
                    </Link>
                </div>
            </div>

            {error && <div className="error-state">{resolveApiErrorMessage(error)}</div>}

            {removeTaskMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(removeTaskMutation.error)}
                </div>
            )}

            {isLoading && <div className="loading-state">Loading tasks...</div>}

            {!isLoading && tasks.length === 0 && (
                <div className="empty-state">No tasks were found for this user.</div>
            )}

            {!isLoading && tasks.length > 0 && (
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Operations</th>
                    </tr>
                    </thead>

                    <tbody>
                    {tasks.map((task: TaskListItemResponse, index: number) => (
                        <tr key={task.id}>
                            <td>{index + 1}</td>
                            <td>{task.id}</td>
                            <td>{task.name}</td>
                            <td>{formatEnumValue(task.priority)}</td>
                            <td>{formatEnumValue(task.status)}</td>
                            <td className="actions-cell">
                                <Link
                                    className="button"
                                    to={ROUTES.adminEditUserTask(userIdNumber, task.id)}
                                >
                                    Edit
                                </Link>

                                <button
                                    className="button danger"
                                    type="button"
                                    disabled={removeTaskMutation.isPending}
                                    onClick={() => removeTaskMutation.mutate(task.id)}
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

function formatEnumValue(value: string): string {
    return value.replace(/_/g, ' ')
}