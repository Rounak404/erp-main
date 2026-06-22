import { z } from 'zod'

// ===================================================================================
// 🏢 CLASSROOM SCHEMAS
// ===================================================================================

export const CreateClassRoomSchema = z.object({
  body: z.object({
    grade: z.string('Grade/Class level is required').min(1).max(3),
    section: z.string('Section is required').min(1).max(2).toUpperCase(),
  }),
})

export const UpdateClassRoomSchema = z.object({
  body: z.object({
    grade: z.string().min(1).max(3).optional(),
    section: z.string().min(1).max(2).toUpperCase().optional(),
  }),
})

// ===================================================================================
// 🎓 STUDENT SCHEMAS
// ===================================================================================

export const AssignStudentsSchema = z.object({
  body: z.object({
    classRoomId: z.uuid('Invalid Classroom UUID format'),
    studentIds: z
      .array(z.uuid('Each Student ID must be a valid UUID'))
      .min(1, 'Provide at least one student ID'),
  }),
})

// ===================================================================================
// 📖 SUBJECT & TEACHER SCHEMAS
// ===================================================================================

export const AssignSubjectSchema = z.object({
  body: z.object({
    classRoomId: z.uuid('Invalid Classroom UUID format'),
    subjectId: z.uuid('Invalid Subject UUID format'),
    teacherId: z
      .string()
      .uuid('Invalid Teacher UUID format')
      .nullable()
      .optional(),
  }),
})

export const AssignMultipleSubjectsSchema = z.object({
  body: z.object({
    classRoomId: z.uuid('Invalid Classroom UUID format'),
    subjectIds: z
      .array(z.uuid('Each Subject ID must be a valid UUID'))
      .min(1, 'Provide at least one subject ID'),
  }),
})

// ===================================================================================
// 🗺️ BONUS: URL PARAMETER VALIDATION
// ===================================================================================
// Since your middleware validates params too, you can use this for routes like DELETE /:id
export const ClassRoomIdParamSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid Classroom ID path parameter'),
  }),
})
