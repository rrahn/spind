FROM python:3.12-slim

WORKDIR /app
RUN pip install --no-cache-dir uv==0.10.8
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-install-project
COPY locker_tools ./locker_tools
COPY tests ./tests
RUN uv sync --frozen

EXPOSE 8000
CMD ["sh", "-c", "uv run --no-sync locker-web migrate --noinput && uv run --no-sync locker-web runserver 0.0.0.0:8000 --noreload"]
