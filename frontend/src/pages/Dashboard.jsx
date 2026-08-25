import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Dashboard({ socket }) {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()

    if (socket) {
      socket.on('stock:actualizado', () => {
        fetchDashboard()
      })
    }

    return () => {
      if (socket) socket.off('stock:actualizado')
    }
  }, [socket])

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/dashboard`)
      setDashboard(response.data.data)
    } catch (error) {
      console.error('Error al obtener dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Dashboard</h1>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-gray-400 text-sm">Total de Productos</div>
          <div className="text-3xl font-bold text-blue-400 mt-2">
            {dashboard?.totalProductos || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-gray-400 text-sm">Bajo Stock</div>
          <div className="text-3xl font-bold text-yellow-400 mt-2">
            {dashboard?.productosConBajoStock || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-gray-400 text-sm">Entradas Hoy</div>
          <div className="text-3xl font-bold text-green-400 mt-2">
            {dashboard?.entradasHoy || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-gray-400 text-sm">Salidas Hoy</div>
          <div className="text-3xl font-bold text-red-400 mt-2">
            {dashboard?.salidasHoy || 0}
          </div>
        </div>
      </div>

      {/* Productos con bajo stock */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">
          ⚠️ Alertas de Stock Bajo
        </h2>
        
        {dashboard?.productosBajoStock?.length > 0 ? (
          <div className="table-container">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left">Producto</th>
                  <th className="px-6 py-3 text-left">SKU</th>
                  <th className="px-6 py-3 text-right">Stock Actual</th>
                  <th className="px-6 py-3 text-right">Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.productosBajoStock.map((producto) => (
                  <tr key={producto._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                    <td className="px-6 py-3">{producto.name}</td>
                    <td className="px-6 py-3">{producto.sku}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={producto.stock === 0 ? 'text-red-400' : 'text-yellow-400'}>
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">{producto.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No hay productos con stock bajo 🎉</p>
        )}
      </div>
    </div>
  )
}
