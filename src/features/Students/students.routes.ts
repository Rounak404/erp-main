// student.routes.ts

import { Router } from 'express'

import {
  createStudentController,
  getStudentByIdController,
  getAllStudentsController,
  updateStudentController,
  deleteStudentController,
} from './students.controller'

const studentRoutes = Router()

studentRoutes.post('/', createStudentController)

studentRoutes.get('/', getAllStudentsController)

studentRoutes.get('/:id', getStudentByIdController)

studentRoutes.patch('/:id', updateStudentController)

studentRoutes.delete('/:id', deleteStudentController)

export default studentRoutes
