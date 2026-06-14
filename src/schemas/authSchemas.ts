import { z } from 'zod'

export const loginSchema = z.object({
    email: z.email('Email must be valid.'),
    password: z.string().min(1, 'Password is required.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>