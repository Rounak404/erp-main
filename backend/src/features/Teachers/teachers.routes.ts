// teacher.routes.ts

import { Router } from 'express'
import {
  addTeacherController,
  getTeacherByIdController,
  getAllTeachersController,
  updateTeacherController,
  deleteTeacherController,
} from './teachers.controller'

const teacherRoutes = Router()

teacherRoutes.post('/', addTeacherController)

teacherRoutes.get('/', getAllTeachersController)

teacherRoutes.get('/:id', getTeacherByIdController)

teacherRoutes.patch('/:id', updateTeacherController)

teacherRoutes.delete('/:id', deleteTeacherController)

export default teacherRoutes
