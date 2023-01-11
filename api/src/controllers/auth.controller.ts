import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { hashPassword, comparePassword } from '../utils/password'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { AppError } from '../middlewares/error.middleware'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = registerSchema.parse(req.body)

    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) throw new AppError(409, 'E-mail já cadastrado.')

    const passwordHash = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, passwordHash, role: body.role },
      select: { id: true, name: true, email: true, role: true },
    })

    const accessToken = signAccessToken({ id: user.id, role: user.role })
    const refreshToken = signRefreshToken({ id: user.id, role: user.role })

    return res.status(201).json({ user, accessToken, refreshToken })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) throw new AppError(401, 'Credenciais inválidas.')

    const valid = await comparePassword(body.password, user.passwordHash)
    if (!valid) throw new AppError(401, 'Credenciais inválidas.')

    const accessToken = signAccessToken({ id: user.id, role: user.role })
    const refreshToken = signRefreshToken({ id: user.id, role: user.role })

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw new AppError(401, 'Refresh token não fornecido.')

    const payload = verifyRefreshToken(refreshToken) as { id: string; role: string }
    const accessToken = signAccessToken({ id: payload.id, role: payload.role })

    return res.json({ accessToken })
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request & { user?: { id: string } }, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
    })
    if (!user) throw new AppError(404, 'Usuário não encontrado.')
    return res.json(user)
  } catch (err) {
    next(err)
  }
}
