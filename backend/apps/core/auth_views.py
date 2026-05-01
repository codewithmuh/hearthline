"""Session-based auth endpoints for the Hearthline dashboard.

POST /api/auth/login/   { username, password }  -> sets sessionid cookie, returns user
POST /api/auth/logout/                          -> clears session
GET  /api/auth/me/                              -> returns current user or 401
"""
from __future__ import annotations

from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.core import is_ratelimited
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def _serialize(user) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "is_staff": user.is_staff,
    }


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []  # don't require CSRF on first call

    def post(self, request):
        # Throttle: 5 failed attempts / 5 min per IP, 10 / 5 min per username.
        # Lockouts cool off automatically; uses Django's default cache backend.
        if is_ratelimited(request, group="login-ip", key="ip", rate="5/5m", increment=True):
            return Response(
                {"detail": "Too many login attempts. Try again in a few minutes."},
                status=429,
            )

        identifier = (request.data.get("username") or request.data.get("email") or "").strip()
        password = request.data.get("password") or ""
        if not identifier or not password:
            return Response({"detail": "Username and password are required."}, status=400)

        if is_ratelimited(
            request, group="login-user", key=lambda _g, _r: identifier.lower(),
            rate="10/5m", increment=True,
        ):
            return Response(
                {"detail": "Too many login attempts for this account. Try again later."},
                status=429,
            )

        user = authenticate(request, username=identifier, password=password)
        if user is None and "@" in identifier:
            from django.contrib.auth import get_user_model

            User = get_user_model()
            try:
                match = User.objects.get(email__iexact=identifier)
                user = authenticate(request, username=match.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is None:
            return Response({"detail": "Invalid credentials."}, status=401)
        if not user.is_active:
            return Response({"detail": "Account is disabled."}, status=403)

        login(request, user)
        return Response({"user": _serialize(user)})


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request):
        logout(request)
        return Response({"ok": True})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": _serialize(request.user)})
