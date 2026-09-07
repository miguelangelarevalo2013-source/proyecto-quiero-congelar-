import { NavLink } from 'react-router-dom'

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

export function Navbar() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Panel de gestión</p>
        <h1>CEIA La Pintana</h1>
      </div>
      <span className="status-pill">API conectada</span>
    </header>
  )
}

export function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-content">
        <Navbar />
        {children}
        <div className="app-footer">
          <div>API Online</div>
          <div>v1.0.0</div>
        </div>
        <div className="toast-container" aria-live="polite"></div>
      </main>
    </div>
  )
}

export default Layout
