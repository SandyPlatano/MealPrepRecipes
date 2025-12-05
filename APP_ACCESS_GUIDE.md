# App Access Guide

You have **two applications** in this project. Here's how to access each one:

## 🚀 Application 1: Vite/React App (Original)

**Location:** Root directory  
**Port:** `3000`  
**URL:** http://localhost:3000

**Features:**
- Simple recipe search by protein or ingredients
- Add new recipes
- Basic meal planning interface
- Client-side only (no backend)

**To run:**
```bash
npm run dev
```

**Tech Stack:** React + Vite + Tailwind CSS

---

## 🎯 Application 2: Next.js App (Full-Featured)

**Location:** `nextjs/` directory  
**Port:** `3001`  
**URL:** http://localhost:3001

**Features:**
- Full authentication system (login/signup)
- Database integration (Supabase)
- Recipe management with persistence
- Meal planning with calendar
- Shopping list generation
- Google Calendar sync
- AI-powered recipe import
- User settings and preferences
- Cooking history and stats

**To run:**
```bash
cd nextjs
npm install  # if you haven't already
npm run dev
```

**Tech Stack:** Next.js 14 + TypeScript + Supabase + Tailwind CSS

---

## 📝 Quick Start

### Run Both Apps Simultaneously

**Terminal 1 - Vite App:**
```bash
npm run dev
```
→ Opens at http://localhost:3000

**Terminal 2 - Next.js App:**
```bash
cd nextjs
npm run dev
```
→ Opens at http://localhost:3001

---

## 🔍 Which App Should You Use?

- **Use the Vite app** if you want a simple, lightweight recipe search tool
- **Use the Next.js app** if you want the full-featured application with user accounts, data persistence, and advanced features

---

## 💡 Tips

- Both apps can run at the same time on different ports
- The Next.js app requires environment variables (check `nextjs/.env.example` if it exists)
- The Next.js app likely needs Supabase configuration to work fully

