# Add a Django/PostgreSQL backend without replacing the prototype

The user approved Django ORM/migrations, Django Ninja, and django-allauth for
the booking backend after comparing Python alternatives and the existing
Express/MySQL implementation. This keeps typed REST/OpenAPI endpoints and
centralises authentication and transactional booking rules without building
separate SQLAlchemy/Alembic and authentication layers.

Reuse the existing Python package and preserve its importer and optimiser.
Keep the React/Express/MySQL prototype and its API-only RAS simulator running
alongside PostgreSQL until an explicit data migration and React integration are
implemented. The two databases are not synchronised or interchangeable.
