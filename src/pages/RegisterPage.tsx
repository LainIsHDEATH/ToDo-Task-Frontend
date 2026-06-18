import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/authApi'
import { resolveApiErrorMessage, resolveApiFieldErrors } from '../api/httpClient'
import { ROUTES } from '../config/routes'
import { createUserSchema, type CreateUserFormValues } from '../schemas/userSchemas'

const DEFAULT_FORM_VALUES: CreateUserFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
}

export function RegisterPage() {
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
        mode: 'onBlur',
    })

    const registerUserMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['users', 'catalog'] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
            ])

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
                if (isRegisterField(field)) {
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
                    <h1>Register</h1>
                    <p>Create a new account.</p>
                </div>

                <Link className="button" to={ROUTES.login}>
                    Back to Login
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
                    <input
                        id="firstName"
                        type="text"
                        disabled={registerUserMutation.isPending}
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
                        disabled={registerUserMutation.isPending}
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
                        disabled={registerUserMutation.isPending}
                        {...register('email')}
                    />
                    {errors.email?.message && (
                        <span className="field-error">{errors.email.message}</span>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        disabled={registerUserMutation.isPending}
                        {...register('password')}
                    />
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

                    <Link className="button" to={ROUTES.login}>
                        Go to Login
                    </Link>
                </div>
            </form>
        </section>
    )
}

function isRegisterField(field: string): field is keyof CreateUserFormValues {
    return ['firstName', 'lastName', 'email', 'password'].includes(field)
}