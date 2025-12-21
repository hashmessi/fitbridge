# Issue Backlog

Prioritized list of tasks for contributors. Look for `🟢 Good First Issue` if you're new!

---

## Priority Levels

| Priority | Label | Response Time |
|----------|-------|---------------|
| **P0** | `critical` | Immediate |
| **P1** | `high` | This week |
| **P2** | `medium` | This sprint |
| **P3** | `low` | Backlog |

---

## 🟢 Good First Issues

Perfect for interns and new contributors. Clear scope, well-defined acceptance criteria.

### Documentation
| Task | Priority | Estimate |
|------|----------|----------|
| Add JSDoc comments to `apiClient.ts` functions | P3 | 1h |
| Document environment variables in README | P2 | 30min |
| Add inline comments to complex Dashboard logic | P3 | 1h |

### Testing
| Task | Priority | Estimate |
|------|----------|----------|
| Add tests for `WorkoutTab` component | P2 | 2h |
| Add tests for `DietTab` component | P2 | 2h |
| Add tests for `ProfileTab` component | P2 | 2h |
| Add tests for `supabaseClient.ts` functions | P2 | 3h |
| Increase backend test coverage to 70% | P2 | 4h |

### UI Polish
| Task | Priority | Estimate |
|------|----------|----------|
| Add loading skeletons to Dashboard cards | P3 | 1h |
| Improve empty state messages | P3 | 1h |
| Add toast notifications for actions | P2 | 2h |
| Fix mobile responsiveness on Profile page | P2 | 1h |

### Bug Fixes
| Task | Priority | Estimate |
|------|----------|----------|
| Fix streak reset logic edge case | P1 | 2h |
| Handle network errors gracefully in AI chat | P2 | 1h |
| Fix calorie calculation rounding | P3 | 30min |

---

## Feature Tasks

Larger scope, requires design discussion.

### P1 - High Priority
| Feature | Description | Complexity |
|---------|-------------|------------|
| Workout Templates | Pre-built workout plans users can select | Medium |
| Progress Photos | Upload and track body transformation | High |
| Export Data | Download workout/diet history as CSV | Low |
| Push Notifications | Daily reminders (requires mobile) | High |

### P2 - Medium Priority
| Feature | Description | Complexity |
|---------|-------------|------------|
| Social Sharing | Share achievements to social media | Medium |
| Workout Timer | Rest timer between sets | Low |
| Meal Suggestions | AI-powered meal recommendations | Medium |
| Weekly Reports | Email summary of progress | Medium |

### P3 - Low Priority
| Feature | Description | Complexity |
|---------|-------------|------------|
| Dark/Light Theme Toggle | User preference for theme | Low |
| Localization | Multi-language support | High |
| Apple Health Integration | Sync with HealthKit | High |
| Workout Music | Spotify/Apple Music integration | Medium |

---

## Backend Improvements

### P1 - High Priority
| Task | Description |
|------|-------------|
| Add rate limiting | Prevent API abuse |
| Implement JWT refresh | Proper token rotation |
| Add request validation | Pydantic schemas for all inputs |

### P2 - Medium Priority
| Task | Description |
|------|-------------|
| Add Redis caching | Cache AI responses |
| Implement webhooks | Notify on streak milestones |
| Add analytics endpoints | Aggregated user stats |

---

## How to Pick a Task

1. Look for `🟢 Good First Issue` tasks if you're new
2. Check priority - P1 tasks are most impactful
3. Consider your skills (frontend/backend/both)
4. Comment on the issue to claim it
5. Ask questions before starting

---

## Creating New Issues

Use the templates in `.github/ISSUE_TEMPLATE/`:
- `bug_report.md` for bugs
- `feature_request.md` for new features

Include:
- Clear title
- Steps to reproduce (bugs)
- Expected behavior
- Screenshots if applicable
