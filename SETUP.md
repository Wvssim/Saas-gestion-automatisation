# 🚀 SELLFLOW-SAAS SETUP

**Installation complète.** MVP 12 semaines.

---

## 📋 Table

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Supabase Config](#supabase-config)
4. [NextAuth Setup](#nextauth-setup)
5. [Environment Variables](#environment-variables)
6. [Database Init](#database-init)
7. [Development](#development)
8. [Verification](#verification)

---

## Prerequisites

**Node.js 20+**
```bash
node --version  # v20.0.0+
```

**npm 10+**
```bash
npm --version   # 10.0.0+
```

**Git**
```bash
git --version   # 2.40.0+
```

**Accounts créés:**
- GitHub (repo)
- Supabase (database)
- Vercel (frontend hosting)
- Google Cloud (OAuth)
- Stripe (payments)
- Shopify Developer (API)

---

## Local Setup

### 1. Clone Repo

```bash
cd C:\Users\PC\Documents\SellFlow-Saas
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. Install Dependencies

```bash
npm install
```

**Packages installés:**
- next@14, react@19
- @supabase/supabase-js
- next-auth@5
- @prisma/client, prisma
- tailwindcss, shadcn/ui
- recharts
- stripe, resend
- @shopify/shopify-api
- vitest, @playwright/test

### 3. Init Git

```bash
git add .
git commit -m "initial: project setup"
git remote add origin https://github.com/your-username/sellflow-saas.git
git branch -M main
git push -u origin main
```

---

## Supabase Config

### 1. Create Project

1. Go to supabase.com
2. "New Project"
3. Name: `sellflow-saas`
4. Region: `Europe (eu-west-1)`
5. Password: strong + save
6. Wait (2-3 min)

### 2. Get Credentials

In Supabase Dashboard:
- **Project URL:** `Settings → API → Project URL`
- **Anon Key:** `Settings → API → Anon Key`
- **Service Key:** `Settings → API → Service Role Key`
- **DB Password:** Saved from creation

### 3. Test Connection

```bash
npm install -D dotenv-cli

# In .env.local temporarily:
DATABASE_URL="postgresql://postgres:PASSWORD@PROJECT.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"

# Test:
npx prisma db push --skip-generate
```

---

## NextAuth Setup

### 1. Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project → `SellFlow`
3. Enable APIs:
   - Google+ API
4. Create OAuth 2.0 Credentials:
   - Type: Web application
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-domain.com/api/auth/callback/google
     ```
5. Copy Client ID & Secret

### 2. Generate NextAuth Secret

```bash
openssl rand -base64 32
# Copy output → NEXTAUTH_SECRET in .env.local
```

### 3. Create Auth Config

Already in: `/lib/auth/config.ts`

```typescript
// Configure:
// - Google provider (CLIENT_ID, CLIENT_SECRET)
// - JWT secret
// - Session settings
```

---

## Environment Variables

### Copy Template

```bash
cp .env.example .env.local
```

### Fill All Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@PROJECT.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxx..."
SUPABASE_SERVICE_ROLE_KEY="eyJxx..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"  # or production URL
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Shopify
SHOPIFY_API_KEY="xxx"
SHOPIFY_API_SECRET="xxx"
SHOPIFY_API_VERSION="2024-01"

# Stripe (test keys for MVP)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Email
RESEND_API_KEY="re_xxx"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://xxx"

# Node
NODE_ENV="development"
```

### Verify No Secrets in Git

```bash
cat .gitignore | grep .env.local
# Should output: .env.local
```

---

## Database Init

### 1. Push Schema

```bash
npx prisma db push
# Agree to create schema
```

### 2. Generate Types

```bash
npx prisma generate
```

### 3. Seed Data (Optional)

```bash
npx ts-node prisma/seed.ts
# Creates test user + integration + products
```

### 4. View Database

```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

---

## Development

### Start Dev Server

```bash
npm run dev
```

**Opens:** http://localhost:3000

### Verify All Working

1. **Landing Page**
   - Navigate to http://localhost:3000
   - See hero + features

2. **Google Login**
   - Click "Sign up"
   - Use Google test account
   - Should redirect to dashboard (not built yet)

3. **Database**
   - Run: `npx prisma studio`
   - See `users` table with logged-in user

4. **Environment**
   - Check `.env.local` loaded: `npm run dev` should not error

---

## Verification Checklist

- [ ] Node 20+ installed
- [ ] Repo cloned locally
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] Database credentials in `.env.local`
- [ ] Google OAuth credentials in `.env.local`
- [ ] `npx prisma db push` successful
- [ ] `npx prisma generate` successful
- [ ] `npm run dev` runs without errors
- [ ] http://localhost:3000 loads
- [ ] Google login flow works
- [ ] User appears in `npx prisma studio`

---

## Common Issues

### `Error: Missing Prisma schema`

```bash
npx prisma generate
```

### `Error: DATABASE_URL not set`

```bash
# Verify .env.local exists
cat .env.local | grep DATABASE_URL

# Copy from Supabase Settings
```

### `Google login fails`

1. Verify `GOOGLE_CLIENT_ID` in `.env.local`
2. Check redirect URI in Google Cloud Console
3. Clear browser cookies for localhost:3000

### `Port 3000 already in use`

```bash
npm run dev -- -p 3001
```

### `Prisma migration pending`

```bash
npx prisma migrate deploy
```

---

## Next Steps

1. ✅ Setup complete
2. → Build Dashboard (weeks 3-4)
3. → Shopify Integration (weeks 5-7)
4. → Automations (weeks 8-9)
5. → Payments (weeks 10-11)
6. → Launch (week 12)

See `README.md` for full roadmap.

---

**Setup done. Ready to code! 🚀**

Run: `npm run dev`
