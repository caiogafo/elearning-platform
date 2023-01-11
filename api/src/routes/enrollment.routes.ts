import { Router } from 'express'
import {
  enroll,
  getMyEnrollments,
  markLessonComplete,
  getCourseProgress,
} from '../controllers/enrollment.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

export const enrollmentRoutes = Router()

enrollmentRoutes.post('/:courseId', authenticate, requireRole('STUDENT'), enroll)
enrollmentRoutes.get('/my', authenticate, requireRole('STUDENT'), getMyEnrollments)
enrollmentRoutes.post('/lesson/:lessonId/complete', authenticate, requireRole('STUDENT'), markLessonComplete)
enrollmentRoutes.get('/progress/:courseId', authenticate, requireRole('STUDENT'), getCourseProgress)
