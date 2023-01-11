import { Router } from 'express'
import { register, login, refresh, me } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'

export const authRoutes = Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.post('/refresh', refresh)
authRoutes.get('/me', authenticate, me)
