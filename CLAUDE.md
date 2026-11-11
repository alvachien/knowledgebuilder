# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**alvachien.com** is an Angular 22 AI-powered learning platform for English, Chinese, and Knowledge Bank exercises. Built with Angular CLI 22.1.6 (TypeScript ~6.0). The app is fully standalone (no NgModules for feature code) and uses `@jsverse/transloco` for i18n (English + Chinese).

## Development Commands

```bash
ng serve                                 # Dev server at http://localhost:29800
ng serve --configuration production      # Production config
ng build                                 # Dev build (outputs to dist/)
ng build --configuration production      # Production build
ng build --watch --configuration development  # Watch mode
ng test                                  # Run all unit tests (Vitest + jsdom)
ng test --watch                          # Vitest watch mode
ng test --coverage                       # Run tests with coverage report
ng test --include "src/app/services/audio-service.service.spec.ts"  # Single test file
ng test --exclude "**/*.extended.spec.ts"   # Exclude files by glob
ng test --filter "LearningContentService"   # Filter tests by name regex
ng lint                                  # Lint (ESLint via @angular-eslint)
ng generate component component-name     # Generate component (uses SCSS)
ng generate service service-name         # Generate service
```

## Code Architecture

### App Structure

```
src/
  app/
    pages/            # Feature page components (routed views, lazy-loaded), incl. signin-callback, user-detail, page-title
    shared/           # Reusable components, directives
    services/         # Injectable services (learning-content, audio, auth, rating, AI, UI, util, katex, marked, user-code)
    interfaces/       # TypeScript interfaces, enums, and data models
  assets/
    data/i18n/        # Transloco translation files (en.json, zh-CN.json)
  environments/       # environment.ts (dev) and environment.prod.ts
  test-setup.ts       # Vitest setup: test env init, polyfills, global stubs
public/
  sounds/             # Sound-effect audio clips
  favicon.png / favicon.svg
docs/                 # Architecture/design notes (data-models.md is the data-model reference)
tools/                # Validation scripts, schema, converters (Python, JS, PowerShell), raw exercise JSON
```

### Routing (`app.routes.ts`)

All top-level routes are lazy-loaded via `loadComponent` / `loadChildren` (`app.routes.ts`). Child routes inside a lazy bundle use direct `component:` imports in `chinese-exercises.routes.ts` and `knowledge-exercises.routers.ts` (while every child in `habits.routes.ts` is lazy-loaded with its own `loadComponent:`) — they are still code-split with their parent, just not lazy per-component:
- `/` → Homepage
- `/signin-callback` → OIDC sign-in callback (post-IDP-redirect landing, public)
- `/vocabulary` → Vocabulary exercises
- `/translating` → Translation exercises
- `/listening` → English listening
- `/chinese` → Chinese exercises (child routes via `chinese-exercises.routes.ts`)
- `/formula` → Formula recites
- `/knowledge` → Knowledge exercises (child routes: list + `displayv2`)
- `/habits` → Habit tracker (child routes via `habits.routes.ts`: list, `new`, `calendar`, `shared`, `shared/:id`, `:id/edit`, `:id`)
- `/user-detail` → User detail
- `/help` → Help / how-to guide (public: it explains what happens after you sign in). Body copy is `HelpContentComponent` — one compiled component holding both language branches, switched by the active Transloco language (no fetch, no loading/failure state); entry points are the navbar (all tiers) and the homepage "Explore Features" CTA
- `/404` → Not found (`**` catch-all redirects here)

All exercise routes (`/vocabulary`, `/translating`, `/listening`, `/chinese`, `/formula`, `/knowledge`) plus `/habits` and `/user-detail` are wrapped in `canActivate: [AuthGuardService]` (OIDC; see the parent `CLAUDE.md` shared auth contract). Public (unguarded): `/`, `/signin-callback`, `/help`, `/404`.

### Key Services

- **LearningContentService** — Central data loading service. Fetches the file list for every category (Vocabulary, Sentences, Listening, Chinese, Formula, Knowledge Bank) from the `api/LearningContents` endpoint and loads each file's content via the authenticated `api/Storage` controller. HTTP responses are cached per category/fileUrl. `LearningContent` records also carry `version`, `includeLatex`, and `translationDisabled` metadata, so no separate index-file load is needed.
- **AudioService** — Audio playback via Howler.js (`playSound()`), plus word pronunciation via the browser Web Speech API (`speakWord()`, with a voice cache). Uses DI tokens for testability: `HOWLER_GLOBAL` (global Howler), `HOWL_FACTORY` (Howl instance factory).
- **KatexService** — Math formula rendering.
- **MarkedService** — Markdown parsing (`parse()`, plus `parseWithExtensions()` on a fresh instance so extensions never pollute the shared one).
- **MarkdownContentComponent** (`shared/markdown-content/`) — `app-markdown-content`: marked → DOMPurify → sanitized `innerHTML`, inputs `markdown`, `enableMath`, `imageBaseUrl`, and `headingIds` (default **false**; gives each `h2`/`h3` an ordinal `sec-N` / `sec-N-M` id so a long document can carry its own clickable table of contents). Used by listening, knowledge and translate. **The help page does NOT use it** — the help guide is a compiled bilingual template (`HelpContentComponent`); do not reintroduce `headingIds` there.
- **HelpContentComponent** (`pages/help/help-content.component.ts`) — the `/help` body: one standalone component whose template holds an `@if (lang() === 'zh-CN')` branch and an English `@else` branch (any unknown id falls back to English, matching Transloco's `fallbackLang`), each wrapped in `.app-markdown.markdown-content` so the global help prose styles apply. Both branches carry the same six semantic heading ids (`quick-start` … `account`) in the same TOC order — guarded by `help.component.spec.ts`. Section jumps are `[routerLink]="[]" [fragment]="'id'"`, scrolled manually inside `HelpContentComponent` via `scrollIntoView` on `NavigationEnd`/`NavigationSkipped` — the router deliberately carries NO `withInMemoryScrolling` config, because the app scrolls inside `.app-main-content`, not the window (see `app.config.ts`); **never a bare `href="#id"`**, which resolves against `<base href>` (`/` dev, `/learning/` prod) rather than the current route and reloads the app at the homepage.
- **AiService** — AI integration for learning assistance (`api/TTS/details`, `api/EnglishLLM/details`, `api/FormatLLM/AskAnything` — all LLMAndTTS-rate-limited server-side).
- **AuthService / AuthGuardService / AuthInterceptor** (`auth.service.ts`, `auth-guard.service.ts`, `auth.interceptor.ts`) — OIDC authentication via `angular-auth-oidc-client` against `acidserver`. The guard is a CLASS-based `AuthGuardService` (an `@Injectable` with an instance `canActivate()` that waits for the initial auth check to settle — see the Deprecations note); the interceptor attaches tokens to API calls.
- **LearningRatingService** — Per-user learning ratings, persisted server-side via `api/UserLearningRatings` (client-side get-then-write: POST creates the unique user/content/item triple, PUT updates an existing row by id), with per-content in-memory caching
- **UserLoginHistoryService** — Per-day login history (`api/UserLoginHistories`): `recordLogin()` fires once when the OIDC redirect completes (signin-callback), `getHistory()` feeds the login-history card on the user-detail page.
- **UserLearningTimeService** — Learning-time heartbeat + client (`api/UserLearningTimes`): constructed once at bootstrap (`provideAppInitializer` in `app.config`); while an exercise route is displayed, signed in, and the tab has seen activity within 2 minutes, a 60-second zone-free timer POSTs `{ categoryId }` (route segment → category 1-6 map; hidden/idle tabs stop beating, the server caps every credit). Passive screens — review auto play, dictation — call `markActivity()` on each word change. `getMy()` feeds the learning-time card on the user-detail page (today / last-7-days minute totals + per day×category rows). Beats carry the caller's display name (`UserAuthInfo.getUserName()`); `getLeaderboard(windowDays, top)` powers the signed-in-only "Top Learners" section on the homepage (past week + past month, first cross-user surface); `getPreferences()` / `savePreferences(optOut)` drive the leaderboard opt-out checkbox on the user-detail page.
- **WordDictionaryService** — Per-word dictionary detail (`api/WordDictionary`): `getWord()` returns the entry (Chinese definitions + bilingual examples, served by aclearningutil from `words.db`) or `null` on a 404/HTTP failure, cached for the session keyed by the lowercased word (404 misses ARE cached as `null`; only transient failures - 5xx / network / expired token - are not); feeds the definitions/examples blocks of the vocabulary review screen.
- **UtilService** — General utilities.
- **UIService** — UI utilities.
- **UserCodeService** — Tracks user-entered access codes.
- **AppPageTitle** (`pages/page-title/`) — Sets page-level browser title via `@angular/platform-browser` `Title` service, with environment-configured suffix.

### Vocabulary Exercises Page Architecture (`pages/vocabulary-exercises/`)

Decomposed into a container component, presentational children, and four signal stores — review, spelling, quiz, and dictation (see `docs/vocabulary-exercises-architecture.md`):

- **`VocabularyExercisesComponent`** - the container. Owns a `mode` signal (`'list' | 'review' | 'spelling' | 'spellingresult' | 'dictation' | 'dictationresult' | 'quiz' | 'quizresult'`); the template renders exactly one screen via `@switch`, so screen components are created/destroyed on transition. Owns file loading, the shared `MatTableDataSource`/`SelectionModel`, word-queue preparation (filters → shuffle → cap via `prepareWordQueue()`), and most dialog orchestration (the one exception: the review screen opens its own `autoplayoptions` dialog): dialogs open via `MatDialog`, and `afterClosed()` is piped through `takeUntilDestroyed(destroyRef)`; an `undefined` result (Cancel/backdrop/Esc) leaves state untouched.
- **`VocabularyExercisesWordListComponent`** - the presentational list screen. Receives the container's shared dataSource/selection/signals as inputs and forwards user intents as outputs; wires its template's paginator/sort onto the shared dataSource via `@ViewChild` setters.
- **Signal stores** - `VocabularyReviewSessionStore` (queue, cursor, auto-mode interval, per-word `ratingMap`, per-cursor `wordReference` dictionary detail fetched via `WordDictionaryService` with a generation guard, progress computeds), `VocabularySpellingSessionStore` (queue, per-letter reveal state, results), `VocabularyDictationSessionStore` (queue, per-word typed-answer state, results), and `VocabularyQuizSessionStore` (single-choice question queue, per-question answer state, results). Plain `@Injectable()` classes (no state library), provided in the container's `providers` so the container and session screens share one instance per page instance. They are imported directly, not via the barrel.
- **Session screens** - `review-session`, `spelling-session`, `spelling-result`, `dictation-session`, `dictation-result`, `quiz-session`, and `quiz-result` components inject their store directly (no state inputs). Only the four *session* screens register a `document:keyup` `@HostListener` (review-session also a `document:keydown` one); the three result screens register none — keystroke handling therefore lives only while the relevant screen is mounted.
- **Dialogs** - one mode-driven select dialog (By Count / Free Selection / By Word), plus `reviewoptions`, `spellingoptions`, `worksheetoptions`, `dictationoptions`, `quizoptions`, the `autoplayoptions` dialog (opened by the review screen itself), and the **shared** `filter` dialog (`src/app/shared/filter-dialog/` — `SharedFilterDialogComponent`, design in `docs/reusable-filter-dialog-design.md`, contract in `docs/filter-hierarchy-contract.md`), opened with the page's `VOCABULARY_FILTER_PROPERTIES` schema and an actslib `FilterRoot` seed (a group definition, or a bare single condition); Submit returns the edited `FilterRoot` — a single-condition filter comes back as a bare `IFilterCondition` (`FilterUtility.Simplify` at the boundary) and an empty tree is not submittable (case 0 belongs to the Clear Filter button — a "new filter" dialog opens scaffolded in case 1 instead — one blank, selected condition; the editor tree IS the actslib root — the top level holds a SINGLE node (case 1: one condition row; case 2: one group row with its members nested; the wrapper is never rendered and holds at most one member, its join inert) — and the tree toolbar holds exactly three buttons enabled by the selected node's kind (nothing selected — the empty tree — arms both inserts, a condition arms delete only, a group arms all three); delete returns the selection to the parent group (or to nothing when the tree empties, where the inserts re-arm), so a node is always selected unless the tree is empty); Cancel/backdrop/Esc return `undefined`. It is a project-wide component (all four list pages — vocabulary, knowledge, Chinese and translate — now filter through it, each with its own `*_FILTER_PROPERTIES` schema), not a vocabulary-page file. Options dialogs round-trip `currentSettings` so reopening shows the last picks.
- **Filter pipeline** - free-text + the actslib **`FilterRoot`** (word/rating conditions in AND/OR-joined, nestable groups — a bare condition when the filter is a single condition; produced directly by the shared dialog, no page-side tree model or translation step) combine into a `VocabularyListFilter` (`interfaces/vocabulary.ts`), serialized as JSON into `MatTableDataSource.filter`; the row predicate delegates to the pure `matchVocabularyListFilter()` (closing over the rating map), which runs `FilterUtility.MatchFilter` against a case-folded target `{ enword, cnword, rating }` (string condition values are folded by each property's `prepareValue` at dialog emit time; free-text stays a hand-written cross-field check). After async rating loads, re-assign `dataSource.filter = dataSource.filter` to force re-filtering.
- **Ratings** - list ratings live in a `contentRatingMap` signal; the review store captures only server-confirmed ratings and returns them on `quit()`, which the container merges back into the map. Temporary (uploaded) content gets a synthetic `LearningContent` with a negative id, and rating calls are disabled for it.
- **Quiz exercise** - the Exercises-menu Quiz item reuses the shared word-queue selection (table selection, else filter + `prepareWordQueue`), then builds single-choice questions via the pure `buildVocabularyQuizQuestions()` (`interfaces/vocabulary.ts`): EN word -> pick the CN explanation among up to 4 candidates (correct answer + at most 3 deduplicated distractors; degrades to 2-3 when the pool lacks distinct texts) (`en2cn`), or CN explanation -> pick the EN word (`cn2en`). Distractors come from the visible (filtered) rows, deduplicated by displayed text; questions that cannot gather one distinct alternative are skipped.

### Internationalization (Transloco)

- Library: `@jsverse/transloco` (v8+)
- Config: `transloco-root.module.ts` exports `provideTranslocoStandalone()` used in `app.config.ts`
- Languages: `en` (default), `zh-CN`
- Translation files: `src/assets/data/i18n/{en,zh-CN}.json`
- Usage in templates: `{{ t('key') }}` via `TranslocoModule` import; in components: `inject(TranslocoService)`

### Data Models

See document 'docs/data-models.md'.


### Content Data

All exercise content is served by the `aclearningutil` backend (see the parent `CLAUDE.md`). The frontend never reads local JSON files — every category goes through `LearningContentService`. (The help page's guide text is UI copy, not content, and lives compiled in `HelpContentComponent` — no asset file.)

- **File lists** — `GET /api/LearningContents?categoryId=N` returns `LearningContent[]` (one row per content file), carrying `id`, `nameChinese`, `nameEnglish`, `fileUrl`, plus the metadata flags `version`, `includeLatex`, `translationDisabled`.
- **File content** — `GET /api/Storage/<subfolder>/<file>` returns the raw JSON for a given `fileUrl`, served by the authenticated `StorageController`.

Category → `LearningContentService` method → backend `Storage/` subfolder:

| ID | Category | File-list method | Content method | Storage subfolder |
|---|---|---|---|---|
| 1 | Vocabulary | `getVocabularyContents()` | `getVocabularyWordContent()` | `learnenglish` |
| 2 | Sentences | `getSentenceContents()` | `getSentenceFileContent()` | `learnenglish` |
| 3 | Listening | `getListeningContents()` | `getListeningFileContent()` | `englishlistening` |
| 4 | Chinese | `getChineseContents()` | `getChineseFileContent()` | `learnchinese` |
| 5 | Formula | `getFormulaContents()` | `getFormulaFileContent()` | `formula` |
| 6 | Knowledge Bank | `getKnowledgeBankContents()` | `getKnowledgeExerciseContent()` | `knowledge-exercises` |

The `Storage/` index files (`data.json` / `formula.json`) and content JSON live in the backend. Schema validation lives in the `knowledgebuilder-content` repo (`npm run validate` runs `util/validate-schema.js`); the local `tools/validate-schema.js` is stale and no longer runs (it targets a removed `public/data/` path).

### Styling

- SCSS for all component styles; component-specific `.scss` files
- **Shared table styles** (`src/styles/_shared-tables.scss`) — global `mat-table` styles imported in `styles.scss`. Defines consistent column widths (`.mat-column-*`), header/cell styling, zebra striping (odd/even rows), row hover, sticky headers, and borders. Component SCSS files should NOT define their own `.mat-column-*` overrides — update the shared file instead.
- **Shared toolbar styles** (`src/styles/_shared-toolbars.scss`) — responsive `mat-toolbar` styles for sub-page toolbars. Three-tier responsive layout: (1) >1200px: normal layout with all items visible; (2) 821-1200px: compact single-row (smaller dropdowns, item count hidden); (3) ≤820px: two-row layout (title on first row, controls wrap to second row, smaller buttons, item count hidden). Use `.page-toolbar-item`/`.toolbar-item` for file selectors and `.toolbar-item-count` for item count spans.
- **Action buttons (project-wide convention)**: one button family per role, so every page reads the same.
  - Page header / toolbar icon action: `<button mat-fab class="toolbar-fab-button">` + `<mat-icon>` only, with BOTH `[matTooltip]` and `aria-label` (no `color` — the theme's default FAB tint).
  - Page header / toolbar labelled action (New Habit, Edit, Back to habits): `mat-fab extended` + `class="toolbar-fab-button"` — the extended FAB keeps the text label (40px tall) and is what `knowledge-exercises` already uses.
  - Repeated action inside a card or a table row: `mat-mini-fab` (icon + tooltip; `color="warn"` for destructive).
  - Overflow menu trigger: `mat-icon-button` + `mat-menu` (unchanged); labelled dropdown menu triggers stay `mat-stroked-button`.
  - Form buttons, wizard Back/Next/Save, dialog OK/Cancel, result-screen `backToList`: stay in the labelled `mat-button` / `mat-flat-button` / `mat-raised-button` family — the exercise pages use exactly these there.
  - `.toolbar-fab-button` spacing and the <=820px FAB shrink live in `src/styles/_shared-toolbars.scss` (single definition, was duplicated in nine component stylesheets); the shrink targets round FABs only, so an extended FAB never loses its label.
- Tailwind CSS utility classes (`tailwind.config.js`)
- **No theme switcher** (removed with the "Mark & Ledger" redesign): one baked azure-blue Material theme (`styles.scss` `$theme` → `mat.all-component-themes`) styles Material components; app-level colors are static literals in `src/styles/_page-colors.scss` (former per-page `*_theme.scss` mixins, deleted). The homepage, navbar, and footer carry a fixed paper/ink/red-pen identity defined in their own component styles (display faces are system fonts — KaiTi/STKaiti + FangSong, Georgia for Latin; see `$font-ledger-*` in `styles/_constants.scss`, no self-hosted font bytes) and render identically everywhere.
- **App shell chrome**: `app.component.html` is `<app-navbar/>` + `<router-outlet/>` + `<app-footer/>` — navbar and footer are persistent single-instance chrome; every routed page renders as a sub-page between them. Navbar: `position: fixed` at the top (~56px; routed pages carry the matching `margin-top: 56px` clearance via `.app-main-content` in `app.component.scss`). Footer: flex-pinned to the viewport bottom inside `app-root`'s `height: 100vh` column (`margin-top: auto` + `flex-shrink: 0` in `footer.scss`) — no hardcoded clearance needed, and pages scroll inside `.app-main-content`, never the window. Do NOT re-add `<app-footer>` to page templates. (At ≤884px the footer switches to a compact form — smaller mark + one wrapped 10px copyright line — so the pinned band stays slim on phones.)
- `ViewEncapsulation.None` used when global styles are needed
- Angular Material for UI components; follow Material Design patterns for accessibility
- Datepicker uses `date-fns` via `@angular/material-date-fns-adapter` (not Moment.js)

### Patterns

- **Standalone components** with `imports` array (no NgModules for feature components)
- **`inject()`** preferred over constructor injection
- **`@Input({ required: true })`** for required inputs
- **RxJS** for observables; prefer `takeUntilDestroyed(this.destroyRef)` for subscription cleanup; `async` pipe in templates when possible. Older code uses manual `OnDestroy` unsubscribes.
- **HTTP caching** in services: `Map<string, DataType[]>` + boolean loaded flags + private cached arrays
- **Filtering**: List pages filter through the actslib `FilterRoot` + free text, JSON-serialized into `MatTableDataSource.filter` and evaluated by a pure per-page matcher (see the vocabulary filter pipeline). Free text is a single case-folded substring check on the vocabulary, Chinese, and translate pages; only the knowledge page splits multi-term input by whitespace. (The former weighted-ranked search — id=8, question=7, tags=6, options=5, answer=4, sort by rank, original-data restore — no longer exists in the code.)
- **Barrel files** (`index.ts`) in `services/` and `interfaces/` for exports
- **Category icons**: every icon that stands for a study destination (Vocabulary, Sentences, Listening, Chinese, Formula, Knowledge Bank, Habits) binds to `NAV_ICON` in `src/app/shared/nav-icons.ts` — the homepage (ledger rows, feature notes, CTA) and the navbar drawer all read from it. The font is the classic Material Icons ligature set (`index.html`), so a glyph name is just a string; add a key there instead of picking an icon in a template.
- **`@HostBinding`** for dynamic class binding on component host
- **`@ViewChild`** with definite assignment (`!`) for template references
- **`ChangeDetectionStrategy.OnPush`** for performance optimization
- **`declare function`** for external functions (e.g., KaTeX `renderMathInElement`)
- **DI tokens for third-party libs**: Howler.js is injected via `HOWLER_GLOBAL` / `HOWL_FACTORY` tokens for testability

### Responsive Layout

The app uses a three-tier responsive layout system with a minimum width of 360px (supports most mobile phones in portrait):

**Navbar (top header bar):**
- **>820px**: the eight destinations are **icon-only at every width** (glyphs from `NAV_ICON`, the same ones the home page ledger and the drawer use), each with the name in `[matTooltip]` + `aria-label`; active route = red icon + inset underline. User name visible >1200px, hidden (tooltip only) at 821-1200px via `.app-navbar-hide-medium`; icon color indicates login status
- **≤820px**: Hamburger menu with slide-out drawer containing all navigation (icon + label)
- The brand anchor still uses the label tiers: `.app-navbar-full-text` (>1200px) / `.app-navbar-short-text` "KHB" (821-1200px) — those two classes now apply to the brand only

**Sub-page toolbars (exercise pages):**
- **>1200px**: Normal layout — title, file selector, item count, action buttons all visible
- **821-1200px**: Compact single-row — smaller file selector, item count hidden
- **≤820px**: Two-row layout — title on first row, controls wrap to second row, smaller action buttons

Use `.toolbar-item-count` for item count spans and `.page-toolbar-item` / `.toolbar-item` for file selectors. (`.app-navbar-full-text` / `.app-navbar-short-text` are left over from the navbar's label-abbreviation tier and now only wrap the brand text — destination links carry no text at any width.)

## Testing

### Framework

- **Vitest** via `@angular/build:unit-test` (default runner)
- **jsdom** environment (configured in `vitest.config.ts`)
- **Globals enabled**: `describe`, `it`, `expect`, `beforeEach`, `vi` available without imports
- **Setup file**: `src/test-setup.ts` — initializes `BrowserTestingModule` + `platformBrowserTesting()`, installs polyfills (ResizeObserver, MutationObserver, matchMedia), stubs KaTeX globals, stubs CDK `HighContrastModeDetector`
- **`tsconfig.spec.json`** extends base config with `"types": ["vitest/globals", "node"]`

### Running tests — use `ng test`, NOT `npx vitest`

**Always run tests via `ng test` (or `npx ng test --watch=false` for CI).** Do NOT run `npx vitest` directly.

The Angular builder (`@angular/build:unit-test`) wires up the Angular Vite plugin that resolves component `templateUrl` and `styleUrls` at test time. Running Vitest directly bypasses this plugin, causing every component-based test to fail with errors like:

```
Component 'FooComponent' is not resolved:
 - templateUrl: ./foo.html
Did you run and wait for 'resolveComponentResources()'?
```

`ng test` routes through the Angular builder, which properly compiles inline and external templates/styles before handing off to Vitest. The full suite (93 spec files, 2229 tests including component, service, dialog, store, and guard tests — all green as of 2026-11-11) passes cleanly this way.

### Patterns

- Use `provideHttpClientTesting()` (from `@angular/common/http/testing`) with `TestBed.configureTestingModule()` — do NOT use the deprecated `HttpClientTestingModule`
- Use `provideHttpClient()` alongside it when the service under test makes HTTP calls
- Get the mock controller: `httpTestingController = TestBed.inject(HttpTestingController)`
- Mock data using `const` variables at the top of spec files
- Test both success and error paths; verify with `httpTestingController.expectOne()` and `req.flush()`
- Test caching behavior (no second request should be made)
- For async tests, use `async`/`await` or Vitest's `waitFor()` — avoid the Jasmine `done` callback pattern
- Mock Howler via `HOWL_FACTORY` and `HOWLER_GLOBAL` tokens (see `audio-service.service.spec.ts`)

## Code Style

### TypeScript Configuration
- Strict mode: `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `moduleResolution: "bundler"`, `esModuleInterop: true`, `skipLibCheck: true`, `useDefineForClassFields: false`
- Angular compiler strict: `strictInjectionParameters`, `strictInputAccessModifiers`, `strictTemplates`
- `enableI18nLegacyMessageIdFormat: false`
- Target ES2022, experimental decorators enabled

### Naming
- PascalCase for classes/interfaces/enums (`QuestionBankTypeEnum`, `LearningContentService`)
- camelCase for variables (`mobileQuery`, `daysleft1`)
- kebab-case for files (`homepage.ts`, `learning-content.service.ts`)
- UPPER_SNAKE_CASE for constants (`VALID_OPTION_KEYS`, `HOWLER_GLOBAL`)
- Private members with underscore prefix (`_mobileQueryListener`, `_queryParamSubscription`)

### Imports
- Group: Angular core → Angular modules → third-party → project imports
- Alphabetical within groups
- Barrel file imports: `import { LearnChineseFileItem } from '../interfaces'`

### Type Safety
- Always define explicit types for function parameters and return values
- Use interfaces for complex data structures, enums for fixed sets
- Leverage TypeScript utility types (`Partial`, `Record`, `Pick`)
- `as const` for enum-like objects; avoid `any` — use `unknown` or specific types

### Error Handling
- `throwError(() => new Error(...))` for RxJS error cases
- Optional chaining (`?.`) and nullish coalescing (`??`) for null safety
- Handle HTTP errors gracefully with proper error messages

## Tools

Located in `tools/`:
- `parse_questions.py` / `parse_questions.ps1` — Question parsing utilities
- `analyze_vocabularies.py` — Vocabulary analysis
- `clean-cet6.js` — CET-6 data cleanup
- `cutmp3.py` / `cutmp3v2.py` — Audio file processing
- `enwordjson2excel.py` — Word data to Excel export
- `find_duplicates.py` — Duplicate detection in data files

`tools/` also holds the raw knowledge-exercise JSON data files (`1-01.json` ... `2-06.json`, the three-digit `1-001`/`1-004`/`1-005.json`, `questions.json`), loose scratch files (`another.py`, `question.txt`, `table.html`), and a Python venv at `tools/.venv/` (self-ignored via its own internal `.gitignore` — never commit it). Tool documentation lives in `docs/util-tools.md`.

Other docs in `docs/`: `data-models.md` (the data-model reference), `authentication-flow.md`, `vocabulary-exercises-architecture.md` (the as-built vocabulary-page design — container/store/screen/dialog structure, filter pipeline, ratings, and the worksheet-generation & print-rendering flow, which supersedes the former `vocabulary-print.md`), `vocabulary-page-review.md` (code-review findings & fix status), `chinese-print.md` (Chinese print/format notes), `design-habit-ui.md` and `testing-habit-ui.md` (habit tracker design & testing), `reusable-filter-dialog-design.md` / `filter-hierarchy-contract.md` / `filter-dialog-review.md` (shared filter dialog: design, contract, review), `knowledge-chinese-pages-review.md`, and `material-dialog-sizing.md`.

> **Note:** `validate-schema.js`, `exercise-schema.json`, and `exercise-validation-report.md` are legacy/stale — they target a removed `public/data/knowledge-exercises/` path. Schema validation now lives in the `knowledgebuilder-content` repo (`util/validate-schema.js`, run via `npm run validate`).

## Deprecations to Avoid

- ❌ `BrowserDynamicTestingModule` / `platformBrowserDynamicTesting` from `@angular/platform-browser-dynamic/testing` — use `BrowserTestingModule` / `platformBrowserTesting` from `@angular/platform-browser/testing`
- ❌ `HttpClientTestingModule` — use `provideHttpClientTesting()` provider function
- ❌ `TestBed.get(Token)` — use `TestBed.inject(Token)`
- ❌ `@angular/http` (legacy) — use `@angular/common/http`
- ❌ `toPromise()` on Observables — use `firstValueFrom()` / `lastValueFrom()`
- ❌ `Renderer` — use `Renderer2`
- ❌ `ViewEncapsulation.Native` — use `ViewEncapsulation.ShadowDom`
- ❌ `entryComponents` — removed in Angular 13+; not needed with standalone components
- ❌ Class-based route guards (`canActivate: [MyGuard]`) — prefer functional guards (`canActivate: [myGuardFn]`) for NEW guards. Sanctioned exception: `AuthGuardService` deliberately keeps its stateful class form (per-instance redirect cooldown + waiting for the initial auth check to settle) — do not convert it, and do not add new stateful-class guards
- ❌ `npx vitest run` to run tests — use `ng test` instead (see Testing section). Direct Vitest invocation skips the Angular Vite plugin and breaks `templateUrl`/`styleUrls` resolution.

## Git Workflow

- Never commit unless explicitly requested by user
- Check git status and diff before committing
- Verify build/test success before committing
- Never commit secrets
