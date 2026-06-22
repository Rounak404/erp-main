import { prisma } from '../../lib/prisma'
import { Prisma } from '../../../generated/prisma/client'
import { createUser } from '../Users/users.service'
import { ApiError } from '../../common/utils/ApiError'

interface TeacherData {
  name: string
  email: string
  password: string

  phoneNo?: string
  profileImage?: string

  employeeId: string
  joiningDate: Date
}

interface UpdatedTeacherData {
  name?: string
  phoneNo?: string
  profileImage?: string

  employeeId?: string
  joiningDate?: Date
}

export const addTeacher = async (teacherData: TeacherData) => {
  try {
    const teacher = await prisma.$transaction(async (tx) => {
      const user = await createUser(
        {
          name: teacherData.name,
          email: teacherData.email,
          password: teacherData.password,
          role: 'TEACHER',
          phoneNo: teacherData.phoneNo,
          profileImage: teacherData.profileImage,
        },
        tx
      )

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId: teacherData.employeeId,
          joiningDate: teacherData.joiningDate,
        },
      })
      return teacher
    })
    return teacher
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ApiError(409, 'Teacher already exists')
    }

    throw error
  }
}

export const getTeacherById = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: {
      id,
    },

    include: {
      user: true,
    },
  })

  if (!teacher) {
    throw new ApiError(404, 'Teacher not found')
  }

  return teacher
}

export const getAllTeachers = async () => {
  return await prisma.teacher.findMany({
    include: {
      user: true,
    },
  })
}

export const updateTeacher = async (
  id: string,
  updatedData: UpdatedTeacherData
) => {
  try {
    const updatedTeacher = await prisma.$transaction(async (tx) => {
      const userData = {
        name: updatedData.name,
        phoneNo: updatedData.phoneNo,
        profileImage: updatedData.profileImage,
      }

      const teacherData = {
        employeeId: updatedData.employeeId,
        joiningDate: updatedData.joiningDate,
      }

      if (Object.values(userData).some((value) => value !== undefined)) {
        await tx.user.update({
          where: {
            id,
          },

          data: userData,
        })
      }

      if (Object.values(teacherData).some((value) => value !== undefined)) {
        await tx.teacher.update({
          where: {
            userId: id,
          },

          data: teacherData,
        })
      }

      const teacher = await tx.teacher.findUnique({
        where: {
          userId: id,
        },

        include: {
          user: true,
        },
      })

      return teacher
    })

    return updatedTeacher
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new ApiError(404, 'Teacher not found')
    }

    throw error
  }
}

export const deleteTeacher = async (id: string) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.teacher.delete({
        where: {
          userId: id,
        },
      })

      await tx.user.delete({
        where: {
          id,
        },
      })
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new ApiError(404, 'Teacher not found')
    }

    throw error
  }
}
