# vPasi Backend

> AI-powered trade assistant for informal cross-border traders in Africa.

## Architecture

```
src/
├── main.py              # FastAPI app entry point
├── core/                # Config, security, logging
├── services/            # External service wrappers (AT, Vertex AI, Redis)
├── interfaces/          # Business logic per channel (USSD, Voice, WhatsApp)
└── api/                 # FastAPI routers (webhook endpoints)
```

## Quick Start

```bash
# 1. Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Install dependencies
uv sync

# 3. Copy environment variables
cp .env.example .env
# → Fill in AT_API_KEY, AT_USERNAME, GOOGLE_PROJECT_ID, REDIS_URL

# 4. Run the dev server
uv run uvicorn src.main:app --reload --port 8080

# 5. Run tests
uv run pytest

# 6. Lint & format
uv run ruff check src/
uv run ruff format src/
```

## Docker

```bash
docker build -t vpasi-backend .
docker run -p 8080:8080 --env-file .env vpasi-backend
```

## Webhook Endpoints

| Endpoint             | Method | Content-Type       | Description           |
|----------------------|--------|--------------------|-----------------------|
| `/webhooks/ussd`     | POST   | `text/plain`       | AT USSD callbacks     |
| `/webhooks/voice`    | POST   | `application/xml`  | AT Voice callbacks    |
| `/webhooks/whatsapp` | POST   | `application/json` | WhatsApp messages     |
| `/health`            | GET    | `application/json` | Health check          |
