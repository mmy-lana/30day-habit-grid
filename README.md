# 30-Day Habit Grid

A minimalist, high-performance daily habit tracker inspired by GitHub's contribution activity graph. Built with Vue 3, TypeScript, and Tailwind CSS v4, it provides a rolling 30-day visual punch card for building consistent routines without requiring backend accounts or external databases.

Live Demo: https://30day-habit-grid.vercel.app

---

## Overview

Traditional habit trackers rely on standard checklist views or complicated calendar layouts. 30-Day Habit Grid uses an intuitive heatmap approach:
- Each cell represents one day in a continuous 30-day rolling window ending today.
- An aggregated master heatmap displays overall daily consistency across all habits.
- Individual habit cards offer quick one-click check-ins, precise cell toggles, streak metrics, and completion rates.
- All data is persisted client-side in LocalStorage with full JSON export and import capabilities.

---

## Features

### Visual Tracking
- Rolling 30-Day Window: The timeline automatically rolls over at midnight upon tab focus without requiring polling intervals.
- Master Heatmap (Combined Grid): Aggregates daily completion ratios into five intensity levels (0 to 4), mirroring GitHub's contribution scale.
- Individual Habit Punch Cards: Compact 15x2 grid layout (responsive to 10x3 and 6x5 on smaller viewports) with direct cell interaction.
- Visual "Today" Indicator: Distinct active ring highlight and tooltip notation marking the current day.
- Timeline Reference: Clear start and end labels indicating the 30-day range at a glance.

### Analytics and Streaks
- Intelligent Streak Math: Prevents the "morning zero" penalty by maintaining yesterday's streak during the current day until midnight.
- Comprehensive Metrics: Calculates Current Streak, Longest Streak, Total Completions, and 30-Day Completion Rate per habit.
- Global Dashboard Summary: Tracks total active habits, total completions, and best overall streak across all routines.

### Data Management and Privacy
- Zero Backend / Pure Client-Side: Operates entirely in the browser with no tracking or external API dependencies.
- Reliable Persistence: Reactive LocalStorage sync debounced with `requestIdleCallback` to minimize main-thread work.
- Automated Data Recovery: Preserves corrupted storage snapshots before falling back to default seed data.
- Full Backup and Restore: Export full habit history as a structured `.json` file and restore it with built-in schema validation.

### Accessibility and Theming
- Keyboard Accessible: Full keyboard navigation (Enter and Space key cell toggling) and focus-trapped dialogs.
- ARIA Compliance: Explicit roles, `aria-pressed`, dynamic state labels, and descriptive tooltips.
- Theme Support: GitHub-accurate Dark and Light color palettes syncing with system `prefers-color-scheme`.

---

## Tech Stack

- Framework: Vue 3 (Composition API, `<script setup>`)
- Language: TypeScript (Strict mode, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`)
- Styling: Tailwind CSS v4 (Inline `@theme` custom properties, class-based dark mode)
- Build Tool: Vite 8
- Testing: Vitest 4 with `@vue/test-utils` and `jsdom`
- Type Checking: `vue-tsc`
- Code Quality: ESLint 10 (Flat config) and Prettier
- Package Manager: pnpm

---

## Project Structure

The project follows the Atomic Design pattern for maintainability and clear component boundaries:

```text
src/
├── assets/
│   └── main.css               # Tailwind v4 configuration, theme variables, and layer styles
├── components/
│   ├── atoms/                 # Base visual elements (AppLogo, BaseButton, DayCell, StatTile, etc.)
│   ├── molecules/             # Composite UI components (DayGrid, HabitForm, Modal, StatsHeader, etc.)
│   └── organisms/             # Full feature modules (AppHeader, CombinedGrid, HabitCard, HabitList)
├── composables/               # Reusable business logic and reactive state
│   ├── useDateGrid.ts         # 30-day rolling window calculation and visibility listener
│   ├── useHabitStats.ts       # Per-habit metric computations
│   ├── useHabitStore.ts       # Central singleton store for habit CRUD and state management
│   ├── useIntensity.ts       # 0-4 scale intensity bucketing algorithms
│   ├── useLocalStorage.ts     # Debounced, versioned LocalStorage binding
│   ├── useStreak.ts           # Streak counting with morning-zero tolerance
│   └── useTheme.ts            # System and user theme synchronization
├── constants/                 # Category definitions, default seeds, and palette mappings
├── pages/
│   └── HomePage.vue           # Primary dashboard view integrating all organisms and modals
├── test/                      # Comprehensive unit and integration test suite
├── types/                     # TypeScript interfaces for habits, statistics, and store states
└── utils/                     # Pure helper functions (backup validation, date math, text sanitization)
```

---

## Getting Started

### Prerequisites

- Node.js: `>= 20.19.0` or `>= 22.12.0`
- Package Manager: `pnpm >= 9.0.0`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/30day-habit-grid.git
   cd 30day-habit-grid
   ```

2. Install dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```

### Development

Start the local development server with Hot Module Replacement (HMR):
```bash
pnpm dev
```
Open `http://localhost:5173` in your browser.

### Quality Checks and Testing

Run unit and integration tests:
```bash
pnpm test:run
```

Run TypeScript verification:
```bash
pnpm type-check
```

Run linter:
```bash
pnpm lint:check
```

Format codebase:
```bash
pnpm format
```

### Production Build

Compile and bundle for production:
```bash
pnpm build
```

Preview the production build locally:
```bash
pnpm preview
```

---

## Backup Data Schema

Exported JSON backup files conform to the following schema:

```json
{
  "habits": [
    {
      "id": "c8a6f4e2-9b1a-4f5c-8e3d-1a2b3c4d5e6f",
      "name": "Morning Run",
      "category": "fitness",
      "emoji": "🏃",
      "createdAt": "2026-08-01T08:00:00.000Z"
    }
  ],
  "completions": {
    "c8a6f4e2-9b1a-4f5c-8e3d-1a2b3c4d5e6f": {
      "2026-08-26": true,
      "2026-08-27": true
    }
  },
  "theme": "dark"
}
```

Categories supported: `health`, `learning`, `fitness`, `mindfulness`, `creativity`, `social`.

---

## License

This project is open source and available under the MIT License.
