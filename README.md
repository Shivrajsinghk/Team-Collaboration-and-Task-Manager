# Team Collaboration & Task Manager

A full-stack, real-time team collaboration platform with task management, live chat, presence tracking, and an AI-powered assistant — built with Django Channels and React.

![Backend CI](https://github.com/Shivrajsinghk/Team-Collaboration-and-Task-Manager/actions/workflows/backend-tests.yaml/badge.svg)
![Frontend CI](https://github.com/Shivrajsinghk/Team-Collaboration-and-Task-Manager/actions/workflows/frontend-tests.yaml/badge.svg)

**Live demo:** [frontend-production-499f.up.railway.app](https://frontend-production-499f.up.railway.app/)

<!-- ![demo](./docs/demo.gif) -->

## Features

- **Real-time team & personal chat** via WebSockets (Django Channels), with @mentions, typing indicators, and read receipts
- **Live presence tracking** — online/offline status with multi-connection (multi-tab) support, backed by row-level locking to prevent race conditions
- **Task management** with drag-and-drop boards, subtasks, and assignment
- **AI team assistant** — Gemini-powered chatbot (function calling) for task priorities, team workload analysis, and task search
- **Role-based team permissions** — admin/member roles, invite codes, member promotion/demotion, member management
- **Real-time notifications** for mentions, task assignments, and team activity
- **File attachments** via Cloudflare R2 (S3-compatible object storage) with presigned URLs
- **Global search** with filtering and sorting across tasks and teams

## Key Engineering Highlights

- **Concurrent presence handling** using PostgreSQL row-level locking to safely manage multiple WebSocket connections per user across tabs/devices
- **Real-time communication** using Django Channels, Redis channel layers, and WebSocket consumers for team chat, personal messaging, notifications, typing indicators, and read receipts
- **JWT-authenticated WebSockets** through a custom ASGI middleware before connections are routed to consumers
- **AI function calling** with Google Gemini, allowing the assistant to query and analyze application data instead of generating responses from static context
- **Object storage architecture** using Cloudflare R2 with presigned URLs so file uploads/downloads do not pass through the Django application server
- **Containerized deployment** using multi-stage Docker builds for reproducible backend and frontend environments
- **Automated CI/CD** with GitHub Actions, including backend tests, coverage reporting, frontend linting/build checks, and protected main branch
- **Production deployment** with separate frontend, backend, PostgreSQL, and Redis services on Railway

## Tech Stack

**Backend**
- Django 6.0 + Django REST Framework 3.17
- Django Channels 4.3 + Daphne (ASGI, WebSockets)
- PostgreSQL + Redis (channel layer, presence tracking)
- JWT auth (`djangorestframework-simplejwt`)
- Cloudflare R2 (`django-storages` + `boto3`)
- Google Gemini (`google-genai`) for the AI assistant

**Frontend**
- React 19 + Vite 8
- Redux Toolkit + TanStack Query
- Tailwind CSS
- `@hello-pangea/dnd` for drag-and-drop task boards

**Infra / DevOps**
- Docker (multi-stage builds, backend + frontend)
- GitHub Actions (CI: automated tests, lint, build)
- Railway (deployment — Postgres, Redis, backend, frontend all hosted)
- Nginx (serving frontend static build)

## Architecture

```
┌─────────────┐         HTTPS/WSS         ┌──────────────────┐
│   React     │ ────────────────────────▶ │  Django (Daphne)  │
│  (Nginx)    │ ◀──────────────────────── │   ASGI Server      │
└─────────────┘                            └─────────┬─────────┘
                                                       │
                                    ┌──────────────────┼──────────────────┐
                                    ▼                  ▼                  ▼
                              ┌──────────┐      ┌─────────────┐   ┌─────────────┐
                              │PostgreSQL│      │    Redis     │   │ Cloudflare  │
                              │          │      │(Channel Layer│   │     R2      │
                              │          │      │ + Presence)  │   │  (Media)    │
                              └──────────┘      └─────────────┘   └─────────────┘
```

WebSocket connections are authenticated via a custom JWT middleware (`JWTAuthMiddleware`) that validates tokens passed as query params before routing to the appropriate consumer (team chat, personal chat, or notifications).

## Scaling Considerations

The backend uses Redis as the Channels layer, so WebSocket messages aren't tied to a single server process — multiple Daphne instances could share connections through Redis if traffic required horizontal scaling. Presence state (`active_connections`) uses PostgreSQL row-level locking (`select_for_update`) to stay correct under concurrent WebSocket connects/disconnects from the same user. File attachments go straight to Cloudflare R2 via presigned URLs rather than through the Django server, keeping large uploads off the app server's bandwidth.

## Future Improvements

- Add frontend unit and component tests (Vitest + React Testing Library)
- Introduce background workers (e.g. Celery) for long-running AI and notification workloads
- Add Redis caching for frequently accessed data
- Add rate limiting on APIs and WebSocket connections
- Add structured logging and error monitoring (e.g. Sentry)
- Implement cursor-based pagination for high-volume chat and activity feeds
- Load-test WebSocket connections under concurrent users
- Expand AI assistant with additional tools and deeper team analytics

## Security

- JWT-based authentication for REST APIs and WebSocket connections
- Role-based authorization for team administration and member management
- WebSocket membership validation before joining team/personal chat groups
- Presigned URLs for secure direct-to-object-storage file transfers
- Environment variables for secrets and API credentials
- Backend validation of task assignments, team membership, and permissions
- Protected `main` branch requiring CI checks before merging

## Testing

- 133+ backend tests covering authentication, WebSocket consumers, team permissions, task management, and the AI assistant
- 91% test coverage, including async WebSocket consumer tests using `channels.testing.WebsocketCommunicator` and `pytest-asyncio`
- Frontend CI runs lint + build checks on every push

Run the backend test suite locally:
```bash
cd backend
pytest --cov=. --cov-report=term-missing
```

## Running Locally with Docker

1. Clone the repo:
```bash
git clone https://github.com/Shivrajsinghk/Team-Collaboration-and-Task-Manager.git
cd Team-Collaboration-and-Task-Manager
```

2. Create a `.env` file inside `backend/` with the following variables:
```
SECRET_KEY=
DEBUG=True
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
REDIS_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT_URL=
R2_BUCKET_NAME=
GEMINI_API_KEY=
```

3. Build and run:
```bash
docker-compose up --build
```

4. Backend available at `http://localhost:8000`, frontend at `http://localhost:5173`.

## CI/CD

- **Backend CI**: runs the full pytest suite and reports coverage on every push to `main`
- **Frontend CI**: lints and builds the React app on every push to `main`
- **Deployment**: Railway auto-deploys from `main`, gated on CI passing
- Branch protection on `main` requires both CI checks to pass before merge

## Known Limitations

- Frontend CI currently covers linting and production builds; a dedicated unit/component test suite is planned.
- Some lower-traffic backend modules, such as task views and serializers, have lower test coverage than the core authentication, WebSocket, and permissions layers.
