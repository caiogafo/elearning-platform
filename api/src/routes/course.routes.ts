import { Router } from 'express'
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  publishCourse,
  getTeacherCourses,
} from '../controllers/course.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'
import { uploadImage } from '../middlewares/upload.middleware'

export const courseRoutes = Router()

courseRoutes.get('/', authenticate, listCourses)
courseRoutes.get('/teacher/my-courses', authenticate, requireRole('TEACHER'), getTeacherCourses)
courseRoutes.get('/:id', authenticate, getCourse)
courseRoutes.post('/', authenticate, requireRole('TEACHER'), uploadImage.single('thumbnail'), createCourse)
courseRoutes.put('/:id', authenticate, requireRole('TEACHER'), uploadImage.single('thumbnail'), updateCourse)
courseRoutes.patch('/:id/publish', authenticate, requireRole('TEACHER'), publishCourse)
