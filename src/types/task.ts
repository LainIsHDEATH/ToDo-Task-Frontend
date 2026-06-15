export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface TaskListItemResponse {
    id: number
    name: string
    priority: TaskPriority
    status: TaskStatus
}

export interface TaskResponse {
    id: number
    name: string
    priority: TaskPriority
    status: TaskStatus
}

export interface CreateTaskRequest {
    name: string
    priority: TaskPriority
    collaboratorIds: number[]
}