# Evidence checklist

Use this checklist while you capture screenshots. Mark each item done and attach the corresponding image file as named.

1. fig10_vscode_components_api_serializers_views.png — Open VS Code: Explorer showing `frontend/src/components/`, `frontend/src/pages/` and open `frontend/src/services/api.js`, `escuela_app/serializers.py`, `escuela_app/api_views.py`. Capture all in one screenshot (split view if needed).

2. fig01_dashboard.png — Browser at `http://localhost:5175/` showing Dashboard cards and API-connected values.

3. fig02_sidebar_nav.png — Browser showing sidebar with active link.

4. fig03_cursos_front_api.png — Browser `http://localhost:5175/cursos` and terminal `curl -i http://127.0.0.1:8000/api/cursos/` (HTTP 200). Capture both.

5. fig04_create_edit_curso.png — Fill and submit "Crear curso" from the UI; capture success message and terminal `curl` GET showing the new item (or capture Network devtools request showing HTTP 201).

6. fig05_estudiantes.png — Browser `http://localhost:5175/estudiantes` and `curl -i http://127.0.0.1:8000/api/estudiantes/`.

7. fig06_asistencias_sqlite.png — Create asistencia from UI; then run SQLite query: `sqlite3 db.sqlite3 "select id, estudiante_id, fecha, estado_asistencia from escuela_app_registroasistencia order by id desc limit 5;"` and capture result.

8. fig07_inventario_search.png — In Inventory page, perform a search and capture UI + `curl -i "http://127.0.0.1:8000/api/inventario/buscar/?q=..."` output.

9. fig08_inventario_crud.png — Create an inventory item (UI), capture HTTP 201 (curl or Network), then delete it and capture HTTP 204 and verify via sqlite query.

10. fig09_eventos.png — Browser `http://localhost:5175/eventos` showing events; capture and include `curl -i http://127.0.0.1:8000/api/eventos/` (HTTP 200).

11. fig11_checks_build_httpcodes.png — Terminal with (a) `python manage.py check` output (System check OK), (b) `npm run build` output showing success, and (c) example `curl -i` outputs with HTTP 200, 201, 204. Group them into a single image if possible.

---

Tips:
- Use browser DevTools Network tab to capture requests/responses (Status/Headers/Response).
- Name files exactly as above and keep them in a folder `evidence_images/` to attach later.
- If sqlite3 is not installed, use Django shell to print model data:
  ```py
  .\.venv\Scripts\python.exe manage.py shell
  from escuela_app.models import RegistroAsistencia
  print(RegistroAsistencia.objects.order_by('-id').values_list('id','estudiante_id','fecha','estado_asistencia')[:5])
  ```

When you want, I can run the `capture_commands.ps1` here and paste outputs, or run specific curl/sqlite commands and show the raw text outputs for immediate inclusion in the report.