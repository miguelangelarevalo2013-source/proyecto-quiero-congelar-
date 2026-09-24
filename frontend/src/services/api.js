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
    const responseText = await response.text()
    let message = ''

    if (responseText) {
      const isHtmlResponse = /<\/?(?:html|!doctype|body|head)\b/i.test(responseText)

      if (isHtmlResponse) {
        message = ''
      } else {
        try {
          const data = JSON.parse(responseText)
          if (data && typeof data === 'object') {
            const details = Object.values(data).flat(Infinity).filter(Boolean)
            if (details.length > 0) {
              message = details.join(' ')
            }
          } else if (typeof data === 'string') {
            message = data
          }
        } catch {
          message = responseText.trim()
        }
      }
    }

    const statusMessage = response.status >= 500
      ? 'El servidor encontró un error al procesar la solicitud.'
      : `La solicitud no pudo completarse (HTTP ${response.status}).`
    throw new Error(message || statusMessage)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  checkHealth: () => request('/health/', { signal: AbortSignal.timeout(5000) }),

  getCursos: () => request('/cursos/'),
  createCurso: (payload) => request('/cursos/', { method: 'POST', body: JSON.stringify(payload) }),
  updateCurso: (id, payload) => request(`/cursos/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCurso: (id) => request(`/cursos/${id}/`, { method: 'DELETE' }),

  getEstudiantes: () => request('/estudiantes/'),
  createEstudiante: (payload) => request('/estudiantes/', { method: 'POST', body: JSON.stringify(payload) }),
  updateEstudiante: (id, payload) => request(`/estudiantes/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),

  getAsistencias: () => request('/asistencias/'),
  createAsistencia: (payload) => request('/asistencias/', { method: 'POST', body: JSON.stringify(payload) }),
  updateAsistencia: (id, payload) => request(`/asistencias/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteAsistencia: (id) => request(`/asistencias/${id}/`, { method: 'DELETE' }),

  getInventario: () => request('/inventario/'),
  createInventario: (payload) => request('/inventario/', { method: 'POST', body: JSON.stringify(payload) }),
  updateInventario: (id, payload) => request(`/inventario/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteInventario: (id) => request(`/inventario/${id}/`, { method: 'DELETE' }),
  searchInventario: (query) => request(`/inventario/buscar/?q=${encodeURIComponent(query)}`),

  getEventos: () => request('/eventos/'),
  createEvento: (payload) => request('/eventos/', { method: 'POST', body: JSON.stringify(payload) }),
  updateEvento: (id, payload) => request(`/eventos/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteEvento: (id) => request(`/eventos/${id}/`, { method: 'DELETE' }),
}

export default api
