"""Create or update the default Hearthline admin user.

Usage:
    docker compose exec backend python manage.py seed_admin
    docker compose exec backend python manage.py seed_admin --username owner --email owner@acme.com --password secret123

If env vars are set (HEARTHLINE_ADMIN_USERNAME / _EMAIL / _PASSWORD), they
become the defaults. Otherwise the script falls back to admin/admin/hearthline.
Idempotent: re-running updates the password and ensures is_staff/is_superuser.
"""
from __future__ import annotations

import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed or update the default Hearthline admin user."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            default=os.environ.get("HEARTHLINE_ADMIN_USERNAME", "admin"),
        )
        parser.add_argument(
            "--email",
            default=os.environ.get("HEARTHLINE_ADMIN_EMAIL", "admin@hearthline.local"),
        )
        parser.add_argument(
            "--password",
            default=os.environ.get("HEARTHLINE_ADMIN_PASSWORD", "hearthline"),
        )

    def handle(self, *args, **options):
        from django.conf import settings

        username = options["username"]
        email = options["email"]
        password = options["password"]

        # Hard-fail in production: never let the default 'hearthline' password
        # ship to a non-DEBUG environment.
        if not settings.DEBUG and password == "hearthline":
            raise SystemExit(
                "Refusing to seed admin with the default 'hearthline' password "
                "in a non-DEBUG environment. Set HEARTHLINE_ADMIN_PASSWORD or "
                "pass --password=<strong-password>."
            )

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_staff": True, "is_superuser": True},
        )
        # Only rotate the password hash when the password actually changed.
        # Re-hashing invalidates every active session for this user (Django's
        # session_auth_hash check), which would log the browser out on refresh.
        password_changed = created or not user.check_password(password)
        if password_changed:
            user.set_password(password)
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.save()

        if created:
            verb = "Created"
        elif password_changed:
            verb = "Updated (password rotated)"
        else:
            verb = "Updated (password unchanged)"
        self.stdout.write(self.style.SUCCESS(
            f"{verb} admin user '{username}' (email: {email})."
        ))
        if password == "hearthline":
            self.stdout.write(self.style.WARNING(
                "Using default password 'hearthline'. Set HEARTHLINE_ADMIN_PASSWORD "
                "or pass --password before deploying."
            ))
