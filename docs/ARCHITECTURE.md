# Feature Modules

Architecture breakdown for understanding the codebase.

---

## Frontend Modules

### 1. Dashboard (`components/Dashboard.tsx`)

**Purpose:** Home screen with user stats and quick actions.

**Features:**
- Streak display and management
- XP/Level progress
- Daily activity ring
- Quick navigation tiles

**State:**
| State | Source | Description |
|-------|--------|-------------|
| `streak` | localStorage + Supabase | Consecutive workout days |
| `xp` | localStorage + Supabase | Experience points |
| `todayCalories` | API | Calories consumed today |
| `todayWorkout` | API | Today's workout status |

**Key Functions:**
- `loadDashboardData()` - Fetch all dashboard data
- `checkAndUpdateStreak()` - Validate and update streak
- `recordActivity()` - Log XP-earning activity

---

### 2. WorkoutTab (`components/WorkoutTab.tsx`)

**Purpose:** AI workout generation and logging.

**Features:**
- Generate AI workout plans
- Display workout schedule
- Log completed workouts
- Exercise completion tracking

**API Calls:**
- `POST /api/ai/generate` (plan_type: workout)
- `POST /api/workout/log`
- `GET /api/workout/logs`

**User Flow:**
```
1. User enters workout preferences
2. Click "Generate Plan"
3. AI creates personalized workout
4. User marks exercises as complete
5. Workout logged to database
```

---

### 3. DietTab (`components/DietTab.tsx`)

**Purpose:** AI diet plans and meal tracking.

**Features:**
- Generate AI diet plans
- Log individual meals
- Track daily macros
- View meal history

**API Calls:**
- `POST /api/ai/generate` (plan_type: diet)
- `POST /api/diet/log`
- `GET /api/diet/logs/today`

---

### 4. ActivityTab (`components/ActivityTab.tsx`)

**Purpose:** View workout and meal history.

**Features:**
- Workout log history
- Meal log history
- Statistics and charts
- Delete logs

---

### 5. ChatTab (`components/ChatTab.tsx`)

**Purpose:** AI fitness coach conversation.

**Features:**
- Real-time chat with AI
- Streaming responses
- Suggested questions
- Context-aware responses

**API Calls:**
- `POST /api/chat/stream` (SSE)
- `GET /api/chat/suggestions`

---

### 6. ProfileTab (`components/ProfileTab.tsx`)

**Purpose:** User settings and account.

**Features:**
- Display user info
- Edit profile
- View achievements
- Sign out

---

## Backend Modules

### 1. AI Service (`backend/app/services/ai_service.py`)

**Purpose:** Generate AI content via OpenAI/DeepSeek.

**Methods:**
| Method | Description |
|--------|-------------|
| `generate_workout_plan()` | Create workout schedule |
| `generate_diet_plan()` | Create meal plan |
| `chat_response()` | Conversational AI |
| `is_ready()` | Check API key configured |

**Configuration:**
- `AI_PROVIDER`: openai or deepseek
- `OPENAI_API_KEY`: API key
- `OPENAI_MODEL`: Model name

---

### 2. Supabase Service (`backend/app/services/supabase_service.py`)

**Purpose:** Database operations via Supabase.

**Workout Methods:**
- `create_workout_log()`
- `get_workout_logs()`
- `delete_workout_log()`
- `get_workout_stats()`

**Diet Methods:**
- `create_diet_log()`
- `get_diet_logs()`
- `delete_diet_log()`
- `get_diet_stats()`

**User Methods:**
- `update_daily_log()`
- `get_user_streaks()`

---

### 3. Routers

| Router | Prefix | Purpose |
|--------|--------|---------|
| `health.py` | `/` | Health checks |
| `ai.py` | `/api/ai` | AI generation |
| `workout.py` | `/api/workout` | Workout CRUD |
| `diet.py` | `/api/diet` | Diet CRUD |
| `chat.py` | `/api/chat` | Chat AI |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User Action                                                 │
│  (e.g., "Generate Workout")                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend Component                                          │
│  - Collect user input                                        │
│  - Call apiClient function                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  apiClient.ts                                                │
│  - Add auth headers                                          │
│  - Make HTTP request                                         │
│  - Handle response/errors                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  FastAPI Backend                                             │
│  - Validate request                                          │
│  - Call service layer                                        │
│  - Return response                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Services                                                    │
│  - AI Service (OpenAI/DeepSeek)                             │
│  - Supabase Service (Database)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Adding a New Feature

### Frontend
1. Create component in `components/`
2. Add API call in `services/apiClient.ts`
3. Add route/tab in `App.tsx`
4. Add tests in `tests/components/`

### Backend
1. Create router in `backend/app/routers/`
2. Add service methods if needed
3. Register router in `main.py`
4. Add tests in `backend/tests/`
