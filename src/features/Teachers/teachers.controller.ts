// teacher.controller.ts

import { Request, Response } from 'express'

import {
  addTeacher,
  getTeacherById,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
} from './teachers.service'

import { TeacherSchema, UpdateTeacherSchema } from './teachers.schema'

import { AsyncHandler } from '../../common/utils/AsyncHandler'

import { ApiResponse } from '../../common/utils/ApiResponse'

export const addTeacherController = AsyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = TeacherSchema.parse(req.body)

    const teacher = await addTeacher(validatedData)

    return res
      .status(201)
      .json(new ApiResponse(201, teacher, 'Teacher created successfully'))
  }
)

export const getTeacherByIdController = AsyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''
    const teacher = await getTeacherById(id)

    return res
      .status(200)
      .json(new ApiResponse(200, teacher, 'Teacher fetched successfully'))
  }
)

export const getAllTeachersController = AsyncHandler(
  async (req: Request, res: Response) => {
    const teachers = await getAllTeachers()

    return res
      .status(200)
      .json(new ApiResponse(200, teachers, 'Teachers fetched successfully'))
  }
)

export const updateTeacherController = AsyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = UpdateTeacherSchema.parse(req.body)
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''
    const teacher = await updateTeacher(id, validatedData)

    return res
      .status(200)
      .json(new ApiResponse(200, teacher, 'Teacher updated successfully'))
  }
)

export const deleteTeacherController = AsyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''
    await deleteTeacher(id)

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Teacher deleted successfully'))
  }
)
