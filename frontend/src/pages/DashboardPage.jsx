import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { StatCard } from '../components/StatCard'
import { LoadingMessage } from '../components/LoadingMessage'
import { ErrorMessage } from '../components/ErrorMessage'

export function DashboardPage() {
  const [courses, setCourses] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [coursesData, inventoryData] = await Promise.all([
          api.getCursos(),
          api.getInventario(),
        ])
        setCourses(coursesData)
        setInventory(inventoryData)
      } catch (loadError) {
        setError(loadError.message || 'Error al cargar el dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const totalStock = useMemo(
    () => inventory.reduce((sum, item) => sum + Number(item.stock_actual || 0), 0),
    [inventory],
  )

  const lowStockItems = useMemo(
    () => inventory.filter((item) => Number(item.stock_actual || 0) <= 5),
    [inventory],
  )

  return (
    <div className="page-section">
      <ErrorMessage message={error} />

      <section className="stats-grid">
        <StatCard label="Total cursos" value={loading ? '…' : courses.length} tone="accent" />
        <StatCard label="Artículos" value={loading ? '…' : inventory.length} />
        <StatCard label="Stock total" value={loading ? '…' : totalStock} />
        <StatCard label="Bajo stock" value={loading ? '…' : lowStockItems.length} tone="alert" />
      </section>

      {loading ? (
        <LoadingMessage message="Cargando dashboard..." />
      ) : (
        <div className="content-grid two-columns">
          <section className="panel">
            <div className="panel-header">
              <h2>Cursos</h2>
              <span>{courses.length} registros</span>
            </div>
            <ul className="list-card">
              {courses.map((course) => (
                <li key={course.id}>
                  <div>
                    <strong>{course.nombre}</strong>
                    <small>{course.jornada}</small>
                  </div>
                  <span className="badge">Curso</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Inventario</h2>
              <span>{inventory.length} artículos</span>
            </div>
            <ul className="inventory-list">
              {inventory.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.nombre_articulo}</strong>
                    <small>{item.categoria}</small>
                  </div>
                  <div className="inventory-meta">
                    <span>{item.stock_actual} und.</span>
                    <span className="code">#{item.codigo_activo}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
