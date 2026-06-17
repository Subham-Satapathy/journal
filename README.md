# TradeJournal — Personal Trading Ledger

An AI-powered personal trading journal built with Next.js, featuring:

- 📊 **Import trades** via CSV/Excel or screenshot (AI-powered extraction with Gemini)
- 📈 **Advanced analytics** — cumulative P&L, equity curve, drawdown, monthly breakdowns
- 🗓️ **Calendar heatmap** — GitHub-style P&L calendar view
- 🕐 **Hour × Day heatmap** — find your best trading times
- 🧠 **Mental state analysis** — revenge trading detection, overtrading alerts, psychology score
- 🤖 **AI insights** — Gemini-powered analysis and recommendations
- 🌑 **Dark theme** — beautiful dark UI

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+
- A PostgreSQL database (free: [Neon](https://neon.tech))
- A Gemini API key (free: [Google AI Studio](https://aistudio.google.com/apikey))

### 2. Set up environment variables

Edit the `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Set up the database

```bash
npm run db:push      # push schema to your DB (no migration history)
# OR
npm run db:migrate   # create migration files (recommended for production)
```

### 4. Run the dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Deploying to Vercel

### Step 1 — Create a free Neon PostgreSQL database

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Create a new project → copy the **Connection String**
3. It looks like: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`

### Step 2 — Get a free Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API key" → copy it

### Step 3 — Deploy to Vercel

```bash
npx vercel
```

Or connect via [vercel.com/new](https://vercel.com/new) by importing this repository.

### Step 4 — Add environment variables in Vercel

In your Vercel project settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `GEMINI_API_KEY` | Your Gemini API key |

### Step 5 — Run the database migration on Vercel

After deploying, run this once to create the database tables:

```bash
DATABASE_URL="your_neon_url" npx prisma db push
```

---

## Features

### Import Trades
- **CSV/Excel**: Upload any trading export. Gemini AI auto-maps columns. Supports Binance, Bybit, OKX, and any custom format.
- **Screenshot**: Drop a trading screenshot. Gemini Vision extracts all trade data automatically.
- **Manual**: Fill in a simple form.

### Dashboard
- Total P&L, Win Rate, Profit Factor, Max Drawdown, R:R Ratio
- Cumulative P&L chart (daily/weekly/monthly)
- Equity curve with drawdown overlay
- Long vs Short win rate comparison
- Win/loss streak tracker

### Analytics
- **Calendar heatmap** — GitHub-style, green = profit, red = loss
- **Hour × Day heatmap** — see exactly when you trade best
- **Monthly P&L bar chart**
- **Symbol distribution** pie chart
- **Mental state analysis** — revenge trading, overtrading detection

### AI Insights (Gemini)
- Select a time period (week/month/quarter)
- Get AI-generated analysis including:
  - Performance summary
  - Behavioral patterns detected
  - Psychology/discipline score (0-100)
  - Specific actionable recommendations

---

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** — dark theme
- **Prisma** + PostgreSQL (Neon)
- **Google Gemini** (`gemini-1.5-flash` — free tier)
- **Recharts** — all charts
- **papaparse** + **xlsx** — CSV/Excel parsing
