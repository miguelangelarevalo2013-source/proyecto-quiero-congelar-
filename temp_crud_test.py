import json
import sqlite3
import time
import urllib.request
import urllib.error
from urllib.parse import quote

BASE = 'http://127.0.0.1:8000'


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f'{BASE}{path}',
        data=data,
        method=method,
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode('utf-8')
            print(f'[{method}] {path} -> HTTP {resp.status}')
            if raw:
                print(raw)
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8')
        print(f'[{method}] {path} -> HTTP {e.code}')
        if raw:
            print(raw)
        raise

stamp = int(time.time())
course_name = f'CRUD_COURSE_{stamp}'
student_name = f'CRUD_STUDENT_{stamp}'
item_code = f'INV-{stamp}'
item_name = f'CRUD Item {stamp}'

print('=== GET cursos ===')
request('GET', '/api/cursos/')

print('\n=== POST curso ===')
status, course = request('POST', '/api/cursos/', {'nombre': course_name, 'jornada': 'manana'})
course_id = course['id']
print(f'Created course id={course_id}')

print('\n=== PATCH curso ===')
request('PATCH', f'/api/cursos/{course_id}/', {'nombre': f'{course_name}_EDITED'})

print('\n=== POST estudiante ===')
status, student = request('POST', '/api/estudiantes/', {
    'rut': f'{stamp}123-K',
    'nombre': student_name,
    'sexo': 'M',
    'email_apoderado': f'{student_name.lower()}@mail.test',
    'motivo_atraso': 'Test reason',
    'curso_id': course_id,
})
student_id = student['id']
print(f'Created student id={student_id}')

print('\n=== PATCH estudiante ===')
request('PATCH', f'/api/estudiantes/{student_id}/', {'motivo_atraso': 'Updated test reason'})

print('\n=== POST inventario ===')
status, item = request('POST', '/api/inventario/', {
    'codigo_activo': item_code,
    'nombre_articulo': item_name,
    'categoria': 'aseo',
    'stock_actual': 12,
})
item_id = item['id']
print(f'Created item id={item_id}')

print('\n=== GET inventario ===')
request('GET', '/api/inventario/')

print('\n=== SEARCH inventario ===')
request('GET', f'/api/inventario/buscar/?q={quote(item_name[:12])}')

print('\n=== PATCH inventario ===')
request('PATCH', f'/api/inventario/{item_id}/', {'stock_actual': 25, 'nombre_articulo': f'{item_name} MODIFIED'})

print('\n=== DELETE inventario ===')
request('DELETE', f'/api/inventario/{item_id}/')

print('\n=== POST asistencia ===')
status, attendance = request('POST', '/api/asistencias/', {
    'estudiante_id': student_id,
    'fecha': '2026-09-06',
    'estado_asistencia': 'A',
    'observaciones': 'CRUD attendance test'
})
attendance_id = attendance['id']
print(f'Created attendance id={attendance_id}')

print('\n=== PATCH asistencia ===')
request('PATCH', f'/api/asistencias/{attendance_id}/', {'observaciones': 'Updated attendance note'})

print('\n=== POST evento ===')
status, event = request('POST', '/api/eventos/', {
    'titulo': f'CRUD_EVENT_{stamp}',
    'fecha': '2026-09-07',
    'hora_inicio': '09:00:00',
    'hora_fin': '10:30:00',
    'descripcion': 'CRUD event test'
})
event_id = event['id']
print(f'Created event id={event_id}')

print('\n=== PATCH evento ===')
request('PATCH', f'/api/eventos/{event_id}/', {'descripcion': 'Updated event description'})

print('\n=== SQLITE CHECK ===')
conn = sqlite3.connect('db.sqlite3')
conn.row_factory = sqlite3.Row
for table, field_name in [
    ('escuela_app_curso', 'nombre'),
    ('escuela_app_estudiante', 'nombre'),
    ('escuela_app_recursoinventario', 'nombre_articulo'),
    ('escuela_app_registroasistencia', 'observaciones'),
    ('escuela_app_eventoagenda', 'descripcion'),
]:
    rows = conn.execute(
        f"SELECT * FROM {table} WHERE {field_name} LIKE '%CRUD%' OR {field_name} LIKE '%crud%' OR {field_name} LIKE '%EDITED%' OR {field_name} LIKE '%MODIFIED%' OR {field_name} LIKE '%Updated%' ORDER BY id DESC LIMIT 20"
    ).fetchall()
    print(f'[{table}] {len(rows)} rows')
    for row in rows:
        print(dict(row))
conn.close()

print('\n=== CLEANUP ===')
for path in [
    f'/api/asistencias/{attendance_id}/',
    f'/api/estudiantes/{student_id}/',
    f'/api/eventos/{event_id}/',
    f'/api/cursos/{course_id}/',
]:
    try:
        request('DELETE', path)
    except Exception:
        pass
print('\n=== END ===')
