import { Router } from 'express'
import { ClassRoomController } from './classRoom.controller'
import { validate } from '../../common/middlewares/validate.middleware'
import {
  CreateClassRoomSchema,
  UpdateClassRoomSchema,
  AssignStudentsSchema,
  AssignSubjectSchema,
  AssignMultipleSubjectsSchema,
} from './classRoom.schema'
import {
  checkSession,
  requireRole,
} from '../../common/middlewares/auth.middleware'

const classRoomRoutes = Router()

// ===================================================================================
// 🏢 CLASSROOM ADMINISTRATION (CRUD)
// ===================================================================================

classRoomRoutes
  .route('/')
  .get(ClassRoomController.getAllClassRooms)
  .post(
    checkSession,
    requireRole(['ADMIN']),
    validate(CreateClassRoomSchema),
    ClassRoomController.createClassRoom
  )

classRoomRoutes
  .route('/:id')
  .put(validate(UpdateClassRoomSchema), ClassRoomController.updateClassRoom)
  .delete(ClassRoomController.deleteClassRoom)

// ===================================================================================
// 🎓 STUDENT LIFECYCLE & ROSTER MANAGEMENT
// ===================================================================================

classRoomRoutes.get('/:id/roster', ClassRoomController.getClassRoomRoster)
classRoomRoutes.post(
  '/students/assign',
  validate(AssignStudentsSchema),
  ClassRoomController.assignStudentsToClass
)
classRoomRoutes.post(
  '/students/unassign',
  ClassRoomController.unassignStudentsFromClass
)

// ===================================================================================
// 📖 ACADEMIC CURRICULUM & FACULTY STAFFING
// ===================================================================================

classRoomRoutes.get(
  '/:id/curriculum',
  ClassRoomController.getClassRoomCurriculum
)
classRoomRoutes.post(
  '/subjects/assign-single',
  validate(AssignSubjectSchema),
  ClassRoomController.assignSubjectToClass
)
classRoomRoutes.post(
  '/subjects/assign-batch',
  validate(AssignMultipleSubjectsSchema),
  ClassRoomController.assignMultipleSubjectsToClass
)
classRoomRoutes.post(
  '/subjects/remove',
  ClassRoomController.removeSubjectFromClass
)
classRoomRoutes.put(
  '/subjects/change-teacher',
  ClassRoomController.changeSubjectTeacher
)

export default classRoomRoutes
