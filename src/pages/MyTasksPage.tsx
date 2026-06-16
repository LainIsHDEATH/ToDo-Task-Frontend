import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { resolveApiErrorMessage } from '../api/httpClient'
import { fetchMyTasks, removeMyTask } from '../api/taskApi'
import { ROUTES } from '../config/routes'
import type { TaskListItemResponse } from '../types/task'

export function MyTasksPage() {
    const queryClient = useQueryClient()

    const {
        data: tasks = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['my', 'tasks'],
        queryFn: fetchMyTasks,
    })

    const removeTaskMutation = useMutation({
        mutationFn: removeMyTask,
        onSuccess: async (_, taskId) => {
            queryClient.removeQueries({
                queryKey: ['my', 'tasks', taskId],
            })

            await queryClient.invalidateQueries({
                queryKey: ['my', 'tasks'],
            })
        },
    })

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>My Tasks</h1>
                    <p>Tasks assigned to your account.</p>
                </div>

                <Link className="button primary" to={ROUTES.createMyTask}>
                    Create New Task
                </Link>
            </div>

            {error && <div className="error-state">{resolveApiErrorMessage(error)}</div>}

            {removeTaskMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(removeTaskMutation.error)}
                </div>
            )}

            {isLoading && <div className="loading-state">Loading tasks...</div>}

            {!isLoading && tasks.length === 0 && (
                <div className="empty-state">No tasks were found.</div>
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
                                    to={ROUTES.editMyTask(task.id)}
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