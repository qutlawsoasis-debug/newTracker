# Appy (GainTracker) 🍏⚡

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3%20%2B%20Qwen%20Vision-F34F29)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Release](https://img.shields.io/badge/Release-v1.0.0--beta-blue.svg)](https://github.com/qutlawsoasis-debug/newTracker/releases)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-Contributor%20Covenant-green.svg)](CODE_OF_CONDUCT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Appy** is an intelligent, high-performance Telegram Mini App designed for automated calorie tracking, AI-powered meal planning, and nutrition coaching. It combines personalized BMR calculations, vision-based food recognition, and localized supermarket product recommendations (Germany & CIS regions) into a seamless mobile web application.

---

## ✨ Features

- 🍏 **Smart AI Daily Meal Planner**: Generates balanced daily meal plans (Breakfast, Lunch, Dinner, Snack) tailored to individual Mifflin-St Jeor BMR targets and macro goals (Protein, Fat, Carbs).
- 📸 **Vision AI Food Recognition**: Scan photos of meals to automatically extract dish names, estimated calories, and macro breakdown using high-resolution Vision LLMs.
- 💬 **Interactive AI Coach ("Appy")**: Personable AI nutrition mentor that tracks meal completion, provides feedback, and enforces daily free/premium limits.
- 🏪 **Localized Supermarket Alternatives**: One-tap replacement of home-cooked recipes with ready-to-eat products tailored to user region (REWE, ALDI, LIDL for Germany; Пятёрочка, Магнит, ВкусВилл for CIS).
- 🔄 **Single-Meal Reroll**: Instantly swap out specific meals without regenerating the entire daily plan.
- 📊 **Streak & Progress Tracking**: Daily streak counter, weight history graphing, and macro progress bars.
- ⭐️ **Telegram Stars Integration**: Seamless Telegram Stars payments for Premium tier unlocks (unlimited AI chat, menu rerolls, and supermarket alternatives).
- ⏰ **Automated Serverless Notifications**: Vercel Cron-driven meal reminder notifications tailored to individual user schedules.

---

## 🛠 Tech Stack & Architecture

### **Frontend**
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS + Lucide Icons
- **Platform**: Telegram WebApp SDK (`@twa-dev/sdk`)

### **Backend**
- **Runtime**: Node.js + Express.js
- **Database & Auth**: Supabase (PostgreSQL, Realtime, Auth, Row Level Security)
- **Telegram Bot Engine**: Grammy (`grammy`)
- **AI Acceleration**: Groq SDK (`groq-sdk`) utilizing `llama-3.3-70b-versatile` & `qwen/qwen3.6-27b`

### **Testing & CI/CD**
- **Unit Testing**: Vitest
- **E2E Automation**: Playwright Test Suite (Chromium Mobile)
- **Deployment**: Vercel Serverless Architecture

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Supabase Project & Groq API Key

### 1. Clone the repository
```bash
git clone https://github.com/qutlawsoasis-debug/newTracker.git
cd newTracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=gsk_your_groq_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ADMIN_CHAT_ID=your_telegram_id
```

### 4. Run Locally
```bash
# Start local server
npm run start

# In another terminal, start Vite dev server
npm run dev
```

---

## 🧪 Testing

```bash
# Run unit test suite (Vitest)
npm test

# Run End-to-End test suite (Playwright)
npm run test:e2e

# Build for production
npm run build
```

---

## 🗺 System Architecture Diagram

```mermaid
graph TD
    User([Telegram User / Mini App]) -->|HTTP / WebApp SDK| Frontend[React 19 + Vite Frontend]
    User -->|Telegram Commands| Bot[Grammy Telegram Bot]
    Frontend -->|REST API + Auth Header| Backend[Express.js Server]
    Bot -->|Webhooks| Backend
    Backend -->|LLM Queries| Groq[Groq AI Llama 3.3 / Qwen Vision]
    Backend -->|Persistence & Logs| Supabase[(Supabase PostgreSQL)]
    VercelCron[Vercel Cron] -->|/api/cron/notify| Backend
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
