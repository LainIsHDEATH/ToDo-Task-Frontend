import { z } from 'zod'

export const createUserSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    email: z.email('Email must be valid.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export const updateUserSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    email: z.email('Email must be valid.'),
    role: z.enum(['USER', 'ADMIN'], 'Role is required.'),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>