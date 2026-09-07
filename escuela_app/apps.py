from django.apps import AppConfig
from django.db.models.signals import post_migrate


def create_default_admin(sender, **kwargs):
    from django.contrib.auth import get_user_model

    User = get_user_model()
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@ceia.cl", "admin")


class EscuelaAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "escuela_app"

    def ready(self) -> None:
        post_migrate.connect(create_default_admin, sender=self)
