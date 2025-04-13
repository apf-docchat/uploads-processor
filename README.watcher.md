# Watcher

## Local Setup

- `npm install`
- `cp .env.example .env`
- Modify variables in `.env`

## Usage

- `source .env`
- `node source/watcher/main.js`

## Build Docker Images

```bash
docker build -f dockerfiles/uploads-watcher.dockerfile .
```

## Running in Production

`docker-compose.yml` service

```yaml
uploads-watcher:
  image: <image_path>
  volumes:
    - /data/datasource-uploaded:/uploads
  env:
    UPLOADS_BASE_DIR: "/uploads"
    VECTORIZER_TASKS_CELERY_BROKER_URI: "redis://redis:6379/0"
    NOOP_CELERY_RESULT_BACKEND_URI: "redis://redis:6379/15"
    PW_CORE_API_URL: "http://127.0.0.1:9000"
    PW_CORE_API_KEY: "1234567890"
  restart: unless-stopped
```
