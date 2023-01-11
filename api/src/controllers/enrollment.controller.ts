import { Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../middlewares/error.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'

export async function enroll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params
    const studentId = req.user!.id

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course || !course.published) throw new AppError(404, 'Curso não encontrado.')

    const already = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    })
    if (already) throw new AppError(409, 'Você já está matriculado neste curso.')

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId },
    })
    return res.status(201).json(enrollment)
  } catch (err) {
    next(err)
  }
}

export async function getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user!.id },
      include: {
        course: {
          include: {
            teacher: { select: { name: true } },
            modules: { include: { lessons: { select: { id: true } } } },
          },
        },
        lessonProgress: { where: { completed: true } },
        certificate: true,
      },
      orderBy: { enrolledAt: 'desc' },
    })

    const result = enrollments.map((e) => {
      const totalLessons = e.course.modules.reduce(
        (acc, m) => acc + m.lessons.length, 0
      )
      const completedLessons = e.lessonProgress.length
      const progress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0

      return { ...e, progress }
    })

    return res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function markLessonComplete(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { lessonId } = req.params
    const { secondsWatched } = req.body
    const studentId = req.user!.id

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    })
    if (!lesson) throw new AppError(404, 'Aula não encontrada.')

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: lesson.module.courseId } },
    })
    if (!enrollment) throw new AppError(403, 'Você não está matriculado neste curso.')

    const progress = await prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
      update: { secondsWatched, completed: true },
      create: { enrollmentId: enrollment.id, lessonId, secondsWatched, completed: true },
    })

    // Check if course is fully complete
    const allLessons = await prisma.lesson.count({
      where: { module: { courseId: lesson.module.courseId } },
    })
    const completedCount = await prisma.lessonProgress.count({
      where: { enrollmentId: enrollment.id, completed: true },
    })

    if (completedCount === allLessons && !enrollment.completedAt) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { completedAt: new Date() },
      })
    }

    return res.json(progress)
  } catch (err) {
    next(err)
  }
}

export async function getCourseProgress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params
    const studentId = req.user!.id

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
      include: {
        lessonProgress: true,
        certificate: true,
      },
    })
    if (!enrollment) throw new AppError(404, 'Matrícula não encontrada.')

    const totalLessons = await prisma.lesson.count({
      where: { module: { courseId } },
    })
    const completedLessons = enrollment.lessonProgress.filter((p) => p.completed).length
    const progress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    return res.json({
      enrollmentId: enrollment.id,
      progress,
      completedLessons,
      totalLessons,
      completedAt: enrollment.completedAt,
      certificate: enrollment.certificate,
      lessonProgress: enrollment.lessonProgress,
    })
  } catch (err) {
    next(err)
  }
}
