import { useEffect, useState, FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import { api } from '../../services/api'
import { Course } from '../../types'
import toast from 'react-hot-toast'

export default function ManageCourse() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  // Module form
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleOrder, setModuleOrder] = useState(1)
  const [savingModule, setSavingModule] = useState(false)

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonOrder, setLessonOrder] = useState(1)
  const [lessonModuleId, setLessonModuleId] = useState('')
  const [lessonFile, setLessonFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    api.get<Course>(`/courses/${id}`)
      .then((r) => {
        setCourse(r.data)
        if (r.data.modules?.[0]) setLessonModuleId(r.data.modules[0].id)
      })
      .catch(() => toast.error('Erro ao carregar o curso.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAddModule(e: FormEvent) {
    e.preventDefault()
    setSavingModule(true)
    try {
      await api.post(`/lessons/modules/${id}`, { title: moduleTitle, order: moduleOrder })
      const { data } = await api.get<Course>(`/courses/${id}`)
      setCourse(data)
      setModuleTitle('')
      setModuleOrder((prev) => prev + 1)
      toast.success('Módulo adicionado!')
    } catch {
      toast.error('Erro ao adicionar módulo.')
    } finally {
      setSavingModule(false)
    }
  }

  async function handleUploadLesson(e: FormEvent) {
    e.preventDefault()
    if (!lessonFile) return toast.error('Selecione um arquivo de vídeo.')
    setUploading(true)
    setUploadProgress(0)

    const form = new FormData()
    form.append('title', lessonTitle)
    form.append('order', String(lessonOrder))
    form.append('moduleId', lessonModuleId)
    form.append('video', lessonFile)

    try {
      await api.post('/lessons/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      const { data } = await api.get<Course>(`/courses/${id}`)
      setCourse(data)
      setLessonTitle('')
      setLessonOrder((prev) => prev + 1)
      setLessonFile(null)
      setUploadProgress(0)
      toast.success('Aula enviada com sucesso!')
    } catch {
      toast.error('Erro ao enviar aula.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400">Carregando...</div>
  if (!course) return null

  const totalLessons = course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <div className="mt-1 flex gap-3 text-sm text-gray-400">
            <span>{course.modules?.length ?? 0} módulos</span>
            <span>·</span>
            <span>{totalLessons} aulas</span>
            <span>·</span>
            <span className={course.published ? 'text-green-600' : 'text-yellow-600'}>
              {course.published ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Module */}
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Adicionar Módulo</h2>
            <form onSubmit={handleAddModule} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Título do módulo</label>
                <input
                  className="input"
                  placeholder="Ex: Introdução ao JavaScript"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Ordem</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  value={moduleOrder}
                  onChange={(e) => setModuleOrder(Number(e.target.value))}
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full text-sm" disabled={savingModule}>
                {savingModule ? 'Salvando...' : 'Adicionar módulo'}
              </button>
            </form>
          </div>

          {/* Upload Lesson */}
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Upload de Aula</h2>
            <form onSubmit={handleUploadLesson} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Módulo</label>
                <select
                  className="input"
                  value={lessonModuleId}
                  onChange={(e) => setLessonModuleId(e.target.value)}
                  required
                >
                  <option value="">Selecione um módulo</option>
                  {course.modules?.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Título da aula</label>
                <input
                  className="input"
                  placeholder="Ex: Variáveis e tipos de dados"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Ordem</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  value={lessonOrder}
                  onChange={(e) => setLessonOrder(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Arquivo de vídeo</label>
                <label className="btn-secondary w-full cursor-pointer justify-center text-sm">
                  {lessonFile ? lessonFile.name : 'Selecionar vídeo (MP4, MOV...)'}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setLessonFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              {uploading && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>Enviando...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-primary-600 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <button type="submit" className="btn-primary w-full text-sm" disabled={uploading}>
                {uploading ? `Enviando ${uploadProgress}%...` : 'Fazer upload da aula'}
              </button>
            </form>
          </div>
        </div>

        {/* Course Structure */}
        {(course.modules?.length ?? 0) > 0 && (
          <div className="card mt-8 p-6">
            <h2 className="mb-5 font-semibold text-gray-900">Estrutura do Curso</h2>
            <div className="space-y-4">
              {course.modules?.map((mod) => (
                <div key={mod.id}>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {mod.order}
                    </span>
                    <span className="font-medium text-gray-800">{mod.title}</span>
                    <span className="ml-auto text-xs text-gray-400">{mod.lessons.length} aulas</span>
                  </div>
                  {mod.lessons.length > 0 && (
                    <ul className="ml-6 mt-1 space-y-1 border-l border-gray-100 pl-4">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center gap-2 py-2 text-sm text-gray-600">
                          <span className="text-xs text-gray-300">{lesson.order}.</span>
                          {lesson.title}
                          {lesson.duration > 0 && (
                            <span className="ml-auto text-xs text-gray-300">
                              {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
