import { prisma } from '../../lib/prisma'
import { Class } from '../../../generated/prisma/enums'
import { createUser, UpdatedData, UserData } from '../Users/users.service'
import { ApiError } from '../../common/utils/ApiError'
import { Prisma } from '../../../generated/prisma/client'

interface StudentData extends UserData {
  rollNumber: string
  class: Class
  admissionDate: Date
}

interface UpdatedStudentData extends UpdatedData {
  rollNumber?: string
  class?: Class
  admissionDate?: Date
}

export const addStudent = async (studentData: StudentData) => {
  const student = await prisma.$transaction(async (tx) => {
    const user = await createUser(
      {
        name: studentData.name,
        email: studentData.email,
        password: studentData.password,
        role: 'STUDENT',
        phoneNo: studentData.phoneNo,
        profileImage: studentData.profileImage,
      },
      tx
    )

    const student = await tx.student.create({
      data: {
        userId: user.id,
        rollNumber: studentData.rollNumber,
        class: studentData.class,
        admissionDate: studentData.admissionDate,
      },
    })
    return student
  })

  return student
}

export const getStudentById = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: {
      id,
    },

    include: {
      user: true,
    },
  })

  if (!student) {
    throw new ApiError(404, 'Student not found')
  }

  return student
}

export const getAllStudents = async () => {
  return await prisma.student.findMany({
    include: {
      user: true,
    },
  })
}

export const updateStudent = async (
  id: string,
  updatedData: UpdatedStudentData
) => {
  try {
    const updatedStudent = await prisma.$transaction(async (tx) => {
      const userData = {
        name: updatedData.name,
        phoneNo: updatedData.phoneNumber,
        profileImage: updatedData.profileImage,
      }

      const studentData = {
        rollNumber: updatedData.rollNumber,
        class: updatedData.class,

        admissionDate: updatedData.admissionDate,
      }
      if (Object.values(userData).some((value) => value !== undefined)) {
        await tx.user.update({
          where: {
            id,
          },

          data: userData,
        })
      }
      if (Object.values(studentData).some((value) => value !== undefined)) {
        await tx.student.update({
          where: {
            userId: id,
          },

          data: studentData,
        })
      }
      const updatedStudent = await tx.student.findUnique({
        where: {
          userId: id,
        },

        include: {
          user: true,
        },
      })

      return updatedStudent
    })

    return updatedStudent
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new ApiError(404, 'Student not found')
    }

    throw error
  }
}

export const deleteStudent = async (id: string) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.student.delete({
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
      throw new ApiError(404, 'Student not found')
    }

    throw error
  }
}
