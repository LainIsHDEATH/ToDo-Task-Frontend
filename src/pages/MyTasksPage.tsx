import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveApiErrorMessage } from '../api/httpClient'
import { fetchMyTasks, removeMyTask } from '../api/taskApi'
import { PaginationControls } from '../components/pagination/PaginationControls'
import { ROUTES } from '../config/routes'
import type { TaskListItemResponse } from '../types/task'

const TASK_SORT_OPTIONS = [
    { label: 'ID ↑', value: 'id,asc' },
    { label: 'ID ↓', value: 'id,desc' },
    { label: 'Name ↑', value: 'name,asc' },
    { label: 'Name ↓', value: 'name,desc' },
    { label: 'Priority ↑', value: 'priority,asc' },
    { label: 'Priority ↓', value: 'priority,desc' },
    { label: 'Status ↑', value: 'status,asc' },
    { label: 'Status ↓', value: 'status,desc' },
]

export function MyTasksPage() {
    const queryClient = useQueryClient()

    const [page, setPage] = useState(0)
    const [size, setSize] = useState(20)
    const [sort, setSort] = useState('id,asc')

    const pageRequest = useMemo(
        () => ({
            page,
            size,
            sort,
        }),
        [page, size, sort],
    )

    const {
        data: tasksPage,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['my', 'tasks', pageRequest],
        queryFn: () => fetchMyTasks(pageRequest),
    })

    const tasks = tasksPage?.content ?? []

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

    function handleSizeChange(nextSize: number) {
        setSize(nextSize)
        setPage(0)
    }

    function handleSortChange(nextSort: string) {
        setSort(nextSort)
        setPage(0)
    }

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

            <div className="form">
                <div className="form-field">
                    <label htmlFor="taskSort">Sort by</label>
                    <select
                        id="taskSort"
                        value={sort}
                        disabled={isLoading}
                        onChange={(event) => handleSortChange(event.target.value)}
                    >
                        {TASK_SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
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
                            <td>{page * size + index + 1}</td>
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

            <PaginationControls
                page={tasksPage?.page ?? page}
                size={tasksPage?.size ?? size}
                totalElements={tasksPage?.totalElements ?? 0}
                totalPages={tasksPage?.totalPages ?? 0}
                isLoading={isLoading}
                onPageChange={setPage}
                onSizeChange={handleSizeChange}
            />
        </section>
    )
}

function formatEnumValue(value: string): string {
    return value.replace(/_/g, ' ')
}