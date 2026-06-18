import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchAdminUserTasks, removeAdminTask } from '../api/adminTasksApi'
import { resolveApiErrorMessage } from '../api/httpClient'
import { PaginationControls } from '../components/pagination/PaginationControls'
import { ROUTES } from '../config/routes'
import { TASK_PRIORITIES, TASK_STATUSES } from '../schemas/taskSchemas'
import type { TaskListItemResponse, TaskPriority, TaskStatus } from '../types/task'

type TaskPriorityFilter = 'ALL' | TaskPriority
type TaskStatusFilter = 'ALL' | TaskStatus

export function AdminUserTasksPage() {
    const { userId } = useParams()
    const userIdNumber = Number(userId)
    const isValidUserId = Number.isInteger(userIdNumber) && userIdNumber > 0

    const queryClient = useQueryClient()

    const [page, setPage] = useState(0)
    const [size, setSize] = useState(20)
    const [searchValue, setSearchValue] = useState('')
    const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>('ALL')
    const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('ALL')

    const pageRequest = useMemo(
        () => ({
            page,
            size,
            sort: 'id,asc',
        }),
        [page, size],
    )

    const {
        data: tasksPage,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['admin', 'users', userIdNumber, 'tasks', pageRequest],
        queryFn: () => fetchAdminUserTasks(userIdNumber, pageRequest),
        enabled: isValidUserId,
    })

    const tasks = tasksPage?.content ?? []
    const filteredTasks = filterTasks(tasks, searchValue, priorityFilter, statusFilter)

    const removeTaskMutation = useMutation({
        mutationFn: removeAdminTask,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['admin', 'users', userIdNumber, 'tasks'],
            })
        },
    })

    function handleSizeChange(nextSize: number) {
        setSize(nextSize)
        setPage(0)
    }

    function handleSearchChange(value: string) {
        setSearchValue(value)
        setPage(0)
    }

    function handlePriorityFilterChange(value: TaskPriorityFilter) {
        setPriorityFilter(value)
        setPage(0)
    }

    function handleStatusFilterChange(value: TaskStatusFilter) {
        setStatusFilter(value)
        setPage(0)
    }

    function handleClearFilters() {
        setSearchValue('')
        setPriorityFilter('ALL')
        setStatusFilter('ALL')
        setPage(0)
    }

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

            <TaskFilters
                searchValue={searchValue}
                priorityFilter={priorityFilter}
                statusFilter={statusFilter}
                onSearchChange={handleSearchChange}
                onPriorityFilterChange={handlePriorityFilterChange}
                onStatusFilterChange={handleStatusFilterChange}
                onClearFilters={handleClearFilters}
            />

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

            {!isLoading && tasks.length > 0 && filteredTasks.length === 0 && (
                <div className="empty-state">No tasks match selected filters.</div>
            )}

            {!isLoading && filteredTasks.length > 0 && (
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
                    {filteredTasks.map((task: TaskListItemResponse, index: number) => (
                        <tr key={task.id}>
                            <td>{page * size + index + 1}</td>
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

interface TaskFiltersProps {
    searchValue: string
    priorityFilter: TaskPriorityFilter
    statusFilter: TaskStatusFilter
    onSearchChange: (value: string) => void
    onPriorityFilterChange: (value: TaskPriorityFilter) => void
    onStatusFilterChange: (value: TaskStatusFilter) => void
    onClearFilters: () => void
}

function TaskFilters({
                         searchValue,
                         priorityFilter,
                         statusFilter,
                         onSearchChange,
                         onPriorityFilterChange,
                         onStatusFilterChange,
                         onClearFilters,
                     }: TaskFiltersProps) {
    return (
        <div className="form">
            <div className="form-field">
                <label htmlFor="taskSearch">Search</label>
                <input
                    id="taskSearch"
                    type="text"
                    value={searchValue}
                    placeholder="Search by ID or name"
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </div>

            <div className="form-field">
                <label htmlFor="priorityFilter">Priority</label>
                <select
                    id="priorityFilter"
                    value={priorityFilter}
                    onChange={(event) =>
                        onPriorityFilterChange(event.target.value as TaskPriorityFilter)
                    }
                >
                    <option value="ALL">All priorities</option>
                    {TASK_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                            {priority}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-field">
                <label htmlFor="statusFilter">Status</label>
                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(event) =>
                        onStatusFilterChange(event.target.value as TaskStatusFilter)
                    }
                >
                    <option value="ALL">All statuses</option>
                    {TASK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {formatEnumValue(status)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-actions">
                <button className="button" type="button" onClick={onClearFilters}>
                    Clear Filters
                </button>
            </div>
        </div>
    )
}

function filterTasks(
    tasks: TaskListItemResponse[],
    searchValue: string,
    priorityFilter: TaskPriorityFilter,
    statusFilter: TaskStatusFilter,
): TaskListItemResponse[] {
    const search = searchValue.trim().toLowerCase()

    return tasks.filter((task) => {
        const matchesSearch =
            !search ||
            task.name.toLowerCase().includes(search) ||
            String(task.id).includes(search)

        const matchesPriority =
            priorityFilter === 'ALL' || task.priority === priorityFilter

        const matchesStatus =
            statusFilter === 'ALL' || task.status === statusFilter

        return matchesSearch && matchesPriority && matchesStatus
    })
}

function formatEnumValue(value: string): string {
    return value.replace(/_/g, ' ')
}