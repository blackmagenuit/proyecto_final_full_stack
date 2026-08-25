import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import io from 'socket.io-client'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Movements from './pages/Movements'
import Reports from './pages/Reports'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function App() {
  const [user, setUser] = useState(null)
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay token guardado
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      axios.get(`${API_URL}/auth/me`)
        .then(res => {
          setUser(res.data.user)
          // Conectar WebSocket
          const newSocket = io('http://localhost:5000')
          setSocket(newSocket)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    
    // Conectar WebSocket
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    if (socket) socket.disconnect()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <Router>
      {user && <Navigation user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/" element={<Dashboard socket={socket} />} />
          <Route path="/productos" element={<Products socket={socket} />} />
          <Route path="/movimientos" element={<Movements socket={socket} />} />
          <Route path="/reportes" element={<Reports socket={socket} />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  )
}
