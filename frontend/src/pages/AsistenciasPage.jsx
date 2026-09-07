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
  estudiante_id: '',
  fecha: '',
  estado_asistencia: 'P',
  observaciones: '',
}

const attendanceColumns = [
  { key: 'id', label: 'ID' },
  {
    key: 'estudiante',
    label: 'Estudiante',
    render: (row) => row.estudiante?.nombre ?? 'Sin estudiante',
  },
  { key: 'fecha', label: 'Fecha' },
  { key: 'estado_asistencia', label: 'Estado' },
  {
    key: 'observaciones',
    label: 'Observaciones',
    render: (row) => row.observaciones || '—',
  },
  {
    key: 'actions',
    label: 'Acciones',
    render: (row) => (
      <div className="row-actions">
        <Button variant="secondary" onClick={() => row.onEdit(row)}>
          Editar
        </Button>
      </div>
    ),
  },
]

export function AsistenciasPage() {
  const [attendance, setAttendance] = useState([])
  const [students, setStudents] = useState([])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [attendanceData, studentsData] = await Promise.all([api.getAsistencias(), api.getEstudiantes()])
      setStudents(studentsData)
      setAttendance(
        attendanceData.map((item) => ({
          ...item,
          onEdit: () => handleEdit(item),
        })),
      )
    } catch (loadError) {
      setError(loadError.message || 'Error al cargar asistencias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({
      estudiante_id: item.estudiante?.id ?? '',
      fecha: item.fecha,
      estado_asistencia: item.estado_asistencia,
      observaciones: item.observaciones || '',
    })
    setError('')
    setSuccess('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    if (!form.estudiante_id) return 'Debe seleccionar un estudiante.'
    if (!form.fecha) return 'La fecha es obligatoria.'
    if (!form.estado_asistencia) return 'Debe indicar el estado de asistencia.'
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
        estudiante_id: Number(form.estudiante_id),
        fecha: form.fecha,
        estado_asistencia: form.estado_asistencia,
        observaciones: form.observaciones.trim(),
      }

      if (editingId) {
        await api.updateAsistencia(editingId, payload)
        setSuccess('Registro de asistencia actualizado correctamente.')
        showToast('Registro de asistencia actualizado correctamente.', 'success')
      } else {
        await api.createAsistencia(payload)
        setSuccess('Registro de asistencia creado correctamente.')
        showToast('Registro de asistencia creado correctamente.', 'success')
      }

      setForm(initialForm)
      setEditingId(null)
      await loadData()
    } catch (submitError) {
      setSuccess('')
      setError(submitError.message || 'No se pudo guardar la asistencia.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-section">
      <PageHeader title="Asistencias" subtitle="Registro y gestión de asistencias" />
      <div className="content-grid">
      <section className="panel form-panel">
        <div className="panel-header">
          <h2>{editingId ? 'Editar asistencia' : 'Crear asistencia'}</h2>
          <span>Endpoint: /api/asistencias/</span>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field-grid">
            <label className="field-group">
              <span>Estudiante</span>
              <select name="estudiante_id" value={form.estudiante_id} onChange={handleChange}>
                <option value="">Seleccione un estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nombre}
                  </option>
                ))}
              </select>
            </label>
            <FormField label="Fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange} />
          </div>

          <div className="field-grid">
            <label className="field-group">
              <span>Estado</span>
              <select name="estado_asistencia" value={form.estado_asistencia} onChange={handleChange}>
                <option value="P">Presente</option>
                <option value="X">Ausente</option>
                <option value="/">Observación</option>
                <option value="A">Atraso</option>
              </select>
            </label>
            <FormField label="Observaciones" name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Opcional" />
          </div>

          <div className="btn-row">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear registro'}
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
          <h2>Listado de asistencias</h2>
          <div>
            <input className="search-input" placeholder="Buscar por estudiante..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <span style={{ marginLeft: 12, color: '#627287' }}>{attendance.length} registros</span>
          </div>
        </div>

        {loading ? (
          <LoadingMessage message="Cargando asistencias..." />
        ) : (
          <DataTable columns={attendanceColumns} rows={attendance.filter(a => (a.estudiante?.nombre||'').toLowerCase().includes(query.toLowerCase()))} emptyMessage="No hay registros de asistencia." />
        )}
      </section>
      </div>
    </div>
  )
}

export default AsistenciasPage
