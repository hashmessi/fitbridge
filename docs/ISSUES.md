# GitHub Issues - Ready to Create

Copy-paste these issues into GitHub. Each has labels, description, and acceptance criteria.

---

## 🟢 Good First Issues (Interns Start Here)

---

### Issue #1: Add Loading Skeletons to Dashboard

**Labels:** `good first issue`, `frontend`, `priority: low`

**Description:**
Add skeleton loading states to Dashboard cards while data is being fetched.

**User Story:**
As a user, I want to see loading indicators while the dashboard loads, so I know the app is working.

**Acceptance Criteria:**
- [ ] Streak card shows skeleton while loading
- [ ] XP card shows skeleton while loading
- [ ] Activity ring shows skeleton while loading
- [ ] Skeletons animate with pulse effect

**Files to Modify:**
- `components/Dashboard.tsx`

**Resources:**
- [React Skeleton Pattern](https://www.freecodecamp.org/news/how-to-build-skeleton-screens-with-react/)

**Estimate:** 2 hours

---

### Issue #2: Add Tests for WorkoutTab Component

**Labels:** `good first issue`, `testing`, `priority: medium`

**Description:**
Write unit tests for the WorkoutTab component using Vitest and React Testing Library.

**User Story:**
As a developer, I want tests for WorkoutTab, so I can safely refactor without breaking functionality.

**Acceptance Criteria:**
- [ ] Test renders without crashing
- [ ] Test displays workout plan when generated
- [ ] Test handles empty state
- [ ] Test form submission
- [ ] All tests pass (`npm run test:run`)

**Files to Create:**
- `tests/components/WorkoutTab.test.tsx`

**Example Test:**
```typescript
import { render, screen } from '@testing-library/react';
import { WorkoutTab } from '../../components/WorkoutTab';

describe('WorkoutTab', () => {
  it('should render generate button', () => {
    render(<WorkoutTab user={mockUser} />);
    expect(screen.getByText(/generate/i)).toBeInTheDocument();
  });
});
```

**Estimate:** 3 hours

---

### Issue #3: Add Tests for DietTab Component

**Labels:** `good first issue`, `testing`, `priority: medium`

**Description:**
Write unit tests for the DietTab component.

**Acceptance Criteria:**
- [ ] Test renders without crashing
- [ ] Test displays meal plan when generated
- [ ] Test meal logging form
- [ ] Test calorie calculations
- [ ] All tests pass

**Files to Create:**
- `tests/components/DietTab.test.tsx`

**Estimate:** 3 hours

---

### Issue #4: Add JSDoc Comments to apiClient.ts

**Labels:** `good first issue`, `documentation`, `priority: low`

**Description:**
Add JSDoc comments to all exported functions in apiClient.ts.

**User Story:**
As a developer, I want inline documentation so I understand function parameters and return types.

**Acceptance Criteria:**
- [ ] All exported functions have JSDoc with description
- [ ] Parameters documented with @param
- [ ] Return type documented with @returns
- [ ] Examples included where helpful

**Example:**
```typescript
/**
 * Log a workout session to the backend.
 * @param workout - Workout data to log
 * @returns Promise with success status and created workout
 * @example
 * await logWorkout({ title: "Chest Day", duration_minutes: 45 });
 */
export async function logWorkout(workout: WorkoutInput) { ... }
```

**Files to Modify:**
- `services/apiClient.ts`

**Estimate:** 1 hour

---

### Issue #5: Improve Empty State Messages

**Labels:** `good first issue`, `frontend`, `ux`, `priority: low`

**Description:**
Add friendly empty state messages when there's no data to display.

**Acceptance Criteria:**
- [ ] Dashboard shows "Start your first workout!" when no workouts
- [ ] WorkoutTab shows helpful message when no plan generated
- [ ] DietTab shows "Log your first meal!" when empty
- [ ] Messages include action button/link

**Files to Modify:**
- `components/Dashboard.tsx`
- `components/WorkoutTab.tsx`
- `components/DietTab.tsx`

**Estimate:** 2 hours

---

### Issue #6: Fix Streak Calculation Edge Case

**Labels:** `good first issue`, `bug`, `priority: high`

**Description:**
Streak resets incorrectly when user logs workout at midnight.

**Steps to Reproduce:**
1. Log workout at 11:59 PM
2. Log another at 12:01 AM (next day)
3. Streak shows 1 instead of 2

**Expected:** Streak should be 2

**Files to Modify:**
- `components/Dashboard.tsx` (checkAndUpdateStreak function)

**Estimate:** 2 hours

---

### Issue #7: Add Toast Notifications

**Labels:** `good first issue`, `frontend`, `ux`, `priority: medium`

**Description:**
Show toast notifications when user completes actions.

**Acceptance Criteria:**
- [ ] "Workout logged!" after logging workout
- [ ] "Meal saved!" after logging meal
- [ ] "Error: ..." on API failure
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Toast appears at top-right

**Implementation Options:**
- Create simple Toast component
- Use react-hot-toast library

**Estimate:** 3 hours

---

## 🔵 Feature Issues

---

### Issue #8: Workout Templates

**Labels:** `feature`, `frontend`, `backend`, `priority: high`

**Description:**
Add pre-built workout templates users can select instead of generating from AI.

**User Story:**
As a user, I want to pick from workout templates, so I can start quickly without waiting for AI.

**Acceptance Criteria:**
- [ ] List of 5+ templates (Push/Pull/Legs, Full Body, etc.)
- [ ] Template preview before selecting
- [ ] One-click start workout from template
- [ ] Templates stored in database

**Technical Approach:**
1. Create `workout_templates` table in Supabase
2. Add `GET /api/workout/templates` endpoint
3. Add template selection UI in WorkoutTab

**Estimate:** 8 hours

---

### Issue #9: Export Workout History

**Labels:** `feature`, `backend`, `priority: medium`

**Description:**
Allow users to download their workout history as CSV.

**Acceptance Criteria:**
- [ ] "Export" button on Activity tab
- [ ] Downloads CSV with all workout logs
- [ ] Columns: date, title, duration, calories, exercises
- [ ] Works on mobile browser

**Technical Approach:**
1. Add `GET /api/workout/export` endpoint
2. Return CSV file with proper headers
3. Add download button in frontend

**Estimate:** 4 hours

---

### Issue #10: Rest Timer Between Sets

**Labels:** `feature`, `frontend`, `priority: medium`

**Description:**
Add a countdown timer for rest periods between exercise sets.

**User Story:**
As a user, I want a rest timer, so I know when to start my next set.

**Acceptance Criteria:**
- [ ] Timer button on each exercise
- [ ] Default 60/90/120 second options
- [ ] Countdown display
- [ ] Audio/vibration alert when done
- [ ] Timer continues in background

**Estimate:** 6 hours

---

## 🔴 Backend Issues

---

### Issue #11: Add Rate Limiting

**Labels:** `backend`, `security`, `priority: high`

**Description:**
Implement rate limiting to prevent API abuse.

**Acceptance Criteria:**
- [ ] 100 requests/minute per user for regular endpoints
- [ ] 10 requests/minute for AI generation
- [ ] Return 429 Too Many Requests when exceeded
- [ ] Headers show remaining requests

**Technical Approach:**
- Use `slowapi` or `fastapi-limiter` library
- Store counts in Redis or memory

**Estimate:** 4 hours

---

### Issue #12: Add Request Validation

**Labels:** `backend`, `priority: high`

**Description:**
Add comprehensive Pydantic validation for all request bodies.

**Acceptance Criteria:**
- [ ] All endpoints validate input
- [ ] Meaningful error messages
- [ ] Document validation rules in API docs

**Estimate:** 4 hours

---

## Labels Reference

Create these labels in GitHub:

| Label | Color | Description |
|-------|-------|-------------|
| `good first issue` | `#7057ff` | Good for newcomers |
| `priority: critical` | `#d73a4a` | Needs immediate attention |
| `priority: high` | `#ff6b6b` | Important |
| `priority: medium` | `#ffa500` | Standard priority |
| `priority: low` | `#0e8a16` | Nice to have |
| `frontend` | `#1d76db` | Frontend work |
| `backend` | `#5319e7` | Backend work |
| `testing` | `#bfd4f2` | Test-related |
| `documentation` | `#0075ca` | Documentation |
| `bug` | `#d73a4a` | Something broken |
| `feature` | `#a2eeef` | New functionality |
| `ux` | `#d4c5f9` | User experience |
| `security` | `#ee0701` | Security-related |
