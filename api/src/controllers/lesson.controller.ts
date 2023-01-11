import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { cloudinary } from '../config/cloudinary'
import { AppError } from '../middlewares/error.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'

const moduleSchema = z.object({
  title: z.string().min(2),
  order: z.coerce.number().int().positive(),
})

const lessonSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  order: z.coerce.number().int().positive(),
  moduleId: z.string().uuid(),
})

export async function createModule(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = moduleSchema.parse(req.body)
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } })
    if (!course) throw new AppError(404, 'Curso não encontrado.')
    if (course.teacherId !== req.user!.id) throw new AppError(403, 'Acesso negado.')

    const mod = await prisma.module.create({
      data: { title: body.title, order: body.order, courseId: req.params.courseId },
    })
    return res.status(201).json(mod)
  } catch (err) {
    next(err)
  }
}

export async function uploadLesson(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = lessonSchema.parse(req.body)
    const file = req.file as Express.Multer.File & { path: string; filename: string }
    if (!file) throw new AppError(400, 'Arquivo de vídeo obrigatório.')

    const mod = await prisma.module.findUnique({
      where: { id: body.moduleId },
      include: { course: true },
    })
    if (!mod) throw new AppError(404, 'Módulo não encontrado.')
    if (mod.course.teacherId !== req.user!.id) throw new AppError(403, 'Acesso negado.')

    const videoInfo = await cloudinary.api.resource(file.filename, { resource_type: 'video' })

    const lesson = await prisma.lesson.create({
      data: {
        title: body.title,
        description: body.description,
        videoUrl: file.path,
        videoPublicId: file.filename,
        duration: Math.round(videoInfo.duration ?? 0),
        order: body.order,
        moduleId: body.moduleId,
      },
    })
    return res.status(201).json(lesson)
  } catch (err) {
    next(err)
  }
}

export async function deleteLesson(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: { module: { include: { course: true } } },
    })
    if (!lesson) throw new AppError(404, 'Aula não encontrada.')
    if (lesson.module.course.teacherId !== req.user!.id) throw new AppError(403, 'Acesso negado.')

    await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: 'video' })
    await prisma.lesson.delete({ where: { id: req.params.id } })

    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}
