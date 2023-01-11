import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRoutes } from './routes/auth.routes'
import { courseRoutes } from './routes/course.routes'
import { lessonRoutes } from './routes/lesson.routes'
import { enrollmentRoutes } from './routes/enrollment.routes'
import { certificateRoutes } from './routes/certificate.routes'
import { errorMiddleware } from './middlewares/error.middleware'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/certificates', certificateRoutes)

app.use(errorMiddleware)

export default app
