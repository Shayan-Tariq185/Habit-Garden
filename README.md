# 🌱 Habit Garden

A gamified habit tracker where every habit is a plant. Complete your habits daily and watch your garden — and your streaks — grow.

Built with **React + Vite + Tailwind CSS**, backed by **Supabase** (Postgres + Auth). Every user has their own account and their own private garden, synced across devices.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Connect your Supabase project

Copy the example env file and fill in your real values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find both values in your Supabase dashboard under **Settings → API**.

`.env.local` is already in `.gitignore` — it will never be committed to GitHub.

### 3. Set up the database

If you haven't already, run `supabase-schema.sql` once in your Supabase project's **SQL Editor**. It creates the `habits` table and turns on Row Level Security so each user can only ever see their own data.

**If you created your Supabase project with "Automatically expose new tables" turned off** (a reasonable, more secure default), you'll also need to run `fix-permissions.sql` once. Without it, reads work but every insert fails with `permission denied for table habits` (Postgres error 42501) — Row Level Security policies control *which* rows a user can touch, but a separate `GRANT` is what allows the `authenticated` role to touch the table at all. Both are required together.

**Optional: disable email confirmation for easier testing/demoing.** By default, Supabase requires users to click a confirmation link in their email before they can log in. For a portfolio demo where you want people to try the app instantly, go to **Authentication → Providers → Email** and turn off **"Confirm email."** Skip this if you want the extra verification step for a real deployment.

### 4. Run it

```bash
npm run dev
```

Open the local URL Vite prints. Create an account on the sign-up screen and start planting habits.

## Deploying

This is a static Vite build — deploys anywhere that serves static files (Vercel, Netlify, etc).

**Important:** your deployed site needs the same two environment variables set in your hosting provider's dashboard (e.g. Vercel → Project → Settings → Environment Variables), or it won't be able to reach Supabase. Add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then redeploy.

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally to sanity-check it
```

## Screens

1. **Onboarding** — app intro, leads into sign up / log in.
2. **Auth** — email + password sign up and log in.
3. **Home Garden Dashboard** — greeting, circular Garden Health ring, "Your Oasis" plant preview strip, today's habit cards with one-tap complete.
4. **Add Habit** — name, category, frequency, reminder time, and a swipeable "Choose Your Seed" plant picker (8 plant types).
5. **Habit Detail** — streak, level/growth stage, growth progress bar, a 7-day activity tracker, "Mark as Done" button.
6. **Growth** — full list of every habit/plant in your garden.
7. **Insights (Weekly Progress)** — weekly completion %, total habits cultivated, longest streak, garden health badge, a completion trend line chart, and a focus-distribution donut chart by category.
8. **Profile** — account email, lifetime stats, reset garden data, log out.

## How growth works

Each plant advances through 5 stages based on **total completions** for that habit:

| Completions | Stage             |
|---|---|
| 0 | Seed 🌰 |
| 1–2 | Sprout 🌱 |
| 3–5 | Small Plant 🌿 |
| 6–10 | Blooming / Flourishing 🌻 |
| 11+ | Fully Grown 🌳 |

**Garden Health** is the percentage of today's habits marked complete.

**Streaks** count consecutive days completed, ending today (or yesterday, so your streak doesn't reset to zero the moment midnight passes — you get until the end of today to keep it alive).

## Garden decay

Plants don't just grow — they can wilt if neglected, which makes the garden metaphor honest rather than purely additive.

| Days since last completion | Daily habits | Weekly habits |
|---|---|---|
| Within grace | Thriving | Thriving |
| Starting to lag | Wilting (2+ days / 7+ days) | Wilting |
| Neglected | Wilted (4+ days / 14+ days) | Wilted |

Wilting is a **purely visual state** — it never reduces `totalCompletions`, streak history, or earned growth stage. One completion instantly and fully revives a wilted plant back to its earned stage. Nothing is ever lost; decay only reflects "how long since you last showed up," recalculated fresh on every render from `completedDates` — there's no separate decay flag stored anywhere, so it can never drift out of sync with reality.

## Spatial garden view

The Growth tab has two views, toggled with the switch in the top-right:

- **Scene view** (default) — an actual 2D garden scene where every habit is a plant positioned organically across the ground, sized by growth stage (seeds are small, fully-grown plants are largest), showing decay states in place. This is the "step back and admire your garden" view.
- **List view** — the fast, scannable list for quickly checking stats or marking habits done.

Plant positions in the scene view are **deterministic**, seeded from each habit's id — they never shift between renders or after completing a habit, so the garden feels stable and real rather than randomly reshuffling.

## Garden time travel

On the Growth tab's scene view, a slider lets you scrub back through your garden's entire history — from the day your oldest habit was planted, up to today. Every plant's size, growth stage, and wilted/thriving state is recomputed as of whatever date the slider is on, using only your existing completion history (no separate history log is stored).

Habits that hadn't been planted yet at a given point in time render as faint, grayscale seed markers rather than disappearing — this keeps the garden's layout visually stable while scrubbing, instead of plants popping in and out.

This is the feature most worth watching in action: drag the slider from the start to today and watch the whole garden grow.

## Weekly recap share card

From Insights, tap the share icon to generate a shareable weekly recap — a portrait (1080×1920, Instagram Story-shaped) card summarizing weekly completion %, habits cultivated, longest streak, garden health, how many plants leveled up this week, and a preview of your garden. Downloads as a PNG.

"Plants leveled up" is derived, not stored separately — it compares each habit's growth stage from before the current week (reconstructed from `completedDates`) to its stage now, so no extra data or history log is needed.

## Reminders

Each habit's reminder time (set in Add Habit) actually does something: once that time of day has passed and the habit isn't done yet, it's visually promoted to the top of Today's Seeds on Home and gets a small "Due" badge. This is in-app surfacing only — no push notifications, no permission prompts, no background scheduling — it simply reflects the current clock time against the stored reminder time whenever the app is open. A habit that's already completed never shows as due, even past its reminder time.

## Data & accounts

- Each user signs up with email + password via Supabase Auth, with an optional display name set at sign-up (or added/changed anytime from Profile — tap your name to edit it).
- If no display name is set, the app falls back to the part of your email before the @ sign, so the greeting is never blank.
- Habits are stored in a Postgres `habits` table, scoped to `user_id`.
- **Row Level Security** is enabled — Postgres itself enforces that a user can only read/write their own rows, regardless of what the frontend sends. Even a raw API call from someone else's session cannot see your data.
- Data syncs across devices — log in from your phone and your laptop, see the same garden.
- **Reset Garden Data** (in Profile) permanently deletes all your habits from the database. This cannot be undone.

## Project structure

```
src/
  components/     Reusable UI (bottom nav, headers, progress ring, plant avatar, garden scene, time slider, recap card)
  context/
    AuthContext.jsx    Supabase session state (sign up, log in, log out)
    GardenContext.jsx  Habit state, synced with Supabase, scoped to the logged-in user
  lib/
    date.js             Pure date helpers + reminder due-time comparison
    plants.js           Plant catalogue + growth stage logic + level-up detection
    decay.js            Garden decay/wilting logic (derived, never stored)
    gardenLayout.js     Deterministic scatter positioning for the spatial garden scene
    gardenSnapshot.js   Historical state reconstruction for the time-travel slider
    habitStore.js        Pure calculation logic (streaks, garden health, stats) — no I/O
    supabaseClient.js    Supabase client singleton
    supabaseHabits.js    All Supabase reads/writes for habits
  pages/          One file per screen (Onboarding, Auth, Home, AddHabit, HabitDetail, Growth, Insights, ShareRecap, Profile)
  App.jsx         Routing, auth-gated (HashRouter)
  index.css       Tailwind + global styles
supabase-schema.sql   Run once in Supabase's SQL Editor to set up the database
.env.example          Copy to .env.local and fill in your Supabase credentials
```

## Tech notes

- **Tailwind v3** with a custom `garden` color palette and shadow/gradient tokens.
- **React Router (HashRouter)** — works from any static host without server-side routing config.
- **Supabase JS client** (`@supabase/supabase-js`) for auth + database.
- **Framer Motion** for the spatial garden scene's entrance animations.
- **html-to-image** for exporting the weekly recap card as a PNG client-side, no backend rendering needed.
- **lucide-react** for icons.
- Charts (completion trend line, focus-distribution donut, garden health ring) are hand-built with inline SVG — no charting library dependency.
- Optimistic UI updates: marking a habit done updates the screen instantly, then confirms with the database; if the save fails, it rolls back automatically.
