import { auth } from '../../lib/auth'
import { User, Session } from 'better-auth'

type CustomUser = typeof auth.$Infer.Session.user

declare global {
  namespace Express {
    interface Request {
      user?: CustomUser
      session?: Session
    }
  }
}
