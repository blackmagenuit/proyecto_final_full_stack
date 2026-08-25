import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Movements({ socket }) {
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('entrada')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    supplier: '',
    reason: '',
    reference: '',
    notes: ''
  })

  useEffect(() => {
    fetchMovimientos()
    fetchProductos()

    if (socket) {
      socket.on('stock:actualizado', () => {
        fetchMovimientos()
      })
    }

    return () => {
      if (socket) socket.off('stock:actualizado')
    }
  }, [socket])

  const fetchMovimientos = async () => {
    try {
      const response = await axios.get(`${API_URL}/movements`)
      setMovimientos(response.data.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`)
      setProductos(response.data.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const endpoint = activeTab === 'entrada' ? '/movements/entrada' : '/movements/salida'
      
      const data = {
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        ...(activeTab === 'entrada' && { supplier: formData.supplier }),
        ...(activeTab === 'salida' && { reason: formData.reason }),
        reference: formData.reference,
        notes: formData.notes
      }

      await axios.post(`${API_URL}${endpoint}`, data)
      
      resetForm()
      setShowModal(false)
      fetchMovimientos()
    } catch (error) {
      console.error('Error:', error.response?.data?.message || error.message)
      alert(error.response?.data?.message || 'Error al registrar movimiento')
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      supplier: '',
      reason: '',
      reference: '',
      notes: ''
    })
  }

  const filteredMovimientos = movimientos.filter(m => m.type === activeTab)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400">Movimientos</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary"
        >
          + Nuevo Movimiento
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('entrada')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'entrada'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          📥 Entradas
        </button>
        <button
          onClick={() => setActiveTab('salida')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'salida'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          📤 Salidas
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {activeTab === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Producto *</label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="number"
                name="quantity"
                placeholder="Cantidad *"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
                min="1"
                required
              />

              {activeTab === 'entrada' ? (
                <input
                  type="text"
                  name="supplier"
                  placeholder="Proveedor *"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              ) : (
                <input
                  type="text"
                  name="reason"
                  placeholder="Motivo de salida *"
                  value={formData.reason}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              )}

              <input
                type="text"
                name="reference"
                placeholder="Referencia (ej: pedido#123)"
                value={formData.reference}
                onChange={handleChange}
                className="input-field"
              />

              <textarea
                name="notes"
                placeholder="Notas adicionales"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows="3"
              />

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de movimientos */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left">Producto</th>
                <th className="px-6 py-3 text-right">Cantidad</th>
                <th className="px-6 py-3 text-left">
                  {activeTab === 'entrada' ? 'Proveedor' : 'Motivo'}
                </th>
                <th className="px-6 py-3 text-left">Usuario</th>
                <th className="px-6 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovimientos.map((mov) => (
                <tr key={mov._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                  <td className="px-6 py-3">{mov.product?.name}</td>
                  <td className="px-6 py-3 text-right">{mov.quantity}</td>
                  <td className="px-6 py-3">
                    {activeTab === 'entrada' ? mov.supplier : mov.reason}
                  </td>
                  <td className="px-6 py-3">{mov.user?.name}</td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(mov.date).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
