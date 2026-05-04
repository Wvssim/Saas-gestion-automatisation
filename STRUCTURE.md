# 📁 SellFlow-Saas Architecture

**Version:** 1.0.0  
**Created:** 2026-05-04  
**Based on:** eGrow pattern

---

## 🗂️ Répertoire Principal

```
sellflow-saas/
├── .claude/                    # Claude Code directives
├── app/                        # Next.js 14 App Router
├── components/                 # React components
├── lib/                        # Business logic + utilities
├── types/                      # TypeScript types
├── hooks/                      # Custom React hooks
├── styles/                     # CSS global
├── public/                     # Static assets
├── prisma/                     # Database
├── tests/                      # Unit & E2E tests
├── README.md                   # Main documentation
└── STRUCTURE.md               # This file
```

---

## 📂 Structure Détaillée

### `/app` - Next.js Pages & API Routes

```
app/
├── (auth)/                     # Authentication routes (grouped)
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   └── callback/page.tsx       # OAuth callback
├── (dashboard)/                # Protected routes (grouped)
│   ├── layout.tsx              # Dashboard wrapper
│   ├── page.tsx                # Dashboard home
│   ├── integrations/
│   │   ├── page.tsx            # List integrations
│   │   └── [id]/page.tsx       # Integration detail
│   ├── automation/
│   │   ├── page.tsx            # List automations
│   │   └── [id]/page.tsx       # Automation detail
│   ├── reports/page.tsx        # Analytics reports
│   └── settings/page.tsx       # User settings
├── api/                        # API routes (backend)
│   ├── auth/[...nextauth].ts  # NextAuth handlers
│   ├── integrations/
│   │   ├── shopify/
│   │   │   ├── connect/
│   │   │   ├── callback/
│   │   │   └── sync/
│   │   └── list/
│   ├── analytics/
│   │   ├── overview/
│   │   ├── trends/
│   │   └── products/
│   ├── automation/
│   │   ├── list/
│   │   ├── create/
│   │   └── [id]/
│   └── webhooks/shopify/
├── layout.tsx                  # Root layout
└── page.tsx                    # Landing page
```

### `/components` - React Components

```
components/
├── ui/                         # shadcn/ui base
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   ├── input.tsx
│   └── ...
├── auth/                       # Authentication
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── dashboard/                  # Dashboard
│   ├── DashboardOverview.tsx
│   ├── KPICard.tsx
│   ├── RevenueChart.tsx
│   ├── OrdersChart.tsx
│   ├── TopProductsTable.tsx
│   └── LowStockAlert.tsx
├── integrations/               # Marketplace
│   ├── IntegrationsList.tsx
│   └── ShopifyConnectionFlow.tsx
├── automation/                 # Automations
│   ├── AutomationList.tsx
│   ├── AutomationBuilder.tsx
│   └── AutomationLogs.tsx
└── layout/                     # Layout
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

### `/lib` - Business Logic

```
lib/
├── db/
│   ├── client.ts               # Prisma client instance
│   └── seed.ts                 # Database seeding
├── integrations/
│   ├── shopify/
│   │   ├── client.ts           # Shopify API client
│   │   ├── sync.ts             # Sync logic
│   │   ├── transform.ts        # Parse Shopify responses
│   │   ├── webhooks.ts         # Webhook handlers
│   │   └── types.ts            # Shopify-specific types
│   └── types.ts                # Integration interface
├── auth/
│   ├── config.ts               # NextAuth configuration
│   └── providers.ts            # OAuth providers
├── analytics/
│   ├── metrics.ts              # Metric calculations
│   └── calculations.ts         # Data aggregations
├── automation/
│   ├── engine.ts               # Automation executor
│   ├── scheduler.ts            # Cron scheduler
│   └── conditions.ts           # Condition evaluator
├── utils/
│   ├── helpers.ts              # General utilities
│   ├── validators.ts           # Data validation
│   ├── formatters.ts           # Data formatting
│   └── errors.ts               # Error handling
└── constants.ts                # App constants
```

### `/types` - TypeScript Types

```
types/
├── index.ts                    # Main types export
├── shopify.ts                  # Shopify API types
├── user.ts                     # User types
├── product.ts                  # Product types
└── order.ts                    # Order types
```

### `/hooks` - React Hooks

```
hooks/
├── useAuth.ts                  # Authentication hook
├── useAnalytics.ts             # Analytics data hook
├── useIntegrations.ts          # Integrations management
└── useAutomate.ts              # Automations management
```

### `/styles` - CSS

```
styles/
├── globals.css                 # Global styles
└── variables.css               # Tailwind variables
```

### `/prisma` - Database

```
prisma/
├── schema.prisma               # Database schema
├── migrations/                 # Migration history
└── seed.ts                     # Initial data
```

### `/tests` - Testing

```
tests/
├── unit/                       # Unit tests
│   ├── auth.test.ts
│   ├── analytics.test.ts
│   └── ...
└── e2e/                        # End-to-end tests
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    └── ...
```

---

## 🚀 Development Workflow

### Phase 1: Setup (Semaines 1-2)

1. **Initialize project**
   ```bash
   npm install
   npx prisma db push
   ```

2. **Connect Supabase**
   - Copy `.env.example` → `.env.local`
   - Fill variables
   - Verify DB connection

3. **Setup NextAuth**
   - Configure Google OAuth
   - Add callback routes
   - Test login flow

### Phase 2: Dashboard (Semaines 3-4)

1. **Database schema**
   - Define Prisma models
   - Create migrations
   - Generate types

2. **API routes**
   - Create analytics endpoints
   - Add data fetching
   - Implement caching

3. **UI components**
   - Build KPI cards
   - Create charts
   - Add real-time updates

### Phase 3: Integration (Semaines 5-7)

1. **Shopify OAuth**
   - Setup OAuth flow
   - Store credentials
   - Implement callback

2. **Data sync**
   - Fetch products
   - Fetch orders
   - Parse & store data

3. **Scheduler**
   - Setup cron jobs
   - Sync periodically
   - Log executions

### Phase 4: Automations (Semaines 8-9)

1. **Builder UI**
   - Create rule builder
   - Add condition editor
   - Configure actions

2. **Engine**
   - Evaluate conditions
   - Execute actions
   - Log results

3. **Notifications**
   - Send emails
   - Webhook triggers
   - Store history

### Phase 5: Polish (Semaines 10-11)

1. **Testing**
   - Unit tests
   - E2E tests
   - Manual QA

2. **Payments**
   - Setup Stripe
   - Add pricing page
   - Implement billing

3. **Security**
   - Audit code
   - Fix vulnerabilities
   - Add rate limiting

### Phase 6: Launch (Semaine 12)

1. **Final checks**
   - All tests pass
   - Errors = 0
   - Docs complete

2. **Deployment**
   - Build & deploy
   - Database migration
   - Monitor errors

3. **Marketing**
   - Social posts
   - Email beta users
   - Product Hunt

---

## 📝 Key Files to Know

| File | Purpose |
|------|---------|
| `.claude/CLAUDE.md` | Project guidelines |
| `README.md` | Main documentation |
| `prisma/schema.prisma` | Database schema |
| `lib/constants.ts` | App constants |
| `lib/db/client.ts` | Prisma client |
| `types/index.ts` | Main types |

---

## ⚡ Quick Commands

```bash
# Development
npm run dev                    # Start dev server

# Database
npx prisma db push           # Push schema to DB
npx prisma migrate dev       # Create migration
npx prisma studio           # GUI for database

# Testing
npm run test                 # Run unit tests
npm run test:e2e            # Run E2E tests

# Linting
npm run lint                # Check code quality

# Build & Deploy
npm run build               # Build for production
npm start                   # Start production server
```

---

**Ready to build! 🚀**

See `README.md` for full documentation.
