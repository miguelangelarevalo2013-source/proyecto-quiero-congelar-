# PowerShell helper script with example commands for evidence capture
# Run from the project root (where manage.py and db.sqlite3 live).

# 1) Backend system check
Write-Output "=== Django system check ==="
\.\.\venv\Scripts\python.exe manage.py check 2>&1 | tee django_check.txt

# 2) Build frontend (optional, for production build evidence)
Write-Output "=== Frontend build (Vite) ==="
Set-Location -Path .\frontend
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run build 2>&1 | tee ..\evidence\npm_build.txt
Set-Location -Path ..

# 3) List cursos (HTTP 200)
Write-Output "=== GET /api/cursos/ ==="
curl -i http://127.0.0.1:8000/api/cursos/ | tee evidence\curl_get_cursos.txt

# 4) Create a curso (HTTP 201)
Write-Output "=== POST /api/cursos/ (create) ==="
$cursoPayload = '{"nombre": "Curso Evidencia 01", "jornada": "mañana"}'
curl -i -H "Content-Type: application/json" -d $cursoPayload http://127.0.0.1:8000/api/cursos/ | tee evidence\curl_post_cursos.txt

# 5) List estudiantes
Write-Output "=== GET /api/estudiantes/ ==="
curl -i http://127.0.0.1:8000/api/estudiantes/ | tee evidence\curl_get_estudiantes.txt

# 6) Create an asistencia via API (example)
Write-Output "=== POST /api/asistencias/ (create example) ==="
$asistenciaPayload = '{"estudiante_id": 1, "fecha": "2026-09-07", "estado_asistencia": "A"}'
curl -i -H "Content-Type: application/json" -d $asistenciaPayload http://127.0.0.1:8000/api/asistencias/ | tee evidence\curl_post_asistencias.txt

# 7) Inventory search
Write-Output "=== GET /api/inventario/buscar/?q=papel ==="
curl -i "http://127.0.0.1:8000/api/inventario/buscar/?q=papel" | tee evidence\curl_search_inventario.txt

# 8) Create inventory item
Write-Output "=== POST /api/inventario/ (create) ==="
$invPayload = '{"codigo_activo":"EVID-001","nombre_articulo":"Papel A4 Evidencia","categoria":"oficina_pedagogicos","stock_actual":10}'
curl -i -H "Content-Type: application/json" -d $invPayload http://127.0.0.1:8000/api/inventario/ | tee evidence\curl_post_inventario.txt

# 9) Delete inventory item (example id must be replaced manually or read from previous output)
Write-Output "=== DELETE /api/inventario/<id>/ (example) ==="
Write-Output "Use the id from curl_post_inventario.txt (look for \"id\") and run: curl -i -X DELETE http://127.0.0.1:8000/api/inventario/<id>/"

# 10) List eventos
Write-Output "=== GET /api/eventos/ ==="
curl -i http://127.0.0.1:8000/api/eventos/ | tee evidence\curl_get_eventos.txt

# 11) SQLite quick checks (requires sqlite3 CLI)
Write-Output "=== SQLite checks ==="
if (Get-Command sqlite3 -ErrorAction SilentlyContinue) {
    sqlite3 db.sqlite3 "select id, nombre, jornada from escuela_app_curso order by id desc limit 5;" > evidence\sqlite_cursos.txt
    sqlite3 db.sqlite3 "select id, estudiante_id, fecha, estado_asistencia from escuela_app_registroasistencia order by id desc limit 5;" > evidence\sqlite_asistencias.txt
    sqlite3 db.sqlite3 "select id, codigo_activo, nombre_articulo, stock_actual from escuela_app_recursoinventario order by id desc limit 5;" > evidence\sqlite_inventario.txt
} else {
    Write-Output "sqlite3 CLI not found; run the SQL queries manually or use Django shell to inspect DB."
}

Write-Output "=== Done. Check the files in the evidence/ folder. ==="