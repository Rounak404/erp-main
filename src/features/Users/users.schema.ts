import z from 'zod'

export const UserSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(6, 'Password must be contains 6 character'),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9][0-9]{7,14}$/, 'Invalid Phone Number')
    .optional(),
  profileImage: z.string().optional(),
})

export const BaseUpdateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9][0-9]{7,14}$/, 'Invalid Phone Number')
    .optional(),
  profileImage: z.string().optional(),
})

export const UpdateProfileSchema = BaseUpdateProfileSchema.refine(
  (data) => data.name || data.phoneNumber || data.profileImage,
  {
    message: 'At least one field is required',
  }
)

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(6, 'Password must be contains 6 character'),
  newPassword: z.string().min(6, 'Password must be contains 6 character'),
})
