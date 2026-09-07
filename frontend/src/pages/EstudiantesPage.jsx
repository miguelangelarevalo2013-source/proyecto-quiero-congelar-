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
  rut: '',
  nombre: '',
  sexo: 'M',
  email_apoderado: '',
  motivo_atraso: '',
  curso_id: '',
}

const studentColumns = [
  { key: 'id', label: 'ID' },
  { key: 'rut', label: 'RUT' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'sexo', label: 'Sexo' },
  {
    key: 'curso',
    label: 'Curso',
    render: (row) => row.curso?.nombre ?? 'Sin curso',
  },
  {
    key: 'motivo_atraso',
    label: 'Motivo atraso',
    render: (row) => row.motivo_atraso || '—',
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

export function EstudiantesPage() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
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
      const [studentsData, coursesData] = await Promise.all([api.getEstudiantes(), api.getCursos()])
      setCourses(coursesData)
      setStudents(
        studentsData.map((student) => ({
          ...student,
          onEdit: () => handleEdit(student),
        })),
      )
    } catch (loadError) {
      setError(loadError.message || 'Error al cargar estudiantes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (student) => {
    setEditingId(student.id)
    setForm({
      rut: student.rut,
      nombre: student.nombre,
      sexo: student.sexo,
      email_apoderado: student.email_apoderado,
      motivo_atraso: student.motivo_atraso || '',
      curso_id: student.curso?.id ?? '',
    })
    setError('')
    setSuccess('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    if (!form.rut.trim()) return 'El RUT es obligatorio.'
    if (!form.nombre.trim()) return 'El nombre del estudiante es obligatorio.'
    if (!form.email_apoderado.trim()) return 'El email del apoderado es obligatorio.'
    if (!form.curso_id) return 'Debe seleccionar un curso.'
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
        rut: form.rut.trim(),
        nombre: form.nombre.trim(),
        sexo: form.sexo,
        email_apoderado: form.email_apoderado.trim(),
        motivo_atraso: form.motivo_atraso.trim(),
        curso_id: Number(form.curso_id),
      }

      if (editingId) {
        await api.updateEstudiante(editingId, payload)
        setSuccess('Estudiante actualizado correctamente.')
        showToast('Estudiante actualizado correctamente.', 'success')
      } else {
        await api.createEstudiante(payload)
        setSuccess('Estudiante creado correctamente.')
        showToast('Estudiante creado correctamente.', 'success')
      }

      setForm(initialForm)
      setEditingId(null)
      await loadData()
    } catch (submitError) {
      setSuccess('')
      setError(submitError.message || 'No se pudo guardar el estudiante.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-section">
      <PageHeader title="Estudiantes" subtitle="Gestión de estudiantes" />
      <div className="content-grid">
      <section className="panel form-panel">
        <div className="panel-header">
          <h2>{editingId ? 'Editar estudiante' : 'Crear estudiante'}</h2>
          <span>Endpoint: /api/estudiantes/</span>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field-grid">
            <FormField label="RUT" name="rut" value={form.rut} onChange={handleChange} placeholder="Ej: 12.345.678-9" />
            <FormField label="Nombre completo" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Ana López" />
          </div>

          <div className="field-grid">
            <label className="field-group">
              <span>Sexo</span>
              <select name="sexo" value={form.sexo} onChange={handleChange}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </label>
            <FormField label="Email del apoderado" name="email_apoderado" type="email" value={form.email_apoderado} onChange={handleChange} placeholder="apoderado@correo.com" />
          </div>

          <div className="field-grid">
            <label className="field-group">
              <span>Curso</span>
              <select name="curso_id" value={form.curso_id} onChange={handleChange}>
                <option value="">Seleccione un curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.nombre}
                  </option>
                ))}
              </select>
            </label>
            <FormField label="Motivo del atraso" name="motivo_atraso" value={form.motivo_atraso} onChange={handleChange} placeholder="Opcional" />
          </div>

          <div className="btn-row">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear estudiante'}
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
          <h2>Listado de estudiantes</h2>
          <div>
            <input className="search-input" placeholder="Buscar estudiante..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <span style={{ marginLeft: 12, color: '#627287' }}>{students.length} registros</span>
          </div>
        </div>

        {loading ? (
          <LoadingMessage message="Cargando estudiantes..." />
        ) : (
          <DataTable columns={studentColumns} rows={students.filter(s => s.nombre.toLowerCase().includes(query.toLowerCase()))} emptyMessage="No hay estudiantes registrados." />
        )}
      </section>
      </div>
    </div>
  )
}

export default EstudiantesPage
