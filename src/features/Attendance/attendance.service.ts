import { AttendanceStatus } from '../../../generated/prisma/enums'
import {
  attendanceRecords,
  SubmitBulkClassRoster,
} from '../../common/types/attendance.types'
import { ApiError } from '../../common/utils/ApiError'
import { prisma } from '../../lib/prisma'

export class AttendanceServices {
  static async submitBulkClassRoster(data: SubmitBulkClassRoster) {
    const teacherExists = await prisma.teacher.findUnique({
      where: {
        id: data.teacherId,
      },
      select: {
        id: true,
      },
    })
    if (!teacherExists)
      throw new ApiError(
        404,
        'The assigned teacher profile could not be found.'
      )

    const existingRecords = await prisma.attendance.findMany({
      where: {
        classRoomId: data.classRoomId,
        date: data.date,
      },
      select: {
        studentId: true,
        teacherId: true,
        status: true,
      },
    })

    const existingRecordsMap = new Map(
      existingRecords.map((r) => [r.studentId, r])
    )

    const finalRecordsToUpsert: attendanceRecords[] = []

    for (const record of data.records) {
      const existing = existingRecordsMap.get(record.studentId)

      if (!existing) finalRecordsToUpsert.push(record)
      else {
        if (data.teacherId === existing.teacherId)
          finalRecordsToUpsert.push(record)
        else
          console.warn(
            `Conflict Defended: Teacher ${data.teacherId} blocked from overwriting Teacher ${existing.teacherId} for student ${record.studentId}`
          )
      }
    }
    if (finalRecordsToUpsert.length === 0) {
      return {
        processedCount: 0,
        message: 'No new or authorized changes detected.',
      }
    }
    return await prisma.$transaction(
      finalRecordsToUpsert.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: data.date,
            },
          },
          update: {
            status: record.status,
          },
          create: {
            date: data.date,
            classRoomId: data.classRoomId,
            teacherId: data.teacherId,
            studentId: record.studentId,
            status: record.status,
          },
        })
      )
    )
  }

  static async getClassRoomDailyRoster(
    classroomId: string,
    targetQueryDate: Date
  ) {
    const classroomCheck = await prisma.classRoom.findUnique({
      where: {
        id: classroomId,
      },
    })
    if (!classroomCheck)
      throw new ApiError(
        404,
        'The targeted classroom record could not be found.'
      )
    return await prisma.attendance.findMany({
      where: {
        classroomId,
        date: targetQueryDate,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          select: {
            rollNumber: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          rollNumber: 'asc',
        },
      },
    })
  }

  static async getStudentAttendanceSummary(studentId: string) {
    const targetStudentCheck = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    })
    if (!targetStudentCheck)
      throw new ApiError(404, 'Target student profile record not found.')

    const databaseSummaryGroups = await prisma.attendance.groupBy({
      by: ['status'],
      where: { studentId },
      _count: { status: true },
    })

    const summaryMatrix = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
      cumulativeTotalClasses: 0,
      netAttendancePercentage: 0.0,
    }

    databaseSummaryGroups.forEach((group) => {
      if (group.status in summaryMatrix) {
        summaryMatrix[group.status as keyof typeof summaryMatrix] =
          group._count.status
        summaryMatrix.cumulativeTotalClasses += group._count.status
      }
      if (summaryMatrix.cumulativeTotalClasses > 0) {
        const positiveWeightRatio =
          0.5 * summaryMatrix.LATE + summaryMatrix.PRESENT
        summaryMatrix.netAttendancePercentage = parseFloat(
          (
            (positiveWeightRatio / summaryMatrix.cumulativeTotalClasses) *
            100
          ).toFixed(2)
        )
      }
    })

    return summaryMatrix
  }

  static async updateIndividualAttendanceRecord(data: {
    studentId: string
    date: Date
    status: AttendanceStatus
    teacherId: string
    remarks?: string | null
  }) {
    const teacherExists = await prisma.teacher.findUnique({
      where: { id: data.teacherId },
      select: { id: true },
    })

    if (!teacherExists) {
      throw new ApiError(
        404,
        'The assigned teacher profile could not be found.'
      )
    }

    const existingLog = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId: data.studentId,
          date: data.date,
        },
      },
    })

    if (!existingLog) {
      throw new ApiError(
        404,
        'No prior attendance entry exists for this student on the specified date.'
      )
    }

    return await prisma.attendance.update({
      where: {
        studentId_date: {
          studentId: data.studentId,
          date: data.date,
        },
      },
      data: {
        status: data.status,
        teacherId: data.teacherId,
        remarks:
          data.remarks ||
          `Overridden manually by instructor. Original status: ${existingLog.status}`,
      },
    })
  }
}
