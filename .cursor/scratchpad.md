# Trading Ledger Book — Project Scratchpad

## Background and Motivation

The user wants a personal trading journal/ledger web app. Key goals:
- Upload Excel/CSV files or screenshots of trades
- AI-powered extraction of trade details (pair, amount, side, P&L, etc.)
- Day/week/month wise growth with advanced analytics
- Behavior pattern analysis (accuracy, mental state, profitability)
- Built with Next.js, dark theme, deployable on Node-compatible hosting, no auth needed
- New goal (Jul 2026): evaluate launch potential as a Pocket Option-focused trading journal and identify safest go-to-market positioning.

## Key Challenges and Analysis

1. **AI Extraction**: Gemini Vision (gemini-1.5-flash) for screenshot parsing; papaparse + xlsx for CSV/Excel
2. **Data Storage**: SQLite on ephemeral hosting is unsafe for persistence. Plan: Prisma + PostgreSQL via Neon (free tier). Env var `DATABASE_URL` needed.
3. **Chart Library**: Recharts (lightweight, React-native) for all analytics charts
4. **Mental State Analysis**: Derived metrics — revenge trading (big loss followed by increased position size), overtrading (>N trades/day), consistency score
5. **AI Insights**: Use Google Gemini API (free tier) for periodic summaries and recommendations

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS v3 + shadcn/ui (dark theme default)
- **Database**: Prisma ORM + PostgreSQL (Neon free tier)
- **AI**: Google Gemini API — `gemini-1.5-flash` (free tier, supports vision + text)
- **File Parsing**: papaparse (CSV), xlsx (Excel)
- **Charts**: Recharts
- **Deployment**: Node-compatible hosting (environment vars: DATABASE_URL, GEMINI_API_KEY)

## High-level Task Breakdown

### Phase 1: Project Setup
- [ ] **Task 1**: Initialize Next.js 14 project with TypeScript, Tailwind, shadcn/ui (dark theme)
  - Success: `npm run dev` works, dark-themed landing page visible

### Phase 2: Database & Models
- [ ] **Task 2**: Set up Prisma with PostgreSQL schema (Trade model)
  - Trade fields: id, symbol, side, entryPrice, exitPrice, quantity, pnl, pnlPercent, date, exchange, fees, notes, tags, importSource, createdAt
  - Success: `prisma migrate dev` runs, schema in place

### Phase 3: Trade Import
- [ ] **Task 3**: CSV/Excel file upload + column mapping UI + API route
  - Success: Can upload a CSV and map columns to trade fields, trades saved to DB
- [ ] **Task 4**: Screenshot upload with Gemini Vision API extraction
  - Success: Upload a trade screenshot, AI extracts fields, user can confirm & save

### Phase 4: Dashboard & Analytics
- [ ] **Task 5**: Main dashboard — overview cards (Total P&L, Win Rate, Total Trades, Best Day)
  - Success: Cards show correct aggregated stats
- [ ] **Task 6**: P&L charts — daily/weekly/monthly cumulative P&L chart with Recharts
  - Success: Chart shows correct time-series data with period toggle
- [ ] **Task 7**: Trades table — paginated, sortable, filterable trade list
  - Success: All trades shown, can filter by symbol/date/side

### Phase 5: Advanced Insights
- [ ] **Task 8**: Behavior analytics — best/worst time of day, day-of-week × hour heatmap (GitHub-style), win/loss streaks, trade distribution (pair pie chart, long/short ratio)
  - Success: Heatmap grid and streak cards render correctly
- [ ] **Task 9**: Mental state metrics — revenge trading detector, overtrading alerts, consistency score, drawdown chart, equity curve, risk/reward ratio analysis
  - Success: Metrics calculated correctly, drawdown and equity charts render
- [ ] **Task 10**: AI-generated insights — Gemini summary + recommendations per period + psychology score (gamified 0-100)
  - Success: "Generate Insights" button produces meaningful AI analysis with score

### Extra Attractive Features (added)
- Calendar P&L heatmap (GitHub contribution-style, color by profit/loss per day)
- Equity curve (running balance over time)
- Max drawdown chart overlay
- Trade distribution pie charts (by symbol, by long/short)
- Hour × Day-of-week performance grid heatmap
- Psychology/Discipline score (0–100, gamified with badge)
- Win/loss streak flames (visual streak indicator)
- Export trades to CSV

### Phase 6: Polish & Deploy
- [ ] **Task 11**: Responsive layout, navigation, final UI polish
  - Success: Works well on mobile and desktop
- [ ] **Task 12**: Deployment config (hosting config, env var docs in README)
  - Success: Production deployment works, README has setup instructions

## Project Status Board

- [ ] Task 1: Project setup (Next.js + Tailwind + shadcn/ui)
- [ ] Task 2: Prisma schema + DB setup
- [ ] Task 3: CSV/Excel import
- [ ] Task 4: Screenshot AI import
- [ ] Task 5: Dashboard overview cards
- [ ] Task 6: P&L charts
- [ ] Task 7: Trades table
- [ ] Task 8: Behavior analytics
- [ ] Task 9: Mental state metrics
- [ ] Task 10: AI insights
- [ ] Task 11: UI polish
- [ ] Task 12: Deployment config
- [ ] Task 13 (Ad-hoc): Pocket Option launch potential research (executor finished initial pass; awaiting user/planner validation)
- [ ] Task 14 (Ad-hoc): Technical SEO foundation (metadata + robots + sitemap)
- [ ] Task 15 (Ad-hoc): Fix mobile upload filename alignment overflow
- [ ] Task 16 (Ad-hoc): Align SEO domain config to `pnlogix.com`
- [ ] Task 17 (Ad-hoc): Pricing page + crypto checkout initialization
- [ ] Task 18 (Ad-hoc): Harden NOWPayments flow (validation, signature verification, persistence)
- [ ] Task 19 (Ad-hoc): Auth + session + subscription-gated APIs
- [ ] Task 20 (Ad-hoc): Branded public landing page with animated hero

## Executor's Feedback or Assistance Requests

### Completed — Full App Built ✅

All 12 tasks are complete. The app builds cleanly (`npm run build` passes) and the dev server runs.

**What was built:**
- Next.js 16 App Router with full dark-theme UI
- Prisma schema with Trade model
- API routes: /api/trades, /api/import/csv, /api/import/screenshot, /api/analytics, /api/insights, /api/export
- Dashboard page with 8 stat cards, cumulative P&L chart, equity curve with drawdown
- Trades page with sortable/filterable/paginated table + CSV export
- Import page with CSV/Excel (Gemini AI column mapping), Screenshot (Gemini Vision), Manual entry
- Analytics page with Calendar heatmap, Hour×Day heatmap, Monthly bar chart, Symbol distribution, Mental state card
- AI Insights page powered by Gemini
- README with deployment guide

**User needs to provide:**
1. A real PostgreSQL URL (Neon free tier recommended) → replace in `.env`
2. A Gemini API key → replace in `.env`  
3. Run `npm run db:push` to create DB tables
4. Then `npm run dev` → app works fully at localhost:3001

**Known issues / next steps:**
- The `next.config.ts` turbopack.root warning needs Next.js to accept the path import — may need `"import type"` adjustment
- Prisma errors on startup are expected until DB is connected

### Market Research (Outside India) — Subscription Monetization

- Gathered competitor pricing benchmarks for trading journals:
  - TraderSync: roughly `$29.95` / `$49.95` / `$79.95` monthly tiers.
  - Tradervue: free + paid tiers around `$29.95` and `$49.95`.
  - Edgewonk: annual-only around `$197/year`.
- Direction: position TradeJournal below TraderSync/Tradervue paid tiers with cleaner UX + AI coaching focus.
- Prepared to recommend geo targeting (US, UK, Canada, Australia, Singapore, EU) and subscription packages for launch.

### AI Insights adjustments (latest)

- Removed average Risk/Reward references from AI summary payload in `/api/insights` for binary-trading relevance.
- Updated AI prompt guidance to explicitly avoid R:R analysis for binary options.
- Replaced user-facing "Gemini" wording with neutral "AI" wording in Insights and Import pages.

### Executor Update — Pocket Option Launch Potential (Initial Research Pass)

Milestone completed: gathered external market, pricing, and regulatory signals for a Pocket Option-focused launch.

Key findings:
- Demand signal appears strong: third-party traffic estimators show `pocketoption.com` around ~5M-8M monthly visits (directional only, not official).
- Existing journal competitors already target Pocket Option imports (e.g., TradesViz guidance pages), so there is proven use-case demand but not an empty market.
- Trading-journal benchmark pricing remains in expected range: roughly `$29.95`/`$49.95` monthly tiers, with annual discounting common.
- Most visible Pocket Option workflows rely on manual history export (CSV/XLS), which aligns with this app's import-first architecture.

Critical risk (must be handled in positioning):
- Binary options are prohibited/restricted for retail users in major regions (EU/UK and others). Platform-specific marketing without compliance framing may create legal and ad-platform risk.

Recommended positioning:
- Position as a neutral "trade analytics and discipline journal" for exported user trade data.
- Avoid broker endorsement language and include clear jurisdiction/compliance disclaimer.
- Prioritize regions where product/intermediary rules are clearer for educational analytics tooling.

Assistance request to user/planner:
- Please confirm whether Task 13 should be accepted as complete and whether to proceed with the next single step: defining launch ICP + pricing + landing-page messaging draft.

### Executor Update — Task 14 (Technical SEO Foundation) Completed

Milestone implemented (single-step execution):
- Added centralized site config in `lib/site.ts` with `NEXT_PUBLIC_SITE_URL` support and safe fallback URL.
- Upgraded root metadata in `app/layout.tsx` with:
  - canonical setup (`alternates.canonical`)
  - richer title/description/keywords
  - Open Graph + Twitter metadata
  - JSON-LD `WebApplication` structured data block
- Added `app/robots.ts` using Next.js metadata file convention, with sitemap reference.
- Added `app/sitemap.ts` using Next.js metadata file convention for core routes.

Validation status:
- IDE lints for edited files show no errors.
- `npm run lint` currently fails due local ESLint runtime issue (`Cannot find module '../package.json'` from `node_modules/.bin/eslint`), appears environment/tooling-related and not from these code edits.

Assistance request to user/planner:
- Please manually verify:
  1. `/robots.txt` renders with sitemap URL
  2. `/sitemap.xml` renders expected routes
  3. page source includes canonical + OG metadata and JSON-LD
- If verified, approve moving to next single milestone: auth + subscription plan data model and plans page scaffold.

### Executor Update — Task 15 (Import Screen Alignment Fix) Completed

Issue fixed:
- On mobile import upload card, long file names overflowed/misaligned and pushed UI elements out of alignment.

Changes made:
- Updated `components/import/FileUpload.tsx` to use truncation-safe flex layout:
  - `min-w-0`, `flex-1`, and `truncate` on filename container/text
  - `shrink-0` on icon and remove button
- Switched hidden file input id to `useId()` so each upload widget has a unique input id.

Assistance request to user/planner:
- Please re-open the Import page on mobile, select a long `.xlsx` filename, and confirm:
  1. filename stays inside the card (truncated with ellipsis)
  2. close (`x`) icon stays aligned on the right
  3. no text overlaps card borders

### Executor Update — Task 16 (SEO Domain Alignment) Completed

Milestone implemented:
- Updated SEO default site URL in `lib/site.ts` from previous domain to `https://pnlogix.com`.
- Updated SEO/app brand name in site config to `Pnlogix` for metadata output consistency.
- Updated `README.md` env docs to include `NEXT_PUBLIC_SITE_URL=https://pnlogix.com` for local/production correctness.

Assistance request to user/planner:
- Please set environment variable `NEXT_PUBLIC_SITE_URL=https://pnlogix.com` in production environment settings and redeploy.
- After deploy, verify:
  1. canonical URL uses `https://pnlogix.com`
  2. `/robots.txt` sitemap points to `https://pnlogix.com/sitemap.xml`
  3. `/sitemap.xml` route URLs use `https://pnlogix.com`

### Executor Update — Task 17 (Pricing + Crypto Checkout Init) Completed

Milestone implemented:
- Added shared pricing config in `lib/pricing.ts` with Starter/Pro/Elite plans and monthly/yearly pricing.
- Added new pricing page at `app/pricing/page.tsx` with plan cards and dual crypto checkout actions (monthly/yearly).
- Added client checkout button component `components/pricing/CryptoCheckoutButton.tsx` with loading/error UX.
- Added backend checkout initializer endpoint `app/api/payments/crypto/checkout/route.ts`.
- Added Pricing nav entries to desktop and mobile navigation.
- Added `/pricing` to sitemap for indexing.

Environment requirement:
- `NOWPAYMENTS_API_KEY` must be added for live crypto checkout.
- Optional: `NOWPAYMENTS_API_BASE_URL` for custom API base.

Assistance request to user/planner:
- Please verify milestone:
  1. `/pricing` loads and shows all plans
  2. pricing nav item appears on desktop/mobile
  3. clicking crypto checkout either redirects (if key configured) or shows config error message
- If approved, next single milestone will be auth implementation (sign up/sign in/session + route protection).

### Executor Update — Task 17 Provider Change (NOWPayments)

Provider switch completed per user request:
- Replaced previous provider flow with NOWPayments invoice flow in `app/api/payments/crypto/checkout/route.ts`.
- Added webhook placeholder endpoint `app/api/payments/crypto/webhook/route.ts` for payment callbacks.
- Checkout now returns NOWPayments `invoice_url` redirect link.

New env required:
- `NOWPAYMENTS_API_KEY`
- Optional: `NOWPAYMENTS_API_BASE_URL` (default `https://api.nowpayments.io/v1`)

### Executor Update — Task 18 (NOWPayments Hardening) Completed

Hardening delivered:
- Added persistent billing models in Prisma: `BillingCustomer`, `Subscription`, `CryptoInvoice`.
- Checkout now requires valid email and persists initiated invoice before calling provider.
- Provider responses are persisted for traceability (`checkout_created`, `provider_error`, etc.).
- Added secure NOWPayments webhook signature verification using HMAC SHA-512 (`x-nowpayments-sig`) with `NOWPAYMENTS_IPN_SECRET`.
- Webhook now updates invoice/payment fields and auto-activates/extends subscription period on `finished`/`confirmed` statuses.
- Added pricing email input so plan activation is tied to customer email.

New env requirement:
- `NOWPAYMENTS_IPN_SECRET` (required for webhook verification)

Assistance request to user/planner:
- Please run Prisma sync for new billing tables (`npm run db:push` with your production/staging DB).
- Verify flow end-to-end:
  1. open `/pricing`, enter email, start checkout
  2. successful payment returns from NOWPayments
  3. webhook hits `/api/payments/crypto/webhook` and subscription becomes active in DB

Validation status:
- `npm run build` passes after these changes (pricing + checkout + webhook routes compile).

### Executor Update — Task 18.1 (NOWPayments Doc Alignment) Completed

Adjustments made to match NOWPayments API docs behavior:
- Updated webhook signature generation to match documented top-level key sorting approach before HMAC SHA-512.
- Added webhook idempotency protection: subscription activation/extension runs only on the first transition into a successful state, avoiding duplicate extension on repeated callbacks.
- Re-ran full build successfully after changes.

### Executor Update — Task 18.2 (NOWPayments Strict Compliance Pass) Completed

Additional compliance and safety improvements:
- Checkout API now supports optional `pay_currency` (validated) and passes it to NOWPayments invoice creation.
- Added optional fee behavior env support via `NOWPAYMENTS_FEE_PAID_BY_USER`.
- Webhook now matches invoices by `order_id` and/or provider `invoice_id`.
- Webhook validates callback amount/currency against expected USD invoice value; mismatches are marked and never activate subscriptions.
- Build + lint re-validated after these changes.

### Executor Update — Prisma Client Type Sync Fix

Issue addressed:
- IDE showed `Property 'billingCustomer' does not exist on type PrismaClient` in `lib/subscription.ts`.

Fix:
- Regenerated Prisma client (`npx prisma generate`) to sync Prisma types with current schema models.

Verification:
- Full `npm run build` passes afterward, including TypeScript checks.

### Executor Update — Task 19 (Auth + Subscription Gating) Completed

Implemented:
- Added auth system with secure password hashing and JWT session cookie:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Added middleware route protection:
- Added proxy-based route protection (Next.js 16 convention):
  - unauthenticated users are redirected to `/login` for protected routes
  - authenticated users are redirected away from `/login` and `/signup`
- Added Prisma `User` model and user linkage on `Trade` (`userId`) for data isolation.
- Updated protected data APIs to enforce auth/subscription and user scoping:
  - trades, analytics, imports, export, insights, settings routes.
- Updated crypto checkout to bind to authenticated user email (no arbitrary email injection).
- Added login/signup UI pages and logout button in sidebar.
- Refactored app shell layout to hide navigation on auth pages.

Validation status:
- Prisma client regenerated.
- `npm run build` passes with new auth/subscription changes.
- No linter errors on changed files.

Important runbook:
- Run `npm run db:push` to apply new `User`/trade-user schema changes.
- Set env: `AUTH_SECRET` (required).

Security note from dependency check:
- Ran `npm audit` after installing auth deps (as required). Existing advisories remain:
  - `xlsx` (no fix available)
  - `postcss` via Next dependency chain (fix would require breaking downgrade path)

## Lessons

- Ephemeral hosting does not support persistent SQLite; always use external Postgres (Neon free tier recommended)
- Use `DATABASE_URL` env var for Prisma in production
- Gemini API: use `@google/generative-ai` package; `gemini-1.5-flash` model supports both vision (inlineData base64) and text; free tier = 15 RPM, 1M TPM
- For shadcn/ui dark mode: set `darkMode: 'class'` in tailwind.config, add `class="dark"` to `<html>`
- Trading-journal market expects price anchors around `$15–$50/mo`; annual plans and trial periods are standard.
- For binary options users, AI coaching should avoid generic R:R commentary unless explicitly requested.
- Pocket Option-focused GTM must be compliance-aware: keep messaging educational/analytics-first, not broker-promotional.
- Treat third-party traffic and broker-review websites as directional; rely on regulator sources for compliance decisions.
- For Next.js 16 metadata/SEO, prefer file conventions (`app/robots.ts`, `app/sitemap.ts`) and centralized metadata in `app/layout.tsx`.
- Keep `NEXT_PUBLIC_SITE_URL` synced with live domain to avoid wrong canonical/sitemap URLs.
- For crypto subscriptions, initialize checkout server-side with provider API keys only (never expose provider secret keys in client).
- NOWPayments webhooks must be validated with `NOWPAYMENTS_IPN_SECRET`; reject unsigned/invalid callbacks.
- When using `crypto.timingSafeEqual`, always check buffer lengths first to avoid runtime throw on malformed signatures.
- Auth cookies must be HTTP-only and signed with `AUTH_SECRET`; never trust client-provided user email for subscription assignment.

### Executor Update — Task 20 (Branding + Landing Hero) Completed

Milestone delivered:
- Converted root route `/` into a branded public landing page with animated hero, value-prop cards, and CTAs.
- Added subtle animation effects via CSS keyframes (`float` + `fade-up`) in `app/globals.css`.
- Moved previous app dashboard to `/dashboard` and preserved existing dashboard functionality.
- Updated app navigation to use `/dashboard` as the authenticated home route.
- Updated auth and routing flow:
  - login default redirect now goes to `/dashboard`
  - protected route redirects still work via proxy
  - shell nav hidden on marketing routes (`/` and `/pricing`) for cleaner brand presentation.
- Added `/dashboard` to sitemap.

Validation status:
- `npm run build` passes after route and UI changes.
- No linter errors on changed files.

### Executor Update — Task 21 (Billing + Membership Visibility) Completed

Implemented:
- Added `GET /api/billing/overview` to fetch authenticated user billing summary, active/latest subscription, and invoice history.
- Added new `/billing` page with:
  - membership details (active/inactive + validity)
  - quick renew/extend actions using current plan
  - payment history table with resume links for pending checkouts.
- Added Billing nav item to desktop and mobile navigation.
- Updated `/pricing` to show clear return-state messages when NOWPayments redirects back:
  - `?status=cancelled`: no membership change
  - `?status=success`: waiting for webhook confirmation
- Added `/billing` to sitemap.

Behavior clarification for user flow:
- If user clicks “go back/cancel” from NOWPayments, they return with `status=cancelled`.
- Subscription is not activated unless webhook confirms a successful payment status.
- Pending invoice can be resumed from Billing page if checkout URL still valid.

Validation status:
- `npm run build` passes.
- No linter errors on changed files.

### Executor Update — Task 21.1 (Modern Import Notifications) Completed

User feedback addressed:
- Replaced browser `alert()` popups on Import page with modern in-page notification banners (error/info/success).
- Added contextual action links in notices (e.g., membership-required -> Billing, unauthorized -> Login).
- Kept flow non-blocking and visually consistent with app theme.

Validation:
- `npm run build` passes after this UI/UX change.

### Executor Update — Task 22 (Landing Content Expansion) Completed

Implemented:
- Expanded landing page from minimal hero to a complete marketing page with:
  - branded top navigation
  - richer hero + CTA
  - feature deep-dive cards
  - 3-step workflow section
  - testimonials section
  - final conversion CTA block
  - branded footer links
- Reused existing animation styling for smooth entry/floating effects.

Validation:
- `npm run build` passes.
- No linter errors in updated landing file.

### Executor Update — Task 22.1 (User-Provided Logo Applied) Completed

Implemented:
- Replaced branding logo asset with user-provided image (`public/logo.png`).
- Regenerated `public/favicon.ico` from the same logo for browser tab consistency.
- Updated logo references in landing/header, sidebar branding, and metadata OG/Twitter image.

Validation:
- `npm run build` passes after branding swap.

### Executor Update — Task 22.2 (Favicon Update) Completed

Implemented:
- Replaced favicon source with user-provided icon asset.
- Regenerated `public/favicon.ico` from the uploaded favicon image for browser compatibility.

Validation:
- Favicon assets updated successfully (`public/favicon.png`, `public/favicon.ico`).
