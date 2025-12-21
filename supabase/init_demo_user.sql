-- Initialize Demo User Streaks in Supabase
-- Run this SQL in Supabase SQL Editor
-- Note: We skip the users table because it requires auth.users entry

-- Initialize streaks for demo user (this will work even without users table entry)
INSERT INTO streaks (user_id, streak_type, current_streak, longest_streak, xp_earned, level, level_title, last_activity_date)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'workout', 0, 0, 0, 1, 'Beginner', CURRENT_DATE),
  ('00000000-0000-0000-0000-000000000001', 'diet', 0, 0, 0, 1, 'Beginner', CURRENT_DATE),
  ('00000000-0000-0000-0000-000000000001', 'login', 0, 0, 0, 1, 'Beginner', CURRENT_DATE),
  ('00000000-0000-0000-0000-000000000001', 'steps', 0, 0, 0, 1, 'Beginner', CURRENT_DATE)
ON CONFLICT (user_id, streak_type) 
DO UPDATE SET
  last_activity_date = CURRENT_DATE;

-- Verify the data
SELECT * FROM streaks WHERE user_id = '00000000-0000-0000-0000-000000000001';
