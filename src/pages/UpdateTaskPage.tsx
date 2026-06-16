import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import {
    resolveApiErrorMessage,
    resolveApiFieldErrors,
} from '../api/httpClient'
import { fetchAdminTaskById, updateAdminTask } from '../api/adminTasksApi'
import { fetchUserCatalog } from '../api/userApi'
import { ROUTES } from '../config/routes'
import {
    TASK_PRIORITIES,
    TASK_STATUSES,
    type UpdateTaskFormValues,
    updateTaskSchema,
} from '../schemas/taskSchemas'
import type {
    TaskPriority,
    TaskResponse,
    TaskStatus,
    UpdateTaskRequest,
} from '../types/task'
import type { UserShortResponse } from '../types/user'

const DEFAULT_FORM_VALUES: UpdateTaskFormValues = {
    name: '',
    priority: 'LOW',
    status: 'TODO',
}

export function UpdateTaskPage() {
    const { userId, taskId } = useParams()

    const userIdNumber = Number(userId)
    const taskIdNumber = Number(taskId)

    const isValidUserId = Number.isInteger(userIdNumber) && userIdNumber > 0
    const isValidTaskId = Number.isInteger(taskIdNumber) && taskIdNumber > 0

    const queryClient = useQueryClient()

    const [selectedCollaboratorId, setSelectedCollaboratorId] = useState('')
    const [selectedCollaboratorsOverride, setSelectedCollaboratorsOverride] =
        useState<UserShortResponse[] | null>(null)
    const [collaboratorError, setCollaboratorError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<UpdateTaskFormValues>({
        resolver: zodResolver(updateTaskSchema),
        defaultValues: DEFAULT_FORM_VALUES,
        mode: 'onBlur',
    })

    const {
        data: task,
        isLoading: isTaskLoading,
        error: taskError,
    } = useQuery({
        queryKey: ['admin', 'tasks', taskIdNumber],
        queryFn: () => fetchAdminTaskById(taskIdNumber),
        enabled: isValidTaskId,
    })

    const selectedCollaborators = selectedCollaboratorsOverride ?? task?.collaborators ?? []

    const {
        data: users = [],
        isLoading: isUsersLoading,
        error: usersError,
    } = useQuery({
        queryKey: ['users', 'catalog'],
        queryFn: fetchUserCatalog,
        enabled: isValidUserId && isValidTaskId,
    })

    useEffect(() => {
        if (task) {
            reset(toFormValues(task))
        }
    }, [task, reset])

    const updateTaskMutation = useMutation({
        mutationFn: (request: UpdateTaskRequest) => updateAdminTask(taskIdNumber, request),
        onSuccess: async (updatedTask) => {
            setSuccessMessage('Task updated successfully.')
            setCollaboratorError(null)
            setSelectedCollaboratorId('')
            setSelectedCollaboratorsOverride(null)

            reset(toFormValues(updatedTask))

            queryClient.setQueryData(['admin', 'tasks', taskIdNumber], updatedTask)

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['admin', 'users', userIdNumber, 'tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['admin', 'tasks', taskIdNumber],
                }),
            ])
        },
        onError: (cause) => {
            setSuccessMessage(null)

            const fieldErrors = resolveApiFieldErrors(cause)

            for (const [field, message] of Object.entries(fieldErrors)) {
                if (isUpdateTaskField(field)) {
                    setError(field, { message })
                }

                if (field === 'collaboratorIds') {
                    setCollaboratorError(message)
                }
            }
        },
    })

    const ownerId = task?.owner.id ?? userIdNumber

    const availableCollaborators = users.filter(
        (user) =>
            user.id !== ownerId &&
            !selectedCollaborators.some((collaborator) => collaborator.id === user.id),
    )

    function handleAddCollaborator() {
        const collaboratorId = Number(selectedCollaboratorId)

        if (!Number.isInteger(collaboratorId) || collaboratorId <= 0) {
            setCollaboratorError('Select collaborator first.')
            return
        }

        if (collaboratorId === ownerId) {
            setCollaboratorError('Task owner cannot be collaborator.')
            return
        }

        if (selectedCollaborators.some((collaborator) => collaborator.id === collaboratorId)) {
            setCollaboratorError('Collaborator is already selected.')
            return
        }

        const collaborator = users.find((user) => user.id === collaboratorId)

        if (!collaborator) {
            setCollaboratorError('Selected collaborator was not found.')
            return
        }

        setSelectedCollaboratorsOverride([
            ...selectedCollaborators,
            collaborator,
        ])
        setSelectedCollaboratorId('')
        setCollaboratorError(null)
    }

    function handleRemoveCollaborator(collaboratorId: number) {
        setSelectedCollaboratorsOverride(
            selectedCollaborators.filter((collaborator) => collaborator.id !== collaboratorId),
        )
        setCollaboratorError(null)
    }

    function onSubmit(values: UpdateTaskFormValues) {
        setSuccessMessage(null)
        setCollaboratorError(null)

        updateTaskMutation.mutate({
            name: values.name,
            priority: values.priority,
            status: values.status,
            collaboratorIds: selectedCollaborators.map((collaborator) => collaborator.id),
        })
    }

    function handleClear() {
        if (task) {
            reset(toFormValues(task))
        }

        setSelectedCollaboratorsOverride(null)
        setSelectedCollaboratorId('')
        setSuccessMessage(null)
        setCollaboratorError(null)
        updateTaskMutation.reset()
    }

    if (!isValidUserId || !isValidTaskId) {
        return (
            <section>
                <h1>Update Task</h1>

                <div className="error-state">Invalid route parameters.</div>

                <Link className="button" to={isValidUserId ? ROUTES.userTasks(userIdNumber) : ROUTES.users}>
                    Back to Tasks
                </Link>
            </section>
        )
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Update Task</h1>
                    <p>
                        Update task #{taskIdNumber} for user #{userIdNumber}.
                    </p>
                </div>

                <Link className="button" to={ROUTES.userTasks(userIdNumber)}>
                    Back to Tasks
                </Link>
            </div>

            {isTaskLoading && <div className="loading-state">Loading task...</div>}

            {taskError && (
                <div className="error-state">{resolveApiErrorMessage(taskError)}</div>
            )}

            {usersError && (
                <div className="error-state">{resolveApiErrorMessage(usersError)}</div>
            )}

            {updateTaskMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(updateTaskMutation.error)}
                </div>
            )}

            {successMessage && <div className="success-state">{successMessage}</div>}

            {task && (
                <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-field">
                        <label htmlFor="id">ID</label>
                        <input id="id" type="text" value={task.id} disabled readOnly />
                    </div>

                    <div className="form-field">
                        <label htmlFor="name">Name</label>
                        <input id="name" type="text" {...register('name')} />
                        {errors.name?.message && (
                            <span className="field-error">{errors.name.message}</span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="priority">Priority</label>
                        <select id="priority" {...register('priority')}>
                            {TASK_PRIORITIES.map((priority: TaskPriority) => (
                                <option key={priority} value={priority}>
                                    {priority}
                                </option>
                            ))}
                        </select>
                        {errors.priority?.message && (
                            <span className="field-error">{errors.priority.message}</span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="status">Status</label>
                        <select id="status" {...register('status')}>
                            {TASK_STATUSES.map((status: TaskStatus) => (
                                <option key={status} value={status}>
                                    {formatEnumValue(status)}
                                </option>
                            ))}
                        </select>
                        {errors.status?.message && (
                            <span className="field-error">{errors.status.message}</span>
                        )}
                    </div>

                    <section className="collaborators-section">
                        <h2>Collaborators</h2>

                        {isUsersLoading && (
                            <div className="loading-state">Loading collaborators...</div>
                        )}

                        {!isUsersLoading && (
                            <div className="collaborator-selector">
                                <select
                                    aria-label="Collaborator"
                                    value={selectedCollaboratorId}
                                    disabled={
                                        availableCollaborators.length === 0 ||
                                        updateTaskMutation.isPending
                                    }
                                    onChange={(event) => {
                                        setSelectedCollaboratorId(event.target.value)
                                        setCollaboratorError(null)
                                    }}
                                >
                                    <option value="">Select collaborator</option>

                                    {availableCollaborators.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {formatUserOption(user)}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    className="button"
                                    type="button"
                                    disabled={!selectedCollaboratorId || updateTaskMutation.isPending}
                                    onClick={handleAddCollaborator}
                                >
                                    Add Collaborator
                                </button>
                            </div>
                        )}

                        {collaboratorError && (
                            <span className="field-error">{collaboratorError}</span>
                        )}

                        {selectedCollaborators.length === 0 && (
                            <div className="empty-state">No collaborators selected.</div>
                        )}

                        {selectedCollaborators.length > 0 && (
                            <ul className="collaborator-list">
                                {selectedCollaborators.map((collaborator) => (
                                    <li key={collaborator.id} className="collaborator-list-item">
                                        <span>{formatUserOption(collaborator)}</span>

                                        <button
                                            className="button danger"
                                            type="button"
                                            disabled={updateTaskMutation.isPending}
                                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <div className="form-actions">
                        <button
                            className="button primary"
                            type="submit"
                            disabled={updateTaskMutation.isPending}
                        >
                            {updateTaskMutation.isPending ? 'Updating...' : 'Update'}
                        </button>

                        <button
                            className="button"
                            type="button"
                            disabled={updateTaskMutation.isPending}
                            onClick={handleClear}
                        >
                            Clear
                        </button>

                        <Link className="button" to={ROUTES.userTasks(userIdNumber)}>
                            Go to Task List
                        </Link>
                    </div>
                </form>
            )}
        </section>
    )
}

function toFormValues(task: TaskResponse): UpdateTaskFormValues {
    return {
        name: task.name,
        priority: task.priority,
        status: task.status,
    }
}

function formatUserOption(user: UserShortResponse): string {
    const fullName = `${user.firstName} ${user.lastName}`.trim()

    if (!fullName) {
        return user.email
    }

    return `${fullName} (${user.email})`
}

function formatEnumValue(value: string): string {
    return value.replace(/_/g, ' ')
}

function isUpdateTaskField(field: string): field is keyof UpdateTaskFormValues {
    return ['name', 'priority', 'status'].includes(field)
}