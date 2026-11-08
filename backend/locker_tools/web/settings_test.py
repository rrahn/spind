import os

os.environ.setdefault("DJANGO_SECRET_KEY", "test-only-not-for-serving-requests")
os.environ.setdefault("POSTGRES_PASSWORD", "change-me")

from .settings import *  # noqa: E402,F403

ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
PASSWORD_HASHERS = ["django.contrib.auth.hashers.PBKDF2PasswordHasher"]
