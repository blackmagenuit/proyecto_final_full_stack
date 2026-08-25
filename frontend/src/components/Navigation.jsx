import { Link, useNavigate } from 'react-router-dom'

export default function Navigation({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-bold text-xl text-blue-400">
              📦 Stock App
            </Link>
            
            <div className="hidden md:flex gap-4">
              <Link to="/" className="hover:text-blue-400 transition">
                Dashboard
              </Link>
              <Link to="/productos" className="hover:text-blue-400 transition">
                Productos
              </Link>
              <Link to="/movimientos" className="hover:text-blue-400 transition">
                Movimientos
              </Link>
              <Link to="/reportes" className="hover:text-blue-400 transition">
                Reportes
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
