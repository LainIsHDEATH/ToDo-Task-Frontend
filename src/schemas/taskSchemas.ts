import { z } from 'zod'

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const

export const createTaskSchema = z.object({
    name: z.string().trim().min(1, 'Task name is required.').max(255, 'Task name must not exceed 255 characters.'),
    priority: z.enum(TASK_PRIORITIES, 'Priority is required.'),
})

export const updateTaskSchema = z.object({
    name: z.string().trim().min(1, 'Task name is required.').max(255, 'Task name must not exceed 255 characters.'),
    priority: z.enum(TASK_PRIORITIES, 'Priority is required.'),
    status: z.enum(TASK_STATUSES, 'Status is required.'),
})

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>