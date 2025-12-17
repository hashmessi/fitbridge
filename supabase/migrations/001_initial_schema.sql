-- FitBridge Database Schema
-- Migration: 001_initial_schema
-- Description: Core tables for fitness tracking application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Stores user profile and fitness goals
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    weight DECIMAL(5,2), -- in kg
    height DECIMAL(5,2), -- in cm
    goal TEXT CHECK (goal IN ('Muscle Gain', 'Fat Loss', 'Maintenance', 'Endurance', 'Flexibility')),
    fitness_level TEXT CHECK (fitness_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY LOGS TABLE
-- Tracks daily summary: calories, steps, workout status
-- ============================================
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    calories_consumed INTEGER DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    steps INTEGER DEFAULT 0,
    water_intake INTEGER DEFAULT 0, -- in ml
    sleep_hours DECIMAL(3,1),
    workout_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ============================================
-- WORKOUT LOGS TABLE
-- Individual workout sessions with details
-- ============================================
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    title TEXT NOT NULL,
    workout_type TEXT, -- e.g., 'Strength', 'Cardio', 'HIIT', 'Yoga'
    duration_minutes INTEGER NOT NULL,
    calories_burned INTEGER,
    exercises JSONB, -- Array of exercises with sets/reps
    notes TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_plan_id UUID REFERENCES ai_plans(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DIET LOGS TABLE
-- Individual meals and calorie intake
-- ============================================
CREATE TABLE IF NOT EXISTS diet_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')) NOT NULL,
    meal_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(5,1) DEFAULT 0, -- in grams
    carbs DECIMAL(5,1) DEFAULT 0,
    fats DECIMAL(5,1) DEFAULT 0,
    description TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_plan_id UUID REFERENCES ai_plans(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEEKLY SUMMARY TABLE
-- Precomputed analytics for fast dashboard loading
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL, -- Monday of the week
    week_end DATE NOT NULL,   -- Sunday of the week
    total_workouts INTEGER DEFAULT 0,
    total_workout_minutes INTEGER DEFAULT 0,
    total_calories_consumed INTEGER DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    avg_sleep_hours DECIMAL(3,1),
    avg_weight DECIMAL(5,2),
    workout_streak INTEGER DEFAULT 0,
    goals_met JSONB, -- Track which goals were achieved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- ============================================
-- STREAKS TABLE
-- Gamification: consistency tracking
-- ============================================
CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    streak_type TEXT CHECK (streak_type IN ('workout', 'diet', 'login', 'steps')) NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    xp_earned INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    level_title TEXT DEFAULT 'Beginner',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- ============================================
-- AI PLANS TABLE
-- AI-generated workout and diet plans
-- ============================================
CREATE TABLE IF NOT EXISTS ai_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type TEXT CHECK (plan_type IN ('workout', 'diet')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    plan_data JSONB NOT NULL, -- Full plan structure
    duration_weeks INTEGER,
    difficulty TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    generated_by TEXT DEFAULT 'openai', -- 'openai', 'deepseek', etc.
    prompt_used TEXT, -- Store the user's original request
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ============================================
-- WEIGHT HISTORY TABLE
-- Track weight changes over time
-- ============================================
CREATE TABLE IF NOT EXISTS weight_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, workout_date DESC);
CREATE INDEX idx_diet_logs_user_date ON diet_logs(user_id, log_date DESC);
CREATE INDEX idx_weekly_summary_user_week ON weekly_summary(user_id, week_start DESC);
CREATE INDEX idx_ai_plans_user_type ON ai_plans(user_id, plan_type, is_active);
CREATE INDEX idx_weight_history_user ON weight_history(user_id, recorded_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Daily logs policies
CREATE POLICY "Users can view own daily logs" ON daily_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs" ON daily_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs" ON daily_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily logs" ON daily_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Workout logs policies
CREATE POLICY "Users can view own workout logs" ON workout_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" ON workout_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON workout_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs" ON workout_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Diet logs policies
CREATE POLICY "Users can view own diet logs" ON diet_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet logs" ON diet_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet logs" ON diet_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet logs" ON diet_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Weekly summary policies
CREATE POLICY "Users can view own weekly summary" ON weekly_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weekly summary" ON weekly_summary
    FOR ALL USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks" ON streaks
    FOR ALL USING (auth.uid() = user_id);

-- AI plans policies
CREATE POLICY "Users can view own AI plans" ON ai_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI plans" ON ai_plans
    FOR ALL USING (auth.uid() = user_id);

-- Weight history policies
CREATE POLICY "Users can view own weight history" ON weight_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weight history" ON weight_history
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at
    BEFORE UPDATE ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_summary_updated_at
    BEFORE UPDATE ON weekly_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
    BEFORE UPDATE ON streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- Initialize streaks for new user
    INSERT INTO streaks (user_id, streak_type) VALUES
        (NEW.id, 'workout'),
        (NEW.id, 'diet'),
        (NEW.id, 'login'),
        (NEW.id, 'steps');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
