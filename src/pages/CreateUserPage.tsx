import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {resolveApiErrorMessage, resolveApiFieldErrors,} from '../api/httpClient'
import { registerUser } from '../api/authApi'
import { ROUTES } from '../config/routes'
import {createUserSchema, type CreateUserFormValues,} from '../schemas/userSchemas'

const DEFAULT_FORM_VALUES: CreateUserFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
}

export function CreateUserPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: DEFAULT_FORM_VALUES,
    })

    const registerUserMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['users'] })

            navigate(ROUTES.login, {
                replace: true,
                state: {
                    registrationSuccess: true,
                    email: variables.email,
                },
            })
        },
        onError: (cause) => {
            const fieldErrors = resolveApiFieldErrors(cause)

            for (const [field, message] of Object.entries(fieldErrors)) {
                if (isCreateUserField(field)) {
                    setError(field, { message })
                }
            }
        },
    })

    function onSubmit(values: CreateUserFormValues) {
        registerUserMutation.mutate(values)
    }

    function handleClear() {
        reset(DEFAULT_FORM_VALUES)
        registerUserMutation.reset()
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Create New User</h1>
                    <p>Register a new user in the system.</p>
                </div>

                <Link className="button" to={ROUTES.users}>
                    Back to Users
                </Link>
            </div>

            {registerUserMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(registerUserMutation.error)}
                </div>
            )}

            <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" {...register('password')} />
                    {errors.password?.message && (
                        <span className="field-error">{errors.password.message}</span>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        className="button primary"
                        type="submit"
                        disabled={registerUserMutation.isPending}
                    >
                        {registerUserMutation.isPending ? 'Registering...' : 'Register'}
                    </button>

                    <button
                        className="button"
                        type="button"
                        disabled={registerUserMutation.isPending}
                        onClick={handleClear}
                    >
                        Clear
                    </button>
                </div>
            </form>
        </section>
    )
}

function isCreateUserField(field: string): field is keyof CreateUserFormValues {
    return ['firstName', 'lastName', 'email', 'password'].includes(field)
}