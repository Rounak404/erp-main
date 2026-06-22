// student.controller.ts

import { Request, Response } from 'express'

import {
  addStudent,
  getStudentById,
  getAllStudents,
  updateStudent,
  deleteStudent,
} from './students.service'

import { StudentSchema, UpdateStudentSchema } from './students.schema'

import { AsyncHandler } from '../../common/utils/AsyncHandler'
import { ApiResponse } from '../../common/utils/ApiResponse'
import { ApiError } from '../../common/utils/ApiError'

export const createStudentController = AsyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = StudentSchema.parse(req.body)

    const student = await addStudent(validatedData)

    return res
      .status(201)
      .json(new ApiResponse(201, student, 'Student created successfully'))
  }
)

export const getStudentByIdController = AsyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''

    const student = await getStudentById(id)

    if (!student) throw new ApiError(404, 'Student not Found!!')

    return res
      .status(200)
      .json(new ApiResponse(200, student, 'Student fetched successfully'))
  }
)

export const getAllStudentsController = AsyncHandler(
  async (req: Request, res: Response) => {
    const students = await getAllStudents()

    return res
      .status(200)
      .json(new ApiResponse(200, students, 'Students fetched successfully'))
  }
)

export const updateStudentController = AsyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = UpdateStudentSchema.parse(req.body)
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''

    const student = await updateStudent(id, validatedData)

    return res
      .status(200)
      .json(new ApiResponse(200, student, 'Student updated successfully'))
  }
)

export const deleteStudentController = AsyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''
    await deleteStudent(id)

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Student deleted successfully'))
  }
)
