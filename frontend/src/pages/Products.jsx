import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Products({ socket }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'Otros',
    stock: 0,
    minStock: 5,
    price: 0,
    unit: 'unidades',
    supplier: ''
  })

  const categories = ['Electrónica', 'Ropa', 'Alimentos', 'Hogar', 'Otros']

  useEffect(() => {
    fetchProductos()

    if (socket) {
      socket.on('producto:creado', () => fetchProductos())
      socket.on('producto:actualizado', () => fetchProductos())
      socket.on('producto:eliminado', () => fetchProductos())
    }

    return () => {
      if (socket) {
        socket.off('producto:creado')
        socket.off('producto:actualizado')
        socket.off('producto:eliminado')
      }
    }
  }, [socket])

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`)
      setProductos(response.data.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
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
      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, formData)
      } else {
        await axios.post(`${API_URL}/products`, formData)
      }
      
      resetForm()
      setShowModal(false)
      fetchProductos()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`)
        fetchProductos()
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  const handleEdit = (producto) => {
    setEditingId(producto._id)
    setFormData({
      name: producto.name,
      sku: producto.sku,
      description: producto.description,
      category: producto.category,
      stock: producto.stock,
      minStock: producto.minStock,
      price: producto.price,
      unit: producto.unit,
      supplier: producto.supplier
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: 'Otros',
      stock: 0,
      minStock: 5,
      price: 0,
      unit: 'unidades',
      supplier: ''
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400">Productos</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />

              <input
                type="text"
                name="sku"
                placeholder="Código SKU"
                value={formData.sku}
                onChange={handleChange}
                className="input-field"
                disabled={!!editingId}
                required
              />

              <textarea
                name="description"
                placeholder="Descripción"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="3"
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="number"
                name="price"
                placeholder="Precio"
                value={formData.price}
                onChange={handleChange}
                className="input-field"
                required
              />

              <input
                type="number"
                name="minStock"
                placeholder="Stock Mínimo"
                value={formData.minStock}
                onChange={handleChange}
                className="input-field"
              />

              <input
                type="text"
                name="supplier"
                placeholder="Proveedor"
                value={formData.supplier}
                onChange={handleChange}
                className="input-field"
              />

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? 'Actualizar' : 'Crear'}
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

      {/* Tabla de productos */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">SKU</th>
                <th className="px-6 py-3 text-left">Categoría</th>
                <th className="px-6 py-3 text-right">Stock</th>
                <th className="px-6 py-3 text-right">Precio</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                  <td className="px-6 py-3">{producto.name}</td>
                  <td className="px-6 py-3">{producto.sku}</td>
                  <td className="px-6 py-3">{producto.category}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={producto.stock <= producto.minStock ? 'text-red-400' : ''}>
                      {producto.stock}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">${producto.price}</td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleEdit(producto)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(producto._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
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
