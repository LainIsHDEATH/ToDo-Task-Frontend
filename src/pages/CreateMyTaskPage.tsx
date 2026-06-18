import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { resolveApiErrorMessage, resolveApiFieldErrors } from '../api/httpClient'
import { createMyTask } from '../api/taskApi'
import { fetchUserCatalog } from '../api/userApi'
import { useAuth } from '../auth/useAuth'
import { PaginationControls } from '../components/pagination/PaginationControls'
import { CollaboratorSelector } from '../components/tasks/CollaboratorSelector'
import { TaskForm } from '../components/tasks/TaskForm'
import { ROUTES } from '../config/routes'
import { createTaskSchema, type CreateTaskFormValues } from '../schemas/taskSchemas'
import type { CreateTaskRequest } from '../types/task'
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

    const [collaboratorsPage, setCollaboratorsPage] = useState(0)
    const [collaboratorsSize, setCollaboratorsSize] = useState(10)

    const collaboratorPageRequest = useMemo(
        () => ({
            page: collaboratorsPage,
            size: collaboratorsSize,
            sort: 'id,asc',
        }),
        [collaboratorsPage, collaboratorsSize],
    )

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
        data: usersPage,
        isLoading: isUsersLoading,
        error: usersError,
    } = useQuery({
        queryKey: ['users', 'catalog', collaboratorPageRequest],
        queryFn: () => fetchUserCatalog(collaboratorPageRequest),
    })

    const users = usersPage?.content ?? []

    const createTaskMutation = useMutation({
        mutationFn: (request: CreateTaskRequest) => createMyTask(request),
        onSuccess: async () => {
            reset(DEFAULT_FORM_VALUES)
            setSelectedCollaborators([])
            setSelectedCollaboratorId('')
            setCollaboratorError(null)

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
        setSelectedCollaborators([])
        setSelectedCollaboratorId('')
        setCollaboratorError(null)
        createTaskMutation.reset()
    }

    function handleCollaboratorsSizeChange(nextSize: number) {
        setCollaboratorsSize(nextSize)
        setCollaboratorsPage(0)
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Create Task</h1>
                    <p>Create a new task for your account.</p>
                </div>
            </div>

            {usersError && (
                <div className="error-state">{resolveApiErrorMessage(usersError)}</div>
            )}

            {createTaskMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(createTaskMutation.error)}
                </div>
            )}

            <TaskForm
                onSubmit={handleSubmit(onSubmit)}
                nameRegistration={register('name')}
                priorityRegistration={register('priority')}
                errors={{
                    name: errors.name?.message,
                    priority: errors.priority?.message,
                }}
                isPending={createTaskMutation.isPending}
                submitLabel="Create"
                pendingSubmitLabel="Creating..."
                onClear={handleClear}
                backTo={ROUTES.myTasks}
                backLabel="Go to Task List"
                childrenAfterFields={
                    <>
                        <CollaboratorSelector
                            availableUsers={users}
                            selectedCollaborators={selectedCollaborators}
                            selectedCollaboratorId={selectedCollaboratorId}
                            excludedUserId={currentUser?.id}
                            error={collaboratorError}
                            isLoading={isUsersLoading}
                            disabled={createTaskMutation.isPending}
                            onSelectedCollaboratorIdChange={setSelectedCollaboratorId}
                            onSelectedCollaboratorsChange={setSelectedCollaborators}
                            onErrorChange={setCollaboratorError}
                        />

                        <PaginationControls
                            page={usersPage?.page ?? collaboratorsPage}
                            size={usersPage?.size ?? collaboratorsSize}
                            totalElements={usersPage?.totalElements ?? 0}
                            totalPages={usersPage?.totalPages ?? 0}
                            isLoading={isUsersLoading}
                            onPageChange={setCollaboratorsPage}
                            onSizeChange={handleCollaboratorsSizeChange}
                        />
                    </>
                }
            />
        </section>
    )
}

function isCreateTaskField(field: string): field is keyof CreateTaskFormValues {
    return ['name', 'priority'].includes(field)
}