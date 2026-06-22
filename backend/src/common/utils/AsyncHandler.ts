import { NextFunction, Request, Response } from 'express'

const AsyncHandler = (
  requestHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(
      requestHandler(req, res, next).catch((err: unknown) => next(err))
    )
  }
}

export { AsyncHandler }
