# Contributing to Appy (GainTracker) 🍏⚡

Thank you for your interest in contributing to **Appy**! We welcome contributions from developers of all skill levels. Whether you are fixing bugs, improving documentation, adding new localized supermarket databases, or enhancing AI prompt reliability, your help is appreciated.

---

## 🛠 How to Get Started

### 1. Fork & Clone
Fork the repository on GitHub and clone your fork locally:
```bash
git clone https://github.com/YOUR-USERNAME/newTracker.git
cd newTracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill in required keys:
```bash
cp .env.example .env
```

---

## 🧪 Testing Guidelines

Before submitting a Pull Request, please ensure all unit and end-to-end tests pass cleanly:

```bash
# Run unit tests
npm test

# Run End-to-End Playwright suite
npm run test:e2e

# Validate production build
npm run build
```

---

## 📐 Coding Conventions

- **Frontend**: Write modern functional React 19 components with clean hooks.
- **Backend**: Use Express.js async route handlers with proper error logging via `logSystemError`.
- **Localization**: Ensure any new features support both Russian (`ru`) and German (`de`) contexts.
- **AI Prompts**: Mandate strict JSON schemas for LLM outputs without raw unescaped newlines or markdown wrappers.

---

## 📬 Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes using conventional commit messages (`feat: ...`, `fix: ...`, `docs: ...`).
3. Push to your fork and submit a PR against `main`.
4. Describe your changes clearly in the PR template.

Thank you for helping build the future of open-source nutrition AI! 🚀
