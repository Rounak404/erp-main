// teacher.schema.ts

import { z } from 'zod'

import { UserSchema, BaseUpdateProfileSchema } from '../Users/users.schema'

export const TeacherSchema = UserSchema.extend({
  employeeId: z.string().min(1),

  joiningDate: z.coerce.date(),
})

export const UpdateTeacherSchema = BaseUpdateProfileSchema.extend({
  employeeId: z.string().optional(),

  joiningDate: z.coerce.date().optional(),
})
.refine(
  (data) => Object.values(data).some((value) => value !== undefined),

  {
    message: 'At least one field is required',
  }
)
