// src/middleware/validate.middleware.ts
import { z, ZodError } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'

export const validate = (schema: z.ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Await the parse and capture the transformed data
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
      })

      // 2. Reassign the cleaned data back to the request object
      req.body = validatedData.body

      if (validatedData.query) {
        for (const key in req.query) {
          delete req.query[key]
        }
        Object.assign(req.query, validatedData.query)
      }

      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        // 3. Format the error string and pass it to your existing ApiError handler
        const issues = error.issues
        const errorMessages = issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ')

        return next(new ApiError(400, `Validation failed - ${errorMessages}`))
      }

      return next(error)
    }
  }
}
