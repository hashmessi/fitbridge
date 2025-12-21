# Deployment Guide

## Architecture

| Layer | Platform | Free Tier |
|-------|----------|-----------|
| Frontend | Vercel | ✅ Unlimited |
| Backend | Render | ✅ 750 hrs/month |
| Database | Supabase | ✅ 500MB |
| CI/CD | GitHub Actions | ✅ 2000 min/month |

---

## Prerequisites

- GitHub account with repo access
- Supabase project (already configured)
- Vercel account
- Render account

---

## Step 1: Deploy Backend to Render

### Option A: One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Option B: Manual Setup

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Name:** `fitbridge-api`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. Add Environment Variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=sk-your-key
   AI_PROVIDER=openai
   ```

5. Click **Create Web Service**

6. Note your API URL: `https://fitbridge-api.onrender.com`

---

## Step 2: Deploy Frontend to Vercel

### Option A: One-Click
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/fitbridge)

### Option B: Manual Setup

1. Go to [vercel.com](https://vercel.com) → Add New → Project
2. Import your GitHub repo
3. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=https://fitbridge-api.onrender.com
   ```

5. Click **Deploy**

6. Your app is live at: `https://fitbridge.vercel.app`

---

## Step 3: Verify Deployment

### Health Checks
```bash
# Backend
curl https://fitbridge-api.onrender.com/health

# Frontend
open https://fitbridge.vercel.app
```

### Expected Response (Backend)
```json
{
  "status": "healthy",
  "ai_provider": "openai"
}
```

---

## Environment Variables Reference

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_API_URL` | Backend API URL (Render) |

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `OPENAI_API_KEY` | OpenAI API key |
| `AI_PROVIDER` | `openai` or `deepseek` |

---

## Automatic Deployments

Both Vercel and Render auto-deploy on push to `main`:

```
git push origin main
   ↓
GitHub Actions (CI)
   ↓ (tests pass)
Vercel deploys frontend
Render deploys backend
```

---

## Troubleshooting

### Backend not starting
- Check Render logs
- Verify environment variables
- Ensure `requirements.txt` is complete

### Frontend can't reach API
- Check CORS settings in backend
- Verify `VITE_API_URL` is correct
- Check browser console for errors

### Supabase connection fails
- Verify RLS policies are configured
- Check API keys are correct
- Ensure database migrations ran

---

## Cost Estimate

| Service | Free Tier Limit | Overage |
|---------|-----------------|---------|
| Vercel | Unlimited deploys | $20/month |
| Render | 750 hrs/month | $7/month |
| Supabase | 500MB, 50k requests | $25/month |
| **Total** | **$0** | ~$52/month |
