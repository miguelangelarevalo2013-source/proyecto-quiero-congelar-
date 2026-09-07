# Evidence capture instructions

This folder contains a checklist and ready-to-run PowerShell commands to collect the screenshots and terminal outputs recommended for the report.

Overview of recommended figures (names match the checklist):

1. fig10_vscode_components_api_serializers_views.png — Project structure and key files in VS Code
2. fig01_dashboard.png — Dashboard React
3. fig02_sidebar_nav.png — Sidebar / navigation
4. fig03_cursos_front_api.png — Cursos page + `/api/cursos/` JSON (HTTP 200)
5. fig04_create_edit_curso.png — Create/Edit curso (UI + HTTP 201)
6. fig05_estudiantes.png — Estudiantes page + `/api/estudiantes/` JSON
7. fig06_asistencias_sqlite.png — Create asistencia (UI) + SQLite verification
8. fig07_inventario_search.png — Inventario search (UI + `/api/inventario/buscar/`)
9. fig08_inventario_crud.png — Inventario create/edit/delete (HTTP 201, 204) + SQLite check
10. fig09_eventos.png — Eventos page + `/api/eventos/` JSON
11. fig11_checks_build_httpcodes.png — `manage.py check`, `npm run build`, and example `curl` status lines

Instructions

- Open the frontend at `http://localhost:5175` in your browser to capture UI screenshots.
- Use the PowerShell script `capture_commands.ps1` to run example API calls and DB queries; it prints the HTTP headers (status) and JSON body to the terminal for easy screenshotting.
- For network-level evidence you can also use the browser DevTools Network tab while reproducing the action and capture the request/response rows.

Notes

- The script assumes the Django dev server runs at `http://127.0.0.1:8000` and the frontend dev server at `http://localhost:5175`. Adjust if different.
- To capture SQLite evidence the script uses `sqlite3` if available; alternatively run the SQL command shown in the checklist using the `sqlite3` CLI or a short Python snippet.

If you want I can run the example commands now and paste their outputs here for direct inspection.