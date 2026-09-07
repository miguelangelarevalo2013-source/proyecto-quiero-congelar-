from datetime import date, datetime, timedelta
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Count, Q
from django.shortcuts import redirect, render
from escuela_app.models import Curso, Estudiante, EventoAgenda, RegistroAsistencia, RecursoInventario


@login_required
def dashboard(request):
    return render(request, "dashboard.html", {
        "title": "Panel principal CEIA La Pintana",
    })


@login_required
def agenda_director(request):
    today = datetime.now().date()
    selected_year = request.GET.get('year')
    selected_month = request.GET.get('month')

    try:
        selected_year = int(selected_year)
        selected_month = int(selected_month)
        current_month = datetime(year=selected_year, month=selected_month, day=1).date()
    except (TypeError, ValueError):
        current_month = today.replace(day=1)

    first_day_of_month = current_month
    next_month_date = (current_month.replace(day=28) + timedelta(days=4)).replace(day=1)
    last_day_of_month = next_month_date - timedelta(days=1)

    eventos = EventoAgenda.objects.filter(
        fecha__gte=first_day_of_month,
        fecha__lte=last_day_of_month
    ).order_by('fecha', 'hora_inicio')

    eventos_por_dia = {}
    for evento in eventos:
        eventos_por_dia.setdefault(evento.fecha, []).append(evento)

    start_weekday = first_day_of_month.weekday()  # 0=lunes, 6=domingo
    days_in_month = (last_day_of_month - first_day_of_month).days + 1

    calendar_days = [None] * start_weekday
    for day in range(1, days_in_month + 1):
        fecha = current_month.replace(day=day)
        calendar_days.append({
            'date': fecha,
            'day': day,
            'eventos': eventos_por_dia.get(fecha, [])
        })

    remaining_days = (7 - len(calendar_days) % 7) % 7
    calendar_days += [None] * remaining_days

    weeks = [calendar_days[i:i+7] for i in range(0, len(calendar_days), 7)]

    prev_month = current_month.month - 1 or 12
    prev_year = current_month.year - 1 if current_month.month == 1 else current_month.year
    next_month = current_month.month + 1 if current_month.month < 12 else 1
    next_year = current_month.year + 1 if current_month.month == 12 else current_month.year

    month_names = [
        (1, 'Enero'), (2, 'Febrero'), (3, 'Marzo'), (4, 'Abril'),
        (5, 'Mayo'), (6, 'Junio'), (7, 'Julio'), (8, 'Agosto'),
        (9, 'Septiembre'), (10, 'Octubre'), (11, 'Noviembre'), (12, 'Diciembre'),
    ]

    year_options = list(range(today.year - 3, today.year + 4))

    context = {
        'current_month': current_month,
        'weeks': weeks,
        'month_name': f"{month_names[current_month.month - 1][1]} {current_month.year}",
        'today': today,
        'prev_month': prev_month,
        'prev_year': prev_year,
        'next_month': next_month,
        'next_year': next_year,
        'month_options': month_names,
        'year_options': year_options,
    }
    return render(request, 'agenda.html', context)


@login_required
def alumnos_injustificados(request):
    cursos = Curso.objects.order_by('nombre')
    estudiantes = Estudiante.objects.select_related('curso').annotate(
        atrasos_count=Count('registros_asistencia', filter=Q(registros_asistencia__estado_asistencia=RegistroAsistencia.ESTADO_ATRASO))
    ).order_by('curso__nombre', 'nombre')

    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'add_student':
            rut = request.POST.get('rut', '').strip()
            nombre = request.POST.get('nombre', '').strip()
            sexo = request.POST.get('sexo')
            email_apoderado = request.POST.get('email_apoderado', '').strip()
            motivo_atraso = request.POST.get('motivo_atraso', '').strip()
            curso_id = request.POST.get('curso')

            if not (rut and nombre and sexo and email_apoderado and curso_id):
                messages.error(request, 'Complete todos los campos para agregar al alumno.')
            else:
                try:
                    curso = Curso.objects.get(pk=curso_id)
                    estudiante, created = Estudiante.objects.get_or_create(
                        rut=rut,
                        defaults={
                            'nombre': nombre,
                            'sexo': sexo,
                            'email_apoderado': email_apoderado,
                            'motivo_atraso': motivo_atraso or None,
                            'curso': curso,
                        },
                    )
                    if created:
                        messages.success(request, 'Alumno agregado correctamente.')
                        return redirect('alumnos_injustificados')
                    messages.warning(request, 'Ya existe un alumno con ese RUT.')
                except Curso.DoesNotExist:
                    messages.error(request, 'Curso inválido.')

        elif action == 'add_course':
            nombre_curso = request.POST.get('nombre_curso', '').strip()
            jornada = request.POST.get('jornada')
            jornadas_validas = [choice[0] for choice in Curso.JORNADA_CHOICES]

            if not (nombre_curso and jornada):
                messages.error(request, 'Complete todos los campos para agregar el curso.')
            elif jornada not in jornadas_validas:
                messages.error(request, 'Jornada inválida.')
            else:
                curso, created = Curso.objects.get_or_create(
                    nombre=nombre_curso,
                    defaults={'jornada': jornada}
                )
                if created:
                    messages.success(request, 'Curso agregado correctamente.')
                    return redirect('alumnos_injustificados')
                messages.warning(request, 'Ya existe un curso con ese nombre.')

        elif action == 'mark_late':
            student_id = request.POST.get('student_id')
            observaciones = request.POST.get('observaciones', '').strip()
            if not student_id:
                messages.error(request, 'Seleccione un alumno para marcar atraso.')
            else:
                try:
                    estudiante = Estudiante.objects.get(pk=student_id)
                    registro = RegistroAsistencia.objects.create(
                        estudiante=estudiante,
                        fecha=date.today(),
                        estado_asistencia=RegistroAsistencia.ESTADO_ATRASO,
                        observaciones=observaciones or None,
                    )
                    messages.success(request, f'Atraso registrado para {estudiante.nombre}.')
                    return redirect('alumnos_injustificados')
                except Estudiante.DoesNotExist:
                    messages.error(request, 'Alumno no encontrado.')

    estudiantes = Estudiante.objects.select_related('curso').annotate(
        atrasos_count=Count('registros_asistencia', filter=Q(registros_asistencia__estado_asistencia=RegistroAsistencia.ESTADO_ATRASO))
    ).order_by('curso__nombre', 'nombre')

    context = {
        'cursos': cursos,
        'estudiantes': estudiantes,
        'curso_jornadas': Curso.JORNADA_CHOICES,
        'title': 'Alumnos atrasados',
    }
    return render(request, 'alumnos_injustificados.html', context)


@login_required
def inventario(request):
    query = request.GET.get('q', '').strip()
    recursos = RecursoInventario.objects.order_by('nombre_articulo')

    if query:
        recursos = recursos.filter(
            Q(nombre_articulo__icontains=query) | Q(codigo_activo__icontains=query)
        )

    paginator = Paginator(recursos, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'add_item':
            codigo = request.POST.get('codigo_activo', '').strip()
            nombre = request.POST.get('nombre_articulo', '').strip()
            categoria = request.POST.get('categoria', '').strip()
            stock = request.POST.get('stock_actual', '').strip()

            categorias_validas = [choice[0] for choice in RecursoInventario.CATEGORIA_CHOICES]

            if not (codigo and nombre and categoria and stock):
                messages.error(request, 'Complete todos los campos para agregar el recurso.')
            elif categoria not in categorias_validas:
                messages.error(request, 'Categoría inválida.')
            else:
                try:
                    stock_val = int(stock)
                    recurso, created = RecursoInventario.objects.get_or_create(
                        codigo_activo=codigo,
                        defaults={
                            'nombre_articulo': nombre,
                            'categoria': categoria,
                            'stock_actual': stock_val,
                        },
                    )
                    if created:
                        messages.success(request, 'Recurso agregado correctamente.')
                        return redirect('inventario')
                    messages.warning(request, 'Ya existe un recurso con ese código activo.')
                except ValueError:
                    messages.error(request, 'Stock debe ser un número entero válido.')

        elif action == 'delete_item':
            recurso_id = request.POST.get('recurso_id')
            try:
                recurso = RecursoInventario.objects.get(pk=recurso_id)
                recurso.delete()
                messages.success(request, 'Recurso eliminado correctamente.')
                return redirect('inventario')
            except RecursoInventario.DoesNotExist:
                messages.error(request, 'Recurso no encontrado.')

    context = {
        'recursos': page_obj,
        'categorias': RecursoInventario.CATEGORIA_CHOICES,
        'title': 'Inventario',
        'query': query,
        'page_obj': page_obj,
    }
    return render(request, 'inventario.html', context)
