const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Error al consultar la API'

    try {
      const data = await response.json()
      if (data && typeof data === 'object') {
        const details = Object.values(data).flat().filter(Boolean)
        if (details.length > 0) {
          message = Array.isArray(details[0]) ? details[0].join(' ') : String(details[0])
        }
      }
    } catch {
      const fallback = await response.text()
      if (fallback) {
        message = fallback
      }
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  getCursos: () => request('/cursos/'),
  createCurso: (payload) => request('/cursos/', { method: 'POST', body: JSON.stringify(payload) }),
  updateCurso: (id, payload) => request(`/cursos/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),

  getEstudiantes: () => request('/estudiantes/'),
  createEstudiante: (payload) => request('/estudiantes/', { method: 'POST', body: JSON.stringify(payload) }),
  updateEstudiante: (id, payload) => request(`/estudiantes/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),

  getAsistencias: () => request('/asistencias/'),
  createAsistencia: (payload) => request('/asistencias/', { method: 'POST', body: JSON.stringify(payload) }),
  updateAsistencia: (id, payload) => request(`/asistencias/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),

  getInventario: () => request('/inventario/'),
  createInventario: (payload) => request('/inventario/', { method: 'POST', body: JSON.stringify(payload) }),
  updateInventario: (id, payload) => request(`/inventario/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteInventario: (id) => request(`/inventario/${id}/`, { method: 'DELETE' }),
  searchInventario: (query) => request(`/inventario/buscar/?q=${encodeURIComponent(query)}`),

  getEventos: () => request('/eventos/'),
  createEvento: (payload) => request('/eventos/', { method: 'POST', body: JSON.stringify(payload) }),
  updateEvento: (id, payload) => request(`/eventos/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
}

export default api
