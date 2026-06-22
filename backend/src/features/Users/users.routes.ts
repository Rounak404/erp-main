import { Router } from 'express'
import { changePasswordController, createUserController, deleteUserController, getUserByEmailController, getUserByIdController, updateProfileController } from './users.controller'

const userRoutes = Router()

userRoutes.post('/', createUserController)

userRoutes.get('/id/:id', getUserByIdController)

userRoutes.get('/email/:email', getUserByEmailController)

userRoutes.patch('/:id/profile', updateProfileController)

userRoutes.patch('/:id/password', changePasswordController)

userRoutes.delete('/:id',deleteUserController)

export default userRoutes
