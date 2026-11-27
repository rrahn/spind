import os

DEBUG = os.environ.get("DJANGO_DEBUG", "false") == "true"
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
ROOT_URLCONF = "locker_tools.web.urls"
AUTH_USER_MODEL = "booking.User"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"
LANGUAGE_CODE = "de"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "allauth",
    "allauth.account",
    "allauth.headless",
    "locker_tools.web.booking",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
DATABASES = {"default": {
    "ENGINE": "django.db.backends.postgresql",
    "HOST": os.environ.get("POSTGRES_HOST", "127.0.0.1"),
    "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    "NAME": os.environ.get("POSTGRES_DB", "lockerdb"),
    "USER": os.environ.get("POSTGRES_USER", "locker"),
    "PASSWORD": os.environ["POSTGRES_PASSWORD"],
    "CONN_MAX_AGE": 0,
}}
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]
# Argon2id first (OWASP); older hashes are upgraded transparently on next login.
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.ScryptPasswordHasher",
]
# NIST SP 800-63B rev. 4: >= 15 characters for single-factor passwords, no composition rules.
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 15}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*"]
ACCOUNT_SIGNUP_FORM_CLASS = "locker_tools.web.booking.forms.GuardianSignupForm"
ACCOUNT_USER_DISPLAY = lambda user: user.first_name or user.email
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
# Codes are bound to the pending signup session, so a correct code logs that session in.
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_ENABLED = True
# 6 digits stay unguessable because a code dies after 3 wrong attempts or 15 minutes.
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_FORMAT = {"numeric": True, "length": 6, "dashed": False}
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_MAX_ATTEMPTS = 3
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_TIMEOUT = 15 * 60
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = False
ACCOUNT_PREVENT_ENUMERATION = True
ACCOUNT_UNIQUE_EMAIL = True
HEADLESS_ONLY = True
HEADLESS_CLIENTS = ("browser",)
FRONTEND_URL = os.environ.get("LOCKER_FRONTEND_URL", "http://localhost:3000").rstrip("/")
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": FRONTEND_URL + "/accounts/confirm-email/{key}",
    "account_reset_password": FRONTEND_URL + "/passwort-vergessen",
    "account_reset_password_from_key": FRONTEND_URL + "/accounts/reset-password/{key}",
    "account_signup": FRONTEND_URL + "/registrieren",
}
EMAIL_BACKEND = os.environ.get("DJANGO_EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = os.environ.get("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "1025"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "false") == "true"
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "locker@localhost")
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
STATIC_URL = "/static/"
