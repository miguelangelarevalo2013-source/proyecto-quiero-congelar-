from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("escuela_app", "0004_estudiante_motivo_atraso"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TRIGGER registro_asistencia_unique_insert
            BEFORE INSERT ON escuela_app_registroasistencia
            WHEN EXISTS (
                SELECT 1
                FROM escuela_app_registroasistencia
                WHERE estudiante_id = NEW.estudiante_id AND fecha = NEW.fecha
            )
            BEGIN
                SELECT RAISE(ABORT, 'duplicate attendance for student and date');
            END;

            CREATE TRIGGER registro_asistencia_unique_update
            BEFORE UPDATE OF estudiante_id, fecha ON escuela_app_registroasistencia
            WHEN EXISTS (
                SELECT 1
                FROM escuela_app_registroasistencia
                WHERE estudiante_id = NEW.estudiante_id
                  AND fecha = NEW.fecha
                  AND id != OLD.id
            )
            BEGIN
                SELECT RAISE(ABORT, 'duplicate attendance for student and date');
            END;
            """,
            reverse_sql="""
            DROP TRIGGER IF EXISTS registro_asistencia_unique_insert;
            DROP TRIGGER IF EXISTS registro_asistencia_unique_update;
            """,
        ),
    ]