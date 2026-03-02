# FitBridge — UI/UX Audit, Enhancements & Antigravity Agent Prompt

> **Goal:** Provide a compact, actionable UI/UX analysis + suggested visual + interaction polish for FitBridge mobile/web. The file includes (A) current-state observations, (B) non‑breaking enhancement recommendations targeted at mobile (minimal iOS style), (C) integration & API preservation rules, (D) developer handoff / QA checklist, and (E) a single copy‑paste prompt for the Antigravity agent to execute the work without breaking backend integrations.

---

## 1. Project summary (one-liner)

FitBridge is an AI‑powered fitness app that delivers personalized workout and diet plans based on user profile and activity. The v2 UI/UX objective is to make the app visually consistent, mobile‑responsive, accessible, and iOS‑minimal in style while preserving all current API contracts and backend behavior.

---

## 2. Primary goals for this UI/UX pass

- Fix layout inconsistencies and truncation on small/mobile screens.
- Improve perceived performance (streaming & progressive reveals).
- Standardize visual system (typography, spacing, tokens) to a minimal iOS look.
- Preserve all backend API contracts (no schema changes) and maintain runtime behavior.
- Increase usability and accessibility (touch targets, contrast, readable fonts).

---

## 3. Observations from current screens (live demo)

**Visual / Layout**

- Top-level dashboard shows `Daily Load` ring + small cards (Workout / Calories / Steps). Some card content truncates (long workout title) and text density is high.
- Buttons on dashboard (AI Coach, Gen Workout, Add Meal) are small compared to recommended touch targets.
- Bottom navigation sits very close to the OS gesture area; on some phones it overlaps or feels tight.
- AI Workout screen: goal chips, duration slider, difficulty toggles look fine but spacing between sections is inconsistent on narrow screens.
- Activity screen charts have cramped labels and the consistency graph uses very small X-axis labels.

**Interaction / Behaviour**

- Single “Designing Plan...” modal/spinner — user has no partial feedback while plan is generated.
- No visible "why" or edit affordance in generated plan card—hard to inspect or modify suggestions.

**Accessibility / Usability**

- Contrast for muted labels (e.g., small light gray on dark background) is borderline for smaller text.
- Icons and chips are visually small — some are under 44–48px touch recommendation.
- Missing semantics for key actions (e.g., `Gen Workout` button should have aria-label / accessibilityLabel).

**Consistency Bugs**

- Some cards use soft rounded corners and deep shadows; others are flatter; inconsistent radius values.
- Inconsistent font weights and sizes across headings and card labels.

---

## 4. Non‑breaking UI/UX enhancement plan (prioritized)

> The following changes must **not** change API endpoints, request/response JSON, or server side validation. Changes are strictly front-end and integration-safe unless explicitly flagged.

### Immediate fixes (hotfixes — 48–72 hours)

1. **Safe‑area & bottom nav padding**
   - Add CSS / RN safe area wrappers using `env(safe-area-inset-bottom)` or `SafeAreaView`.
   - Increase bottom nav height + vertical padding so nav items are >56px tall and above the gesture bar.

2. **Touch target sizing**
   - Ensure primary CTA buttons are >=48×48 dp. Increase `AI Coach`, `Gen Workout`, `Add Meal` size and padding.

3. **Line‑wrap & truncation rules**
   - For workout title cards: allow 2-line wrap with ellipsis at end; increase card width or use adaptive font scaling using `clamp()`.

4. **Fix card spacing & consistent radius**
   - Standardize card corner radius to `12px` (mobile) and `16px` (tablet). Use a single token: `--radius-card`.

### Short term (1–3 weeks)

1. **Design tokens & style system**
   - Create tokens: color (primary, accent, bg, card), spacing (xs-xxl), typography scale, radius, elevation. Use them across components.

2. **Partial streaming UI for plan generation**
   - Implement SSE/WebSocket or optimistic UI to stream plan sections (warm‑up, main set, cool down) as they become ready.
   - Show skeleton cards for sections not ready.

3. **Plan item affordances**
   - Each exercise row should have: name, sets/reps, duration, equipment icon, `Why?` button (show LLM rationale), `Swap` button (replace exercise), and `Mark done` quick action.

4. **Form & control polish**
   - Replace slider numeric inconsistency with a `Duration` pill + accessible stepper (increment/decrement) and visually large thumb.

5. **Charts & microcopy**
   - Increase chart axis font sizes, simplify X axis labels to weekly ticks, add alt text for charts for screen readers.

### Mid-term (1–3 months)

1. **iOS minimal theme option**
   - SF Pro text sizes, translucent tab bar with blur, large titles on top of screens (iOS style), haptic feedback for main actions.

2. **Design system component library**
   - Implement a small library (React Native + web) of Button, Card, Chip, Modal, Skeleton, Chart wrapper, Icon set, segmented control.

3. **Responsive layout rules**
   - Use fluid typography (`clamp()`), breakpoints: mobile <420px, small tablet 420–768px, tablet >768px.

4. **A/B experiments**
   - Roll out streaming vs single generation in progressive rollout; measure plan acceptance and time-to-first-interaction.

---

## 5. Technical implementation notes (front-end)

**Stack assumptions**

- Frontend: React + React Native Web or React Native (Expo / bare), styled-components / Tailwind-like or CSS Modules.
- State: Redux / Zustand / React Query for server state.

**Component & CSS guidance**

- Use CSS variables for tokens and export to RN via a small token converter.
- Use `SafeAreaView` on iOS/Android, prefers `env(safe-area-inset-*)` on web mobile.
- Use `pointer` hit slop for small icons (add `hitSlop` in RN or `padding` in web).

**Progressive enhancement for plan generation**

- Keep existing API call `/plan/workout` contract intact; backend returns structured `plan_json`. Add support for `plan_section` stream in inference adapter only: if server supports SSE, render streamed `plan_section` items (but **do not** change the payload schema for existing endpoints). Use feature flag `plan_streaming_enabled`.

**Versioning & feature flags**

- Add front-end config toggle `FEATURE_PLAN_STREAMING` and `FEATURE_IOS_THEME`. Default false. This prevents breaking users when backend doesn't support streaming.

---

## 6. API integration & contract preservation (non‑breaking rules)

**Preserve all existing endpoints**. Example contract list (do not change):

- `POST /auth/signup` — {email, password, ...}
- `POST /auth/login`
- `GET /profile/{user_id}`
- `POST /plan/workout` — request includes user_id + constraints; response returns `{ plan_id, plan_json, estimated_duration }`.
- `POST /activity/log` — logs completion and triggers adaptive recalculation.
- `POST /inference/generate` — internal inference; only Inference Service should call external LLMs.
- `POST /analytics/event` — track events

**Frontend safety patterns**

- Do not change request shapes. If new fields are needed from UI (e.g., `ui_theme_preference`) send them as optional metadata under `metadata` object so backend ignores unknown fields.
- All changes must be backward compatible. If new UI relies on backend flags, default behavior should work without them.

---

## 7. Developer handoff & QA checklist (pre‑merge)

**Pre‑merge checklist**

- [ ] Storybook components or visual snapshot tests for changed components
- [ ] Visual regression tests (Chromatic or Percy) for home/workout/activity screens
- [ ] Accessibility audit: Axe or Lighthouse checks passed (>90)
- [ ] Unit tests for layout helpers (safe-area, clamp) and touch targets
- [ ] E2E smoke test for plan generation happy path + streaming fallback

**Release & rollback plan**

- Feature flag streaming and iOS theme. Gradually enable for 1% -> 10% -> 50% of users.
- Monitor `plan_acceptance_rate`, `plan_generation_latency`, `llm_cost_per_plan`.
- If plan_acceptance_rate drops by >10% in 24 hours, roll back flag.

---

## 8. Suggested visual tokens (starter)

```css
:root {
  --color-bg: #0b0b0d; /* deep black */
  --color-card: #0f1113; /* card dark */
  --color-primary: #a9ff76; /* lime accent */
  --color-accent: #6be8ff; /* complementary */
  --color-muted: #a3a3a6; /* labels */
  --radius-card: 12px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --font-family: 'SF Pro Text', system-ui, -apple-system, 'Segoe UI', Roboto;
}
```

**Typography scale (mobile)**

- Title Large: 28px (700)
- Heading: 18–20px (600)
- Body: 14–16px (400)
- Small: 12px (400)

---

## 9. Acceptance criteria (what "done" looks like)

- All UI screens render without truncation on iPhone 12 / Pixel 4 / Samsung S series in portrait.
- Primary CTAs are >=48×48 touch area.
- Bottom nav no longer overlaps OS gesture area; uses safe area inset.
- Plan generation supports progressive reveal; skeletons show while sections load.
- No visual regression in desktop web flows.
- No changes to server‑side API contract required for rollout.

---

## 10. Single copy/paste prompt for the Antigravity agent

> **Usage:** Copy the entire block below and paste it as a single prompt to your Antigravity agent. It is self-contained and designed to run autonomously. It instructs the agent to produce a PR with UI fixes, component tokens, responsive rules, and a non‑breaking integration strategy. The agent should produce code changes, a Storybook preview, and a short QA report.

```
Antigravity, convert the FitBridge front-end into a polished, mobile‑responsive, minimal iOS‑styled UI without changing any backend contracts.

Scope:
- Source location: repo root contains `frontend/` (React + React Native Web). If different, detect and adapt.
- Do only front-end changes and test harness; do not alter server API endpoints or request/response shapes.

Deliverables:
1) A PR branch `ui/polish/v2` with all code changes.
2) Design tokens file (`src/design/tokens.css` or equivalent JS export) implementing provided tokens.
3) Component updates: Card, Button, Chip, NavBar, Slider, Skeleton, Chart wrapper with responsive rules and safe-area support. Ensure touch targets >=48px.
4) Streaming UI: implement optional progressive plan reveal using feature flag `FEATURE_PLAN_STREAMING` and skeleton placeholders; fall back to existing single-response flow.
5) Accessibility: add aria labels/accessibilityLabel to primary interactive elements; ensure contrast ratios meet AA for body text.
6) Storybook stories for Home, AI Workout, Activity screens with visual snapshots.
7) Unit & E2E: add visual regression snapshots and one Playwright/Cypress smoke test for plan generation happy path.
8) A short QA report (`qa/UI_POLISH_REPORT.md`) that lists manual test steps for iPhone 12 / Pixel 4 and a roll‑out checklist.

Constraints & Rules:
- Do not change network request endpoints or JSON properties. If new metadata is required, attach under optional `metadata` key.
- Use feature flags for streaming and iOS theme: default them to OFF. Add environment toggles and a runtime config provider.
- Maintain current Redux/React Query caches; do not break existing cache keys.
- Keep bundle size minimal; prefer CSS variables and component-level lazy imports.

Design specifics:
- Use SF Pro Text or system UI stack; implement `clamp()` typography for fluid scaling.
- Bottom nav: translucent blurred iOS style with safe area padding, center-aligned icons, a minimum hit target of 56×56px.
- Cards: radius `12px`, subtle elevation, consistent padding tokens.
- Colors: use provided token palette; ensure dark theme readable contrast.

Testing & Validation:
- Run Storybook and produce 3 PNG snapshots (Home, AI Workout, Activity).
- Run linter, unit tests, and E2E smoke test.
- Provide a short changelog in PR explaining all UX changes and where to toggle flags.

Metrics to watch post-release (report in QA): plan_acceptance_rate, plan_generation_latency, llm_cost_per_plan, and plan_reroll_rate.

If any backend change is necessary for streaming (SSE/section streaming), create a separate RFC issue and do not implement server changes in this PR.

Return format: Provide a single PR URL or a patch bundle with a README that describes how to run Storybook and tests locally. Include a QA report and an annotated screenshot diff showing before/after for the three main screens.
```

---

## 11. Next steps (recommended)

1. Run the Antigravity prompt above on a feature branch.
2. Review PR, run Storybook and QA checks locally.
3. Toggle streaming feature flag in a small internal test group.
4. Monitor metrics for 48–72 hours, then progressive rollout.

---

\*End of MD file
