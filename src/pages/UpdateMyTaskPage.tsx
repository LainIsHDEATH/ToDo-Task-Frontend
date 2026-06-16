import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import {
    resolveApiErrorMessage,
    resolveApiFieldErrors,
} from '../api/httpClient'
import { fetchMyTaskById, updateMyTask } from '../api/taskApi'
import { fetchUserCatalog } from '../api/userApi'
import { useAuth } from '../auth/useAuth'
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
import {CollaboratorSelector} from "../components/tasks/CollaboratorSelector.tsx";
import {TaskForm} from "../components/tasks/TaskForm.tsx";

const DEFAULT_FORM_VALUES: UpdateTaskFormValues = {
    name: '',
    priority: 'LOW',
    status: 'TODO',
}

export function UpdateMyTaskPage() {
    const { taskId } = useParams()
    const taskIdNumber = Number(taskId)
    const isValidTaskId = Number.isInteger(taskIdNumber) && taskIdNumber > 0

    const queryClient = useQueryClient()
    const { currentUser } = useAuth()

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
        queryKey: ['my', 'tasks', taskIdNumber],
        queryFn: () => fetchMyTaskById(taskIdNumber),
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
        enabled: isValidTaskId,
    })

    useEffect(() => {
        if (task) {
            reset(toFormValues(task))
        }
    }, [task, reset])

    const updateTaskMutation = useMutation({
        mutationFn: (request: UpdateTaskRequest) => updateMyTask(taskIdNumber, request),
        onSuccess: async (updatedTask) => {
            setSuccessMessage('Task updated successfully.')
            setCollaboratorError(null)
            setSelectedCollaboratorId('')
            setSelectedCollaboratorsOverride(null)

            reset(toFormValues(updatedTask))

            queryClient.setQueryData(['my', 'tasks', taskIdNumber], updatedTask)

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['my', 'tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['my', 'tasks', taskIdNumber],
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

    const ownerId = task?.owner.id ?? currentUser?.id

    function onSubmit(values: UpdateTaskFormValues) {
        setSuccessMessage(null)
        setCollaboratorError(null)

        const request: UpdateTaskRequest = {
            name: values.name,
            priority: values.priority,
            status: values.status,
            collaboratorIds: selectedCollaborators.map((collaborator) => collaborator.id),
        }

        updateTaskMutation.mutate(request)
    }

    function handleClear() {
        if (task) {
            reset(toFormValues(task))
        } else {
            reset(DEFAULT_FORM_VALUES)
        }

        setSelectedCollaboratorsOverride(null)
        setSelectedCollaboratorId('')
        setSuccessMessage(null)
        setCollaboratorError(null)
        updateTaskMutation.reset()
    }

    if (!isValidTaskId) {
        return (
            <section>
                <h1>Update My Task</h1>

                <div className="error-state">Invalid task id.</div>

                <Link className="button" to={ROUTES.myTasks}>
                    Back to My Tasks
                </Link>
            </section>
        )
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Update My Task</h1>
                    <p>Update task #{taskIdNumber}.</p>
                </div>

                <Link className="button" to={ROUTES.myTasks}>
                    Back to My Tasks
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
                    backTo={ROUTES.myTasks}
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