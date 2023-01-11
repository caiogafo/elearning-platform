import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import { api } from '../../services/api'
import { Course } from '../../types'
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Course[]>('/courses/teacher/my-courses')
      .then((r) => setCourses(r.data))
      .catch(() => toast.error('Erro ao carregar seus cursos.'))
      .finally(() => setLoading(false))
  }, [])

  async function togglePublish(course: Course) {
    try {
      const { data } = await api.patch<Course>(`/courses/${course.id}/publish`)
      setCourses((prev) => prev.map((c) => (c.id === course.id ? data : c)))
      toast.success(data.published ? 'Curso publicado!' : 'Curso despublicado.')
    } catch {
      toast.error('Erro ao alterar status do curso.')
    }
  }

  const totalStudents = courses.reduce((acc, c) => acc + (c._count?.enrollments ?? 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Cursos</h1>
            <p className="mt-1 text-gray-500">Gerencie seu conteúdo e acompanhe seus alunos.</p>
          </div>
          <Link to="/teacher/courses/new" className="btn-primary">
            + Novo Curso
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Cursos criados', value: courses.length },
            { label: 'Cursos publicados', value: courses.filter((c) => c.published).length },
            { label: 'Total de alunos', value: totalStudents },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-20 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400">Você ainda não criou nenhum curso.</p>
            <Link to="/teacher/courses/new" className="btn-primary mt-4 inline-block text-sm">
              Criar primeiro curso
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="card flex items-center gap-5 p-5">
                <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary-100 to-blue-200">
                  {course.thumbnailUrl && (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">{course.title}</h2>
                  <div className="mt-1 flex gap-3 text-xs text-gray-400">
                    <span>{course._count?.modules ?? 0} módulos</span>
                    <span>{course._count?.enrollments ?? 0} alunos</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.published ? 'Publicado' : 'Rascunho'}
                  </span>
                  <button
                    onClick={() => togglePublish(course)}
                    className="btn-secondary text-xs"
                  >
                    {course.published ? 'Despublicar' : 'Publicar'}
                  </button>
                  <Link to={`/teacher/courses/${course.id}`} className="btn-primary text-xs">
                    Gerenciar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
