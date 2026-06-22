import { Router } from 'express'
import { AttendanceController } from './attendance.controller'
import { validate } from '../../common/middlewares/validate.middleware'
import { Role } from '../../../generated/prisma/enums' 
import {
  SubmitBulkAttendanceSchema,
  FetchClassroomAttendanceSchema,
  FetchStudentSummarySchema,
  UpdateIndividualAttendanceSchema,
} from './attendance.schema'
import { checkSession, requireRole } from '../../common/middlewares/auth.middleware'
import { hydrateStudentContext, hydrateTeacherContext } from '../../common/middlewares/context.middleware'

const router = Router()

// Protect all routes with session verification
router.use(checkSession)

/**
 * @route   POST /api/v1/attendance/bulk
 * @access  Private (Teachers Only - Guarded by reqRole)
 */
router.post(
  '/bulk',
  requireRole([Role.TEACHER,Role.ADMIN]),
  hydrateTeacherContext,
  validate(SubmitBulkAttendanceSchema),
  AttendanceController.submitClassAttendance
)

/**
 * @route   GET /api/v1/attendance/classroom/:classroomId
 */
router.get(
  '/classroom/:classroomId',
  requireRole([Role.TEACHER, Role.ADMIN]), 
  validate(FetchClassroomAttendanceSchema),
  AttendanceController.getClassAttendanceByDate
)

/**
 * @route   GET /api/v1/attendance/student/:studentId/summary
 */
router.get(
  '/student/:studentId/summary',
  validate(FetchStudentSummarySchema),
  hydrateStudentContext,
  AttendanceController.getStudentSummarySheet
)

/**
 * @route   PATCH /api/v1/attendance/override
 */
router.patch(
  '/override',
  requireRole([Role.TEACHER, Role.ADMIN]),
  hydrateTeacherContext,
  validate(UpdateIndividualAttendanceSchema),
  AttendanceController.overrideAttendanceRecord
)

export default router
