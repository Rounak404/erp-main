// src/features/Subject/subject.routes.ts
import { Router } from 'express'
import { SubjectController } from './subject.controller'
import { validate } from '../../common/middlewares/validate.middleware'
import { CreateSubjectSchema, UpdateSubjectSchema } from './subject.schema'

const subjectRoutes = Router({ mergeParams: true })

subjectRoutes
  .route('/')
  .get(SubjectController.getAllSubjects)
  .post(validate(CreateSubjectSchema), SubjectController.createSubject)

subjectRoutes
  .route('/:id')
  .put(validate(UpdateSubjectSchema), SubjectController.updateSubject)
  .delete(SubjectController.deleteSubject)

export default subjectRoutes
