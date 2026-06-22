import { BaseUpdateProfileSchema, UserSchema } from '../Users/users.schema'
import z from 'zod'

export const StudentSchema = UserSchema.extend({
  rollNumber: z.string(),

  class: z.enum([
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
    'XI',
    'XII',
  ]),

  admissionDate: z.coerce.date(),
})

export const UpdateStudentSchema = BaseUpdateProfileSchema.extend({
  rollNumber: z.string().optional(),

  class: z
    .enum([
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
      'XI',
      'XII',
    ])
    .optional(),

  admissionDate: z.coerce.date().optional(),
}).refine(
  (data) => Object.values(data).some((value) => value !== undefined),

  {
    message: 'At least one field is required',
  }
)
