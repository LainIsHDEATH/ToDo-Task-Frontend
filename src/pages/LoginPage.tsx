import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/authApi'
import {resolveApiErrorMessage, resolveApiFieldErrors} from '../api/httpClient'
import { useAuth } from '../auth/useAuth'
import { ROUTES } from '../config/routes'
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas'

const DEFAULT_FORM_VALUES: LoginFormValues = {
    email: '',
    password: '',
}

interface LoginLocationState {
    from?: string
    registrationSuccess?: boolean
    email?: string
}

export function LoginPage() {
    const auth = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const locationState = location.state as LoginLocationState | null

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            ...DEFAULT_FORM_VALUES,
            email: locationState?.email ?? '',
        },
    })

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: async (response) => {
            auth.login(response.accessToken)

            await queryClient.invalidateQueries()

            navigate(resolveRedirectPath(locationState), { replace: true })
        },
        onError: (cause) => {
            const fieldErrors = resolveApiFieldErrors(cause)

            for (const [field, message] of Object.entries(fieldErrors)) {
                if (isLoginField(field)) {
                    setError(field, { message })
                }
            }
        },
    })

    function onSubmit(values: LoginFormValues) {
        loginMutation.mutate(values)
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Login</h1>
                    <p>Authenticate to access protected pages.</p>
                </div>

                <Link className="button" to={ROUTES.home}>
                    Back to Home
                </Link>
            </div>

            {locationState?.registrationSuccess && (
                <div className="success-state">
                    User registered successfully. Please log in.
                </div>
            )}

            {loginMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(loginMutation.error)}
                </div>
            )}

            <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>
        </section>
    )
}

function resolveRedirectPath(state: LoginLocationState | null): string {
    if (
        state?.from &&
        state.from.startsWith('/') &&
        state.from !== ROUTES.login
    ) {
        return state.from
    }

    return ROUTES.users
}

function isLoginField(field: string): field is keyof LoginFormValues {
    return ['email', 'password'].includes(field)
}