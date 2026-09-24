import { useEffect, useState, useRef } from 'react'
import { Button } from '../components/Button'
import { DataTable } from '../components/DataTable'
import { ErrorMessage } from '../components/ErrorMessage'
import { FormField } from '../components/FormField'
import { LoadingMessage } from '../components/LoadingMessage'
import { PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import { showToast } from '../utils/toast'

const initialForm = {
  codigo_activo: '',
  nombre_articulo: '',
  categoria: 'aseo',
  stock_actual: '0',
}

const inventoryColumns = [
  { key: 'id', label: 'ID' },
  { key: 'codigo_activo', label: 'Código' },
  { key: 'nombre_articulo', label: 'Artículo' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'stock_actual', label: 'Stock' },
  {
    key: 'actions',
    label: 'Acciones',
    render: (row) => (
      <div className="row-actions">
        <Button variant="secondary" onClick={() => row.onEdit(row)}>
          Editar
        </Button>
        <button className="action-delete" type="button" onClick={() => row.onDeleteRequest(row)}>
          Eliminar
        </button>
      </div>
    ),
  },
]

export function InventarioPage() {
  const [inventory, setInventory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const formRef = useRef(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadInventory = async () => {
    setLoading(true)
    try {
      const data = await api.getInventario()
      setInventory(
        data.map((item) => ({
          ...item,
          onEdit: () => handleEdit(item),
          onDeleteRequest: () => setItemToDelete(item),
        })),
      )
    } catch (loadError) {
      setError(loadError.message || 'Error al cargar inventario.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({
      codigo_activo: item.codigo_activo,
      nombre_articulo: item.nombre_articulo,
      categoria: item.categoria,
      stock_actual: String(item.stock_actual),
    })
    setError('')
    setSuccess('')
  }

  // Scroll to and focus the form when editing starts
  useEffect(() => {
    if (editingId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const firstInput = formRef.current.querySelector('input[name="codigo_activo"]')
      if (firstInput) firstInput.focus()
    }
  }, [editingId])

  const handleDelete = async () => {
    if (!itemToDelete) return

    const deletedItemName = itemToDelete.nombre_articulo
    const deletedItemId = itemToDelete.id
    setDeletingId(deletedItemId)
    setItemToDelete(null)
    try {
      setError('')
      setSuccess('')
      await api.deleteInventario(deletedItemId)
      setInventory((currentInventory) => currentInventory.filter((item) => item.id !== deletedItemId))
      setSuccess(`Artículo "${deletedItemName}" eliminado correctamente.`)
      showToast(`Artículo "${deletedItemName}" eliminado correctamente.`, 'success')
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el recurso.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    if (!form.codigo_activo.trim()) return 'El código activo es obligatorio.'
    if (!form.nombre_articulo.trim()) return 'El nombre del artículo es obligatorio.'
    if (!form.categoria) return 'Debe seleccionar una categoría.'
    if (Number(form.stock_actual) < 0) return 'El stock no puede ser negativo.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setSuccess('')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        codigo_activo: form.codigo_activo.trim(),
        nombre_articulo: form.nombre_articulo.trim(),
        categoria: form.categoria,
        stock_actual: Number(form.stock_actual),
      }

      if (editingId) {
        await api.updateInventario(editingId, payload)
        setSuccess('Recurso actualizado correctamente.')
        showToast('Recurso actualizado correctamente.', 'success')
      } else {
        await api.createInventario(payload)
        setSuccess('Recurso creado correctamente.')
        showToast('Recurso creado correctamente.', 'success')
      }

      setForm(initialForm)
      setEditingId(null)
      await loadInventory()
    } catch (submitError) {
      setSuccess('')
      setError(submitError.message || 'No se pudo guardar el recurso.')
    } finally {
      setSaving(false)
    }
  }

  const handleSearch = async () => {
    try {
      setError('')
      setLoading(true)
      const data = await api.searchInventario(search.trim())
      setInventory(
        data.map((item) => ({
          ...item,
          onEdit: () => handleEdit(item),
          onDeleteRequest: () => setItemToDelete(item),
        })),
      )
      setSuccess(search.trim() ? `Búsqueda realizada para: ${search.trim()}` : 'Se muestra el inventario completo.')
    } catch (searchError) {
      setSuccess('')
      setError(searchError.message || 'No se pudo realizar la búsqueda.')
    } finally {
      setLoading(false)
    }
  }

  // Pagination
  const itemsPerPage = 10
  const filtered = inventory.filter((i) => i.nombre_articulo.toLowerCase().includes(query.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRows = filtered.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [query, inventory.length])

  return (
    <div className="page-section">
      <PageHeader title="Inventario" subtitle="Gestión de recursos y stock" />
      <div className="content-grid">

      <section className="panel form-panel" style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
        <div className="panel-header">
          <h2>{editingId ? 'Editar recurso' : 'Crear recurso'}</h2>
          <span>Endpoint: /api/inventario/</span>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="form-grid">
          <div className="form-inner" style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
            <div className="field-grid">
              <FormField label="Código activo" name="codigo_activo" value={form.codigo_activo} onChange={handleChange} placeholder="Ej: INV-001" />
              <FormField label="Nombre del artículo" name="nombre_articulo" value={form.nombre_articulo} onChange={handleChange} placeholder="Ej: Papel kraft" />
            </div>

            <div className="field-grid">
              <label className="field-group">
                <span>Categoría</span>
                <select name="categoria" value={form.categoria} onChange={handleChange}>
                  <option value="aseo">Materiales de aseo</option>
                  <option value="oficina_pedagogicos">Materiales de oficina y pedagógicos</option>
                </select>
              </label>
              <FormField label="Stock actual" name="stock_actual" type="number" value={form.stock_actual} onChange={handleChange} placeholder="0" />
            </div>

            <div className="btn-row">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear recurso'}
              </Button>
              {editingId ? (
                <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(initialForm); setError(''); setSuccess(''); }}>
                  Cancelar
                </Button>
              ) : null}
            </div>
          </div>
        </form>

        <ErrorMessage message={error} />
        {success ? <div className="success-banner">{success}</div> : null}
      </section>

      {itemToDelete ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setItemToDelete(null)}>
          <section
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-inventory-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-inventory-title">¿Confirmar eliminación?</h2>
            <p>
              ¿Estás seguro de que quieres eliminar el artículo <strong>{itemToDelete.nombre_articulo}</strong>?
            </p>
            <div className="btn-row">
              <Button type="button" variant="secondary" onClick={() => setItemToDelete(null)}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" disabled={deletingId === itemToDelete.id} onClick={handleDelete}>
                {deletingId === itemToDelete.id ? 'Eliminando...' : 'Sí, eliminar artículo'}
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="top-search" style={{ gridColumn: '1 / -1', marginBottom: 6 }}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre de artículo"
          className="search-input"
        />
        <Button type="button" variant="secondary" onClick={handleSearch}>
          Buscar
        </Button>
        <Button type="button" variant="secondary" onClick={() => { setSearch(''); loadInventory(); }}>
          Mostrar todo
        </Button>
      </div>

      <section className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="panel-header">
          <h2>Búsqueda y listado</h2>
          <div>
            <span style={{ marginLeft: 12, color: '#627287' }}>{inventory.length} artículos</span>
          </div>
        </div>

        {loading ? (
          <LoadingMessage message="Cargando inventario..." />
        ) : (
          <>
            <DataTable columns={inventoryColumns} rows={paginatedRows} emptyMessage="No hay artículos en inventario." />

            <div className="pagination" style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Button type="button" variant="secondary" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Anterior
                </Button>
                <Button type="button" variant="secondary" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Siguiente
                </Button>
              </div>
              <div style={{ color: '#617287' }}>
                Página {currentPage} de {totalPages} — {filtered.length} resultados
              </div>
            </div>
          </>
        )}
      </section>
      </div>
    </div>
  )
}

export default InventarioPage
