import { Router } from 'express'
import { createModule, uploadLesson, deleteLesson } from '../controllers/lesson.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'
import { uploadVideo } from '../middlewares/upload.middleware'

export const lessonRoutes = Router()

lessonRoutes.post('/modules/:courseId', authenticate, requireRole('TEACHER'), createModule)
lessonRoutes.post('/upload', authenticate, requireRole('TEACHER'), uploadVideo.single('video'), uploadLesson)
lessonRoutes.delete('/:id', authenticate, requireRole('TEACHER'), deleteLesson)
