import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { DataTable } from '../components/DataTable'
import { ErrorMessage } from '../components/ErrorMessage'
import { FormField } from '../components/FormField'
import { LoadingMessage } from '../components/LoadingMessage'
import { PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import { showToast } from '../utils/toast'

const initialForm = {
  nombre: '',
  jornada: 'mañana',
}

const courseColumns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  {
    key: 'jornada',
    label: 'Jornada',
    render: (row) => {
      const cls = row.jornada === 'mañana' ? 'badge--morning' : row.jornada === 'tarde' ? 'badge--afternoon' : 'badge--night'
      return <span className={`badge ${cls}`}>{row.jornada.charAt(0).toUpperCase() + row.jornada.slice(1)}</span>
    },
  },
  {
    key: 'actions',
    label: 'Acciones',
    render: (row) => (
      <div className="row-actions">
        <button className="action-edit" onClick={() => row.onEdit(row)} title="Editar">✏️ Editar</button>
        <button
          className="action-delete"
          onClick={async () => {
            if (!confirm('¿Eliminar curso? Esta acción no se puede deshacer.')) return
            try {
              await api.deleteCurso(row.id)
              await loadCourses()
            } catch (e) {
              alert(e.message || 'Error al eliminar curso')
            }
          }}
          title="Eliminar"
        >
          🗑️ Eliminar
        </button>
      </div>
    ),
  },
]

export function CursosPage() {
  const [courses, setCourses] = useState([])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadCourses = async () => {
    setLoading(true)
    try {
      const data = await api.getCursos()
      setCourses(
        data.map((course) => ({
          ...course,
          onEdit: () => handleEdit(course),
        })),
      )
    } catch (loadError) {
      setError(loadError.message || 'Error al cargar cursos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleEdit = (course) => {
    setEditingId(course.id)
    setForm({ nombre: course.nombre, jornada: course.jornada })
    setError('')
    setSuccess('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    if (!form.nombre.trim()) {
      return 'El nombre del curso es obligatorio.'
    }
    if (!form.jornada) {
      return 'Debe seleccionar una jornada.'
    }
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
        nombre: form.nombre.trim(),
        jornada: form.jornada,
      }

      if (editingId) {
        await api.updateCurso(editingId, payload)
        setSuccess('Curso actualizado correctamente.')
        showToast('Curso actualizado correctamente.', 'success')
      } else {
        await api.createCurso(payload)
        setSuccess('Curso creado correctamente.')
        showToast('Curso creado correctamente.', 'success')
      }

      setForm(initialForm)
      setEditingId(null)
      await loadCourses()
    } catch (submitError) {
      setSuccess('')
      setError(submitError.message || 'No se pudo guardar el curso.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-section">
      <PageHeader title="Cursos" subtitle="Gestiona los cursos del establecimiento" />
      <div className="content-grid">
      <section className="panel form-panel">
        <div className="panel-header">
          <h2>{editingId ? 'Editar curso' : 'Crear curso'}</h2>
          <span>Endpoint: /api/cursos/</span>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <FormField label="Nombre del curso" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: 4° Medio A" />
          <label className="field-group">
            <span>Jornada</span>
            <select name="jornada" value={form.jornada} onChange={handleChange}>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="nocturna">Nocturna</option>
            </select>
          </label>

          <div className="btn-row">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear curso'}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(initialForm); setError(''); setSuccess(''); }}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>

        <ErrorMessage message={error} />
        {success ? <div className="success-banner">{success}</div> : null}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Lista de Cursos</h2>
          <div>
            <input className="search-input" placeholder="Buscar curso..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <span style={{ marginLeft: 12, color: '#627287' }}>{courses.length} registros</span>
          </div>
        </div>

        {loading ? (
          <LoadingMessage message="Cargando cursos..." />
        ) : (
          <DataTable columns={courseColumns} rows={courses.filter(c => c.nombre.toLowerCase().includes(query.toLowerCase()))} emptyMessage="No hay cursos registrados." />
        )}
      </section>
      </div>
    </div>
  )
}

export default CursosPage
