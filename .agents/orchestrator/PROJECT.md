# Project Plan: GainTracker 12 Core Flows E2E Audit

## Overview
GainTracker target Base URL: https://new-tracker-orpin.vercel.app
Telegram Bot: @TrackerCPFC_bot
Test User ID: 8319427555
Integrity mode: development

## Architecture & Scope
Comprehensive E2E audit of GainTracker covering 12 core flows split across 4 specialized testing workers:

### Milestone 1 (M1): Core UI & Meal Tracking Flows
- Flow 1: Онбординг — новый юзер, ввод параметров, расчёт КБЖУ
- Flow 2: Главный экран — отображение прогресса, приёмы пищи, прогресс-бар КБЖУ
- Flow 3: Генерация меню — AI генерация рациона, отображение 4 приёмов пищи
- Flow 4: Реролл блюда — локальная и готовая замена блюда
- Flow 5: Отметка "Съедено" — обновления прогресс-бара при переключении галочек

### Milestone 2 (M2): Monetization, AI Chat & Referral Systems
- Flow 6: AI чат Free — лимит 3 сообщений в день, блокировка и пейволл на 4-м сообщении
- Flow 7: Premium пейволл — открытие модального окна и активность кнопки оплаты
- Flow 8: Реферальная система — генерация реферальной ссылки и учёт баллов

### Milestone 3 (M3): Weight Graph, Calendar History & Internationalization
- Flow 9: График веса — сохранение логирования веса и обновление графика
- Flow 10: Календарь — история питания за прошлые даты
- Flow 11: Смена языка DE/RU — переключение всех текстов UI

### Milestone 4 (M4): API Routes Comprehensive Audit
- Flow 12: API эндпоинты — корректность ответов всех /api/* без 500 ошибок (GET/POST /api/profile, /api/meals, /api/logs, /api/changelog, /api/npc/chat, /api/referrals, etc.), error payloads, status codes, and server source file location mapping.

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Core UI & Meals | Flows 1, 2, 3, 4, 5 | None | IN_PROGRESS |
| 2 | M2: AI Chat & Monetization | Flows 6, 7, 8 | None | IN_PROGRESS |
| 3 | M3: Data Views & i18n | Flows 9, 10, 11 | None | IN_PROGRESS |
| 4 | M4: API Endpoints Audit | Flow 12 | None | IN_PROGRESS |
| 5 | M5: Synthesis & Report | Consolidation of 12 flows status into master table | M1, M2, M3, M4 | PLANNED |

## Deliverables
- E2E Status Table with detailed status for each of the 12 flows (✅ работает / ❌ сломано / ⚠️ частично).
- Precise failure report including HTTP status codes, error messages, and file locations.
- Final completion handoff.
