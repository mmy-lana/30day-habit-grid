# PLAN.md — 30day-habit-grid Hardening Pass

> **Executor: read THIS file (`PLAN.md`).** This is the only plan file; it supersedes any prior plan. This is a hardening/feature pass over an **existing, fully-tested** Vue 3 + TS + Tailwind v4 + Vite project (38 tests green). No scaffolding, no architecture redesign — precise edits + 3 new files only. Honor the brief exactly; do not reinterpret the architecture.

---

## 0. Grounding audit (what the codebase actually contains today)

Confirmed by reading every file listed in the brief:

| Concern | Current state | Implication for plan |
|---|---|---|
| `--gh-border` token | **Already defined.** `:root #d0d7de`, `.dark #30363d`; bridged in `@theme inline` as `--color-gh-border`. `border-gh-border` + `/opacity` modifiers already used (e.g. `EmojiInput.vue` uses `border-gh-border/30`). | **No new token needed.** Use `border-gh-border/20` directly on empty cells. |
| `--gh-level-0` (dark) | Currently `#161b22` — identical to `--gh-panel` (`#161b22`), so empty cells are invisible against the card. | Bump to `#21262d` (single-line edit). |
| `DayCell.vue` `title` | `:title="resolvedLabel"` where `resolvedLabel = props.label ?? formatFullDate(props.date)`. Title shows **date only**, no completion status. | DayCell owns the tooltip; enrich `resolvedLabel` to append status derived from `props.intensity`. DayGrid & HabitCard need **no template edit** (they already forward `date`). |
| `useStreak.ts` | Counts backward from last key; breaks immediately if today not done => `currentStreak = 0` ("morning zero" bug). | Rewrite the backward-scan start index per section 3.3. |
| `useLocalStorage.ts` write path | Already wrapped in `try/catch` (quota-swallowed). Read path swallows parse errors with no backup. | Add raw-backup in read catch; add `console.warn` in write catch (eslint permits `console.warn`). |
| `HabitForm.vue` | Already calls `form.name.trim()` at submit; `TextInput` has `:maxlength="40"`. | Replace `.trim()` with `sanitizeText(form.name, 40)` (strips control chars + trims + hard cap). |
| `useHabitStore.ts` | Returns `habits`/`completions`/`theme` as `computed`. No `importState`, no `state` snapshot exposed. | Add `importState(newState)` + `state: computed(() => state.value)` (readonly snapshot). HomePage will use `store.state.value`. |
| `AppHeader.vue` | Already imports `IconButton`. Emits: `toggleTheme`, `addHabit`. | Add 2 IconButtons (Export/Import) + hidden `<input type="file">` + 2 new emits. |
| `HomePage.vue` | Already uses `ConfirmDialog` (for delete). Accesses store via `store.habits.value` etc. | Wire `@export-data`/`@import-file`; add import-overwrite `ConfirmDialog`. |
| `tsconfig` | `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax: true`. | All type-only imports use `import type`; index access returns `T | undefined` (guard it). |
| `eslint.config.js` | `no-console` warn (allows `warn`/`error`); `vue/multi-word-component-names` ignores `Heading`/`Modal`. | No new ignores needed. |

---

## 1. Project context (architect quick-reference)

### 1.1 pnpm CLI — no init/scaffold
The project is already initialized. From repo root:
```bash
pnpm install --frozen-lockfile   # already done; rerun if lockfile changes (it won't here)
pnpm test:run                     # Vitest 4, single run
pnpm type-check                   # vue-tsc --noEmit
pnpm lint:check                   # eslint flat config
pnpm build                        # vue-tsc -b && vite build
```
No `pnpm create`, no new workspace, no Docker (frontend-only).

### 1.2 Dependencies to install
**None.** Zero new runtime or dev dependencies. All new features use browser builtins (`Blob`, `URL.createObjectURL`, `File`, `TextDecoder`, `crypto.randomUUID` already in use) plus existing libs (`vue`, `tailwindcss`, `vitest`, `vue-tsc`, `eslint`). The `package.json` stays untouched.

### 1.3 Folder tree (delta only — full tree unchanged except these)
```
src/
├── assets/main.css                         [EDIT]
├── components/
│   ├── atoms/
│   │   └── DayCell.vue                     [EDIT]
│   ├── molecules/
│   │   ├── HabitForm.vue                  [EDIT]
│   │   └── DayGrid.vue                    [VERIFY, no edit]
│   └── organisms/
│       ├── AppHeader.vue                  [EDIT]
│       └── HabitCard.vue                  [VERIFY, no edit]
├── composables/
│   ├── useHabitStore.ts                   [EDIT]
│   ├── useLocalStorage.ts                 [EDIT]
│   └── useStreak.ts                       [EDIT]
├── pages/HomePage.vue                     [EDIT]
├── utils/
│   ├── backup.ts                          [CREATE]
│   └── text.ts                            [CREATE]
└── test/
    ├── backup.spec.ts                     [CREATE]
    ├── utils.spec.ts                      [EDIT]
    ├── useHabitStore.spec.ts              [EDIT]
    └── HomePage.spec.ts                   [EDIT]
```
ATOMIC invariant preserved: atoms (`DayCell`) import nothing above their level (only `@/types`, `@/utils`). New `IconButton` usage in `AppHeader` (organism) is permitted. `backup.ts`/`text.ts` are pure functions in `utils/` (leaf-level, import only `@/types` + `@/constants` + `@/utils/date`).

### 1.4 Responsive strategy (existing, unchanged; noted for the new UI)
- **Breakpoints** (Tailwind v4 defaults, project uses `sm`/`md`/`lg`): `sm` 640px, `md` 768px, `lg` 1024px. Mobile-first.
- **Nav (AppHeader):** desktop shows stat tiles + text "New habit" button; `<md` hides stats (they move to a mobile stat strip under `CombinedGrid` in `HomePage`) and swaps "New habit" to an icon-only `IconButton`.
- **Grid (DayGrid):** CSS-var driven `grid-template-columns` = `repeat(var(--cols))` with media-query overrides: `base 6` cols => `sm:10` => `lg:15`. `HabitCard` wraps grid in `overflow-x-auto` for narrow widths.
- **Tables:** N/A (no tables in project).
- **Forms (HabitForm):** single-column `flex-col` on mobile; buttons stack via `flex-col-reverse sm:flex-row sm:justify-end`. No change.
- **NEW Export/Import IconButtons:** icon-only 8x8 (`IconButton`), **visible at all breakpoints** (no mobile/desktop split — they are compact icons, not text). Placed in the existing `flex items-center gap-1` cluster in `AppHeader`, immediately before `ThemeToggle`. Order: `Export` => `Import` => `ThemeToggle` => `New habit`.

### 1.5 Deploy config (no changes)
- `vercel.json`: `framework: vite`, `buildCommand: pnpm build`, `installCommand: pnpm install --frozen-lockfile`, `outputDirectory: dist`, SPA rewrite `/(.*) -> /index.html`. **Unchanged.**
- `netlify.toml`: `command = pnpm build`, `publish = dist`, `NODE_VERSION = 22`, SPA redirect `/* -> /index.html 200`. **Unchanged.**
- No new env vars. Backup export/import is fully client-side (no server).

---

## 2. Change inventory

| # | File | Action | Summary |
|---|---|---|---|
| 1 | `src/assets/main.css` | EDIT | `.dark --gh-level-0`: `#161b22` -> `#21262d` (1 line). No token added. |
| 2 | `src/components/atoms/DayCell.vue` | EDIT | `cellClasses` computed adds `border border-gh-border/20` when `intensity === 0`; `resolvedLabel` appends `· Completed` / `· Not completed` from `intensity` (when no explicit `label` prop). |
| 3 | `src/composables/useStreak.ts` | EDIT | `computeStreak` morning-zero fix: if today (last) not done and yesterday (2nd-last) done, continue counting the run ending yesterday; if neither done => 0; if today done => unchanged. `longestStreak` unchanged. |
| 4 | `src/composables/useLocalStorage.ts` | EDIT | `readStored`: capture raw, on parse-failure write `${storageKey}_corrupt_backup` (raw) before fallback. `write`: keep try/catch, add `console.warn` in catch. |
| 5 | `src/components/molecules/HabitForm.vue` | EDIT | `onSubmit` + `error` use `sanitizeText(form.name, 40)` instead of `.trim()`. |
| 6 | `src/utils/text.ts` | CREATE | `sanitizeText(value: string, maxLength: number): string` — strip C0/DEL control chars, trim, hard-cap. |
| 7 | `src/utils/backup.ts` | CREATE | `exportBackup`, `validateBackupSchema` (type guard), `readBackupFile`. |
| 8 | `src/composables/useHabitStore.ts` | EDIT | Add `importState(newState: HabitStoreState): void` + expose `state: computed<HabitStoreState>(() => state.value)` (readonly snapshot). |
| 9 | `src/components/organisms/AppHeader.vue` | EDIT | Add Export + Import `IconButton`s, hidden `<input type="file" accept=".json">` with template ref, 2 new emits `exportData` / `importFile: [file: File]`, change handlers. |
| 10 | `src/pages/HomePage.vue` | EDIT | Wire `@export-data` -> `exportBackup(store.state.value)`; `@import-file` -> async `handleImportFile` (validates, gates overwrite via `ConfirmDialog` when habits exist); add import `ConfirmDialog` + `pendingImport` ref. |
| 11 | `src/components/molecules/DayGrid.vue` | VERIFY (no edit) | Already forwards `date` + optional `labelFor` to `DayCell`; tooltip owned by `DayCell`. |
| 12 | `src/components/organisms/HabitCard.vue` | VERIFY (no edit) | Already passes `:aria-label` to `DayGrid` container; per-cell title from `DayCell`. |
| 13 | `src/test/backup.spec.ts` | CREATE | `validateBackupSchema` + `readBackupFile` cases (see section 4.3). |
| 14 | `src/test/utils.spec.ts` | EDIT | Add `describe('text utils')`; update 2 streak assertions; add 1 streak case (see section 5.1). |
| 15 | `src/test/useHabitStore.spec.ts` | EDIT | `setDay` test: `currentStreak 0 -> 1`; add `importState` test (see section 5.2). |
| 16 | `src/test/HomePage.spec.ts` | EDIT | Existing `streak 1` assertion unchanged; add morning-zero integration test (see section 5.3). |

---

## 3. Per-file implementation notes (signatures, tokens, events)

### 3.1 `src/assets/main.css`
- Change **only** the `.dark` block line `--gh-level-0: #161b22;` -> `--gh-level-0: #21262d;`.
- Leave `:root --gh-level-0` (`#ebedf0`) untouched. Leave `--gh-border` untouched (`#30363d` dark / `#d0d7de` light). Leave `@theme inline` block untouched — `--color-gh-border` already maps to `var(--gh-border)`.
- **Do not** add a new token; the brief's "check whether `gh-border` exists" resolves to: it exists.

### 3.2 `src/components/atoms/DayCell.vue`
- Add a `cellClasses` computed returning an array: `[cellSizeClasses.value, props.intensity === 0 ? 'border border-gh-border/20' : '']`. Bind `:class="cellClasses"` on the inner `<span>` (replaces the current `:class="cellSizeClasses"` string binding).
- Keep the inline `:style="cellStyle"` (sets `backgroundColor: var(--gh-level-${intensity})`). The 1px border is drawn inside the box (Tailwind Preflight sets `box-sizing: border-box`), so cell dimensions do not shift.
- Rewrite `resolvedLabel`:
  ```ts
  const resolvedLabel = computed(() => {
    if (props.label != null) return props.label;            // explicit caller override
    const status = props.intensity > 0 ? 'Completed' : 'Not completed';
    return `${formatFullDate(props.date)} · ${status}`;
  });
  ```
  Rationale: per-habit grids are binary (intensity 0 vs 4) => "Completed"/"Not completed" is accurate. For the combined grid (intensities 1-4 mean partial activity), "Completed" reads as "at least one habit done that day" — acceptable for a tooltip. Callers can still pass `label` to override.
- No new props/emits. No imports added beyond existing `computed`, `formatFullDate`, types.

### 3.3 `src/composables/useStreak.ts`
- Keep `StreakResult` interface and the `longestStreak` loop **exactly as-is**.
- Rewrite the `currentStreak` backward scan:
  ```ts
  const lastIndex = dayKeys.length - 1;
  const todayKey = dayKeys[lastIndex];                 // noUncheckedIndexedAccess -> DayKey | undefined
  const todayDone = todayKey != null && doneMap[todayKey] === true;
  let startIndex = lastIndex;
  if (!todayDone && lastIndex >= 1) startIndex = lastIndex - 1;   // fall back to yesterday
  let currentStreak = 0;
  for (let index = startIndex; index >= 0; index--) {
    const key = dayKeys[index];                       // DayKey | undefined
    if (key != null && doneMap[key] === true) currentStreak++;
    else break;
  }
  ```
- Behavior matrix:

  | today (last) | yesterday (2nd-last) | `currentStreak` |
  |---|---|---|
  | done | any | full run ending today (unchanged from old logic) |
  | not done | done | run ending yesterday (yesterday's continuation) |
  | not done | not done | 0 |
  | window empty (len 0) | — | 0 |
  | window len 1, today done | — | 1 |
  | window len 1, today not done | — | 0 (no yesterday to continue) |

- Doc comment: update the JSDoc above the function to state the morning-zero rule (today-not-done-but-yesterday-done continues yesterday's run).

### 3.4 `src/composables/useLocalStorage.ts`
- Refactor `readStored` to capture the raw string once and back it up before fallback:
  ```ts
  const readStored = (): T | null => {
    if (typeof localStorage === 'undefined') return null;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(storageKey);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch {
      if (raw != null) {
        try { localStorage.setItem(`${storageKey}_corrupt_backup`, raw); }
        catch { /* best-effort backup; quota/disabled */ }
      }
      return null;
    }
  };
  ```
- `write` already has `try/catch`. **Verify** the catch is graceful (rethrows nothing). Add a diagnostic in the catch:
  ```ts
  catch (err) { console.warn('habit-grid: persistence write failed', err); }
  ```
  (`eslint` `no-console` allows `warn`.)
- No change to `scheduleWrite`, `watch`, or the `useLocalStorage` return type.

### 3.5 `src/components/molecules/HabitForm.vue`
- Add `import { sanitizeText } from '@/utils/text';`.
- `error` computed: `(sanitizeText(form.name, 40).length === 0 ? 'Name is required.' : undefined)`.
- `onSubmit`: emit `name: sanitizeText(form.name, 40)` (replaces `form.name.trim()`).
- `onCategoryChange`, the `watch` on `props.habit`, and the `:max-length="40"` on `TextInput` stay as-is (browser caps input length; `sanitizeText` is the authoritative hard cap).
- No change to props/emits signatures.

### 3.6 `src/utils/text.ts` (CREATE)
- Pure, no Vue, no side-effects. SSR-safe (no globals).
  ```ts
  const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;   // C0 controls + DEL
  export function sanitizeText(value: string, maxLength: number): string {
    return value.replace(CONTROL_CHARS, '').trim().slice(0, maxLength);
  }
  ```
- Contract: (1) remove all C0 control chars (U+0000-U+001F) and DEL (U+007F); (2) trim leading/trailing whitespace; (3) hard-truncate to `maxLength` (post-trim). Order matters: strip -> trim -> slice.

### 3.7 `src/utils/backup.ts` (CREATE)
- Pure utilities + minimal DOM in `exportBackup`. Imports: `import type { HabitStoreState } from '@/types/store';`, `import type { Habit, HabitCategory } from '@/types/habit';`, `import { CATEGORIES } from '@/constants/habits';`, `import { todayKey } from '@/utils/date';` (`verbatimModuleSyntax` -> all type imports use `import type`). Zero `any` — use `unknown` + `Record<string, unknown>`.

**API:**

```ts
export function exportBackup(state: HabitStoreState): void
```
- Serialize `state` with `JSON.stringify(state, null, 2)` (formatted), wrap in `new Blob([json], { type: 'application/json' })`, `URL.createObjectURL` -> create `<a>` with `download = `habit-grid-backup-${todayKey()}.json``, append to `document.body`, `.click()`, remove, `URL.revokeObjectURL`.
- SSR guard: `if (typeof document === 'undefined') return;` at top. No return value (fire-and-forget download).

```ts
export function validateBackupSchema(data: unknown): data is HabitStoreState
```
- Type guard. Validate:
  1. `data` is a non-null `object` (else `false`).
  2. `data.habits` is `Array` (else `false`). For each entry `h`:
     - non-null object; `id: string` non-empty; `name: string` non-empty AND `<= 40` chars; `category` is one of `CATEGORIES.map(c => c.value)`; `createdAt: string` non-empty; `emoji` optional but if present must be `string`.
  3. `data.completions` is a non-null `object`; every value must be a non-null `object`; every leaf value must be `boolean` (any non-boolean -> `false`).
  4. `data.theme` is a `string` in `{'light','dark'}`.
- Use a module-level `const VALID_CATEGORIES = new Set<HabitCategory>(CATEGORIES.map((c) => c.value));` and `const VALID_THEMES = new Set<'light'|'dark'>(['light','dark']);`. Helpers `isString(v: unknown): v is string` etc. **No `any`.**

```ts
export async function readBackupFile(file: File): Promise<HabitStoreState>
```
- Implementation contract:
  ```ts
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(buffer);
  let parsed: unknown;
  try { parsed = JSON.parse(text); }
  catch { throw new Error('Backup file is not valid JSON.'); }
  if (!validateBackupSchema(parsed)) throw new Error('Backup file does not match the expected habit-grid schema.');
  return parsed;
  ```
- Reads via `file.arrayBuffer()` + `TextDecoder` (robust across Node 22 and jsdom 30; avoids reliance on `File.text()` which is inconsistently polyfilled). Throws **human-readable** `Error` messages on malformed JSON or schema mismatch.

### 3.8 `src/composables/useHabitStore.ts`
- Add inside `createStore()`:
  ```ts
  function importState(newState: HabitStoreState): void {
    state.value = {
      habits: Array.isArray(newState.habits) ? [...newState.habits] : [],
      completions: { ...newState.completions },
      theme: newState.theme === 'light' || newState.theme === 'dark' ? newState.theme : 'dark',
    };
  }
  ```
  Assigning `state.value` (the `Ref<HabitStoreState>` from `useLocalStorage`) triggers the existing deep `watch` -> `scheduleWrite` -> persists. Defensive copies prevent shared-reference mutation.
- Add `state: computed<HabitStoreState>(() => state.value)` to the returned object (readonly snapshot, consistent with the existing `habits`/`completions`/`theme` computeds).
- Add `importState` to the returned object alongside `clearAll`/`setTheme`/etc.
- **Do not** export raw `state` ref; expose the computed snapshot only (callers use `store.state.value`). This mirrors `store.habits.value` access in `HomePage`.
- Leave the module singleton (`let instance`/`useHabitStore`) untouched.

### 3.9 `src/components/organisms/AppHeader.vue`
- `<script setup>`:
  - Add `import { ref } from 'vue';` (currently no vue imports).
  - `const fileInputRef = ref<HTMLInputElement | null>(null);`
  - Extend emits:
    ```ts
    const emit = defineEmits<{
      toggleTheme: [];
      addHabit: [];
      exportData: [];
      importFile: [file: File];
    }>();
    ```
  - Handlers:
    ```ts
    function onExportClick(): void { emit('exportData'); }
    function onImportClick(): void { fileInputRef.value?.click(); }
    function onFileChange(evt: Event): void {
      const input = evt.target as HTMLInputElement;
      const file = input.files?.[0];
      if (file) emit('importFile', file);
      input.value = '';   // allow re-importing the same file
    }
    ```
- `<template>`: in the existing `<div class="flex items-center gap-1">` container, insert **before** `<ThemeToggle>`:
  ```html
  <IconButton label="Export backup" @click="onExportClick">
    <svg viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4" aria-hidden="true">
      <path d="M8 1.5a.75.75 0 0 1 .75.75v5.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06L7.25 7.94V2.25A.75.75 0 0 1 8 1.5Z"/>
      <path d="M2.5 12.75a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z"/>
    </svg>
  </IconButton>
  <IconButton label="Import backup" @click="onImportClick">
    <svg viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4" aria-hidden="true">
      <path d="M7.25 7.94 5.03 5.72a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 7.94V2.25a.75.75 0 0 0-1.5 0v5.69Z"/>
      <path d="M2.5 12.75a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z"/>
    </svg>
  </IconButton>
  ```
  `IconButton` already renders `:aria-label` + `:title` from its `label` prop, so accessibility + tooltip are covered.
- At the end of `<header>`, add the hidden input:
  ```html
  <input
    ref="fileInputRef"
    type="file"
    accept=".json"
    class="hidden"
    @change="onFileChange"
  />
  ```
  (Tailwind `hidden` = `display:none`; Vue `ref="fileInputRef"` shorthand binds the template ref to `fileInputRef`.)

### 3.10 `src/pages/HomePage.vue`
- Imports:
  ```ts
  import { exportBackup, readBackupFile } from '@/utils/backup';
  import type { HabitStoreState } from '@/types/store';
  ```
- Add state:
  ```ts
  const pendingImport = ref<HabitStoreState | null>(null);
  ```
- Handlers:
  ```ts
  function handleExport(): void {
    exportBackup(store.state.value);
  }

  async function handleImportFile(file: File): Promise<void> {
    try {
      const parsed = await readBackupFile(file);
      if (store.habits.value.length > 0) {
        pendingImport.value = parsed;        // gate overwrite behind ConfirmDialog
      } else {
        store.importState(parsed);
      }
    } catch (err) {
      console.warn('habit-grid: import failed', err);
    }
  }

  function confirmImport(): void {
    if (pendingImport.value != null) store.importState(pendingImport.value);
    pendingImport.value = null;
  }

  function cancelImport(): void {
    pendingImport.value = null;
  }
  ```
- Template: on `<AppHeader>` add `@export-data="handleExport"` and `@import-file="handleImportFile"` (event names per `defineEmits`; Vue kebab-cases `exportData` -> `export-data`, `importFile` -> `import-file`).
- Template: add a second `ConfirmDialog` (alongside the existing delete one):
  ```html
  <ConfirmDialog
    :open="pendingImport != null"
    title="Import backup?"
    message="Importing this backup will overwrite your current habits and check-in history. Do you want to continue?"
    confirm-text="Import"
    @confirm="confirmImport"
    @cancel="cancelImport"
  />
  ```
  (Exact wording per brief section 5.)

### 3.11 `DayGrid.vue` & `HabitCard.vue` — verify, no edit
- `DayGrid` already forwards `:date` + optional `:label` to `DayCell`; the per-cell tooltip is fully owned by `DayCell` (per section 3.2). `HabitCard` already passes `:aria-label` to the `DayGrid` container (grid-level label, not per-cell). **No template or script change.** The brief's "check existing DayCell `title` attr usage" resolves to: the title is owned by the atom and is enriched there. Listing these files in the inventory as VERIFY-only is the correct architectural decision — do **not** add a redundant `labelFor` callback that would duplicate `DayCell`'s own composition.

---

## 4. New file specs

### 4.1 `src/utils/text.ts`
Full API (single export):
```ts
export function sanitizeText(value: string, maxLength: number): string
```
- Strips `[\u0000-\u001F\u007F]`, trims, slices to `maxLength`.

### 4.2 `src/utils/backup.ts`
Full API (three exports): `exportBackup(state: HabitStoreState): void`, `validateBackupSchema(data: unknown): data is HabitStoreState`, `readBackupFile(file: File): Promise<HabitStoreState>` — see section 3.7 for contracts.

### 4.3 `src/test/backup.spec.ts` — case list
Imports: `describe, expect, it, vi` from `vitest`; `validateBackupSchema, readBackupFile` from `@/utils/backup`; type `HabitStoreState` from `@/types/store`.

**`describe('validateBackupSchema')`** — cases:
1. **valid full state** -> `true`. Fixture: 1 habit `{ id:'h1', name:'Read', category:'learning', createdAt:'2026-08-01T00:00:00.000Z', emoji:'📚' }`, `completions:{ h1:{ '2026-08-26': true } }`, `theme:'dark'`.
2. **valid empty state** (habits `[]`, completions `{}`, theme `'dark'`) -> `true`.
3. **valid without optional emoji** -> `true`.
4. **invalid category** (e.g. `category:'sports'`) -> `false`.
5. **habit missing `id`** -> `false`.
6. **habit empty `name`** -> `false`.
7. **habit `name` > 40 chars** -> `false`.
8. **habit `createdAt` missing** -> `false`.
9. **`emoji` present but non-string** (e.g. `emoji: 5`) -> `false`.
10. **`habits` not an array** (e.g. `{}`) -> `false`.
11. **`completions` not an object** (e.g. `[]`) -> `false`.
12. **`completions` leaf non-boolean** (e.g. `'yes'`) -> `false`.
13. **`theme` invalid** (e.g. `'blue'`) -> `false`.
14. **top-level non-object** (`null`, `[]`, `'string'`, `42`, `undefined`) -> `false` (parametrized `it.each`).

**`describe('readBackupFile')`** — cases (build `File` via `new File([content], 'backup.json', { type:'application/json' })`):
15. **valid JSON file** -> resolves to the parsed `HabitStoreState` (deep-equal fixture from case 1).
16. **malformed JSON** (e.g. `'{"habits":'`) -> rejects; assert `.rejects.toThrowError(/not valid JSON/)` (or `toThrow(/JSON/)`).
17. **valid JSON but invalid schema** (e.g. `{ habits: 'nope' }` stringified) -> rejects; assert rejects with `/schema/`.
18. (Optional) **empty file** -> rejects (`/JSON/`).

> Note: tests rely on `File` + `Blob.arrayBuffer()` being available in the Vitest jsdom environment (jsdom 30 provides both). `TextDecoder` is a Node global. If `File` is somehow undefined in the runner, fall back to `new Blob([content], { type:'application/json' })` cast as `File` — but jsdom 30 + Node 22 has `File` global; no fallback expected.

---

## 5. Test-update matrix (exact assertion deltas)

### 5.1 `src/test/utils.spec.ts`
**ADD** a new `describe('text utils')` block:
- `sanitizeText` trims whitespace: `sanitizeText('  hi  ', 10)` -> `'hi'`.
- `sanitizeText` strips control chars: `sanitizeText('a\x00b\x1Fc\x7Fd', 10)` -> `'abcd'`.
- `sanitizeText` hard-caps: `sanitizeText('abcdefghij', 5)` -> `'abcde'`.
- `sanitizeText` order: strip -> trim -> slice: `sanitizeText(' \x00 hi \x00 ', 10)` -> `'hi'`.
- leaves normal text intact: `sanitizeText('Morning run', 40)` -> `'Morning run'`.

**MODIFY** `describe('computeStreak')` (windowKeys uses `lastNDays(count, new Date(2026, 7, 27))`):

| # | Test (current name -> new name) | Old assertion | New assertion |
|---|---|---|---|
| a | "returns zero streaks for an empty window" (unchanged) | `{ currentStreak: 0, longestStreak: 0 }` | **unchanged** |
| b | "counts an all-done window as one long run" (unchanged) | `{ currentStreak: 5, longestStreak: 5 }` | **unchanged** (today done) |
| c | "breaks the current streak when today is missed" -> **"continues yesterday's streak when today is missed (morning-zero fix)"** | `{ currentStreak: 0, longestStreak: 4 }` | `{ currentStreak: 4, longestStreak: 4 }` (5-day window, first 4 done incl. yesterday, today not done -> continue yesterday's run of 4) |
| d | "finds the longest mid-window run independently of today" (unchanged) | `{ currentStreak: 1, longestStreak: 3 }` | **unchanged** (today is done; pattern `[F,T,T,T,F,T]`) |
| e | "handles sparse done maps" (name unchanged; update value) | `{ currentStreak: 0, longestStreak: 1 }` | `{ currentStreak: 1, longestStreak: 1 }` (4-day window, only `days[2]` done; today=`days[3]` not done, yesterday=`days[2]` done -> continue 1) |
| f | **ADD** "returns zero when both today and yesterday are missed" | — | `{ currentStreak: 0, longestStreak: 3 }` (5-day window; `days[0..2]` done, `days[3]` yesterday not done, `days[4]` today not done) |

### 5.2 `src/test/useHabitStore.spec.ts`

| # | Test | Change |
|---|---|---|
| 1 | "toggleDay flips done state and updates stats" | **No assertion change.** Toggling today on -> `currentStreak 1` (today done). Toggling today off -> today not done AND yesterday not done -> `currentStreak 0` (still 0 under new logic). OK |
| 2 | "setDay writes explicit values" | Final assertion **`currentStreak 0` -> `currentStreak 1`**. (Today set true, yesterday set true, today set false -> today not done, yesterday done -> continue 1.) Other assertions (`isDone` checks) unchanged. |
| 3 | "globalStats aggregates across habits" | **No change.** Today done for both habits -> `bestStreak 2` unchanged (today-done path). OK |
| 4 | **ADD** "importState replaces state and persists across a simulated reload" | New test: build a fixture `HabitStoreState` (2 habits, 1 completion map, `theme:'light'`); call `store.importState(fixture)`; assert `store.habits.value` deep-equals fixture.habits, `store.theme.value === 'light'`, `store.isDone(fixtureHabitId, dayKey) === true`; `await flushWrites(); vi.resetModules();` reload via `import('@/composables/useHabitStore')` -> reloaded store reflects the imported fixture (same habits, same completions, `theme:'light'`). |

### 5.3 `src/test/HomePage.spec.ts`

| # | Test | Change |
|---|---|---|
| 1 | "adds a habit, toggles today, shows streak 1, and persists across a remount" | **No assertion change.** Only today is toggled on -> `currentStreak 1` (today-done path). OK |
| 2 | **ADD** "toggling today off after a yesterday completion keeps yesterday's streak (morning-zero fix)" | New integration test: mount HomePage, add habit "Read", click cell `days[28]` (yesterday) -> on, click cell `days[29]` (today) -> on (streak 2), click cell `days[29]` again -> off. Then assert via `useHabitStore().habitStats(habitId, days)` that `currentStreak === 1` (yesterday's run continues). Reuse `habitGridCells` helper + `CELL_SELECTOR`. (Note: `days` here is `lastNDays(30, new Date())` to match the live grid.) |

> **`DayGrid.spec.ts`, `HabitCard.spec.ts`, `HabitForm.spec.ts`, `useDateGrid.spec.ts`**: **no changes.** `HabitForm`'s existing "submits a trimmed HabitInput" test still passes because `sanitizeText('  Morning run  ', 40)` -> `'Morning run'` (same result). `DayGrid`/`HabitCard` tests assert counts/emits, not streak values; the `border-gh-border/20` class addition and `resolvedLabel` enrichment do not affect `findAllComponents(DayCell)` length or emitted events.

---

## 6. Phased build order (per-phase gate + conventional commit)

Each phase: **gate = `pnpm test:run && pnpm type-check && pnpm lint:check`** must pass before commit. Commit message convention: `type(scope): subject`. Never `git push` (manual step per repo rules). Stage only intended files.

### Phase A — Streak fix + data safety + text util (composables/utils, no UI)
**Scope:** section 3.3 `useStreak.ts`, section 3.4 `useLocalStorage.ts`, section 3.6 `src/utils/text.ts`, section 3.5 `HabitForm.vue` (sanitize only), test updates in section 5.1 (`utils.spec.ts` text block + streak assertions a/c/e/f) and section 5.2 items 1-3 (`useHabitStore.spec.ts` `setDay` 0->1).
**Why first:** pure logic + tests; no UI wiring; isolates the morning-zero behavior so downstream phases build on correct streaks.
**Files touched:** `src/composables/useStreak.ts`, `src/composables/useLocalStorage.ts`, `src/utils/text.ts` (CREATE), `src/components/molecules/HabitForm.vue`, `src/test/utils.spec.ts`, `src/test/useHabitStore.spec.ts`.
**Gate:** `pnpm test:run` (all existing + new streak/text cases green) **&&** `pnpm type-check` **&&** `pnpm lint:check`.
**Commit:** `fix(streak): continue yesterday's run when today is not done (morning-zero)`
- If the text util + HabitForm sanitize warrants its own atomic commit, split into two:
  - `fix(streak): continue yesterday's run when today is not done (morning-zero)` (useStreak + useLocalStorage + tests)
  - `chore(habit-form): sanitize name input via sanitizeText` (text.ts + HabitForm + text tests)
  Both must pass the gate independently.

### Phase B — Backup utils + store `importState` (logic layer)
**Scope:** section 3.7 `src/utils/backup.ts` (CREATE), section 3.8 `useHabitStore.ts` (`importState` + `state` computed), section 4.3 `src/test/backup.spec.ts` (CREATE), section 5.2 item 4 (`useHabitStore.spec.ts` add `importState` test).
**Why second:** depends on nothing from Phase A except a working store; gives Phase C a stable `store.importState` + `store.state` API to wire.
**Files touched:** `src/utils/backup.ts` (CREATE), `src/composables/useHabitStore.ts`, `src/test/backup.spec.ts` (CREATE), `src/test/useHabitStore.spec.ts`.
**Gate:** `pnpm test:run && pnpm type-check && pnpm lint:check`.
**Commit:** `feat(backup): add JSON export/import utils and store.importState`

### Phase C — UI wiring + visual contrast (atoms/organisms/pages)
**Scope:** section 3.1 `main.css` (dark `--gh-level-0` bump), section 3.2 `DayCell.vue` (border + label), section 3.9 `AppHeader.vue` (Export/Import buttons + file input), section 3.10 `HomePage.vue` (event wiring + import ConfirmDialog), section 5.3 `HomePage.spec.ts` (add morning-zero integration test).
**Why last:** depends on Phase A (correct streak for the integration assertion) and Phase B (`store.state`/`importState` + `exportBackup`/`readBackupFile`).
**Files touched:** `src/assets/main.css`, `src/components/atoms/DayCell.vue`, `src/components/organisms/AppHeader.vue`, `src/pages/HomePage.vue`, `src/test/HomePage.spec.ts`.
**Verify (no edit):** `src/components/molecules/DayGrid.vue`, `src/components/organisms/HabitCard.vue` — confirm tooltip wiring is owned by `DayCell`; do not edit.
**Gate:** `pnpm test:run && pnpm type-check && pnpm lint:check` **and** `pnpm build` (verifies Tailwind v4 picks up the new `border-gh-border/20` class + the bumped CSS var compiles). Optional manual smoke: run `pnpm dev`, confirm empty cells visible in dark mode, export then re-import a backup.
**Commit:** `feat(ui): wire backup export/import, fix empty-cell contrast in dark mode`

---

### Constraints honored (cross-cutting)
- **pnpm only.** No npm/yarn.
- **ATOMIC:** atoms (`DayCell`) import only `@/types`/`@/utils`; new `IconButton` use in `AppHeader` (organism) is allowed. `backup.ts`/`text.ts` are leaf utils.
- **TypeScript strict,** `noUncheckedIndexedAccess` (guard all indexed access), `verbatimModuleSyntax` (all type-only imports use `import type`). **Zero `any`** — `validateBackupSchema` uses `unknown` + `Record<string, unknown>`.
- **Tailwind v4 tokens:** reuse existing `--gh-border` (no new token). Bump only `--gh-level-0` in `.dark`.
- **Props/emits conventions:** `defineProps`/`defineEmits` with type literals (matches `DayCell`, `DayGrid`, `AppHeader`, `IconButton`). `AppHeader` emits `importFile: [file: File]` (typed tuple).
- **Existing tests stay green** except the intentionally-changed streak assertions enumerated in section 5.
- **Circuit breaker:** if the same test failure persists across 3 fix attempts, STOP and report — do not keep guessing.
- **Zero placeholders/TODOs** in shipped code.
