import { prisma } from '../../lib/prisma'
import { Prisma, Role } from '../../../generated/prisma/client'
import bcrypt from 'bcrypt'
import { ApiError } from '../../common/utils/ApiError'

export interface UserData {
  name: string
  email: string
  password: string
  role: Role
  phoneNo?: string
  profileImage?: string
}
export interface UpdatedData {
  name?: string
  phoneNumber?: string
  profileImage?: string
}

export const createUser = async (
  userData: UserData,
  tx?: Prisma.TransactionClient
) => {

  try {
    const db = tx ?? prisma
    const hashPassword = await bcrypt.hash(userData.password, 10)
    userData.password = hashPassword
    const user = await db.user.create({
      data: userData,
    })

    return user
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ApiError(409, 'Email already exists')
    }

    throw error
  }
}

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  return user
}

export const updateProfile = async (
  id: string,
  updatedData: UpdatedData
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: updatedData,
    })
    return updatedUser
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    )
      throw new ApiError(404, 'User not Found!')
    throw error
  }
}

export const changePassword = async (
  id: string,
  newPassword: string,
  oldPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password)

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Old password is incorrect')
  }

  if (oldPassword == newPassword)
    throw new ApiError(400, 'New password cannot be same as old password')

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },

    data: {
      password: hashedPassword,
    },
  })

  return updatedUser
}

export const deleteUser = async (id: string) => {
  const deletedUser = await prisma.user.delete({
    where: {
      id,
    },
  })

  return deletedUser
}
