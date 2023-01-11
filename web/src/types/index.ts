export type Role = 'STUDENT' | 'TEACHER'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  published: boolean
  teacher: { id: string; name: string; avatarUrl?: string }
  _count?: { enrollments: number; modules: number }
  modules?: Module[]
}

export interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description?: string
  videoUrl: string
  duration: number
  order: number
}

export interface Enrollment {
  id: string
  courseId: string
  enrolledAt: string
  completedAt?: string
  progress: number
  course: Course
  certificate?: Certificate
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  secondsWatched: number
}

export interface Certificate {
  id: string
  fileUrl: string
  issuedAt: string
}

export interface CourseProgress {
  enrollmentId: string
  progress: number
  completedLessons: number
  totalLessons: number
  completedAt?: string
  certificate?: Certificate
  lessonProgress: LessonProgress[]
}
