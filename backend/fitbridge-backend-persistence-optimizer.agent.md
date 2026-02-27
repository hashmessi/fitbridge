# 🔥 FITBRIDGE BACKEND – DATA PERSISTENCE & PERFORMANCE OPTIMIZATION AGENT

## 🎯 OBJECTIVE

Fix critical issue:

- Data not persisting in Supabase
- Backend returning cached/in-memory data
- Same data appears after logout/login
- Database remains empty

This agent will:

- Validate real DB writes
- Eliminate mock leakage
- Enforce service-role writes
- Remove in-memory state
- Detect silent Supabase failures
- Optimize DB execution flow
- Validate async behavior
- Confirm persistence integrity

---

# 🚨 PHASE 1 — ELIMINATE MOCK LEAKAGE

Search entire codebase for:

```
dependency_overrides
MagicMock
AsyncMock
mock_supabase_service
```

Ensure:

- No dependency_overrides active outside tests
- No test fixture imported in production
- No mock service instantiated in router
- No fallback mock on Supabase failure

If any found in runtime code → REMOVE.

---

# 🚨 PHASE 2 — VERIFY REAL SUPABASE CLIENT

Open SupabaseService.

Ensure:

```
self.client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key
)
```

NOT:

```
supabase_anon_key
```

Backend MUST use service_role.

---

# 🚨 PHASE 3 — FORCE EXECUTION CHECK

Ensure every DB call ends with:

```
.execute()
```

Example FIX:

WRONG:
```
self.client.table("workout_logs").insert(data)
```

CORRECT:
```
response = self.client.table("workout_logs").insert(data).execute()
```

Without `.execute()` → no DB write.

---

# 🚨 PHASE 4 — HARD ERROR DETECTION

Replace all insert logic with:

```
response = self.client.table("workout_logs").insert(payload).execute()

if hasattr(response, "error") and response.error:
    raise Exception(response.error.message)

if not response.data:
    raise Exception("Insert returned no data")
```

Never allow silent pass.

---

# 🚨 PHASE 5 — REMOVE IN-MEMORY STATE

Search for:

```
global
[]
{}
cache
store
dict
```

Ensure:

- No global workout list
- No global diet list
- No in-memory session store
- No static variable storing logs

All persistence MUST come from Supabase.

---

# 🚨 PHASE 6 — VERIFY TABLE NAMES

Check:

Supabase dashboard table names EXACT match:

- workout_logs
- diet_logs
- workout_plans
- diet_plans

If backend using:

```
workout_log
workouts
logs
```

Mismatch = silent failure.

---

# 🚨 PHASE 7 — ASYNC COMPATIBILITY FIX

Supabase Python client is synchronous.

If route is:

```
async def create_workout_log(...)
```

You MUST NOT block event loop.

Wrap DB call:

```
from fastapi.concurrency import run_in_threadpool

response = await run_in_threadpool(
    lambda: self.client.table("workout_logs").insert(payload).execute()
)
```

Prevents event loop blocking and unstable behavior.

---

# 🚨 PHASE 8 — VERIFY USER_ID PASSING

Ensure:

- user_id comes from verified JWT
- user_id included in insert payload
- user_id column exists in table
- Column type UUID matches auth.users.id

Test manually in SQL:

```
insert into workout_logs (user_id, title)
values ('VALID_AUTH_UUID', 'Test');
```

If fails → foreign key or RLS issue.

---

# 🚨 PHASE 9 — RLS DEBUG MODE

Temporarily disable RLS to confirm:

```
alter table workout_logs disable row level security;
```

Test insert.

If works → RLS policy incorrect.

Re-enable and fix policy:

```
create policy "User insert"
on workout_logs
for insert
with check (auth.uid() = user_id);
```

---

# 🚨 PHASE 10 — FORCE READ AFTER WRITE

Immediately after insert:

```
new_row = response.data[0]

verify = self.client.table("workout_logs") \
    .select("*") \
    .eq("id", new_row["id"]) \
    .execute()

if not verify.data:
    raise Exception("Write not persisted")
```

Guarantees persistence integrity.

---

# 🚨 PHASE 11 — REMOVE CACHED RESPONSE

Ensure no code does:

```
return mock_data
return payload
return request.json()
```

Must return actual DB response.

---

# 🚨 PHASE 12 — FULL WRITE-PATH TEST

1. Start backend
2. Create workout
3. Check Supabase dashboard
4. Restart backend
5. Fetch workouts
6. Confirm persistence remains

If data disappears after restart → memory storage bug confirmed.

---

# 🚨 PHASE 13 — ENV VALIDATION

Print once on startup:

```
print("Using Supabase URL:", settings.supabase_url)
```

Ensure:
- Not localhost DB
- Not wrong project
- Not test project

---

# 🚀 FINAL INTEGRITY TEST

Run:

1. Login
2. Create workout
3. Logout
4. Login again
5. Fetch workouts

Expected:
Data persists permanently.

---

# 🔥 FINAL SYSTEM STATE

After execution:

✔ No mock leakage  
✔ Real Supabase writes  
✔ No silent failures  
✔ Async-safe execution  
✔ Proper service_role usage  
✔ RLS validated  
✔ No in-memory cache  
✔ True persistence verified  

---

# 🧠 ROOT CAUSE EXPECTATION

Based on symptoms:

Most likely cause is one of:

1. Missing `.execute()`
2. Using anon key in backend
3. Mock service accidentally active
4. Table name mismatch
5. RLS blocking silently

This agent eliminates all of them.

END.