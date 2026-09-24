import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { api } from '../services/api'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/cursos', label: 'Cursos' },
  { to: '/estudiantes', label: 'Estudiantes' },
  { to: '/asistencias', label: 'Asistencias' },
  { to: '/inventario', label: 'Inventario' },
  { to: '/eventos', label: 'Agenda' },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">CEIA</div>
        <div>
          <h2>La Pintana</h2>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export function Navbar({ apiStatus }) {
  const statusLabel = apiStatus === 'connected'
    ? 'API conectada'
    : apiStatus === 'unavailable'
      ? 'API no disponible'
      : 'Comprobando API...'

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Panel de gestión</p>
        <h1>CEIA La Pintana</h1>
      </div>
      <span className={`status-pill status-pill--${apiStatus}`}>{statusLabel}</span>
    </header>
  )
}

export function Layout({ children }) {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    let active = true

    const checkApi = async () => {
      try {
        const response = await api.checkHealth()
        if (active) setApiStatus(response?.status === 'ok' ? 'connected' : 'unavailable')
      } catch {
        if (active) setApiStatus('unavailable')
      }
    }

    checkApi()
    const intervalId = window.setInterval(checkApi, 30000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-content">
        <Navbar apiStatus={apiStatus} />
        {children}
        <div className="app-footer">
          <div className={`footer-status footer-status--${apiStatus}`}>
            {apiStatus === 'connected' ? 'API Online' : apiStatus === 'unavailable' ? 'API no disponible' : 'Comprobando API...'}
          </div>
          <div>v1.0.0</div>
        </div>
        <div className="toast-container" aria-live="polite"></div>
      </main>
    </div>
  )
}

export default Layout
