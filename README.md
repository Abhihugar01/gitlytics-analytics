# 🚀 Gitlytics — GitHub Analytics Platform

A modern, production-ready full-stack web application that provides deep analytics for GitHub repositories. Log in with GitHub OAuth, fetch your repos, run async analysis, and explore insights through a beautiful glassmorphism dashboard.

## Architecture

```
┌────────────────┐     ┌──────────────┐     ┌──────────┐
│   React (Vite) │────▶│  FastAPI      │────▶│ PostgreSQL│
│   Tailwind CSS │     │  REST API     │     └──────────┘
│   Recharts     │     │              │
│   Zustand      │     │  OAuth + JWT  │     ┌──────────┐
└────────────────┘     │              │────▶│  Redis    │
       :3000           └──────────────┘     └──────────┘
                             :8000               │
                               │           ┌──────────┐
                               └──────────▶│  Celery   │
                                           │  Worker   │
                                           └──────────┘
```

## Features

- **GitHub OAuth** — Secure login with token-based sessions
- **Repository Sync** — Fetch and cache all repos from GitHub API
- **Deep Analysis** — Commit frequency, contributors, language breakdown, issues/PRs
- **Async Processing** — Celery workers for background analysis with progress tracking
- **Activity Heatmap** — GitHub-style contribution visualization
- **ML Predictions** — Simple regression-based popularity predictions
- **Repo Comparison** — Side-by-side repository analytics
- **Glassmorphism UI** — Modern dark theme with animations and micro-interactions

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18, Vite 5, Tailwind CSS    |
| Charts      | Recharts                          |
| State       | Zustand                           |
| Backend     | Python 3.11, FastAPI              |
| Database    | PostgreSQL 15                     |
| Cache/Queue | Redis 7                           |
| Workers     | Celery 5                          |
| Auth        | GitHub OAuth 2.0 + JWT            |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- (Optional) Docker & Docker Compose

### 1. Clone and configure

```bash
cd gitlytics/backend
cp .env.example .env
# Edit .env with your GitHub OAuth credentials
```

Create a GitHub OAuth App at https://github.com/settings/applications/new:
- **Homepage URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:8000/auth/github/callback`

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Redis & Celery

```bash
# Start Redis (if not via Docker)
redis-server

# Start Celery worker
cd backend
celery -A app.tasks.analysis.celery worker --loglevel=info --pool=eventlet
```

### 5. Docker (recommended)

```bash
docker-compose up --build
```

## Environment Variables

| Variable               | Description                      | Default                                        |
|------------------------|----------------------------------|------------------------------------------------|
| `GITHUB_CLIENT_ID`     | GitHub OAuth App Client ID       | (required)                                     |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret   | (required)                                     |
| `GITHUB_REDIRECT_URI`  | OAuth callback URL               | `http://localhost:8000/auth/github/callback`    |
| `DATABASE_URL`         | PostgreSQL connection string     | `postgresql://postgres:password@localhost:5432/gitlytics` |
| `REDIS_URL`            | Redis connection string          | `redis://localhost:6379/0`                      |
| `SECRET_KEY`           | JWT signing key                  | (change in production!)                        |
| `FRONTEND_URL`         | Frontend URL for CORS/redirects  | `http://localhost:3000`                        |

## API Documentation

### Auth
| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| GET    | `/auth/github`         | Get GitHub OAuth login URL     |
| GET    | `/auth/github/callback`| Handle OAuth callback          |
| GET    | `/auth/me?user_id=`    | Get current user profile       |

### Repositories
| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| GET    | `/repos/?user_id=`     | Sync & list user repos         |
| GET    | `/repos/{id}?user_id=` | Get single repo with analysis  |

### Analysis
| Method | Endpoint                   | Description                    |
|--------|----------------------------|--------------------------------|
| POST   | `/analysis/{repo_id}?user_id=` | Start async analysis       |
| GET    | `/analysis/task/{task_id}` | Poll task status               |
| GET    | `/analysis/{repo_id}?user_id=` | Get stored analysis        |
| GET    | `/analysis/compare?repo_a=&repo_b=&user_id=` | Compare repos |

### General
| Method | Endpoint  | Description        |
|--------|-----------|--------------------|
| GET    | `/`       | Health message      |
| GET    | `/health` | Health check        |
| GET    | `/docs`   | Swagger UI          |
| GET    | `/redoc`  | ReDoc               |

## Project Structure

```
gitlytics/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # Settings
│   │   ├── database.py          # Async SQLAlchemy
│   │   ├── models/
│   │   │   ├── user.py          # User model
│   │   │   ├── repository.py    # Repo + Analysis models
│   │   │   └── task.py          # Task tracking model
│   │   ├── routes/
│   │   │   ├── auth.py          # GitHub OAuth
│   │   │   ├── repos.py         # Repository CRUD
│   │   │   └── analysis.py      # Analysis endpoints
│   │   ├── services/
│   │   │   ├── github.py        # GitHub API client
│   │   │   └── analytics.py     # Analytics computation
│   │   └── tasks/
│   │       └── analysis.py      # Celery background tasks
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── store/useStore.js
│   │   ├── services/api.js
│   │   ├── layouts/DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RepoDetail.jsx
│   │   │   └── Compare.jsx
│   │   └── components/
│   │       ├── StatsOverview.jsx
│   │       ├── ActivityHeatmap.jsx
│   │       ├── CommitChart.jsx
│   │       ├── LanguagePie.jsx
│   │       └── ContributorsChart.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## License

MIT
