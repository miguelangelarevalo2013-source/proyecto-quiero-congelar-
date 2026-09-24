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
  titulo: '',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  descripcion: '',
}

const eventColumns = [
  { key: 'id', label: 'ID' },
  { key: 'titulo', label: 'Título' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora_inicio', label: 'Hora inicio' },
  { key: 'hora_fin', label: 'Hora fin' },
  {
    key: 'descripcion',
    label: 'Descripción',
    render: (row) => row.descripcion || '—',
  },
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

export function EventosPage() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [query, setQuery] = useState('')

  const loadEvents = async () => {
    setLoading(true)
    try {
      const data = await api.getEventos()
      setEvents(
        data.map((event) => ({
          ...event,
          onEdit: () => handleEdit(event),
          onDeleteRequest: () => setEventToDelete(event),
        })),
      )
    } catch (loadError) {
      setError(loadError.message || 'Error al cargar eventos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleEdit = (event) => {
    setEditingId(event.id)
    setForm({
      titulo: event.titulo,
      fecha: event.fecha,
      hora_inicio: event.hora_inicio,
      hora_fin: event.hora_fin,
      descripcion: event.descripcion || '',
    })
    setError('')
    setSuccess('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleDelete = async () => {
    if (!eventToDelete || deletingId) return

    const deletedEventId = eventToDelete.id
    const deletedEventTitle = eventToDelete.titulo
    setDeletingId(deletedEventId)
    setError('')
    setSuccess('')

    try {
      await api.deleteEvento(deletedEventId)
      setEvents((currentEvents) => currentEvents.filter((item) => item.id !== deletedEventId))
      setEventToDelete(null)
      setSuccess(`Evento "${deletedEventTitle}" eliminado correctamente.`)
      showToast(`Evento "${deletedEventTitle}" eliminado correctamente.`, 'success')
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el evento.')
    } finally {
      setDeletingId(null)
    }
  }

  const validateForm = () => {
    if (!form.titulo.trim()) return 'El título del evento es obligatorio.'
    if (!form.fecha) return 'La fecha es obligatoria.'
    if (!form.hora_inicio) return 'La hora de inicio es obligatoria.'
    if (!form.hora_fin) return 'La hora de término es obligatoria.'
    if (form.hora_fin <= form.hora_inicio) return 'La hora de término debe ser posterior a la hora de inicio.'
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
        titulo: form.titulo.trim(),
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        descripcion: form.descripcion.trim(),
      }

      if (editingId) {
        await api.updateEvento(editingId, payload)
        setSuccess('Evento actualizado correctamente.')
        showToast('Evento actualizado correctamente.', 'success')
      } else {
        await api.createEvento(payload)
        setSuccess('Evento creado correctamente.')
        showToast('Evento creado correctamente.', 'success')
      }

      setForm(initialForm)
      setEditingId(null)
      await loadEvents()
    } catch (submitError) {
      setSuccess('')
      setError(submitError.message || 'No se pudo guardar el evento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-section">
      <PageHeader title="Agenda" subtitle="Eventos y actividades" />
      <div className="content-grid">
      <section className="panel form-panel">
        <div className="panel-header">
          <h2>{editingId ? 'Editar evento' : 'Crear evento'}</h2>
          <span>Endpoint: /api/eventos/</span>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field-grid">
            <FormField label="Título" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej: Reunión de apoderados" />
            <FormField label="Fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange} />
          </div>

          <div className="field-grid">
            <FormField label="Hora de inicio" name="hora_inicio" type="time" value={form.hora_inicio} onChange={handleChange} />
            <FormField label="Hora de término" name="hora_fin" type="time" value={form.hora_fin} onChange={handleChange} />
          </div>

          <FormField label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Opcional" />

          <div className="btn-row">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear evento'}
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

      {eventToDelete ? (
        <div className="modal-backdrop" role="presentation" onClick={() => !deletingId && setEventToDelete(null)}>
          <section
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-event-title">¿Confirmar eliminación?</h2>
            <p>
              ¿Estás seguro de que quieres eliminar el evento <strong>{eventToDelete.titulo}</strong>?
            </p>
            <div className="btn-row">
              <Button type="button" variant="secondary" disabled={Boolean(deletingId)} onClick={() => setEventToDelete(null)}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" disabled={Boolean(deletingId)} onClick={handleDelete}>
                {deletingId ? 'Eliminando...' : 'Sí, eliminar evento'}
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Agenda</h2>
          <div>
            <input className="search-input" placeholder="Buscar evento..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <span style={{ marginLeft: 12, color: '#627287' }}>{events.length} registros</span>
          </div>
        </div>

        {loading ? (
          <LoadingMessage message="Cargando agenda..." />
        ) : (
          <DataTable columns={eventColumns} rows={events.filter(ev => ev.titulo.toLowerCase().includes(query.toLowerCase()))} emptyMessage="No hay eventos programados." />
        )}
      </section>
      </div>
    </div>
  )
}

export default EventosPage
