# Figura 2 — Integración Front-End / Back-End

Este archivo contiene los fragmentos de código que representan la integración entre el front-end (cliente React) y el back-end (Django REST Framework). Úsalos para generar la imagen "Figura 2" en tu informe.

---

## frontend/src/services/api.js

```javascript
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
```

---

## escuela_app/serializers.py

```python
from rest_framework import serializers

from .models import Curso, Estudiante, EventoAgenda, RecursoInventario, RegistroAsistencia


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = ["id", "nombre", "jornada"]


class EstudianteSerializer(serializers.ModelSerializer):
    curso = CursoSerializer(read_only=True)
    curso_id = serializers.PrimaryKeyRelatedField(
        source="curso",
        queryset=Curso.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Estudiante
        fields = [
            "id",
            "rut",
            "nombre",
            "sexo",
            "email_apoderado",
            "motivo_atraso",
            "curso",
            "curso_id",
        ]


class RegistroAsistenciaSerializer(serializers.ModelSerializer):
    estudiante = EstudianteSerializer(read_only=True)
    estudiante_id = serializers.PrimaryKeyRelatedField(
        source="estudiante",
        queryset=Estudiante.objects.all(),
        write_only=True,
    )

    class Meta:
        model = RegistroAsistencia
        fields = [
            "id",
            "estudiante",
            "estudiante_id",
            "fecha",
            "estado_asistencia",
            "observaciones",
        ]


class RecursoInventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecursoInventario
        fields = ["id", "codigo_activo", "nombre_articulo", "categoria", "stock_actual"]


class EventoAgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoAgenda
        fields = ["id", "titulo", "fecha", "hora_inicio", "hora_fin", "descripcion"]
```

---

## escuela_app/api_views.py

```python
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Curso, Estudiante, EventoAgenda, RecursoInventario, RegistroAsistencia
from .serializers import (
    CursoSerializer,
    EstudianteSerializer,
    EventoAgendaSerializer,
    RecursoInventarioSerializer,
    RegistroAsistenciaSerializer,
)


class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all().order_by("nombre")
    serializer_class = CursoSerializer


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.select_related("curso").all().order_by("curso__nombre", "nombre")
    serializer_class = EstudianteSerializer


class RegistroAsistenciaViewSet(viewsets.ModelViewSet):
    queryset = RegistroAsistencia.objects.select_related("estudiante", "estudiante__curso").all().order_by("-fecha")
    serializer_class = RegistroAsistenciaSerializer


class RecursoInventarioViewSet(viewsets.ModelViewSet):
    queryset = RecursoInventario.objects.all().order_by("nombre_articulo")
    serializer_class = RecursoInventarioSerializer

    @action(detail=False, methods=["get"], url_path="buscar")
    def buscar(self, request):
        query = request.query_params.get("q", "").strip()
        queryset = self.get_queryset()
        if query:
            queryset = queryset.filter(nombre_articulo__icontains=query)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class EventoAgendaViewSet(viewsets.ModelViewSet):
    queryset = EventoAgenda.objects.all().order_by("fecha", "hora_inicio")
    serializer_class = EventoAgendaSerializer
```

---

### Uso sugerido para la figura
- Muestra `frontend/src/services/api.js` en la izquierda (cliente), y `escuela_app/api_views.py` + `escuela_app/serializers.py` a la derecha (servidor).
- Resalta la ruta `/api/inventario/buscar/?q=` en `api.js` y el método `buscar` de `RecursoInventarioViewSet`.
- Añade una flecha que indique: `fetch('/api/inventario/buscar/?q=papel') → RecursoInventarioViewSet.buscar → RecursoInventarioSerializer → JSON response`.

Archivo generado: `evidence/Figura2_api_integration.md`
