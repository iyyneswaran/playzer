# PLAYZER -- Neo-Brutalist Sports Broadcast Dashboard

A high-performance, real-time sports broadcasting dashboard built with **Next.js (App Router)**, **Tailwind CSS**, and **WebSockets**, designed with an authentic **Neo-Brutalism** aesthetic (high contrast, bold black borders, offset hard drop shadows, sharp typography, zero emojis).

---

## Design System: Neo Brutalism

Directly inspired by the brutalist visual language:
- **Palette**: Neon Lime (`#D4FF2B`), Electric Violet (`#A855F7`), Crimson Red (`#EF4444`), Cyber Blue (`#3B82F6`), Stark Black & White.
- **Borders & Shadows**: Heavy 3px solid black borders (`border-3 border-black`) with solid offset black shadows (`shadow-[4px_4px_0px_#000]` and `shadow-[8px_8px_0px_#000]`).
- **Typography**: Space Grotesk display headings + Space Mono for live scores, timers, and timestamps.
- **Interactions**: Tactile button press effects (offset shift on active state), animated pulse badges for on-air streaming, marquee live tickers.
- **Icons & Graphics**: Clean geometric Lucide icons, Lottie vector animations, zero emojis.

---

## Features

- **Real-Time Score & Fixture Streaming**: Live WebSocket subscriptions (`/ws`) stream match score changes and new commentary instantly.
- **Interactive Match Detail Drawer**: Slide-over sheet with score stepper controls (`- 1 +`) that trigger `PATCH /matches/:id/score`.
- **Live Commentary Broadcast**: Add commentary events directly from the dashboard (`POST /matches/:id/commentary`) with actor, minute, event type (Goal, Red Card, Yellow Card, etc.), and tags.
- **Match Creation**: Modal dialog to create new matches across any sport category (Football, Basketball, Cricket, Tennis, etc.).
- **Live Event Ticker**: Continuous marquee ticker broadcasting scores and commentary headlines.
- **Filter & Search**: Instant filtering by status (All, Live Now, Scheduled, Finished) and sport categories with live search query.
- **Responsive Layout**: Designed for mobile, tablet, and desktop viewports.

---

## Getting Started

### 1. Start the Backend (`sportz-WebSocket`)

```bash
cd sportz-WebSocket
npm install
# Ensure DATABASE_URL is set in .env
npm run dev
```

The backend server runs on `http://localhost:3000` with WebSocket endpoint `ws://localhost:3000/ws`.

### 2. Start the Frontend (`frontend`)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) or [http://localhost:3000](http://localhost:3000) to view the dashboard.
