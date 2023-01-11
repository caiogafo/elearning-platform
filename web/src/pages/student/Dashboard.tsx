import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import { api } from '../../services/api'
import { Course } from '../../types'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    api.get<Course[]>('/courses')
      .then((r) => setCourses(r.data))
      .catch(() => toast.error('Erro ao carregar cursos.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleEnroll(courseId: string) {
    setEnrolling(courseId)
    try {
      await api.post(`/enrollments/${courseId}`)
      toast.success('Matrícula realizada com sucesso!')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erro ao se matricular.')
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Explorar Cursos</h1>
          <p className="mt-1 text-gray-500">Encontre o curso certo para você e comece hoje.</p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center text-gray-400">Nenhum curso disponível ainda.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="card flex flex-col overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-primary-100 to-blue-200">
                  {course.thumbnailUrl && (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-semibold text-gray-900">{course.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span>Por {course.teacher.name}</span>
                    {course._count && (
                      <span>· {course._count.enrollments} alunos</span>
                    )}
                  </div>
                  <div className="mt-auto flex gap-2 pt-4">
                    <Link to={`/student/courses/${course.id}`} className="btn-secondary flex-1 text-center text-xs">
                      Ver curso
                    </Link>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                      className="btn-primary flex-1 text-xs"
                    >
                      {enrolling === course.id ? 'Matriculando...' : 'Matricular-se'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
