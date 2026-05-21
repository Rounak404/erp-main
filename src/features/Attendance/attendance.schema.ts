import { z } from 'zod'
import { AttendanceStatus } from '../../../generated/prisma/enums'

export const SubmitBulkAttendanceSchema = z.object({
  body: z.object({
    classroomId: z.uuid('Invalid Classroom UUID format.'),
    date: z
      .date('Invalid ISO date format (Expected: YYYY-MM-DD).')
      .pipe(z.coerce.date()),
    records: z
      .array(
        z.object({
          studentId: z.uuid('Invalid Student UUID format.'),
          status: z.enum(AttendanceStatus, {
            message:
              'Status must match an active system value (PRESENT, ABSENT, LATE, EXCUSED).',
          }),
        })
      )
      .min(1, 'Roster submission payload list cannot be empty.'),
  }),
})

export const FetchClassroomAttendanceSchema = z.object({
  params: z.object({
    classroomId: z.uuid('Invalid Classroom UUID format.'),
  }),
  query: z.object({
    date: z
      .date('Invalid query date string format (Expected: YYYY-MM-DD).')
      .pipe(z.coerce.date()),
  }),
})

export const FetchStudentSummarySchema = z.object({
  params: z.object({
    studentId: z.uuid('Invalid Student UUID format.'),
  }),
})

export const UpdateIndividualAttendanceSchema = z.object({
  body: z.object({
    studentId: z.uuid('Invalid Student UUID format.'),
    date: z
      .date('Invalid ISO date format (Expected: YYYY-MM-DD).')
      .pipe(z.coerce.date()),
    status: z.enum(AttendanceStatus, {
      message:
        'Status must match an active system value (PRESENT, ABSENT, LATE, EXCUSED).',
    }),
  }),
})
