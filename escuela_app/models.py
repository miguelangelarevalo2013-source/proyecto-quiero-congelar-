from django.core.mail import send_mail
from django.db import models


class Curso(models.Model):
    JORNADA_MANANA = "mañana"
    JORNADA_TARDE = "tarde"
    JORNADA_NOCTURNA = "nocturna"
    JORNADA_CHOICES = [
        (JORNADA_MANANA, "Mañana"),
        (JORNADA_TARDE, "Tarde"),
        (JORNADA_NOCTURNA, "Nocturna"),
    ]

    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre del curso")
    jornada = models.CharField(max_length=20, choices=JORNADA_CHOICES, verbose_name="Jornada")

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"

    def __str__(self) -> str:
        return self.nombre


class Estudiante(models.Model):
    SEXO_MASCULINO = "M"
    SEXO_FEMENINO = "F"
    SEXO_CHOICES = [
        (SEXO_MASCULINO, "Masculino"),
        (SEXO_FEMENINO, "Femenino"),
    ]

    rut = models.CharField(max_length=12, unique=True, verbose_name="RUT")
    nombre = models.CharField(max_length=100, verbose_name="Nombre completo")
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, verbose_name="Sexo")
    email_apoderado = models.EmailField(verbose_name="Email del apoderado")
    motivo_atraso = models.TextField(blank=True, null=True, verbose_name="Motivo del atraso")
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name="estudiantes")

    class Meta:
        verbose_name = "Estudiante"
        verbose_name_plural = "Estudiantes"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(sexo__in=["M", "F"]),
                name="check_estudiante_sexo_valido",
            )
        ]

    def __str__(self) -> str:
        return f"{self.nombre} ({self.rut})"


class RegistroAsistencia(models.Model):
    ESTADO_PRESENTE = "P"
    ESTADO_AUSENTE = "X"
    ESTADO_OBSERVACION = "/"
    ESTADO_ATRASO = "A"
    ESTADO_CHOICES = [
        (ESTADO_PRESENTE, "Presente"),
        (ESTADO_AUSENTE, "Ausente"),
        (ESTADO_OBSERVACION, "Observación"),
        (ESTADO_ATRASO, "Atraso"),
    ]

    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name="registros_asistencia")
    fecha = models.DateField(verbose_name="Fecha de asistencia")
    estado_asistencia = models.CharField(max_length=1, choices=ESTADO_CHOICES, verbose_name="Estado de asistencia")
    observaciones = models.TextField(blank=True, null=True, verbose_name="Observaciones")

    class Meta:
        verbose_name = "Registro de asistencia"
        verbose_name_plural = "Registros de asistencia"
        indexes = [
            models.Index(fields=["fecha", "estudiante"], name="idx_registro_fecha_estudiante"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(estado_asistencia__in=["P", "X", "/", "A"]),
                name="check_registro_estado_asistencia_valido",
            )
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.estado_asistencia == self.ESTADO_ATRASO:
            atrasos_acumulados = RegistroAsistencia.objects.filter(
                estudiante=self.estudiante,
                estado_asistencia=self.ESTADO_ATRASO,
            ).count()

            if atrasos_acumulados == 5:
                send_mail(
                    subject="Alerta de Atrasos Reiterados - CEIA La Pintana",
                    message=(
                        f"Estimado apoderado/a, informamos que el estudiante {self.estudiante.nombre} "
                        f"acumula {atrasos_acumulados} atrasos. "
                        "De continuar con esta conducta, el estudiante quedará sujeto a suspensión del establecimiento."
                    ),
                    from_email=None,
                    recipient_list=[self.estudiante.email_apoderado],
                    fail_silently=False,
                )

    def __str__(self) -> str:
        estado = dict(self.ESTADO_CHOICES).get(self.estado_asistencia, self.estado_asistencia)
        return f"{self.estudiante.nombre} - {self.fecha} - {estado}"


class RecursoInventario(models.Model):
    CATEGORIA_ASEO = "aseo"
    CATEGORIA_OFICINA = "oficina_pedagogicos"
    CATEGORIA_CHOICES = [
        (CATEGORIA_ASEO, "Materiales de aseo"),
        (CATEGORIA_OFICINA, "Materiales de oficina y pedagógicos"),
    ]

    codigo_activo = models.CharField(max_length=50, unique=True, verbose_name="Código activo")
    nombre_articulo = models.CharField(max_length=100, verbose_name="Nombre del artículo")
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES, verbose_name="Categoría")
    stock_actual = models.IntegerField(verbose_name="Stock actual")

    class Meta:
        verbose_name = "Recurso de inventario"
        verbose_name_plural = "Recursos de inventario"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(stock_actual__gte=0),
                name="check_recurso_stock_no_negativo",
            )
        ]

    def __str__(self) -> str:
        return f"{self.codigo_activo} - {self.nombre_articulo}"


class EventoAgenda(models.Model):
    titulo = models.CharField(max_length=150, verbose_name="Título")
    fecha = models.DateField(verbose_name="Fecha")
    hora_inicio = models.TimeField(verbose_name="Hora de inicio")
    hora_fin = models.TimeField(verbose_name="Hora de término")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")

    class Meta:
        verbose_name = "Evento de agenda"
        verbose_name_plural = "Eventos de agenda"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(hora_fin__gt=models.F("hora_inicio")),
                name="check_evento_hora_fin_mayor_hora_inicio",
            )
        ]

    def __str__(self) -> str:
        return self.titulo
