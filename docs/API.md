# API Documentation

Complete API contracts with request/response examples for interns.

---

## Base URL

```
Development: http://localhost:8000
Production: https://api.fitbridge.app
```

## Authentication

All authenticated endpoints require the `Authorization` header:

```
Authorization: Bearer <user_token>
```

---

## Health Check

### GET /health

Check API status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-21T10:00:00Z",
  "ai_provider": "openai",
  "supabase_connected": true
}
```

### GET /ping

Quick connectivity check.

**Response:**
```json
{ "pong": true }
```

---

## AI Generation

### POST /api/ai/generate

Generate workout or diet plan.

**Request:**
```json
{
  "user_description": "Build muscle, 4 days per week, intermediate level",
  "plan_type": "workout",
  "user_profile": {
    "name": "John",
    "weight": 75,
    "height": 180,
    "goal": "muscle_gain",
    "fitness_level": "intermediate"
  }
}
```

**Response (Workout):**
```json
{
  "success": true,
  "plan": {
    "title": "4-Day Muscle Building Program",
    "duration": "8 weeks",
    "difficulty": "Intermediate",
    "schedule": [
      {
        "dayTitle": "Day 1 - Push",
        "exercises": [
          {
            "name": "Bench Press",
            "sets": 4,
            "reps": "8-10",
            "notes": "Control the descent"
          }
        ]
      }
    ]
  }
}
```

**Response (Diet):**
```json
{
  "success": true,
  "plan": {
    "dailyCalories": 2500,
    "macros": { "protein": 180, "carbs": 280, "fats": 80 },
    "meals": {
      "breakfast": {
        "name": "Protein Oatmeal",
        "calories": 450,
        "protein": 35,
        "carbs": 55,
        "fats": 12,
        "description": "Oats with protein powder and banana"
      }
    }
  }
}
```

### GET /api/ai/status

Check AI service status.

**Response:**
```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "ready": true
}
```

---

## Workouts

### POST /api/workout/log

Log a completed workout.

**Request:**
```json
{
  "title": "Morning Chest Day",
  "duration_minutes": 45,
  "workout_type": "strength",
  "calories_burned": 280,
  "exercises": [
    { "name": "Bench Press", "sets": 4, "reps": "10" }
  ],
  "notes": "Felt strong today",
  "is_ai_generated": false,
  "workout_date": "2025-12-21"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "title": "Morning Chest Day",
    "duration_minutes": 45,
    "calories_burned": 280,
    "workout_date": "2025-12-21",
    "created_at": "2025-12-21T08:30:00Z"
  }
}
```

### GET /api/workout/logs

Get workout history.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 10 | Max results |
| `offset` | int | 0 | Pagination offset |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "title": "Morning Chest Day",
      "workout_type": "strength",
      "duration_minutes": 45,
      "calories_burned": 280,
      "workout_date": "2025-12-21",
      "created_at": "2025-12-21T08:30:00Z"
    }
  ]
}
```

### GET /api/workout/stats

Get workout statistics.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `days` | int | 7 | Period in days |

**Response:**
```json
{
  "success": true,
  "data": {
    "total_workouts": 12,
    "total_duration_minutes": 540,
    "total_calories_burned": 3200,
    "avg_duration": 45,
    "workouts_by_type": {
      "strength": 8,
      "cardio": 4
    }
  }
}
```

### DELETE /api/workout/logs/{workout_id}

Delete a workout log.

**Response:**
```json
{
  "success": true,
  "message": "Workout deleted"
}
```

---

## Diet / Meals

### POST /api/diet/log

Log a meal.

**Request:**
```json
{
  "meal_type": "Breakfast",
  "meal_name": "Protein Oatmeal",
  "calories": 450,
  "protein": 35,
  "carbs": 55,
  "fats": 12,
  "description": "Oats with whey and banana",
  "is_ai_generated": false,
  "log_date": "2025-12-21"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-456",
    "meal_type": "Breakfast",
    "meal_name": "Protein Oatmeal",
    "calories": 450,
    "log_date": "2025-12-21",
    "created_at": "2025-12-21T08:00:00Z"
  }
}
```

### GET /api/diet/logs

Get meal history.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 20 | Max results |
| `log_date` | string | - | Filter by date (YYYY-MM-DD) |

### GET /api/diet/logs/today

Get today's meals with totals.

**Response:**
```json
{
  "success": true,
  "data": {
    "meals": [...],
    "totals": {
      "calories": 1850,
      "protein": 145,
      "carbs": 180,
      "fats": 65
    }
  }
}
```

### GET /api/diet/stats

Get nutrition statistics.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `days` | int | 7 | Period in days |

### DELETE /api/diet/logs/{meal_id}

Delete a meal log.

---

## Chat

### POST /api/chat/send

Send message to AI coach.

**Request:**
```json
{
  "message": "How can I improve my bench press?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help?" }
  ],
  "user_context": {
    "goal": "muscle_gain",
    "fitness_level": "intermediate"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Great question! Here are 5 tips to improve your bench press..."
  }
}
```

### POST /api/chat/stream

Stream AI response (Server-Sent Events).

**Request:** Same as `/api/chat/send`

**Response (SSE):**
```
data: {"content": "Great "}
data: {"content": "question! "}
data: {"content": "Here are..."}
data: {"done": true}
```

### GET /api/chat/suggestions

Get suggested questions.

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "What should I eat before a workout?",
      "How do I calculate my macros?",
      "Best exercises for beginners?"
    ]
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 422 | Validation error |
| 500 | Server error |
