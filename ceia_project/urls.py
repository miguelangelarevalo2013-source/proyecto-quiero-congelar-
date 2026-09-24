from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path
from rest_framework.routers import DefaultRouter

import ceia_project.admin  # noqa: F401
from escuela_app.api_views import CursoViewSet, EstudianteViewSet, EventoAgendaViewSet, RecursoInventarioViewSet, RegistroAsistenciaViewSet, api_health
from escuela_app.views import dashboard, agenda_director, alumnos_injustificados, inventario

router = DefaultRouter()
router.register(r"cursos", CursoViewSet, basename="curso")
router.register(r"estudiantes", EstudianteViewSet, basename="estudiante")
router.register(r"asistencias", RegistroAsistenciaViewSet, basename="asistencia")
router.register(r"inventario", RecursoInventarioViewSet, basename="recursoinventario")
router.register(r"eventos", EventoAgendaViewSet, basename="evento")

urlpatterns = [
    path("", auth_views.LoginView.as_view(template_name="registration/login.html"), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("dashboard/", dashboard, name="dashboard"),
    path("agenda/", agenda_director, name="agenda_director"),
    path("injustificados/", alumnos_injustificados, name="alumnos_injustificados"),
    path("inventario/", inventario, name="inventario"),
    path("api/health/", api_health, name="api_health"),
    path("api/", include(router.urls)),
    path("admin/", admin.site.urls),
]
