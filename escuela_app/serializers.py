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

    def validate(self, attrs):
        estudiante = attrs.get("estudiante", getattr(self.instance, "estudiante", None))
        fecha = attrs.get("fecha", getattr(self.instance, "fecha", None))
        existing = RegistroAsistencia.objects.filter(estudiante=estudiante, fecha=fecha)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError(
                "Ya existe un registro de asistencia para este estudiante en la fecha seleccionada. "
                "Puedes editar el registro existente si necesitas modificar su estado."
            )
        return attrs


class RecursoInventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecursoInventario
        fields = ["id", "codigo_activo", "nombre_articulo", "categoria", "stock_actual"]


class EventoAgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoAgenda
        fields = ["id", "titulo", "fecha", "hora_inicio", "hora_fin", "descripcion"]
