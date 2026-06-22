import e, { NextFunction, Request, Response } from 'express'
import userRoutes from './features/Users/users.routes'
import { ApiError } from './common/utils/ApiError'
import studentRoutes from './features/Students/students.routes'
import teacherRoutes from './features/Teachers/teachers.routes'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth'
import classRoomRoutes from './features/ClassRoom/classRoom.routes'
import subjectRoutes from './features/Subject/subject.routes'

const app = e()

app.all('/api/v1/auth/*splat', toNodeHandler(auth))

app.use(e.json())
app.use(e.urlencoded({ extended: true }))

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/students', studentRoutes)
app.use('/api/v1/teachers', teacherRoutes)
app.use('/api/v1/classroom', classRoomRoutes)
app.use('/api/v1/subject', subjectRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send('ERP Backend Running')
})

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Route not found'))
})

app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  })
})

export { app }
