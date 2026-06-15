import { z } from 'zod'

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const

export const createTaskSchema = z.object({
    name: z.string().trim().min(1, 'Task name is required.').max(255, 'Task name must not exceed 255 characters.'),
    priority: z.enum(TASK_PRIORITIES, 'Priority is required.'),
})

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>