# vPasi — Research-Augmented Trade Assistant

> AI-powered trade assistant for informal cross-border traders in Africa.
> Combines a LangGraph research agent with multi-channel access (Web UI, USSD, Voice, WhatsApp, SMS).

## Architecture

```
vPasi/
├── backend/                 # FastAPI + LangGraph research agent
│   ├── src/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── api/             # REST & webhook routes
│   │   ├── core/            # Config, security, logging
│   │   ├── graph/           # LangGraph research agent
│   │   ├── safety/          # AI safety (PII, toxicity, hallucination)
│   │   ├── services/        # External service clients (AT, Gemini, Redis)
│   │   └── interfaces/      # Channel handlers (USSD, Voice, WhatsApp)
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/                # React + Vite UI
│   ├── src/
│   │   ├── components/      # Input form, timeline, citations
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Production stack
├── docker-compose.override.yml  # Dev overrides (hot-reload, mounts)
├── .env.example             # Template — no secrets
├── CAPSTONE.md              # Project specification
└── README.md                # This file
```

## Quick Start (Docker Compose)

```bash
# 1. Copy environment template
cp .env.example .env
# → Fill in API keys: GEMINI_API_KEY, AT_API_KEY, LANGSMITH_API_KEY

# 2. Start all services
docker-compose up --build

# 3. Access the app
#    Frontend:  http://localhost:5173
#    Backend:   http://localhost:8080
#    API docs:  http://localhost:8080/docs
```

## Development (without Docker)

### Backend

```bash
cd backend

# Install uv (if needed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Copy env and configure
cp ../.env.example .env

# Run dev server
uv run uvicorn src.main:app --reload --port 8080

# Run tests
uv run pytest

# Lint & format
uv run ruff check src/
uv run ruff format src/
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## API Endpoints

| Endpoint             | Method | Description                          |
|----------------------|--------|--------------------------------------|
| `/health`            | GET    | Health check                         |
| `/api/research`      | POST   | Submit a research query (Web UI)     |
| `/api/research/{id}` | GET    | Get research result by ID            |
| `/webhooks/ussd`     | POST   | Africa's Talking USSD callbacks      |
| `/webhooks/voice`    | POST   | Africa's Talking Voice callbacks     |
| `/webhooks/whatsapp` | POST   | WhatsApp Business API messages       |
| `/webhooks/sms`      | POST   | Africa's Talking SMS inbound         |

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Development with hot-reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Tail backend logs
docker-compose logs -f backend

# Verify env inside container
docker-compose exec backend env | grep -E 'LANGSMITH|GEMINI|AT_'

# Stop and remove volumes
docker-compose down -v
```
