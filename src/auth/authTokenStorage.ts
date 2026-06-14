export const ACCESS_TOKEN_STORAGE_KEY = 'todoTasksAccessToken'

export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function saveAccessToken(accessToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

export function removeAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}