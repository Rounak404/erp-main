import { Request, Response } from 'express'
import { AsyncHandler } from '../../common/utils/AsyncHandler'
import { getTeacherById } from '../Teachers/teachers.service'
import { ApiError } from '../../common/utils/ApiError'
import { AttendanceServices } from './attendance.service'
import { ApiResponse } from '../../common/utils/ApiResponse'
import { student } from '../../lib/permissions'

export class AttendanceController {
  static submitClassAttendance = AsyncHandler(
    async (req: Request, res: Response) => {
      const { classRoomId, date, records } = req.body

      const teacherId = req.teacherId

      if (!teacherId) throw new ApiError(400, 'Teacher is not available')

      const transactionResult = await AttendanceServices.submitBulkClassRoster({
        classRoomId,
        date,
        teacherId: teacherId,
        records,
      })
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            transactionResult,
            'Classroom daily attendance ledger processed cleanly.'
          )
        )
    }
  )
  static getClassAttendanceByDate = AsyncHandler(
    async (req: Request, res: Response) => {
      const classRoomId = Array.isArray(req.params)
        ? req.params[0]
        : req.params ?? ''

      const targetQueryDate = req.query.date as unknown as Date

      const historicalLedger = await AttendanceServices.getClassRoomDailyRoster(
        classRoomId,
        targetQueryDate
      )

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            historicalLedger,
            'Classroom data records retrieved successfully.'
          )
        )
    }
  )
  static getStudentSummarySheet = AsyncHandler(
    async (req: Request, res: Response) => {
      const studentId = Array.isArray(req.params)
        ? req.params[0]
        : req.params ?? ''
      const currentUserRole = req?.user?.role

      if (currentUserRole === 'STUDENT') {
        if (req.studentId !== studentId) {
          throw new ApiError(
            403,
            "Access Denied: You are not authorized to view another student's attendance data."
          )
        }
      }
      const statisticalSpreadsheet =
        await AttendanceServices.getStudentAttendanceSummary(studentId)

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            statisticalSpreadsheet,
            'Computed aggregate analytical tracking values successfully.'
          )
        )
    }
  )
  static overrideAttendanceRecord = AsyncHandler(
    async (req: Request, res: Response) => {
      const { studentId, date, status, remarks } = req.body
      const teacherId = req.teacherId

      if (!teacherId) throw new ApiError(400, 'Teacher is not available')

      const updatedRecord =
        await AttendanceServices.updateIndividualAttendanceRecord({
          studentId,
          date,
          status,
          teacherId: teacherId
        })

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedRecord,
            'Individual attendance log row overridden successfully.'
          )
        )
    }
  )
}
