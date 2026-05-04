# 🚀 SELLFLOW-SAAS

**L'OS opérationnel** pour les entreprises de vente en ligne.

**Créé par:** Vous
**Stack:** Next.js 14 + TypeScript + Supabase + Stripe
**Durée MVP:** 12 semaines
**Développeur:** 1 (vous) + Claude Opus 4.7

---

## 📋 Table des matières

1. [Vision](#-vision)
2. [Objectifs MVP](#-objectifs-mvp)
3. [Stack Technique](#-stack-technique)
4. [Architecture](#-architecture)
5. [Plan 12 Semaines](#-plan-12-semaines)
6. [Structure Fichiers](#-structure-fichiers)
7. [Setup & Config](#-setup--config)
8. [Roadmap](#-roadmap)

---

## 🎯 Vision

**Positionner SellFlow comme le "système d'exploitation" pour e-commerce.**

Pas un outil parmi tant d'autres, mais l'**infrastructure centrale** où les vendeurs:
- 📊 Gèrent leurs données en 1 place
- 🔗 Intègrent toutes leurs marketplaces (Shopify, Amazon, eBay)
- ⚙️ Automatisent optimisations (prix, stocks, descriptions)
- 📈 Prennent décisions data-driven
- 💰 Augmentent revenue sans effort supplémentaire

**Promesse principale:**
> "Gagnez 3-5h/semaine en automatisant votre e-commerce"

**Cible:** Petits/moyens vendeurs (100k-5M€ revenue) qui n'ont pas time/budget pour agence externe.

---

## 🎯 Objectifs MVP

| Objectif | Description | Métrique |
|----------|-------------|----------|
| **1 Marketplace** | Shopify complètement intégré | ✅ Sync produits + commandes |
| **Dashboard Core** | 6 KPIs + 4 graphiques | ✅ Données real-time |
| **3 Automations** | Price, stock alerts, descriptions | ✅ Exécution sans erreur |
| **Auth & Payment** | Google login + Stripe | ✅ Users payants |
| **Responsive** | Mobile + desktop optimisé | ✅ Lighthouse > 80 |

**NOT in MVP:**
- ❌ Multi-marketplace (phase 2)
- ❌ Mobile app natif
- ❌ IA/ML recommendations
- ❌ Advanced reporting
- ❌ Customer support chat

---

## 🛠️ Stack Technique

### Frontend
```
Framework:        Next.js 14 (TypeScript)
Styling:          Tailwind CSS + shadcn/ui
State:            TanStack Query + Zustand
Charts:           Recharts
Forms:            React Hook Form + Zod
Icons:            Lucide React
```

### Backend
```
Runtime:          Node.js 20+
Framework:        Next.js API Routes
ORM:              Prisma (type-safe)
Database:         PostgreSQL (Supabase)
Auth:             NextAuth.js v5 + Google OAuth
Task Queue:       Bull + Redis (optionnel)
Real-time:        WebSockets (Supabase)
```

### Infrastructure
```
Frontend:         Vercel (gratuit MVP)
Backend:          Railway ou Render ($5-20/mois)
Database:         Supabase ($25-100/mois)
Email:            Resend ($0-25/mois)
Payments:         Stripe (2.9% + 30¢)
Monitoring:       Sentry (free tier)
CI/CD:            GitHub Actions (gratuit)
```

### APIs Externes
```
Shopify:          REST API v2024-01
Google OAuth:     Sign-in
Stripe:           Paiements SaaS
Resend:           Emails transactionnels
```

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────┐
│      VERCEL (Frontend)          │
│  Next.js 14 + Tailwind + Charts │
│                                 │
│  Pages: dashboard, integrations,│
│  automation, settings, reports  │
└─────────────────────────────────┘
         ↕️ HTTPS
┌─────────────────────────────────┐
│   SUPABASE (PostgreSQL + Auth)  │
│                                 │
│  Tables: users, integrations,   │
│  products, orders, analytics,   │
│  automations, automation_logs   │
└─────────────────────────────────┘
         ↕️ APIs
┌─────────────────────────────────┐
│   SERVICES EXTERNES             │
│  Shopify, Stripe, Google, Email │
└─────────────────────────────────┘
```

### Flux Données Clés

**Authentification:**
```
User → Google Login → NextAuth.js → Supabase Auth → Session
```

**Intégration Marketplace:**
```
User → Connect Shopify → OAuth → Stock API Key → Sync Data → DB
```

**Analytics & Dashboard:**
```
DB (orders, products) → Calculate Metrics → Real-time → UI
```

**Synchronisation:**
```
Cron (toutes les heures) → Shopify API → Parse → Update DB
```

---

## 📅 Plan 12 Semaines

### Semaines 1-2: SETUP

- [ ] Repo GitHub + dépôt local
- [ ] Next.js 14 + TypeScript setup
- [ ] Supabase project créé
- [ ] NextAuth.js configuré (Google OAuth)
- [ ] Vercel deployment initial

**Livrables:**
- ✅ App Next.js déployée
- ✅ Google login fonctionnel
- ✅ DB connectée Supabase

---

### Semaines 3-4: DASHBOARD

- [ ] Schema DB complet (Prisma)
- [ ] Dashboard 6 KPIs
- [ ] 4 graphiques (Recharts)
- [ ] API routes analytics (/overview, /trends, /products/top)
- [ ] Real-time updates (WebSocket optionnel)

**DB Schema:**
```sql
-- users (via Supabase Auth)
-- integrations (API keys, type, store_url)
-- products (external_id, name, price, stock)
-- orders (external_id, product_id, revenue, status)
-- analytics (cache: revenue, orders, AOV, conversion_rate)
-- automations (rules: price, stock, description)
-- automation_logs (execution history)
```

**Components:**
- `<DashboardOverview />` - 6 cards
- `<RevenueChart />` - Line chart
- `<OrdersChart />` - Bar chart
- `<TopProductsTable />` - Tableau
- `<LowStockAlert />` - Alertes

**Livrables:**
- ✅ Dashboard avec KPIs live
- ✅ 3 API routes fonctionnelles
- ✅ Real-time data

---

### Semaines 5-7: SHOPIFY INTEGRATION

- [ ] OAuth Shopify complet
- [ ] Sync produits (GraphQL)
- [ ] Sync commandes (depuis last_sync)
- [ ] Cron scheduler (node-cron)
- [ ] Page gestion intégrations

**OAuth Flow:**
```
1. User clique "Connect Shopify"
2. Redirect → Shopify OAuth
3. Authorize → Callback → Stock token chiffré
4. Dashboard affiche données Shopify
```

**Code Structure:**
```
/lib/integrations/shopify/
  - client.ts      (API client)
  - sync.ts        (Logique sync)
  - transform.ts   (Parser réponses)
  - webhooks.ts    (Handlers)

/app/api/integrations/shopify/
  - connect/route.ts    (OAuth initiate)
  - callback/route.ts   (OAuth callback)
  - disconnect/route.ts
  - sync/route.ts       (Force manual sync)
```

**UI:**
- `<IntegrationsList />` - List avec status
- `<ShopifyConnectionFlow />` - Setup wizard

**Livrables:**
- ✅ OAuth Shopify fonctionnel
- ✅ Données synced (products + orders)
- ✅ Page intégrations
- ✅ Sync scheduler actif

---

### Semaines 8-9: AUTOMATISATIONS

**3 Features à Implémenter:**

1. **Price Adjustment**
   - Condition: stock < 5
   - Action: réduire prix -10%
   - Frequency: quotidien

2. **Low Stock Alert**
   - Condition: stock < 10
   - Action: email alert
   - Frequency: real-time

3. **Description Update**
   - Condition: sold% > 50
   - Action: ajouter "POPULAR" au titre
   - Frequency: on order

**Components:**
- `<AutomationList />` - Rules list
- `<AutomationBuilder />` - Create/edit
- `<AutomationLogs />` - History

**DB Tables:**
```sql
CREATE TABLE automations (
  id UUID PRIMARY KEY,
  integration_id UUID REFERENCES integrations,
  name VARCHAR, type VARCHAR,
  condition JSONB, action JSONB,
  enabled BOOLEAN, frequency VARCHAR,
  created_at TIMESTAMP, last_run TIMESTAMP
);

CREATE TABLE automation_logs (
  id UUID PRIMARY KEY, automation_id UUID,
  executed_at TIMESTAMP, status VARCHAR,
  affected_items INT, details JSONB
);
```

**Livrables:**
- ✅ 3 automations fonctionnelles
- ✅ Builder UI
- ✅ Logs détaillés
- ✅ Email notifications

---

### Semaines 10-11: POLISH & PAYMENTS

**Testing:**
- [ ] 10-15 components testés (vitest)
- [ ] E2E tests (Playwright)
- [ ] Lighthouse > 80
- [ ] Security audit

**Stripe Setup:**
```
Plans:
  - Starter: $29/month (1 intégration, 5 règles)
  - Pro: $79/month (3 intégrations, 20 règles)
  - Enterprise: custom
```

**Feature Gating:**
- Limiter intégrations selon plan
- Limiter automations selon plan

**Billing Page:**
- `<PricingTable />`
- `<BillingInfo />`
- `<InvoiceHistory />`

**Livrables:**
- ✅ 95%+ test coverage
- ✅ Stripe payments live
- ✅ Feature gating
- ✅ Billing page

---

### Semaine 12: LAUNCH

**Checklist Final:**
- [ ] Tous tests passent
- [ ] Sentry errors = 0
- [ ] Documentation complète
- [ ] Terms of Service + Privacy
- [ ] Landing page

**Deployment:**
```bash
npm run test:e2e
git commit -m "v1.0.0 - MVP Release"
git push origin main
# Vercel auto-deploys
npx prisma migrate:deploy
```

**Launch Tasks:**
- [ ] Twitter/LinkedIn post
- [ ] Email beta users
- [ ] Product Hunt
- [ ] Hacker News
- [ ] Collect feedback

**Livrables:**
- ✅ MVP production-ready
- ✅ Documentation utilisateur
- ✅ Monitoring actif

---

## 📁 Structure Fichiers

```
sellflow-saas/
├── .claude/
│   └── CLAUDE.md                  # Guidelines projet
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Routes authentification
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/page.tsx
│   ├── (dashboard)/               # Routes protégées
│   │   ├── layout.tsx             # Sidebar + navigation
│   │   ├── page.tsx               # Dashboard home
│   │   ├── integrations/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── automation/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                       # API Routes
│   │   ├── auth/
│   │   │   ├── [...nextauth].ts
│   │   │   └── callback/route.ts
│   │   ├── integrations/
│   │   │   ├── shopify/
│   │   │   │   ├── connect/route.ts
│   │   │   │   ├── callback/route.ts
│   │   │   │   └── sync/route.ts
│   │   │   └── list/route.ts
│   │   ├── analytics/
│   │   │   ├── overview/route.ts
│   │   │   ├── trends/route.ts
│   │   │   └── products/route.ts
│   │   ├── automation/
│   │   │   ├── list/route.ts
│   │   │   ├── create/route.ts
│   │   │   └── [id]/route.ts
│   │   └── webhooks/
│   │       └── shopify/route.ts
│   ├── layout.tsx
│   └── page.tsx                   # Landing page
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── dashboard/
│   │   ├── DashboardOverview.tsx
│   │   ├── KPICard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── OrdersChart.tsx
│   │   ├── TopProductsTable.tsx
│   │   └── LowStockAlert.tsx
│   ├── integrations/
│   │   ├── IntegrationsList.tsx
│   │   └── ShopifyConnectionFlow.tsx
│   ├── automation/
│   │   ├── AutomationList.tsx
│   │   ├── AutomationBuilder.tsx
│   │   └── AutomationLogs.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── db/
│   │   ├── client.ts              # Prisma client
│   │   └── seed.ts
│   ├── integrations/
│   │   ├── shopify/
│   │   │   ├── client.ts
│   │   │   ├── sync.ts
│   │   │   └── types.ts
│   │   └── types.ts
│   ├── auth/
│   │   ├── config.ts              # NextAuth config
│   │   └── providers.ts
│   ├── analytics/
│   │   ├── metrics.ts
│   │   └── calculations.ts
│   ├── automation/
│   │   ├── engine.ts
│   │   └── scheduler.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   └── constants.ts
├── types/
│   ├── index.ts
│   ├── user.ts
│   ├── product.ts
│   ├── order.ts
│   └── integration.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAnalytics.ts
│   ├── useIntegrations.ts
│   └── useAutomate.ts
├── styles/
│   ├── globals.css
│   └── variables.css
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   └── images/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js 20+
- Git
- GitHub account
- Supabase account
- Vercel account
- Stripe account
- Google Cloud account
- Shopify Developer account

### Installation

```bash
# Clone repo
git clone https://github.com/your-username/sellflow-saas.git
cd sellflow-saas

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Fill environment variables (voir section suivante)
# nano .env.local
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sellflow_db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx"
SUPABASE_SERVICE_ROLE_KEY="eyJxxx"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Shopify
SHOPIFY_API_KEY="xxx"
SHOPIFY_API_SECRET="xxx"
SHOPIFY_API_VERSION="2024-01"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Email (Resend)
RESEND_API_KEY="re_xxx"

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN="https://xxx"
```

### Database Setup

```bash
# Generate schema from Supabase
npx prisma db pull

# Create migration
npx prisma migrate dev --name initial

# Generate types
npx prisma generate
```

### Development

```bash
# Start dev server
npm run dev
# Open http://localhost:3000

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build production
npm run build
npm start
```

---

## 🚀 Roadmap

### Phase 1: MVP (Semaines 1-12)
- ✅ Shopify integration
- ✅ Dashboard core
- ✅ 3 Automations
- ✅ Auth + Payments

### Phase 2: Growth (Mois 4-9)
- [ ] Amazon integration
- [ ] eBay integration
- [ ] Advanced reporting
- [ ] Email marketing
- [ ] Team management

### Phase 3: Scale (Mois 10+)
- [ ] IA/ML recommendations
- [ ] Mobile app native
- [ ] Custom integrations API
- [ ] Enterprise features
- [ ] International expansion

---

## 💰 Coûts Estimés

| Service | Cost/month | Notes |
|---------|-----------|-------|
| Supabase | $25-100 | Database + auth |
| Vercel | $20 | Pro plan (optional) |
| Railway/Render | $5-20 | Backend |
| Stripe | 2.9% + $0.30 | Per transaction |
| Resend | $0-25 | Emails |
| Domain | $1-15 | Registrar |
| **Total** | ~$70-200 | Scalable |

---

## 📝 Notes

### Philosophie

✅ **Done > Perfect** → MVP first, polish later
✅ **Build in Public** → Share progress
✅ **Focus** → 1 feature at a time
✅ **Learn by Doing** → Each bug = lesson
✅ **Iterate Fast** → Deploy often

### Red Flags à Éviter

❌ Perfectionnisme
❌ Trop de features
❌ Pas de déploiement early
❌ Ignorer feedback
❌ Technical debt massif

---

## 🚀 Commencer

```bash
# 1. Create GitHub repo
gh repo create sellflow-saas --public

# 2. Clone & setup
git clone https://github.com/your-username/sellflow-saas.git
cd sellflow-saas

# 3. Install dependencies
npm install

# 4. Setup Supabase & environment
# → Create project at supabase.com
# → Copy variables to .env.local

# 5. Start development
npm run dev
```

---

**Let's build the future of e-commerce. 🚀**

*Document created: 2026-05-04*
*Stack: Next.js 14 + TypeScript + Supabase + Vercel*
*MVP Timeline: 12 weeks*
