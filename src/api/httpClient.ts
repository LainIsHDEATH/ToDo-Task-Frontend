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

function resolveAxiosErrorMessage(cause: AxiosError): string {
    const responseData = cause.response?.data

    if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        const message = responseData.message

        if (typeof message === 'string' && message.trim().length > 0) {
            return message
        }
    }

    if (typeof responseData === 'string' && responseData.trim().length > 0) {
        return responseData
    }

    if (cause.response?.status) {
        return `Request failed with status ${cause.response.status}.`
    }

    return 'Backend is not available.'
}