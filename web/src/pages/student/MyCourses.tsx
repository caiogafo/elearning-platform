import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import ProgressBar from '../../components/ui/ProgressBar'
import { api } from '../../services/api'
import { Enrollment } from '../../types'
import toast from 'react-hot-toast'

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Enrollment[]>('/enrollments/my')
      .then((r) => setEnrollments(r.data))
      .catch(() => toast.error('Erro ao carregar suas matrículas.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDownloadCert(enrollmentId: string, courseTitle: string) {
    try {
      await api.post(`/certificates/${enrollmentId}/issue`)
      const response = await api.get(`/certificates/${enrollmentId}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado-${courseTitle.replace(/\s+/g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erro ao baixar certificado.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Meus Cursos</h1>
          <p className="mt-1 text-gray-500">Acompanhe seu progresso e acesse seus certificados.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-24 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400">Você ainda não está matriculado em nenhum curso.</p>
            <Link to="/student" className="btn-primary mt-4 inline-block text-sm">
              Explorar cursos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="card flex items-center gap-6 p-5">
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary-100 to-blue-200">
                  {enrollment.course.thumbnailUrl && (
                    <img
                      src={enrollment.course.thumbnailUrl}
                      alt={enrollment.course.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">{enrollment.course.title}</h2>
                  <p className="text-xs text-gray-400">Por {enrollment.course.teacher?.name}</p>
                  <ProgressBar value={enrollment.progress} className="mt-2 max-w-xs" />
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {enrollment.progress === 100 && (
                    <button
                      onClick={() => handleDownloadCert(enrollment.id, enrollment.course.title)}
                      className="btn-secondary text-xs"
                    >
                      Certificado PDF
                    </button>
                  )}
                  <Link to={`/student/courses/${enrollment.courseId}`} className="btn-primary text-xs">
                    Continuar
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
