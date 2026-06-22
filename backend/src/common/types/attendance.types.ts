import { AttendanceStatus } from '../../../generated/prisma/enums'

export interface SubmitBulkClassRoster {
  classRoomId: string
  date: Date
  teacherId: string
  records: attendanceRecords[]
}

export interface attendanceRecords {
  studentId: string
  status: AttendanceStatus
}
