import { Request, Response, NextFunction } from 'express'
import { auth } from '../../lib/auth' 
import { ApiError } from '../utils/ApiError' 
import { fromNodeHeaders } from 'better-auth/node'

export const checkSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) {
      throw new ApiError(
        401,
        'Authentication required. Please log in to continue.'
      )
    }

    req.user = session.user
    req.session = session.session

    return next()
  } catch (error) {
    return next(error)
  }
}

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(
          500,
          'Auth context missing. requireRole must be preceded by checkSession.'
        )
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(
          403,
          'Forbidden: You do not have permission to access this resource.'
        )
      }

      return next()
    } catch (error) {
      return next(error)
    }
  }
}