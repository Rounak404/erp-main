// users.controller.ts

import { Request, Response } from 'express'

import {
  createUser,
  getUserById,
  getUserByEmail,
  updateProfile,
  changePassword,
  deleteUser,
} from './users.service'

import {
  UserSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from './users.schema'

import { AsyncHandler } from '../../common/utils/AsyncHandler'
import { ApiResponse } from '../../common/utils/ApiResponse'
import { ApiError } from '../../common/utils/ApiError'

export const createUserController = AsyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = UserSchema.parse(req.body)

    const user = await createUser(validatedData)

    return res
      .status(201)
      .json(new ApiResponse(201, user, 'User created successfully'))
  }
)

export const getUserByIdController = AsyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''

    const user = await getUserById(id)

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, 'User fetched successfully'))
  }
)

export const getUserByEmailController = AsyncHandler(
  async (req: Request, res: Response) => {
    const email = Array.isArray(req.params.email)
      ? req.params.email[0]
      : req.params.email ?? ''

    const user = await getUserByEmail(email)

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, 'User fetched successfully'))
  }
)

export const updateProfileController = AsyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = UpdateProfileSchema.parse(req.body)

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''

    const updatedUser = await updateProfile(id, validatedData)

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, 'Profile updated successfully'))
  }
)

export const changePasswordController = AsyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = ChangePasswordSchema.parse(req.body)
    
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''

    const updatedUser = await changePassword(id, validatedData.oldPassword, validatedData.newPassword)

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, 'Password changed successfully'))
  }
)

export const deleteUserController = AsyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id ?? ''

    await deleteUser(id)

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'User deleted successfully'))
  }
)
