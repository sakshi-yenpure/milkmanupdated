import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "milkman.settings")

import django
django.setup()

from staff.models import Staff


def run():
    obj, created = Staff.objects.update_or_create(
        email="admin@example.com",
        defaults={
            "name": "Admin",
            "phone": "0000000000",
            "address": "Local",
            "password": "admin123",
            "is_active": True,
        },
    )
    print("created" if created else "updated", obj.id, obj.email)


if __name__ == "__main__":
    run()
