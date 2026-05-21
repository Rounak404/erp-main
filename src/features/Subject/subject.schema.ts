// src/features/Subject/subject.validator.ts
import { z } from 'zod'

export const CreateSubjectSchema = z.object({
  body: z.object({
    name: z
      .string('Subject name is require')
      .min(2, 'Name must be at least 2 characters long'),
  }),
})

export const UpdateSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
  }),
})
