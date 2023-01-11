import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-xl font-bold text-primary-600">
          EduFlow
        </Link>

        <nav className="flex items-center gap-6">
          {user?.role === 'STUDENT' && (
            <>
              <Link to="/student" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                Explorar
              </Link>
              <Link to="/student/courses" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                Meus Cursos
              </Link>
            </>
          )}
          {user?.role === 'TEACHER' && (
            <>
              <Link to="/teacher" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                Dashboard
              </Link>
              <Link to="/teacher/courses/new" className="btn-primary text-xs">
                + Novo Curso
              </Link>
            </>
          )}

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm font-medium text-gray-500 hover:text-red-500"
            >
              Sair
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
