import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import {
    deleteCurrentUser,
    fetchCurrentUser,
    updateCurrentUser,
} from '../api/userApi'
import {
    resolveApiErrorMessage,
    resolveApiFieldErrors,
} from '../api/httpClient'
import { useAuth } from '../auth/useAuth'
import { ROUTES } from '../config/routes'
import {
    type UserProfileFormValues,
    userProfileUpdateSchema,
} from '../schemas/userSchemas'
import type { UserProfileUpdateRequest, UserResponse } from '../types/user'

const DEFAULT_FORM_VALUES: UserProfileFormValues = {
    firstName: '',
    lastName: '',
    email: '',
}

export function ProfilePage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { logout } = useAuth()

    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<UserProfileFormValues>({
        resolver: zodResolver(userProfileUpdateSchema),
        defaultValues: DEFAULT_FORM_VALUES,
        mode: 'onBlur',
    })

    const {
        data: currentUser,
        isLoading,
        error: loadError,
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: fetchCurrentUser,
    })

    useEffect(() => {
        if (currentUser) {
            reset(toFormValues(currentUser))
        }
    }, [currentUser, reset])

    const updateProfileMutation = useMutation({
        mutationFn: (request: UserProfileUpdateRequest) => updateCurrentUser(request),
        onSuccess: (updatedUser) => {
            setSuccessMessage('Profile updated successfully.')

            reset(toFormValues(updatedUser))

            queryClient.setQueryData(['currentUser'], updatedUser)
        },
        onError: (cause) => {
            setSuccessMessage(null)

            const fieldErrors = resolveApiFieldErrors(cause)

            for (const [field, message] of Object.entries(fieldErrors)) {
                if (isProfileField(field)) {
                    setError(field, { message })
                }
            }
        },
    })

    const deleteProfileMutation = useMutation({
        mutationFn: deleteCurrentUser,
        onSuccess: () => {
            logout()
            navigate(ROUTES.login, { replace: true })
        },
    })

    function onSubmit(values: UserProfileFormValues) {
        const request: UserProfileUpdateRequest = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
        }

        updateProfileMutation.mutate(request)
    }

    function handleClear() {
        if (currentUser) {
            reset(toFormValues(currentUser))
        } else {
            reset(DEFAULT_FORM_VALUES)
        }

        setSuccessMessage(null)
        updateProfileMutation.reset()
        deleteProfileMutation.reset()
    }

    function handleDeleteProfile() {
        const confirmed = window.confirm(
            'Are you sure you want to delete your profile? This action cannot be undone.',
        )

        if (!confirmed) {
            return
        }

        deleteProfileMutation.mutate()
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Profile</h1>
                    <p>View and update your current user profile.</p>
                </div>

                <Link className="button" to={ROUTES.myTasks}>
                    Back to My Tasks
                </Link>
            </div>

            {isLoading && <div className="loading-state">Loading profile...</div>}

            {loadError && (
                <div className="error-state">{resolveApiErrorMessage(loadError)}</div>
            )}

            {updateProfileMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(updateProfileMutation.error)}
                </div>
            )}

            {deleteProfileMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(deleteProfileMutation.error)}
                </div>
            )}

            {successMessage && <div className="success-state">{successMessage}</div>}

            {currentUser && (
                <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-field">
                        <label htmlFor="id">ID</label>
                        <input id="id" type="text" value={currentUser.id} disabled readOnly />
                    </div>

                    <div className="form-field">
                        <label htmlFor="role">Role</label>
                        <input id="role" type="text" value={currentUser.role} disabled readOnly />
                    </div>

                    <div className="form-field">
                        <label htmlFor="firstName">First name</label>
                        <input
                            id="firstName"
                            type="text"
                            disabled={updateProfileMutation.isPending || deleteProfileMutation.isPending}
                            {...register('firstName')}
                        />
                        {errors.firstName?.message && (
                            <span className="field-error">{errors.firstName.message}</span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="lastName">Last name</label>
                        <input
                            id="lastName"
                            type="text"
                            disabled={updateProfileMutation.isPending || deleteProfileMutation.isPending}
                            {...register('lastName')}
                        />
                        {errors.lastName?.message && (
                            <span className="field-error">{errors.lastName.message}</span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            disabled={updateProfileMutation.isPending || deleteProfileMutation.isPending}
                            {...register('email')}
                        />
                        {errors.email?.message && (
                            <span className="field-error">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            className="button primary"
                            type="submit"
                            disabled={updateProfileMutation.isPending || deleteProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending ? 'Updating...' : 'Update'}
                        </button>

                        <button
                            className="button"
                            type="button"
                            disabled={updateProfileMutation.isPending || deleteProfileMutation.isPending}
                            onClick={handleClear}
                        >
                            Clear
                        </button>

                        <button
                            className="button danger"
                            type="button"
                            disabled={updateProfileMutation.isPending || deleteProfileMutation.isPending}
                            onClick={handleDeleteProfile}
                        >
                            {deleteProfileMutation.isPending ? 'Deleting...' : 'Delete Profile'}
                        </button>
                    </div>
                </form>
            )}
        </section>
    )
}

function toFormValues(user: UserResponse): UserProfileFormValues {
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    }
}

function isProfileField(field: string): field is keyof UserProfileFormValues {
    return ['firstName', 'lastName', 'email'].includes(field)
}