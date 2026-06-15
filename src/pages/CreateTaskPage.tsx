import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {resolveApiErrorMessage, resolveApiFieldErrors} from '../api/httpClient'
import { createTask } from '../api/tasksApi'
import { fetchUsers } from '../api/usersApi'
import { ROUTES } from '../config/routes'
import {createTaskSchema, TASK_PRIORITIES, type CreateTaskFormValues} from '../schemas/taskSchemas'
import type { CreateTaskRequest, TaskPriority } from '../types/task'
import type { UserResponse } from '../types/user'

const DEFAULT_FORM_VALUES: CreateTaskFormValues = {
    name: '',
    priority: 'LOW',
}

export function CreateTaskPage() {
    const { userId } = useParams()
    const userIdNumber = Number(userId)
    const isValidUserId = Number.isInteger(userIdNumber) && userIdNumber > 0

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [selectedCollaboratorId, setSelectedCollaboratorId] = useState('')
    const [selectedCollaborators, setSelectedCollaborators] = useState<UserResponse[]>([])
    const [collaboratorError, setCollaboratorError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<CreateTaskFormValues>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: DEFAULT_FORM_VALUES,
        mode: 'onBlur',
    })

    const {
        data: users = [],
        isLoading: isUsersLoading,
        error: usersError,
    } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        enabled: isValidUserId,
    })

    const createTaskMutation = useMutation({
        mutationFn: (request: CreateTaskRequest) => createTask(userIdNumber, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['users', userIdNumber, 'tasks'],
            })

            navigate(ROUTES.userTasks(userIdNumber))
        },
        onError: (cause) => {
            const fieldErrors = resolveApiFieldErrors(cause)

            for (const [field, message] of Object.entries(fieldErrors)) {
                if (isCreateTaskField(field)) {
                    setError(field, { message })
                }

                if (field === 'collaboratorIds') {
                    setCollaboratorError(message)
                }
            }
        },
    })

    const availableCollaborators = users.filter(
        (user) =>
            user.id !== userIdNumber &&
            !selectedCollaborators.some((collaborator) => collaborator.id === user.id),
    )

    function handleAddCollaborator() {
        const collaboratorId = Number(selectedCollaboratorId)

        if (!Number.isInteger(collaboratorId) || collaboratorId <= 0) {
            setCollaboratorError('Select collaborator first.')
            return
        }

        if (collaboratorId === userIdNumber) {
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

        setSelectedCollaborators((currentCollaborators) => [
            ...currentCollaborators,
            collaborator,
        ])
        setSelectedCollaboratorId('')
        setCollaboratorError(null)
    }

    function handleRemoveCollaborator(collaboratorId: number) {
        setSelectedCollaborators((currentCollaborators) =>
            currentCollaborators.filter((collaborator) => collaborator.id !== collaboratorId),
        )
        setCollaboratorError(null)
    }

    function onSubmit(values: CreateTaskFormValues) {
        setCollaboratorError(null)

        createTaskMutation.mutate({
            name: values.name,
            priority: values.priority,
            collaboratorIds: selectedCollaborators.map((collaborator) => collaborator.id),
        })
    }

    function handleClear() {
        reset(DEFAULT_FORM_VALUES)
        setSelectedCollaboratorId('')
        setSelectedCollaborators([])
        setCollaboratorError(null)
        createTaskMutation.reset()
    }

    if (!isValidUserId) {
        return (
            <section>
                <h1>Create New Task</h1>

                <div className="error-state">Invalid user id.</div>

                <Link className="button" to={ROUTES.users}>
                    Back to Users
                </Link>
            </section>
        )
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Create New Task</h1>
                    <p>Create a new task for user #{userIdNumber}.</p>
                </div>

                <Link className="button" to={ROUTES.userTasks(userIdNumber)}>
                    Back to Tasks
                </Link>
            </div>

            {usersError && (
                <div className="error-state">{resolveApiErrorMessage(usersError)}</div>
            )}

            {createTaskMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(createTaskMutation.error)}
                </div>
            )}

            <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                                    createTaskMutation.isPending
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
                                disabled={!selectedCollaboratorId || createTaskMutation.isPending}
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
                                        disabled={createTaskMutation.isPending}
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
                        disabled={createTaskMutation.isPending}
                    >
                        {createTaskMutation.isPending ? 'Creating...' : 'Create'}
                    </button>

                    <button
                        className="button"
                        type="button"
                        disabled={createTaskMutation.isPending}
                        onClick={handleClear}
                    >
                        Clear
                    </button>

                    <Link className="button" to={ROUTES.userTasks(userIdNumber)}>
                        Go to Task List
                    </Link>
                </div>
            </form>
        </section>
    )
}

function formatUserOption(user: UserResponse): string {
    const fullName = `${user.firstName} ${user.lastName}`.trim()

    if (!fullName) {
        return user.email
    }

    return `${fullName} (${user.email})`
}

function isCreateTaskField(field: string): field is keyof CreateTaskFormValues {
    return ['name', 'priority'].includes(field)
}