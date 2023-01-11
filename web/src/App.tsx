import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import StudentDashboard from './pages/student/Dashboard'
import MyCourses from './pages/student/MyCourses'
import CourseDetail from './pages/student/CourseDetail'

import TeacherDashboard from './pages/teacher/Dashboard'
import CreateCourse from './pages/teacher/CreateCourse'
import ManageCourse from './pages/teacher/ManageCourse'

function PrivateRoute({ children, role }: { children: JSX.Element; role?: string }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/student'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student routes */}
        <Route path="/student" element={<PrivateRoute role="STUDENT"><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/courses" element={<PrivateRoute role="STUDENT"><MyCourses /></PrivateRoute>} />
        <Route path="/student/courses/:id" element={<PrivateRoute role="STUDENT"><CourseDetail /></PrivateRoute>} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<PrivateRoute role="TEACHER"><TeacherDashboard /></PrivateRoute>} />
        <Route path="/teacher/courses/new" element={<PrivateRoute role="TEACHER"><CreateCourse /></PrivateRoute>} />
        <Route path="/teacher/courses/:id" element={<PrivateRoute role="TEACHER"><ManageCourse /></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  )
}
