# MCD_SMC

## Tech Stack
- Language: JavaScript (JSX)
- Framework: React 19 + Vite 8
- Styling: Tailwind CSS 4
- Routing: React Router DOM 7
- Database: N/A (frontend only)

## Architecture Overview
Single-page React app with sidebar navigation, login page, dashboard, complaint list, and raise complaint pages. Uses UserContext for auth state.

## Directory Structure
```
src/
├── assets/        # SVGs, images
├── components/    # Reusable UI (SideBar, CustomTable, BatchTable, FilterDropDown, etc.)
├── contexts/      # UserContext (auth)
├── pages/         # LoginPage, DashboardPage, ComplainListPage, RaiseComplaintPage
├── App.jsx        # Routes + layout
├── main.jsx       # Entry point
└── index.css      # Global styles
```

## Key Files
- Entry point: src/main.jsx
- Config: vite.config.js, package.json
- Routes/API: src/App.jsx
- Contexts: src/contexts/UserContext.jsx
- Pages: src/pages/

## Common Commands
- Run: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
