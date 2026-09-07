import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { CursosPage } from './pages/CursosPage'
import { EstudiantesPage } from './pages/EstudiantesPage'
import { AsistenciasPage } from './pages/AsistenciasPage'
import { InventarioPage } from './pages/InventarioPage'
import { EventosPage } from './pages/EventosPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/estudiantes" element={<EstudiantesPage />} />
          <Route path="/asistencias" element={<AsistenciasPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/eventos" element={<EventosPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
