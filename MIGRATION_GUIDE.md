# 🚀 FitBridge Database Migration Guide

## Quick Steps

### 1. Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your FitBridge project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query**

### 2. Copy the Migration SQL
The file is already open in your editor: `supabase/migrations/001_initial_schema.sql`

**Select All (Ctrl+A)** → **Copy (Ctrl+C)**

### 3. Run in Supabase
1. Paste the SQL into the Supabase SQL Editor
2. Click **Run** (or press Ctrl+Enter)
3. Wait for "Success. No rows returned" message

### 4. Verify Tables Created
In Supabase Dashboard:
- Go to **Table Editor**
- You should see these tables:
  - ✅ `users`
  - ✅ `streaks`
  - ✅ `workout_logs`
  - ✅ `diet_logs`
  - ✅ `daily_logs`
  - ✅ `ai_plans`
  - ✅ `weight_history`

### 5. Refresh Your App
Go back to http://localhost:3000 and refresh the page. The dashboard should now load data!

---

## What This Migration Creates

| Table | Purpose |
|-------|---------|
| `users` | User profiles with fitness goals |
| `streaks` | Tracks workout/diet streaks & XP |
| `workout_logs` | Completed workout history |
| `diet_logs` | Meal logging with macros |
| `daily_logs` | Daily summary stats |
| `ai_plans` | AI-generated workout/diet plans |
| `weight_history` | Weight tracking over time |

---

## Troubleshooting

**If you get an error:**
- Make sure you're in the correct Supabase project
- Check that no tables already exist (drop them first if needed)
- Ensure you copied the entire SQL file

**After migration:**
- Dashboard will show real streaks/XP
- Workouts will save to database
- Meals will persist across sessions
