import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { ApiError } from '../utils/ApiError'
import { AsyncHandler } from '../utils/AsyncHandler'

export const hydrateTeacherContext = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: req?.user?.id },
      select: { id: true },
    })
    const currentUserRole = req?.user?.role

    if (currentUserRole === 'ADMIN') {
      return next()
    }

    if (!teacherProfile) {
      throw new ApiError(
        404,
        'Your account is authenticated as a Teacher, but your school profile does not exist.'
      )
    }

    req.teacherId = teacherProfile.id
    next()
  }
)
export const hydrateStudentContext = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const currentUserRole = req?.user?.role

    if (currentUserRole === 'TEACHER' || currentUserRole === 'ADMIN') {
      return next()
    }
    const StudentProfile = await prisma.student.findUnique({
      where: { userId: req?.user?.id },
      select: { id: true },
    })

    if (!StudentProfile) {
      throw new ApiError(
        404,
        'Your account is authenticated as a Student, but your school profile does not exist.'
      )
    }

    req.studentId = StudentProfile.id
    next()
  }
)
