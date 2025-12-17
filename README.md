# FitBridge 🏋️

A mobile-first fitness application with AI-powered workout and diet plans, progress tracking, and gamification.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FITBRIDGE                                 │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/React Native)                                   │
│  ├── Dashboard, Workout, Diet, Activity, Chat, Profile          │
│  ├── Supabase Client (Auth + Real-time)                         │
│  └── API Client (→ Python Backend)                              │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Cloud                                                  │
│  ├── PostgreSQL Database                                        │
│  ├── Authentication (Email/OAuth)                               │
│  ├── Row Level Security (RLS)                                   │
│  └── Edge Functions (optional)                                   │
├─────────────────────────────────────────────────────────────────┤
│  Python FastAPI Backend                                          │
│  ├── AI Service (OpenAI/DeepSeek)                               │
│  ├── Workout & Diet Generation                                  │
│  ├── Chat Streaming                                             │
│  └── Progress Analysis                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
fitbridge/
├── components/           # React UI components
│   ├── Dashboard.tsx
│   ├── WorkoutTab.tsx
│   ├── DietTab.tsx
│   ├── ActivityTab.tsx
│   ├── ChatTab.tsx
│   ├── ProfileTab.tsx
│   └── Navigation.tsx
├── services/             # Frontend services
│   ├── geminiService.ts  # Original Gemini AI (fallback)
│   ├── apiClient.ts      # Python backend API client
│   └── supabaseClient.ts # Supabase auth & database
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── main.py       # FastAPI application
│   │   ├── config.py     # Environment configuration
│   │   ├── routers/      # API endpoints
│   │   │   ├── health.py
│   │   │   ├── ai.py
│   │   │   ├── workout.py
│   │   │   ├── diet.py
│   │   │   └── chat.py
│   │   └── services/     # Business logic
│   │       ├── ai_service.py
│   │       └── supabase_service.py
│   ├── requirements.txt
│   └── .env.example
├── supabase/             # Database migrations
│   └── migrations/
│       └── 001_initial_schema.sql
├── App.tsx               # Main React component
├── types.ts              # TypeScript definitions
└── package.json
```

## 🚀 Quick Start

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL
3. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (for backend only)

### 2. Configure Frontend

```bash
# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Configure Python Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
AI_PROVIDER=openai

# Start the server
cd app
uvicorn main:app --reload --port 8000
```

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User profiles and goals |
| `daily_logs` | Daily calories, steps, workout status |
| `workout_logs` | Individual workout sessions |
| `diet_logs` | Meals and calorie intake |
| `weekly_summary` | Precomputed analytics |
| `streaks` | Gamification & consistency |
| `ai_plans` | AI-generated plans |
| `weight_history` | Weight tracking over time |

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **API Keys Server-side**: AI provider keys stored only in Python backend
- **Authenticated Requests**: All API calls require valid user tokens

## 🤖 AI Providers

The app supports multiple AI providers:

| Provider | Best For | Cost |
|----------|----------|------|
| OpenAI (GPT-4o) | Best quality | Higher |
| DeepSeek | Cost-effective | Lower |

Configure in `backend/.env`:
```env
AI_PROVIDER=openai  # or 'deepseek'
```

## 📱 Future: React Native Migration

The current web app is designed for easy migration to React Native:

1. Component structure is already mobile-first
2. Services layer abstracts all data access
3. Styling uses patterns compatible with NativeWind

## 🛠️ API Endpoints

### Health
- `GET /health` - API status check
- `GET /ping` - Quick ping

### AI Generation
- `POST /api/ai/generate` - Generate workout or diet plan
- `GET /api/ai/status` - AI service status

### Workouts
- `POST /api/workout/log` - Log a workout
- `GET /api/workout/logs` - Get workout history
- `GET /api/workout/stats` - Get workout statistics
- `DELETE /api/workout/logs/:id` - Delete a workout

### Diet
- `POST /api/diet/log` - Log a meal
- `GET /api/diet/logs` - Get meal history
- `GET /api/diet/logs/today` - Today's meals with totals
- `GET /api/diet/stats` - Nutrition statistics

### Chat
- `POST /api/chat/send` - Send message to AI coach
- `POST /api/chat/stream` - Stream AI response (SSE)
- `GET /api/chat/suggestions` - Get suggested questions

## 📄 License

MIT License - See LICENSE file for details.
