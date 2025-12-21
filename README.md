# FitBridge 🏋️

AI-powered fitness app with workout/diet plans, progress tracking, and gamification.

[![CI](https://github.com/your-org/fitbridge/actions/workflows/test.yml/badge.svg)](https://github.com/your-org/fitbridge/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Coach | Personalized workout & diet plans |
| 🔥 Streaks | Gamified consistency tracking |
| 📊 Analytics | Progress charts and stats |
| 💬 Chat | AI fitness coach conversations |
| 📱 Mobile-First | Responsive design |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Vite                            │  │
│  │  ├── components/    UI Components                        │  │
│  │  ├── services/      API Client, Supabase Client          │  │
│  │  └── tests/         Vitest + React Testing Library       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────┘
                             │ HTTP/SSE
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  app/routers/       API Endpoints                        │  │
│  │  app/services/      AI Service, Supabase Service         │  │
│  │  tests/             pytest + httpx                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│      SUPABASE           │    │     AI PROVIDERS        │
│  ├── PostgreSQL DB      │    │  ├── OpenAI GPT-4o      │
│  ├── Authentication     │    │  └── DeepSeek           │
│  └── Row Level Security │    │                         │
└─────────────────────────┘    └─────────────────────────┘
```

### Data Flow

```
User Action → Component → apiClient.ts → FastAPI → Services → Response
                                              ↓
                                        Supabase/AI
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| Python | 3.10+ |
| npm | 10+ |

### Setup

```bash
# Clone
git clone https://github.com/your-org/fitbridge.git
cd fitbridge

# Frontend
npm install
cp .env.example .env

# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env

# Start both
cd ..
npm run dev
```

---

## 🧪 Testing

```bash
# Frontend
npm run test:run        # Run once
npm run test:coverage   # With coverage

# Backend
cd backend
python -m pytest tests/ -v
```

---

## 📁 Project Structure

```
fitbridge/
├── components/          # React UI
├── services/            # API clients
├── tests/               # Frontend tests
├── backend/
│   ├── app/routers/     # API endpoints
│   ├── app/services/    # Business logic
│   └── tests/           # Backend tests
├── docs/                # Documentation
│   ├── API.md           # API contracts
│   ├── ARCHITECTURE.md  # Module breakdown
│   └── ISSUES.md        # GitHub issues
└── .github/workflows/   # CI/CD
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Expectations

| Requirement | Details |
|-------------|---------|
| Tests | All PRs must pass existing tests |
| Lint | Run `npm run lint` before pushing |
| Format | Run `npm run format` for consistency |
| PRs | Small, focused changes preferred |
| Issues | Check existing issues before starting |

### For Interns

1. Start with issues labeled `good first issue`
2. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
3. Review [docs/API.md](docs/API.md) for API contracts
4. Ask questions in PR comments

---

## 🗺️ Roadmap

### Q1 2025: Foundation ✅

- [x] Core workout/diet logging
- [x] AI plan generation
- [x] Streak system
- [x] Basic analytics
- [x] Test infrastructure
- [x] CI/CD pipeline

### Q2 2025: Enhancement

- [ ] Workout templates library
- [ ] Progress photos
- [ ] Export data (CSV)
- [ ] Rest timer
- [ ] Toast notifications
- [ ] Improved empty states

### Q3 2025: Scale

- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Social sharing
- [ ] Weekly email reports
- [ ] Multi-language support

### Q4 2025: Growth

- [ ] Apple Health integration
- [ ] Workout music integration
- [ ] Group challenges
- [ ] Personal trainer mode

---

## 🎯 Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| **v0.1** - MVP | Dec 2024 | ✅ Done |
| **v0.2** - Testing | Dec 2024 | ✅ Done |
| **v0.3** - Polish | Jan 2025 | 🔄 In Progress |
| **v0.4** - Templates | Feb 2025 | ⏳ Planned |
| **v1.0** - Mobile | Mar 2025 | ⏳ Planned |

### v0.3 Polish (Current)

- [ ] Fix streak edge cases
- [ ] Add loading skeletons
- [ ] Improve error handling
- [ ] Add toast notifications
- [ ] Complete test coverage (70%)

> **Exit Criteria:** v0.3 is complete when all polish items are merged, CI is green, and no P0/P1 issues remain open.

### v0.4 Templates

- [ ] Pre-built workout library
- [ ] Meal plan templates
- [ ] One-click start
- [ ] Template customization

---

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| [API.md](docs/API.md) | Full API contracts with examples |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Module breakdown |
| [ISSUES.md](docs/ISSUES.md) | Ready-to-create GitHub issues |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guide |
| [ISSUE_BACKLOG.md](ISSUE_BACKLOG.md) | Prioritized task list |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | Supabase (PostgreSQL) |
| AI | OpenAI, DeepSeek |
| Testing | Vitest, pytest |
| CI/CD | GitHub Actions |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

