# Code Review and Auto-Fix Runbook

Purpose
- Provide a deterministic, repeatable checklist to detect uncommitted changes, review modified files, identify issues, auto-fix where safe, validate via tests/lint, and create a Conventional Commits-style commit.
- Optimized for Windows shell (cmd.exe) with cross-platform-friendly commands where possible.

Prerequisites
- Git installed and repository initialized.
- Project-specific tooling installed (package managers, linters, formatters, test runners, etc.).
- Run all commands from the repository root unless otherwise specified.

High-level Workflow
1) Detect changes
2) Review changes and identify issues
3) Auto-fix safe issues
4) Run formatting and linting
5) Run tests
6) Iterate until clean
7) Stage, craft commit message, and commit

Detailed Steps

1) Detect all uncommitted changes
- Show concise status:
  git --no-pager status -sb
- Show diff summary:
  git --no-pager diff --stat
- Show full unified diff (optional, noisy):
  git --no-pager diff

2) Enumerate changed files and classify
- List names only (modified/added/deleted):
  git --no-pager diff --name-status
- For staged vs unstaged separation:
  git --no-pager diff --name-status
  git --no-pager diff --cached --name-status

3) Review each changed file
- For each file, look for:
  - Syntax errors
  - Logical bugs
  - Security vulnerabilities (e.g., injection, insecure defaults, secrets in code, unsafe deserialization)
  - Performance issues (N+1, unnecessary allocations, blocking I/O on hot paths)
  - Code smells (duplicated code, long functions, deep nesting)
  - Best-practice violations (naming, layering, error handling, logging)
- Use targeted commands per stack:
  - JavaScript/TypeScript: npx eslint . && npx tsc --noEmit
  - Python: ruff check . && mypy .
  - Java: ./gradlew check or mvn -q -DskipTests=false verify
  - Go: golangci-lint run && go vet ./...
  - C#/.NET: dotnet build -warnaserror && dotnet format --verify-no-changes
  - Docker: hadolint Dockerfile
  - YAML: yamllint .
  - Markdown: markdownlint .
  - Secrets: git ls-files -z | xargs -0 detect-secrets-hook --baseline .secrets.baseline (or gitleaks detect)

4) Automatically fix issues where safe
- Prefer formatter/auto-fixers before manual refactors:
  - JS/TS: npx eslint . --fix; npx prettier . --write
  - Python: ruff check . --fix; ruff format . or black .; isort .
  - Go: go fmt ./...; golangci-lint run --fix
  - C#: dotnet format
  - JSON/YAML/Markdown: prettier/yamlfmt/markdownlint --fix as applicable
- For dependency vulnerabilities:
  - Node: npm audit fix (review major upgrades first)
  - Python: pip-audit; pip-tools upgrade pins cautiously

5) Refactor and improve code quality (manual where needed)
- Keep changes minimal and non-breaking; document any major refactor rationale in commit body.
- Apply SOLID and clean code:
  - Single Responsibility: break large, mixed-purpose modules
  - Open/Closed: prefer extensions/injections over conditionals
  - Liskov: respect subtype contracts
  - Interface Segregation: slim interfaces; avoid god-objects
  - Dependency Inversion: depend on abstractions, inject dependencies
- Remove dead code and unused imports; improve naming; reduce nesting via early returns; add tests for newly factored logic.

6) Run formatters and linters
- Ensure consistent formatting prior to tests:
  - JS/TS: npx prettier . --check
  - Python: ruff format . (or black --check .); ruff check .
  - Project-specific linters as configured.

7) Run test suite
- JS/TS (Jest/Vitest): npm test --silent
- Python (pytest): pytest -q
- .NET: dotnet test --nologo
- Java: ./gradlew test or mvn -q test
- Go: go test ./...
- Ensure deterministic, parallel-safe runs. If tests fail, fix code or tests; prefer fixing production code over weakening tests.

8) Re-run static checks for security and performance (as available)
- SAST: semgrep --config auto
- Dependency: npm audit / pip-audit / osv-scanner
- Container: trivy fs . or trivy image <image>

9) Prepare Conventional Commit message
- Format: <type>(<scope>): <short summary>
  - type examples: feat, fix, refactor, perf, test, docs, chore, build, ci
  - scope optional (e.g., api, ui, db, auth)
  - use imperative mood, <= 72 chars subject
- Include body with what/why, and any BREAKING CHANGE: notes if truly necessary.

10) Stage and commit
- Stage only validated changes:
  git add -A
- Preview staged diff:
  git --no-pager diff --cached --stat
- Commit with message (example):
  git commit -m "fix(auth): handle token refresh race and add tests" -m "Explain major refactors and rationale here."

11) Post-commit sanity
- Run tests again if the changes were large.
- Push only after green checks:
  git push

Guardrails
- Do NOT commit secrets or credentials.
- Avoid breaking public APIs; if unavoidable, document in BREAKING CHANGE: and update dependents/tests.
- Keep changes scoped to modified areas; do not reformat unrelated files unless the formatter is part of the CI baseline.
- Prefer smaller, incremental commits if many unrelated changes exist.

Template: Issue Summary and Fixes (for PR description or commit body)
- Summary of detected issues:
  - <bullet list>
- Fixes applied:
  - <bullet list>
- Verification:
  - Lint: <result>
  - Format: <result>
  - Tests: <result>
- Notes on refactors:
  - <explain major refactors and risk mitigation>

Output format when running this checklist manually
1. Summary of detected issues
2. List of fixes applied
3. Final commit message
4. Confirmation of successful commit
