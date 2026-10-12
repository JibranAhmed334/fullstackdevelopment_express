import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Welcome from './pages/Welcome'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/Home'
import Profile from './pages/Profile'
import './App.css'

function AdminRoute() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <AdminDashboard /> : <Navigate replace to="/" />
}

function RootPage() {
  const { user } = useAuth()
  return user ? <Home /> : <Welcome />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

export default App
