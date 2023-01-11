import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

export default function CreateCourse() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData()
    form.append('title', title)
    form.append('description', description)
    if (thumbnail) form.append('thumbnail', thumbnail)

    try {
      const { data } = await api.post('/courses', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Curso criado com sucesso!')
      navigate(`/teacher/courses/${data.id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erro ao criar curso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Criar novo curso</h1>
          <p className="mt-1 text-gray-500">Preencha as informações básicas do seu curso.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6 p-8">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Título do curso <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ex: JavaScript do zero ao avançado"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Descreva o que o aluno vai aprender neste curso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Capa do curso</label>
            <div className="mt-1 flex items-center gap-4">
              {preview ? (
                <img src={preview} alt="preview" className="h-24 w-36 rounded-lg object-cover" />
              ) : (
                <div className="flex h-24 w-36 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                  Sem imagem
                </div>
              )}
              <label className="btn-secondary cursor-pointer text-xs">
                Selecionar imagem
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Criando...' : 'Criar curso'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
