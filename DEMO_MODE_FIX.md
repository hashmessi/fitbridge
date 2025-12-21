# FitBridge Demo Mode - Final Fix

## The Problem
Demo mode uses UUID `00000000-0000-0000-0000-000000000001` but this user doesn't exist in Supabase's `auth.users` table, causing foreign key constraint violations.

## Solution: Use Real Authentication Instead

Instead of trying to bypass Supabase's security, let's create a proper demo account:

### Option 1: Sign Up a Real Demo Account (Recommended)

1. Go to http://localhost:3000
2. Click **"Sign Up"**
3. Use these credentials:
   - Email: `demo@fitbridge.app`
   - Password: `Demo123!`
   - Name: `Demo User`
4. Check your email and confirm (or check Supabase Dashboard → Authentication → Users to manually confirm)
5. Sign in with those credentials

This will:
- ✅ Create proper `auth.users` entry
- ✅ Trigger `handle_new_user()` function
- ✅ Auto-create `users` table entry
- ✅ Auto-initialize `streaks` table
- ✅ Everything works perfectly!

### Option 2: Disable RLS for Testing (Quick but Insecure)

If you just want to test quickly without proper auth:

```sql
-- Run in Supabase SQL Editor
-- WARNING: This disables security! Only for local testing!

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs DISABLE ROW LEVEL SECURITY;

-- Now you can insert demo data directly
INSERT INTO users (id, email, name, fitness_level, goal)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@fitbridge.app',
  'Demo User',
  'Intermediate',
  'Muscle Gain'
);

INSERT INTO streaks (user_id, streak_type, current_streak, longest_streak, xp_earned, level, level_title, last_activity_date)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'workout', 0, 0, 0, 1, 'Beginner', CURRENT_DATE),
  ('00000000-0000-0000-0000-000000000001', 'diet', 0, 0, 0, 1, 'Beginner', CURRENT_DATE);

-- Re-enable RLS after testing
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs ENABLE ROW LEVEL SECURITY;
```

### Option 3: Modify Demo Mode to Use LocalStorage Only

Update the code to skip Supabase entirely in demo mode and use only localStorage.

---

## Recommendation

**Use Option 1** - Create a real demo account. It's the cleanest solution and tests the actual auth flow.

The dashboard will then work perfectly because:
1. User exists in `auth.users` ✅
2. Profile auto-created in `users` table ✅
3. Streaks auto-initialized ✅
4. All foreign keys satisfied ✅
