import { Request, Response, NextFunction } from 'express'
import { ClassRoomServices } from './classRoom.service'
import { ApiResponse } from '../../common/utils/ApiResponse'

/**
 * Express Route Controller Layer handling all incoming network traffic
 * for the institutional Classroom module.
 */
export class ClassRoomController {
  // ===================================================================================
  // 🏢 CLASSROOM ADMINISTRATION (CRUD)
  // ===================================================================================

  static async createClassRoom(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newClassRoom = await ClassRoomServices.createClassRoom(req.body)

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            newClassRoom,
            'Classroom cohort initialized successfully.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  static async updateClassRoom(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id ?? ''
      const updatedClassRoom = await ClassRoomServices.updateClassRoom(
        id,
        req.body
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedClassRoom,
            'Classroom infrastructure updated successfully.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  static async deleteClassRoom(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id ?? ''
      await ClassRoomServices.deleteClassRoom(id[0])

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            'Classroom records deleted from the system.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  static async getAllClassRooms(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const gradeFilter = req.query.grade ? String(req.query.grade) : undefined
      const classRooms = await ClassRoomServices.getAllClassRooms({
        grade: gradeFilter,
      })

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            classRooms,
            'Classroom registries retrieved successfully.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  // ===================================================================================
  // 🎓 STUDENT LIFECYCLE & ROSTER MANAGEMENT
  // ===================================================================================

  static async assignStudentsToClass(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { classRoomId, studentIds } = req.body
      const updateResult = await ClassRoomServices.assignStudentsToClass(
        classRoomId,
        studentIds
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updateResult,
            'Student cohort successfully assigned to classroom.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  static async unassignStudentsFromClass(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentIds } = req.body
      const updateResult = await ClassRoomServices.unassignStudentsFromClass(
        studentIds
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updateResult,
            'Targeted students unassigned from active classrooms.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  static async getClassRoomRoster(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id ?? ''
      const rosterList = await ClassRoomServices.getClassRoomRoster(id)

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            rosterList,
            'Active class roster retrieved successfully.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  // ===================================================================================
  // 📖 ACADEMIC CURRICULUM & FACULTY STAFFING
  // ===================================================================================

  static async assignSubjectToClass(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const assignment = await ClassRoomServices.assignSubjectToClass(req.body)

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            assignment,
            'Subject successfully attached to classroom allocation.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  static async assignMultipleSubjectsToClass(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { classRoomId, subjectIds } = req.body
      const assignmentBatch =
        await ClassRoomServices.assignMultipleSubjectsToClass(
          classRoomId,
          subjectIds
        )

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            assignmentBatch,
            'Course tracking codes bulk-mapped successfully.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  static async removeSubjectFromClass(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { classRoomId, subjectId } = req.body
      await ClassRoomServices.removeSubjectFromClass(classRoomId, subjectId)

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            'Subject successfully unlinked from classroom track.'
          )
        )
    } catch (error) {
      next(error)
    }
  }

  static async changeSubjectTeacher(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { classSubjectId, newTeacherId } = req.body
      const alteredAssignment = await ClassRoomServices.changeSubjectTeacher(
        classSubjectId,
        newTeacherId
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            alteredAssignment,
            'Primary course educator reassigned successfully.'
          )
        )
    } catch (error) {
      next(next)
    }
  }

  static async getClassRoomCurriculum(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id ?? ''
      const academicCurriculum = await ClassRoomServices.getClassRoomCurriculum(
        id
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            academicCurriculum,
            'Classroom curriculum layout parsed successfully.'
          )
        )
    } catch (error) {
      next(error)
    }
  }
}
