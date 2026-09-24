from django.http import JsonResponse
from rest_framework import viewsets
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


def api_health(request):
    return JsonResponse({"status": "ok"})


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
