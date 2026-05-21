import {
  AssignSubjectToClassData,
  CreateClassRoomData,
} from '../../common/types/classRoom.types'
import { ApiError } from '../../common/utils/ApiError'
import { prisma } from '../../lib/prisma'

export class ClassRoomServices {
  // ===================================================================================
  // 🏢 CLASSROOM ADMINISTRATION (CRUD)
  // ===================================================================================

  static async createClassRoom(data: CreateClassRoomData) {
    const { grade, section } = data
    const existingClass = await prisma.classRoom.findUnique({
      where: {
        grade_section: {
          grade: grade,
          section: section,
        },
      },
    })

    if (existingClass) {
      throw new ApiError(
        400,
        `Class ${grade}-${section} already exists in the system.`
      )
    }

    return await prisma.classRoom.create({
      data: {
        name: `Class ${grade}-${section}`,
        grade,
        section,
      },
    })
  }

  static async updateClassRoom(
    id: string,
    data: { name?: string; grade?: string; section?: string }
  ) {
    if (data.grade || data.section) {
      const current = await prisma.classRoom.findUnique({ where: { id } })
      if (!current) throw new ApiError(404, 'Classroom not found.')

      const targetGrade = data.grade ?? current.grade
      const targetSection = data.section ?? current.section

      const duplicate = await prisma.classRoom.findFirst({
        where: { grade: targetGrade, section: targetSection, NOT: { id } },
      })
      if (duplicate)
        throw new ApiError(
          400,
          `Class ${targetGrade}-${targetSection} already exists.`
        )
    }

    return await prisma.classRoom.update({
      where: { id },
      data,
    })
  }

  static async deleteClassRoom(id: string) {
    const classRoom = await prisma.classRoom.findUnique({ where: { id } })
    if (!classRoom) throw new ApiError(404, 'Classroom not found.')

    return await prisma.classRoom.delete({ where: { id } })
  }

  static async getAllClassRooms(filters?: { grade?: string }) {
    return await prisma.classRoom.findMany({
      where: { grade: filters?.grade },
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
    })
  }

  // ===================================================================================
  // 🎓 STUDENT LIFECYCLE & ROSTER MANAGEMENT
  // ===================================================================================

  static async assignStudentsToClass(
    classRoomId: string,
    studentIds: string[]
  ) {
    const targetClass = await prisma.classRoom.findUnique({
      where: { id: classRoomId },
    })
    if (!targetClass) {
      throw new ApiError(404, 'Target classroom does not exist.')
    }

    return await prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: { classRoomId },
    })
  }

  static async unassignStudentsFromClass(studentIds: string[]) {
    return await prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: { classRoomId: null },
    })
  }

  static async getClassRoomRoster(classRoomId: string) {
    const classRoom = await prisma.classRoom.findUnique({
      where: { id: classRoomId },
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
          orderBy: { rollNumber: 'asc' },
        },
      },
    })

    if (!classRoom) {
      throw new ApiError(404, 'Classroom not found.')
    }

    return classRoom
  }

  // ===================================================================================
  // 📖 ACADEMIC CURRICULUM & FACULTY STAFFING
  // ===================================================================================

  static async assignSubjectToClass(data: AssignSubjectToClassData) {
    const subjectConflict = await prisma.classSubject.findUnique({
      where: {
        classRoomId_subjectId: {
          classRoomId: data.classRoomId,
          subjectId: data.subjectId,
        },
      },
    })

    if (subjectConflict) {
      throw new ApiError(
        400,
        'This classroom already has this subject assigned.'
      )
    }

    return await prisma.classSubject.create({
      data: {
        classRoomId: data.classRoomId,
        subjectId: data.subjectId,
        teacherId: data.teacherId || null,
      },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
    })
  }

  static async assignMultipleSubjectsToClass(
    classRoomId: string,
    subjectIds: string[]
  ) {
    const targetClass = await prisma.classRoom.findUnique({
      where: { id: classRoomId },
    })
    if (!targetClass) throw new ApiError(404, 'Classroom does not exist.')

    const dataToInsert = subjectIds.map((subjectId) => ({
      classRoomId,
      subjectId,
    }))

    return await prisma.classSubject.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    })
  }

  static async removeSubjectFromClass(classRoomId: string, subjectId: string) {
    return await prisma.classSubject.delete({
      where: {
        classRoomId_subjectId: {
          classRoomId,
          subjectId,
        },
      },
    })
  }

  static async changeSubjectTeacher(
    classSubjectId: string,
    newTeacherId: string | null
  ) {
    const assignment = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
    })
    if (!assignment) {
      throw new ApiError(404, 'Class with Subject mapping not found.')
    }

    return await prisma.classSubject.update({
      where: { id: classSubjectId },
      data: { teacherId: newTeacherId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
    })
  }

  static async getClassRoomCurriculum(classRoomId: string) {
    const curriculum = await prisma.classRoom.findUnique({
      where: { id: classRoomId },
      select: {
        id: true,
        name: true,
        subjects: {
          include: {
            subject: true,
            teacher: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
    })

    if (!curriculum) throw new ApiError(404, 'Classroom not found.')
    return curriculum
  }
}

// ===================================================================================
// 📝 ARCHITECTURAL & SERVICE IMPLEMENTATION NOTES
// ===================================================================================
/*
 * 🏢 1. CLASSROOM ADMINISTRATION (CRUD LOGIC)
 * -----------------------------------------------------------------------------------
 * • createClassRoom:
 * Extracts [grade + section] and verifies uniqueness against the compound unique
 * index before creating the record to avoid database constraint failures[cite: 164, 185].
 * • updateClassRoom:
 * If grade or section fields are modified, findFirst executes a look-ahead validation
 * ensuring the combination is not already owned by another room ID[cite: 167, 188].
 * • deleteClassRoom:
 * Safely isolates and breaks the record down[cite: 168]. Due to database-level onDelete: SetNull
 * cascading, any child student records are retained but set as unassigned[cite: 14, 191].
 * • getAllClassRooms:
 * Retrieves structural setups sorted sequentially by grade level arrays and sections[cite: 173].
 * Aggregates assigned student metrics using Prisma's lightweight _count utility[cite: 173, 193].
 *
 * 🎓 2. STUDENT LIFECYCLE & ROSTER MANAGEMENT
 * -----------------------------------------------------------------------------------
 * • assignStudentsToClass & unassignStudentsFromClass:
 * Relational design does not append collections of primitive strings to ClassRooms[cite: 51, 55].
 * Instead, bulk data transactions occur purely on Student table rows by overwriting the
 * 'classRoomId' foreign key reference column (or assigning null for offboarding)[cite: 52, 175].
 * • getClassRoomRoster:
 * Queries the inverse virtual relation arrays mapped inside the application engine[cite: 56, 57].
 * Performs internal relational JOINS to serve roll-number ordered lists containing secure,
 * destructured user contact values[cite: 57, 172, 201].
 *
 * 📖 3. ACADEMIC CURRICULUM & FACULTY STAFFING
 * -----------------------------------------------------------------------------------
 * • assignSubjectToClass & assignMultipleSubjectsToClass:
 * Creates single or bulk mapping rows within the ClassSubject junction schema[cite: 181, 203].
 * The bulk variant utilizes .createMany with 'skipDuplicates: true' to safely ignore pre-existing
 * subject links without halting executing transaction pipelines[cite: 182, 206].
 * • removeSubjectFromClass & changeSubjectTeacher:
 * Directly manipulates courses within individual classroom parameters[cite: 180]. Clears
 * active faculty rows seamlessly by overriding targeted inputs with standard null values[cite: 180, 211].
 * • getClassRoomCurriculum:
 * Assembles comprehensive academic workloads[cite: 212]. Resolves multidirectional relationships
 * by recursively extracting Subject details and corresponding teacher profiles[cite: 183, 213].
 */
