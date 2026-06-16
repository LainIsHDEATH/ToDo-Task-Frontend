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
    type UpdateTaskFormValues,
    updateTaskSchema,
} from '../schemas/taskSchemas'
import type {
    TaskResponse,
    UpdateTaskRequest,
} from '../types/task'
import type { UserShortResponse } from '../types/user'
import { CollaboratorSelector } from '../components/tasks/CollaboratorSelector'
import { TaskForm } from '../components/tasks/TaskForm'
const DEFAULT_FORM_VALUES: UpdateTaskFormValues = {
    name: '',
    priority: 'LOW',
    status: 'TODO',
}

export function AdminUpdateUserTaskPage() {
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

                <Link
                    className="button"
                    to={isValidUserId ? ROUTES.adminUserTasks(userIdNumber) : ROUTES.adminUsers}
                >
                    Back to Tasks
                </Link>
            </section>
        )
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Update Admin User Task</h1>
                    <p>Update task #{taskIdNumber} for user #{userIdNumber}.</p>
                </div>

                <Link className="button" to={ROUTES.adminUserTasks(userIdNumber)}>
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
                <TaskForm
                    onSubmit={handleSubmit(onSubmit)}
                    nameRegistration={register('name')}
                    priorityRegistration={register('priority')}
                    statusRegistration={register('status')}
                    errors={{
                        name: errors.name?.message,
                        priority: errors.priority?.message,
                        status: errors.status?.message,
                    }}
                    isPending={updateTaskMutation.isPending}
                    submitLabel="Update"
                    pendingSubmitLabel="Updating..."
                    onClear={handleClear}
                    backTo={ROUTES.adminUserTasks(userIdNumber)}
                    backLabel="Go to Task List"
                    childrenBeforeFields={
                        <div className="form-field">
                            <label htmlFor="id">ID</label>
                            <input id="id" type="text" value={task.id} disabled readOnly />
                        </div>
                    }
                    childrenAfterFields={
                        <CollaboratorSelector
                            availableUsers={users}
                            selectedCollaborators={selectedCollaborators}
                            selectedCollaboratorId={selectedCollaboratorId}
                            excludedUserId={ownerId}
                            error={collaboratorError}
                            isLoading={isUsersLoading}
                            disabled={updateTaskMutation.isPending}
                            onSelectedCollaboratorIdChange={setSelectedCollaboratorId}
                            onSelectedCollaboratorsChange={setSelectedCollaboratorsOverride}
                            onErrorChange={setCollaboratorError}
                        />
                    }
                />
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

function isUpdateTaskField(field: string): field is keyof UpdateTaskFormValues {
    return ['name', 'priority', 'status'].includes(field)
}