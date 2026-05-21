import { ApiError } from "../../common/utils/ApiError";
import { prisma } from "../../lib/prisma";


export class SubjectServices {
  static async createSubject(data: { name: string }) {
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
      },
    })
    if (existingSubject) {
      throw new ApiError(
        400,
        `A subject named '${data.name}' already exists in the catalog.`
      )
    }
    return await prisma.subject.create({ data })
  }

  static async getAllSubjects() {
    return await prisma.subject.findMany({
      orderBy: { name: 'asc' },
    })
  }
  static async updateSubject(id: string, data: { name?: string }) {
    const current = await prisma.subject.findUnique({ where: { id } })
    if (!current) throw new ApiError(404, 'Subject record not found.')

    if (data.name && data.name.toLowerCase() !== current.name.toLowerCase()) {
      const duplicateName = await prisma.subject.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' } },
      })
      if (duplicateName)
        throw new ApiError(
          400,
          `The subject name '${data.name}' is already taken.`
        )
    }

    return await prisma.subject.update({
      where: { id },
      data,
    })
  }

  static async deleteSubject(id: string) {
    const subject = await prisma.subject.findUnique({ where: { id } })
    if (!subject) throw new ApiError(404, 'Subject record not found.')
        
    return await prisma.subject.delete({ where: { id } })
  }
}