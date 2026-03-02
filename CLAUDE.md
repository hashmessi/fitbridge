---
name: project-guidelines
version: 1.0
scope: Backend (FastAPI/Pydantic), Frontend (React + Vite, React Native/Expo), Supabase
---

Purpose

- Define explicit, enforceable rules for authoring, reviewing, and maintaining code in this repository.
- Minimize false positives by being precise and tool-aligned. Reviewers and automation MUST use this file as the single source of truth for code style and quality rules.

General Principles

- Security first: never commit secrets; follow least privilege; validate all inputs.
- Reproducibility: pinned dependencies, deterministic builds, CI parity with local.
- Observability: consistent logging, error handling, and health checks.
- Performance and accessibility are non-negotiable; measure and test.

Repository-wide Rules

1. Formatting and Linting

- Frontend: Prettier is the source of truth for formatting; ESLint for linting (typescript, react, react-hooks, jsx-a11y). Run with --max-warnings=0 in CI.
- Backend: Black (line length 88), isort (profile=black), Ruff for linting. Ruff/Flake8 errors fail CI.
- Do not disable rules without a justification comment referencing an issue/ticket.

2. Type Checking

- Frontend: TypeScript must compile with "strict": true. No any unless justified and isolated.
- Backend: Prefer type hints everywhere. mypy runs in CI with strict optional checks for app/.

3. Testing

- Frontend: Use Vitest/Jest + Testing Library. Minimum coverage gate 70% lines for changed files.
- Backend: pytest with coverage; minimum 80% lines for app/ changed files.
- Tests must be deterministic. Avoid network calls; mock services (Supabase, AI, etc.).

4. Secrets and Configuration

- Never hardcode secrets. Dotenv files are for local dev only.
- .env.example and backend/.env.example must include all required keys with comments. Production uses environment variables injected by the platform (no .env files read in prod).
- Use namespaced public env vars in frontend only (e.g., VITE*, EXPO_PUBLIC*) and never commit private keys.

5. Git and Review Process

- Default review scope is unstaged changes (git diff). Reviewers may expand scope when necessary.
- All PRs must pass CI: format, lint, type checks, tests, and this guideline conformance.
- Large PRs should be split logically. Include migration and rollback notes where relevant.

Backend (FastAPI + Pydantic) Rules

1. Structure and Routing

- Use APIRouter per domain in app/routers. Include tags and response_model on endpoints.
- Requests/responses use Pydantic models (BaseModel). Avoid dicts for cross-layer contracts.
- Path and query param validation must be explicit with types and constraints (conint, constr, HttpUrl, EmailStr, etc.).

2. Error Handling and Logging

- Implement exception handlers for HTTPException, RequestValidationError, and a catch-all that logs at error level and returns a sanitized payload.
- Use standard logging configured once in app/main.py. JSON logs in production; include request_id correlation (middleware). No print().
- Never leak stack traces or secrets in responses.

3. Services and IO

- Separate services (business logic) from routers. Services are pure/side-effect aware and unit-testable.
- External API/DB clients (Supabase, AI) live in services/ with small, composable functions.
- Timeouts and retries with backoff for network IO. Handle and log errors with context.

4. Performance

- Use async endpoints for IO-bound work. Avoid blocking calls in the event loop; offload with run_in_executor where needed.
- Employ pagination for list endpoints. Do not return unbounded datasets.

5. Validation and Security

- Validate incoming payloads strictly. Use from_orm only where needed and secure.
- Enforce auth/authorization in dependencies (dependencies/auth.py). Reject unauthenticated by default.
- Sanitize and validate user-provided identifiers to avoid injection and leakage.

6. Configuration

- Use pydantic-settings (BaseSettings) in app/config.py. Do not read .env in production by default.
- All required settings must have no default and raise when missing. Environment selection via ENV=development|staging|production.

Frontend (React + Vite, React Native/Expo) Rules

1. Structure and State

- Keep components small and typed. Use custom hooks for shared logic. Avoid prop drilling; prefer context only when warranted.
- React Hooks rules must never be violated. No conditional hooks.

2. Styling and Theming

- Prefer Tailwind or CSS Modules (web) and StyleSheet (RN). Avoid inline styles except for dynamic single-use values.
- Ensure dark/light theme correctness where applicable.

3. Accessibility

- Web: Follow eslint-plugin-jsx-a11y. Provide aria-\* where needed; labels for inputs; alt text for images; focus management for dialogs.
- RN: Use accessibilityLabel, accessible, and testIDs for important elements.

4. Networking and Env

- All network calls go through services/apiClient.\* with a single base URL source. Handle timeouts, auth, and errors centrally.
- Only expose public keys with VITE*/EXPO_PUBLIC*. Private keys must be proxied via backend.

5. Error Boundaries and Suspense

- Wrap root routes with ErrorBoundary where applicable. Never swallow errors; surface them to the boundary with context.

6. Testing

- Prefer Testing Library with realistic user interactions. Avoid snapshot-only tests for complex UI.
- Mock network with MSW for web and equivalent for RN when feasible.

Supabase Rules

- Never commit service_role key on the client. Only use anon/public keys in frontend (public).
- Backend stores Supabase secrets in environment variables. Rotate and scope keys.
- Database migrations are idempotent and backward compatible. Include down migrations or rollback notes.

CI Requirements

- CI must run: format, lint, type-check, tests for both workspaces. Block PRs on any failure.
- Prevent merges to default branch without passing checks.

Reviewer Checklist (High-confidence issues only)

- Explicitly cite the rule (file:line + rule name) or a concrete bug scenario.
- Provide a minimal patch or precise change description.
- Severity: Critical (91-100) for rule violations causing breakage/security; Important (80-90) for significant quality/maintainability gaps.

Ignore/Advisory Areas

- Generated artifacts (dist, build, .tsbuildinfo), vendored code, and SQL migrations: advisory unless a clear bug or security issue exists.

References

- FastAPI, Pydantic, pydantic-settings, pytest, Ruff/Black/isort
- React, TypeScript, ESLint, Prettier, Testing Library, Vitest/Jest
- Expo/React Native, Supabase
