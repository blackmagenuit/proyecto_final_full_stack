import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Reports() {
  const [reportType, setReportType] = useState('categoria')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchReport()
  }, [reportType])

  const fetchReport = async () => {
    setLoading(true)
    try {
      let response
      
      if (reportType === 'categoria') {
        response = await axios.get(`${API_URL}/reports/stock-por-categoria`)
      } else if (reportType === 'alertas') {
        response = await axios.get(`${API_URL}/reports/alertas/bajo-stock`)
      } else if (reportType === 'periodo') {
        response = await axios.get(`${API_URL}/reports/movimientos-periodo`, {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        })
      }
      
      setData(response.data.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Reportes</h1>

      {/* Selector de reporte */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setReportType('categoria')}
            className={`px-4 py-2 rounded ${
              reportType === 'categoria'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            Stock por Categoría
          </button>
          <button
            onClick={() => setReportType('alertas')}
            className={`px-4 py-2 rounded ${
              reportType === 'alertas'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            ⚠️ Productos con Bajo Stock
          </button>
          <button
            onClick={() => setReportType('periodo')}
            className={`px-4 py-2 rounded ${
              reportType === 'periodo'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            Movimientos por Período
          </button>
        </div>
      </div>

      {/* Filtro de fechas */}
      {reportType === 'periodo' && (
        <div className="card mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="input-field"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Fecha Fin</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="input-field"
              />
            </div>
            <button
              onClick={fetchReport}
              className="btn-primary"
            >
              Filtrar
            </button>
          </div>
        </div>
      )}

      {/* Contenido del reporte */}
      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : reportType === 'categoria' ? (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Stock por Categoría</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left">Categoría</th>
                  <th className="px-6 py-3 text-right">Productos</th>
                  <th className="px-6 py-3 text-right">Stock Total</th>
                  <th className="px-6 py-3 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-700 hover:bg-slate-700/50">
                    <td className="px-6 py-3">{item._id}</td>
                    <td className="px-6 py-3 text-right">{item.totalProductos}</td>
                    <td className="px-6 py-3 text-right">{item.stockTotal}</td>
                    <td className="px-6 py-3 text-right font-semibold text-green-400">
                      ${item.valorTotal?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : reportType === 'alertas' ? (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Productos con Bajo Stock</h2>
          {Array.isArray(data) && data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left">Producto</th>
                    <th className="px-6 py-3 text-left">SKU</th>
                    <th className="px-6 py-3 text-left">Categoría</th>
                    <th className="px-6 py-3 text-right">Stock Actual</th>
                    <th className="px-6 py-3 text-right">Stock Mínimo</th>
                    <th className="px-6 py-3 text-right">Déficit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((producto) => (
                    <tr key={producto._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-3">{producto.name}</td>
                      <td className="px-6 py-3">{producto.sku}</td>
                      <td className="px-6 py-3">{producto.category}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={producto.stock === 0 ? 'text-red-400' : 'text-yellow-400'}>
                          {producto.stock}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">{producto.minStock}</td>
                      <td className="px-6 py-3 text-right text-red-400">
                        {Math.max(0, producto.minStock - producto.stock)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No hay productos con stock bajo</p>
          )}
        </div>
      ) : (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Movimientos del Período</h2>
          {data && (
            <>
              {/* Resumen */}
              {data.resumen && Array.isArray(data.resumen) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {data.resumen.map((item) => (
                    <div key={item._id} className="bg-slate-700 rounded p-4">
                      <div className="text-gray-400 text-sm capitalize">{item._id}</div>
                      <div className="text-3xl font-bold mt-2 text-blue-400">
                        {item.cantidad}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {item.totalMovimientos} movimientos
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabla de movimientos */}
              {data.movimientos && Array.isArray(data.movimientos) && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="table-header">
                      <tr>
                        <th className="px-6 py-3 text-left">Tipo</th>
                        <th className="px-6 py-3 text-left">Producto</th>
                        <th className="px-6 py-3 text-right">Cantidad</th>
                        <th className="px-6 py-3 text-left">Referencia</th>
                        <th className="px-6 py-3 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.movimientos.map((mov) => (
                        <tr key={mov._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                          <td className="px-6 py-3">
                            <span className={mov.type === 'entrada' ? 'text-green-400' : 'text-red-400'}>
                              {mov.type === 'entrada' ? '📥 Entrada' : '📤 Salida'}
                            </span>
                          </td>
                          <td className="px-6 py-3">{mov.product?.name}</td>
                          <td className="px-6 py-3 text-right">{mov.quantity}</td>
                          <td className="px-6 py-3 text-xs text-gray-400">{mov.reference}</td>
                          <td className="px-6 py-3 text-xs text-gray-400">
                            {new Date(mov.date).toLocaleDateString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
