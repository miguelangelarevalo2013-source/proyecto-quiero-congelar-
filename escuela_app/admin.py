from django.contrib import admin
from escuela_app.models import Curso, Estudiante, RegistroAsistencia, RecursoInventario, EventoAgenda


@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'jornada')
    search_fields = ('nombre', 'jornada')


@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ('rut', 'nombre', 'sexo', 'email_apoderado', 'curso')
    list_filter = ('sexo', 'curso')
    search_fields = ('rut', 'nombre', 'email_apoderado')


@admin.register(RegistroAsistencia)
class RegistroAsistenciaAdmin(admin.ModelAdmin):
    list_display = ('estudiante', 'fecha', 'estado_asistencia')
    list_filter = ('fecha', 'estado_asistencia')
    search_fields = ('estudiante__nombre', 'estudiante__rut')
    date_hierarchy = 'fecha'


@admin.register(RecursoInventario)
class RecursoInventarioAdmin(admin.ModelAdmin):
    list_display = ('codigo_activo', 'nombre_articulo', 'categoria', 'stock_actual')
    list_filter = ('categoria',)
    search_fields = ('codigo_activo', 'nombre_articulo')


@admin.register(EventoAgenda)
class EventoAgendaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'fecha', 'hora_inicio', 'hora_fin')
    list_filter = ('fecha',)
    search_fields = ('titulo', 'descripcion')
    date_hierarchy = 'fecha'
    fieldsets = (
        ('Información del evento', {
            'fields': ('titulo', 'descripcion')
        }),
        ('Fechas y horas', {
            'fields': ('fecha', 'hora_inicio', 'hora_fin')
        }),
    )
