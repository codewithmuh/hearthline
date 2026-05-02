"""Django settings for Hearthline."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-not-for-production")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = os.environ.get(
    "DJANGO_ALLOWED_HOSTS",
    "localhost,127.0.0.1,backend,.ngrok-free.app,.ngrok.app,.ngrok.io,.trycloudflare.com",
).split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.core",
    "apps.leads",
    "apps.calls",
    "apps.quotes",
    "apps.ai",
    "django_ratelimit",
]

# Local-memory cache for django-ratelimit. Per-process; for multi-worker
# production, swap to Redis/Memcached and remove the silenced check below.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "hearthline-default",
    },
}
SILENCED_SYSTEM_CHECKS = ["django_ratelimit.E003", "django_ratelimit.W001"]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "hearthline.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "hearthline.wsgi.application"
ASGI_APPLICATION = "hearthline.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "hearthline"),
        "USER": os.environ.get("POSTGRES_USER", "hearthline"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "hearthline_dev"),
        "HOST": os.environ.get("POSTGRES_HOST", "db"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    }
}

# Railway / Heroku style: if DATABASE_URL is provided, use it (overrides individual vars).
_database_url = os.environ.get("DATABASE_URL")
if _database_url:
    try:
        import dj_database_url  # type: ignore
        DATABASES["default"] = dj_database_url.parse(_database_url, conn_max_age=600, ssl_require=False)
    except ImportError:
        # Lightweight fallback parser if dj_database_url isn't installed.
        from urllib.parse import urlparse
        parsed = urlparse(_database_url)
        DATABASES["default"] = {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": (parsed.path or "/").lstrip("/"),
            "USER": parsed.username or "",
            "PASSWORD": parsed.password or "",
            "HOST": parsed.hostname or "",
            "PORT": str(parsed.port or 5432),
        }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.core.authentication.CsrfExemptSessionAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

_default_cors = "http://localhost:3000,http://127.0.0.1:3000"
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("DJANGO_CORS_ALLOWED_ORIGINS", _default_cors).split(",")
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

# Behind a reverse proxy (Railway / Vercel proxy / nginx), trust the X-Forwarded-Proto header.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# Production hardening (no-op when DEBUG=1)
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

CSRF_TRUSTED_ORIGINS = [
    o.replace("http://", "https://") if o.startswith("http://") else o
    for o in CORS_ALLOWED_ORIGINS
] + [
    "https://*.ngrok-free.app",
    "https://*.ngrok.app",
    "https://*.ngrok.io",
]

# Logging — surface app-level INFO logs (call transcripts, tool calls) to stdout
# so `docker compose logs -f backend` shows the running call.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "simple"},
    },
    "loggers": {
        "apps": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
    "root": {"handlers": ["console"], "level": "WARNING"},
}

# AI
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# Voice
VAPI_API_KEY = os.environ.get("VAPI_API_KEY", "")
VAPI_PHONE_NUMBER_ID = os.environ.get("VAPI_PHONE_NUMBER_ID", "")
VAPI_WEBHOOK_SECRET = os.environ.get("VAPI_WEBHOOK_SECRET", "")
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER", "")

# ----- Production hard-fail guards ---------------------------------------
# Refuse to boot when DEBUG=0 with insecure defaults still in place. Prevents
# the entire class of "shipped to prod with dev secrets" outages.
if not DEBUG:
    if SECRET_KEY == "dev-only-not-for-production":
        raise RuntimeError(
            "DJANGO_SECRET_KEY is not set. Refusing to start with the dev fallback."
        )
    if not os.environ.get("HEARTHLINE_ENCRYPTION_KEY", "").strip():
        raise RuntimeError(
            "HEARTHLINE_ENCRYPTION_KEY is not set. API keys would be encrypted "
            "with a SECRET_KEY-derived dev fallback — refusing to start. "
            "Generate one with: "
            "python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'"
        )
    if not VAPI_WEBHOOK_SECRET:
        # Soft warning: webhook signature verification is skipped without it.
        import logging as _lg
        _lg.getLogger(__name__).warning(
            "VAPI_WEBHOOK_SECRET is not set in prod — webhook signatures will not be verified."
        )
