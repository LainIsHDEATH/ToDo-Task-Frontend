import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import {
    resolveApiErrorMessage,
    resolveApiFieldErrors,
} from '../api/httpClient'
import { createMyTask } from '../api/taskApi'
import { fetchUserCatalog } from '../api/userApi'
import { useAuth } from '../auth/useAuth'
import { ROUTES } from '../config/routes'
import {
    createTaskSchema,
    TASK_PRIORITIES,
    type CreateTaskFormValues,
} from '../schemas/taskSchemas'
import type { CreateTaskRequest, TaskPriority } from '../types/task'
import type { UserShortResponse } from '../types/user'

const DEFAULT_FORM_VALUES: CreateTaskFormValues = {
    name: '',
    priority: 'LOW',
}

export function CreateMyTaskPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { currentUser } = useAuth()

    const [selectedCollaboratorId, setSelectedCollaboratorId] = useState('')
    const [selectedCollaborators, setSelectedCollaborators] = useState<UserShortResponse[]>([])
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
        queryKey: ['users', 'catalog'],
        queryFn: fetchUserCatalog,
    })

    const createTaskMutation = useMutation({
        mutationFn: (request: CreateTaskRequest) => createMyTask(request),
        onSuccess: async (createdTask) => {
            queryClient.setQueryData(['my', 'tasks', createdTask.id], createdTask)

            await queryClient.invalidateQueries({
                queryKey: ['my', 'tasks'],
            })

            navigate(ROUTES.myTasks)
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
            user.id !== currentUser?.id &&
            !selectedCollaborators.some((collaborator) => collaborator.id === user.id),
    )

    function handleAddCollaborator() {
        const collaboratorId = Number(selectedCollaboratorId)

        if (!Number.isInteger(collaboratorId) || collaboratorId <= 0) {
            setCollaboratorError('Select collaborator first.')
            return
        }

        if (collaboratorId === currentUser?.id) {
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

        const request: CreateTaskRequest = {
            name: values.name,
            priority: values.priority,
            collaboratorIds: selectedCollaborators.map((collaborator) => collaborator.id),
        }

        createTaskMutation.mutate(request)
    }

    function handleClear() {
        reset(DEFAULT_FORM_VALUES)
        setSelectedCollaboratorId('')
        setSelectedCollaborators([])
        setCollaboratorError(null)
        createTaskMutation.reset()
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Create My Task</h1>
                    <p>Create a task for your account.</p>
                </div>

                <Link className="button" to={ROUTES.myTasks}>
                    Back to My Tasks
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
                    <input
                        id="name"
                        type="text"
                        disabled={createTaskMutation.isPending}
                        {...register('name')}
                    />
                    {errors.name?.message && (
                        <span className="field-error">{errors.name.message}</span>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="priority">Priority</label>
                    <select
                        id="priority"
                        disabled={createTaskMutation.isPending}
                        {...register('priority')}
                    >
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

                    <Link className="button" to={ROUTES.myTasks}>
                        Go to Task List
                    </Link>
                </div>
            </form>
        </section>
    )
}

function formatUserOption(user: UserShortResponse): string {
    const fullName = `${user.firstName} ${user.lastName}`.trim()

    if (!fullName) {
        return user.email
    }

    return `${fullName} (${user.email})`
}

function isCreateTaskField(field: string): field is keyof CreateTaskFormValues {
    return ['name', 'priority'].includes(field)
}