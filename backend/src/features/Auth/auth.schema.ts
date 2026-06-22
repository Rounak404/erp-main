import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
})
export const CreateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),

  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN'], {
    error: 'Role must be student, teacher, admin, or user',
  }),
  data: z.object({
    phoneNo: z.string().optional(),
    profileImage: z.url({ message: 'Invalid image URL' }).optional(),

    rollNumber: z.string().optional(),
    class: z.string().optional(),
    admissionDate: z.string().or(z.date()).optional(),

    employeeId: z.string().optional(),
    department: z.string().optional(),
    joiningDate: z.string().or(z.date()).optional(),
  }).optional(),
})

export const signInSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const requestPasswordResetSchema = z.object({
  email: z.email('Invalid email format'),
})

export const sendResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'New password must contain at least 6 characters'),
  token: z.string(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Old password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must contain at least 6 characters'),
  revokeOtherSessions: z.boolean().optional(),
})
