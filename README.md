# ShonenBuilds

> **Level Up. Every Day.**
> Gamified calisthenics training — unlock skill nodes, earn XP, and climb 10 tiers of anime-inspired ranks.

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![Built with](https://img.shields.io/badge/built%20with-Next.js%2016-black)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## What is ShonenBuilds?

ShonenBuilds is a **gamified calisthenics tracker** that turns real bodyweight training into an RPG-style progression system.

You don't just log reps. You:

- **Unlock skill nodes** on a recursive tree (pull-up → muscle-up → planche, etc.)
- **Earn XP** for every clean rep, hold, and progression
- **Level up** through 10 tiers of anime-inspired power ranks — from **E-Rank** to **Apex**
- **Compete** on a global leaderboard
- **Challenge squads** in daily, weekly, and monthly feats
- **Chat in real time** with friends (1-on-1 and group)
- **Choose your discipline** — Shinobi, Awakened Hunter, High Seas, or Spirit Warrior

Think **Strava meets Dragon Ball Z** — but for calisthenics, and built with real engineering depth.

---

## Project Status

**Day 1 — Landing page shipped.**

### Done
- ✅ Next.js 16 project scaffolded (TypeScript, Tailwind v4, App Router, `src/` dir)
- ✅ shadcn-style semantic theme (dark mode, violet + cyan + gold palette)
- ✅ Custom fonts (Syne for display, DM Sans for body)
- ✅ Responsive landing page: hero, EXP bar preview, feature cards, footer
- ✅ Sticky navbar with brand mark
- ✅ Custom animations (orb pulse, EXP fill, fade-up sequences)
- ✅ SEO foundation: metadata, Open Graph, robots.txt, sitemap
- ✅ Domain secured: [shonenbuilds.online](https://shonenbuilds.online)

### In Progress
- 🚧 Prisma schema (17 entities planned — User, Session, UserStats, Skill, Challenge, etc.)
- 🚧 Backend architecture (Express + raw WebSocket server)

### Planned (Phase 1 → Phase 7)
- Auth (JWT + 2FA + device fingerprinting)
- Skill tree with recursive DFS unlock logic
- EXP engine with write-behind cache
- Redis-backed global leaderboard
- Raw WebSocket chat (no Socket.io) — 1-on-1 and group
- Friend requests with 24hr expiry
- Group challenges with atomic tick validation
- Real-time notifications
- AI-powered training assistant (RAG over rank data)

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** with custom design tokens
- **Syne** + **DM Sans** via `next/font`
- *Later:* Redux Toolkit, Recharts, Framer Motion, shadcn/ui

### Backend (planned)
- **Node.js + Express** for REST API
- **Raw Node `net` module** for WebSocket server — the handshake and frame parser written by hand, not imported from `ws`
- **Django** microservice for AI/RAG recommendations

### Data
- **PostgreSQL** (via Prisma ORM)
- **Redis** for caching, leaderboards, presence
- **Neon** for hosted Postgres

### Infrastructure
- **Vercel** (frontend)
- **Railway / Fly.io** (backend services)

---

## Architecture Philosophy

This project is built on one rule:

> **Understand every layer before abstracting it.**

That means:

- **WebSocket protocol is implemented manually** — HTTP upgrade handshake, frame masking/unmasking, opcode parsing — instead of using `socket.io` or `ws`.
- **Database schema is planned before any code** — 3 days of design to avoid 30 migrations.
- **AI is used for speed, not for learning** — boilerplate and UI can be generated, but every core algorithm (skill tree DFS, EXP engine, challenge ranking) is written and understood line by line.
- **Decisions are documented** — every architectural choice gets a `DECISIONS.md` entry: *"Chose X over Y because Z. Breaks when W."*

The goal isn't to have the most features. It's to have **defensible depth** on the features that matter.

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm / pnpm
- A PostgreSQL database (local or [Neon](https://neon.tech))
- A Redis instance (local or [Upstash](https://upstash.com))

### Setup

```bash
# Clone
git clone https://github.com/<your-username>/shonenbuilds.git
cd shonenbuilds

# Install
npm install

# Environment
cp .env.example .env
# Fill in:
#   DATABASE_URL=   (Neon pooled connection string)
#   DIRECT_URL=     (Neon direct connection string — for migrations)

# Prisma
npx prisma generate
npx prisma migrate dev

# Dev server
npm run dev
