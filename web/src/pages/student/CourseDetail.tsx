import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import ProgressBar from '../../components/ui/ProgressBar'
import { api } from '../../services/api'
import { Course, CourseProgress, Lesson } from '../../types'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    Promise.all([
      api.get<Course>(`/courses/${id}`),
      api.get<CourseProgress>(`/enrollments/progress/${id}`).catch(() => null),
    ]).then(([courseRes, progressRes]) => {
      setCourse(courseRes.data)
      if (progressRes) setProgress(progressRes.data)
      const first = courseRes.data.modules?.[0]?.lessons?.[0]
      if (first) setActiveLesson(first)
    }).catch(() => toast.error('Erro ao carregar o curso.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleVideoEnd() {
    if (!activeLesson) return
    try {
      const seconds = videoRef.current?.duration ?? 0
      await api.post(`/enrollments/lesson/${activeLesson.id}/complete`, {
        secondsWatched: Math.round(seconds),
      })
      const { data } = await api.get<CourseProgress>(`/enrollments/progress/${id}`)
      setProgress(data)
      if (data.progress === 100) toast.success('Parabéns! Curso concluído! Acesse seu certificado em "Meus Cursos".')
    } catch {
      // progress already saved
    }
  }

  function isCompleted(lessonId: string) {
    return progress?.lessonProgress.some((p) => p.lessonId === lessonId && p.completed) ?? false
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-400">Carregando...</p>
    </div>
  )

  if (!course) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          {progress && <ProgressBar value={progress.progress} className="mt-3 max-w-sm" />}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2">
            {activeLesson ? (
              <div className="card overflow-hidden">
                <video
                  ref={videoRef}
                  key={activeLesson.id}
                  src={activeLesson.videoUrl}
                  controls
                  className="w-full bg-black"
                  style={{ maxHeight: '460px' }}
                  onEnded={handleVideoEnd}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-gray-900">{activeLesson.title}</h2>
                      {activeLesson.description && (
                        <p className="mt-1 text-sm text-gray-500">{activeLesson.description}</p>
                      )}
                    </div>
                    {isCompleted(activeLesson.id) && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 whitespace-nowrap">
                        Concluída
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex h-64 items-center justify-center text-gray-400">
                Selecione uma aula para começar
              </div>
            )}
          </div>

          {/* Lesson List */}
          <div className="card h-fit overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">Conteúdo do Curso</h3>
              {progress && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {progress.completedLessons}/{progress.totalLessons} aulas concluídas
                </p>
              )}
            </div>

            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {course.modules?.map((mod) => (
                <div key={mod.id}>
                  <div className="bg-gray-50 px-5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {mod.title}
                    </p>
                  </div>
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={clsx(
                        'flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-primary-50',
                        activeLesson?.id === lesson.id && 'bg-primary-50'
                      )}
                    >
                      <div className={clsx(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        isCompleted(lesson.id)
                          ? 'bg-green-500 text-white'
                          : activeLesson?.id === lesson.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      )}>
                        {isCompleted(lesson.id) ? '✓' : lesson.order}
                      </div>
                      <span className={clsx(
                        'text-sm',
                        activeLesson?.id === lesson.id ? 'font-semibold text-primary-700' : 'text-gray-700'
                      )}>
                        {lesson.title}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
