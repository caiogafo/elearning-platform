import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { AppError } from '../middlewares/error.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
})

export async function listCourses(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        teacher: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { modules: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(courses)
  } catch (err) {
    next(err)
  }
}

export async function getCourse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { select: { id: true, name: true, avatarUrl: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
        _count: { select: { enrollments: true } },
      },
    })
    if (!course) throw new AppError(404, 'Curso não encontrado.')
    return res.json(course)
  } catch (err) {
    next(err)
  }
}

export async function createCourse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = courseSchema.parse(req.body)
    const file = req.file as Express.Multer.File & { path: string }

    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        thumbnailUrl: file?.path,
        teacherId: req.user!.id,
      },
    })
    return res.status(201).json(course)
  } catch (err) {
    next(err)
  }
}

export async function updateCourse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } })
    if (!course) throw new AppError(404, 'Curso não encontrado.')
    if (course.teacherId !== req.user!.id) throw new AppError(403, 'Acesso negado.')

    const body = courseSchema.partial().parse(req.body)
    const file = req.file as Express.Multer.File & { path: string }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: { ...body, ...(file && { thumbnailUrl: file.path }) },
    })
    return res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function publishCourse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } })
    if (!course) throw new AppError(404, 'Curso não encontrado.')
    if (course.teacherId !== req.user!.id) throw new AppError(403, 'Acesso negado.')

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: { published: !course.published },
    })
    return res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function getTeacherCourses(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const courses = await prisma.course.findMany({
      where: { teacherId: req.user!.id },
      include: {
        _count: { select: { enrollments: true, modules: true } },
        modules: { include: { _count: { select: { lessons: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(courses)
  } catch (err) {
    next(err)
  }
}
