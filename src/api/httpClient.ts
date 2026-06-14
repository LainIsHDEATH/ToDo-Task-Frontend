import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const ACCESS_TOKEN_STORAGE_KEY = 'todoTasksAccessToken'

export const httpClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

httpClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export function resolveApiErrorMessage(cause: unknown): string {
    if (axios.isAxiosError(cause)) {
        return resolveAxiosErrorMessage(cause)
    }

    if (cause instanceof Error) {
        return cause.message
    }

    return 'Unexpected error occurred.'
}

export function resolveApiFieldErrors(cause: unknown): Record<string, string> {
    if (!axios.isAxiosError(cause)) {
        return {}
    }

    const responseData = cause.response?.data

    if (!isRecord(responseData)) {
        return {}
    }

    return (
        extractFieldErrors(responseData.fieldErrors) ??
        extractFieldErrors(responseData.errors) ??
        extractFieldErrors(responseData.validationErrors) ??
        {}
    )
}

function resolveAxiosErrorMessage(cause: AxiosError): string {
    const responseData = cause.response?.data

    if (isRecord(responseData) && typeof responseData.message === 'string') {
        return responseData.message
    }

    if (typeof responseData === 'string' && responseData.trim().length > 0) {
        return responseData
    }

    if (cause.response?.status) {
        return `Request failed with status ${cause.response.status}.`
    }

    return 'Backend is not available.'
}

function extractFieldErrors(value: unknown): Record<string, string> | null {
    if (isRecord(value)) {
        const errors: Record<string, string> = {}

        for (const [field, message] of Object.entries(value)) {
            if (typeof message === 'string' && message.trim().length > 0) {
                errors[field] = message
            }
        }

        return Object.keys(errors).length > 0 ? errors : null
    }

    if (Array.isArray(value)) {
        const errors: Record<string, string> = {}

        for (const item of value) {
            if (!isRecord(item)) {
                continue
            }

            const field = item.field
            const message = item.message

            if (
                typeof field === 'string' &&
                typeof message === 'string' &&
                message.trim().length > 0
            ) {
                errors[field] = message
            }
        }

        return Object.keys(errors).length > 0 ? errors : null
    }

    return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}