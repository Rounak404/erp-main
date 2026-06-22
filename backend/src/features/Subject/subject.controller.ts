// src/features/Subject/subject.controller.ts
import { Request, Response } from 'express'
import { SubjectServices } from './subject.service'
import { ApiResponse } from '../../common/utils/ApiResponse'
import { AsyncHandler } from '../../common/utils/AsyncHandler'

export class SubjectController {
  static createSubject = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const newSubject = await SubjectServices.createSubject(req.body)
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            newSubject,
            'Global course registry item initialized successfully.'
          )
        )
    }
  )

  static getAllSubjects = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const subjects = await SubjectServices.getAllSubjects()
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            subjects,
            'Master subject catalog parsed successfully.'
          )
        )
    }
  )

  static updateSubject = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id ?? ''
      const updatedSubject = await SubjectServices.updateSubject(id, req.body)
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedSubject,
            'Subject curriculum metadata altered successfully.'
          )
        )
    }
  )

  static deleteSubject = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id ?? ''
      await SubjectServices.deleteSubject(id)
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            'Subject completely purged from system catalogs.'
          )
        )
    }
  )
}
