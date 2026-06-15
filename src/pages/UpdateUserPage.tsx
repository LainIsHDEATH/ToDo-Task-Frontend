import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import {resolveApiErrorMessage, resolveApiFieldErrors} from '../api/httpClient'
import { fetchUserById, updateUser } from '../api/usersApi'
import { ROUTES } from '../config/routes'
import {updateUserSchema, type UpdateUserFormValues} from '../schemas/userSchemas'
import type { UserResponse, UserRole } from '../types/user'

const DEFAULT_FORM_VALUES: UpdateUserFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER',
}

const USER_ROLES: UserRole[] = ['USER', 'ADMIN']

export function UpdateUserPage() {
    const { userId } = useParams()
    const userIdNumber = Number(userId)
    const isValidUserId = Number.isInteger(userIdNumber) && userIdNumber > 0

    const queryClient = useQueryClient()
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: DEFAULT_FORM_VALUES,
    })

    const {
        data: user,
        isLoading,
        error: loadError,
    } = useQuery({
        queryKey: ['users', userIdNumber],
        queryFn: () => fetchUserById(userIdNumber),
        enabled: isValidUserId,
    })

    useEffect(() => {
        if (user) {
            reset(toFormValues(user))
        }
    }, [user, reset])

    const updateUserMutation = useMutation({
        mutationFn: (values: UpdateUserFormValues) => updateUser(userIdNumber, values),
        onSuccess: async (updatedUser) => {
            setSuccessMessage('User updated successfully.')

            reset(toFormValues(updatedUser))

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['users'] }),
                queryClient.invalidateQueries({ queryKey: ['users', userIdNumber] }),
            ])
        },
        onError: (cause) => {
            setSuccessMessage(null)

            const fieldErrors = resolveApiFieldErrors(cause)

            for (const [field, message] of Object.entries(fieldErrors)) {
                if (isUpdateUserField(field)) {
                    setError(field, { message })
                }
            }
        },
    })

    function onSubmit(values: UpdateUserFormValues) {
        setSuccessMessage(null)
        updateUserMutation.mutate(values)
    }

    function handleClear() {
        if (user) {
            reset(toFormValues(user))
        }

        setSuccessMessage(null)
        updateUserMutation.reset()
    }

    if (!isValidUserId) {
        return (
            <section>
                <h1>Update User</h1>

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
                    <h1>Update User</h1>
                    <p>Edit existing user details.</p>
                </div>

                <Link className="button" to={ROUTES.users}>
                    Back to Users
                </Link>
            </div>

            {isLoading && <div className="loading-state">Loading user...</div>}

            {loadError && (
                <div className="error-state">{resolveApiErrorMessage(loadError)}</div>
            )}

            {updateUserMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(updateUserMutation.error)}
                </div>
            )}

            {successMessage && <div className="success-state">{successMessage}</div>}

            {user && (
                <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-field">
                        <label htmlFor="id">ID</label>
                        <input id="id" type="text" value={user.id} disabled readOnly />
                    </div>

                    <div className="form-field">
                        <label htmlFor="firstName">First name</label>
                        <input id="firstName" type="text" {...register('firstName')} />
                        {errors.firstName?.message && (
                            <span className="field-error">{errors.firstName.message}</span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="lastName">Last name</label>
                        <input id="lastName" type="text" {...register('lastName')} />
                        {errors.lastName?.message && (
                            <span className="field-error">{errors.lastName.message}</span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" {...register('email')} />
                        {errors.email?.message && (
                            <span className="field-error">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="role">Role</label>
                        <select id="role" {...register('role')}>
                            {USER_ROLES.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                        {errors.role?.message && (
                            <span className="field-error">{errors.role.message}</span>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            className="button primary"
                            type="submit"
                            disabled={updateUserMutation.isPending}
                        >
                            {updateUserMutation.isPending ? 'Updating...' : 'Update'}
                        </button>

                        <button
                            className="button"
                            type="button"
                            disabled={updateUserMutation.isPending}
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                    </div>
                </form>
            )}
        </section>
    )
}

function toFormValues(user: UserResponse): UpdateUserFormValues {
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
    }
}

function isUpdateUserField(field: string): field is keyof UpdateUserFormValues {
    return ['firstName', 'lastName', 'email', 'role'].includes(field)
}