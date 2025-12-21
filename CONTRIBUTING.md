# Contributing to FitBridge

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | 20+ | `node --version` |
| Python | 3.10+ | `python --version` |
| Git | Latest | `git --version` |

---

## Development Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/fitbridge.git
cd fitbridge

# Frontend dependencies
npm install

# Backend dependencies
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit both files with your credentials:
# - Supabase URL & keys
# - AI API key (optional for testing)
```

### 3. Start Development

```bash
# Frontend only
npm run dev:frontend

# Backend only (from /backend)
python -m uvicorn app.main:app --reload --port 8000

# Both together
npm run dev
```

---

## Running Tests

### Frontend (Vitest)
```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage
```

### Backend (pytest)
```bash
cd backend
python -m pytest tests/ -v
```

> **Important:** All PRs must pass tests. Run tests before pushing.

---

## Code Style

### TypeScript/React
- Use functional components with hooks
- Name components in PascalCase: `WorkoutCard.tsx`
- Name utilities in camelCase: `formatDate.ts`

### Python
- Follow PEP 8
- Use type hints
- Async functions for I/O operations

### Commit Messages
```
type(scope): brief description

# Examples:
feat(workout): add exercise timer component
fix(api): handle missing user token
test(diet): add meal logging tests
docs: update contributing guide
```

---

## Submitting Changes

### Branch Naming
```
feature/short-description
bugfix/issue-number-description
test/component-name
docs/topic
```

### Pull Request Process

1. **Create branch** from `main`
2. **Make changes** with clear commits
3. **Run tests** locally
4. **Open PR** with description:
   - What changed
   - Why it changed
   - How to test
5. **Request review** from maintainer
6. **Address feedback** if any
7. **Merge** after approval

---

## Issue Labels

| Label | Meaning |
|-------|---------|
| `good first issue` | Ideal for new contributors |
| `priority: critical` | Needs immediate attention |
| `priority: high` | Important for next release |
| `priority: medium` | Should be done soon |
| `priority: low` | Nice to have |
| `type: bug` | Something isn't working |
| `type: feature` | New functionality |
| `type: test` | Test-related |
| `type: docs` | Documentation |

---

## Getting Help

- Check existing issues and PRs
- Read the [README.md](./README.md)
- Ask in PR comments

---

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to build something great together.
