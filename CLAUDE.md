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
    shared/           # Reusable components, directives, theme/style-manager
    services/         # Injectable services (learning-content, audio, auth, rating, AI, UI, util, katex, marked, user-code)
    interfaces/       # TypeScript interfaces, enums, and data models
  assets/
    data/i18n/        # Transloco translation files (en.json, zh-CN.json)
  environments/       # environment.ts (dev) and environment.prod.ts
  test-setup.ts       # Vitest setup: test env init, polyfills, global stubs
public/
  font/               # Font assets
  sounds/             # Sound-effect audio clips
  favicon.png / favicon.svg
docs/                 # Architecture/design notes (data-models.md is the data-model reference)
tools/                # Validation scripts, schema, converters (Python, JS, PowerShell), raw exercise JSON
```

### Routing (`app.routes.ts`)

All routes are lazy-loaded via `loadComponent` / `loadChildren`:
- `/` → Homepage
- `/signin-callback` → OIDC signin callback (post-IDP-redirect landing, unguarded)
- `/vocabulary` → Vocabulary exercises
- `/translating` → Translation exercises
- `/listening` → English listening
- `/chinese` → Chinese exercises (child routes via `chinese-exercises.routes.ts`)
- `/formula` → Formula recites
- `/knowledge` → Knowledge exercises (child routes: list + `displayv2`)
- `/signin-callback` → OIDC sign-in callback (public)
- `/user-detail` → User detail
- `/404` → Not found (`**` catch-all redirects here)

All exercise routes (`/vocabulary`, `/translating`, `/listening`, `/chinese`, `/formula`, `/knowledge`) plus `/user-detail` are wrapped in `canActivate: [AuthGuardService]` (OIDC; see the parent `CLAUDE.md` shared auth contract).

### Key Services

- **LearningContentService** — Central data loading service. Fetches the file list for every category (Vocabulary, Sentences, Listening, Chinese, Formula, Knowledge Bank) from the `api/LearningContents` endpoint and loads each file's content via the authenticated `api/Storage` controller. HTTP responses are cached per category/fileUrl. `LearningContent` records also carry `version`, `includeLatex`, and `translationDisabled` metadata, so no separate index-file load is needed.
- **AudioService** — Audio playback via Howler.js (`playSound()`), plus word pronunciation via the browser Web Speech API (`speakWord()`, with a voice cache). Uses DI tokens for testability: `HOWLER_PROVIDER` (global Howler), `HOWL_FACTORY` (Howl instance factory).
- **KaTeXService** — Math formula rendering.
- **MarkedService** — Markdown parsing.
- **AiService** — AI integration for learning assistance.
- **AuthService / AuthGuardService / AuthInterceptor** (`auth.service.ts`, `auth-guard.service.ts`, `auth.interceptor.ts`) — OIDC authentication via `angular-auth-oidc-client` against `acidserver`. The functional guard protects all exercise routes; the interceptor attaches tokens to API calls.
- **LearningRatingService** — Per-user learning ratings, persisted server-side via the rating API, with per-content in-memory caching.
- **UtilService** — General utilities.
- **UiService** — UI utilities.
- **UserCodeService** — Tracks user-entered access codes.
- **AppPageTitle** (`pages/page-title/`) — Sets page-level browser title via `@angular/platform-browser` `Title` service, with environment-configured suffix.

### Vocabulary Exercises Page Architecture (`pages/vocabulary-exercises/`)

Decomposed into a container component, presentational children, and three signal stores (see `docs/vocabulary-page-architecture-refactor-plan.md`):

- **`VocabularyExercisesComponent`** - the container. Owns a `mode` signal (`'list' | 'review' | 'spelling' | 'spellingresult' | 'quiz' | 'quizresult'`); the template renders exactly one screen via `@switch`, so screen components are created/destroyed on transition. Owns file loading, the shared `MatTableDataSource`/`SelectionModel`, word-queue preparation (filters → shuffle → cap via `prepareWordQueue()`), and all dialog orchestration: dialogs open via `MatDialog`, and `afterClosed()` is piped through `takeUntilDestroyed(destroyRef)`; an `undefined` result (Cancel/backdrop/Esc) leaves state untouched.
- **`VocabularyExercisesWordListComponent`** - the presentational list screen. Receives the container's shared dataSource/selection/signals as inputs and forwards user intents as outputs; wires its template's paginator/sort onto the shared dataSource via `@ViewChild` setters.
- **Signal stores** - `ReviewSessionStore` (queue, cursor, auto-mode interval, per-word `ratingMap`, progress computeds), `SpellingSessionStore` (queue, per-letter reveal state, results), and `QuizSessionStore` (single-choice question queue, per-question answer state, results). Plain `@Injectable()` classes (no state library), provided in the container's `providers` so the container and session screens share one instance per page instance. They are imported directly, not via the barrel.
- **Session screens** - `review-session`, `spelling-session`, `spelling-result`, `quiz-session`, and `quiz-result` components inject their store directly (no state inputs) and each registers a `document:keyup` `@HostListener`, so keystroke handling only lives while that screen is mounted.
- **Dialogs** - one mode-driven select dialog (By Count / Free Selection / By Word), plus `reviewoptions`, `spellingoptions`, `worksheetoptions`, `quizoptions`, and the **shared** `filter` dialog (`src/app/shared/filter-dialog/` — `SharedFilterDialogComponent`, design in `docs/reusable-filter-dialog-design.md`), opened with the page's `VOCABULARY_FILTER_PROPERTIES` schema and an actslib `IFilterDefinition` seed; Submit returns the edited definition, Cancel/backdrop/Esc return `undefined`. It is a project-wide component (all four list pages — vocabulary, knowledge, Chinese and translate — now filter through it, each with its own `*_FILTER_PROPERTIES` schema), not a vocabulary-page file. Options dialogs round-trip `currentSettings` so reopening shows the last picks.
- **Filter pipeline** - free-text + the actslib **`IFilterDefinition`** (word/rating conditions in AND/OR-joined, nestable groups, produced directly by the shared dialog — no page-side tree model or translation step) combine into a `VocabularyListFilter` (`interfaces/vocabulary.ts`), serialized as JSON into `MatTableDataSource.filter`; the row predicate delegates to the pure `matchVocabularyListFilter()` (closing over the rating map), which runs `FilterUtility.MatchFilter` against a case-folded target `{ enword, cnword, rating }` (string condition values are folded by each property's `prepareValue` at dialog emit time; free-text stays a hand-written cross-field check). After async rating loads, re-assign `dataSource.filter = dataSource.filter` to force re-filtering.
- **Ratings** - list ratings live in a `contentRatingMap` signal; the review store captures only server-confirmed ratings and returns them on `quit()`, which the container merges back into the map. Temporary (uploaded) content gets a synthetic `LearningContent` with a negative id, and rating calls are disabled for it.
- **Quiz exercise** - the Exercises-menu Quiz item reuses the shared word-queue selection (table selection, else filter + `prepareWordQueue`), then builds single-choice questions via the pure `buildVocabularyQuizQuestions()` (`interfaces/vocabulary.ts`): EN word -> pick the CN explanation among 4 candidates (`en2cn`), or CN explanation -> pick the EN word (`cn2en`). Distractors come from the visible (filtered) rows, deduplicated by displayed text; questions that cannot gather one distinct alternative are skipped.

### Internationalization (Transloco)

- Library: `@jsverse/transloco` (v8+)
- Config: `transloco-root.module.ts` exports `provideTranslocoStandalone()` used in `app.config.ts`
- Languages: `en` (default), `zh-CN`
- Translation files: `src/assets/data/i18n/{en,zh-CN}.json`
- Usage in templates: `{{ t('key') }}` via `TranslocoModule` import; in components: `inject(TranslocoService)`

### Data Models

See document 'docs/data-models.md'.


### Content Data

All exercise content is served by the `aclearningutil` backend (see the parent `CLAUDE.md`). The frontend never reads local JSON files — every category goes through `LearningContentService`:

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
- Tailwind CSS utility classes (`tailwind.config.js`)
- Theme system with color palettes (rose-red, azure-blue, sunshine-coral, forest-green)
- `ViewEncapsulation.None` used when global styles are needed
- Theme files prefixed with underscore (e.g., `_homepage-theme.scss`)
- Angular Material for UI components; follow Material Design patterns for accessibility
- Datepicker uses `date-fns` via `@angular/material-date-fns-adapter` (not Moment.js)

### Patterns

- **Standalone components** with `imports` array (no NgModules for feature components)
- **`inject()`** preferred over constructor injection
- **`@Input({ required: true })`** for required inputs
- **RxJS** for observables; prefer `takeUntilDestroyed(this.destroyRef)` for subscription cleanup; `async` pipe in templates when possible. Older code uses manual `OnDestroy` unsubscribes.
- **HTTP caching** in services: `Map<string, DataType[]>` + boolean loaded flags + private cached arrays
- **Filtering**: Multi-term search by whitespace split, weighted field ranking (id=8, question=7, tags=6, options=5, answer=4), sort by ranking descending, store original data separately for empty filter restore
- **Barrel files** (`index.ts`) in `services/` and `interfaces/` for exports
- **`@HostBinding`** for dynamic class binding on component host
- **`@ViewChild`** with definite assignment (`!`) for template references
- **`ChangeDetectionStrategy.OnPush`** for performance optimization
- **`declare function`** for external functions (e.g., KaTeX `renderMathInElement`)
- **DI tokens for third-party libs**: Howler.js is injected via `HOWLER_PROVIDER` / `HOWL_FACTORY` tokens for testability

### Responsive Layout

The app uses a three-tier responsive layout system with a minimum width of 360px (supports most mobile phones in portrait):

**Navbar (top header bar):**
- **>1200px**: Full labels (Vocabulary, Sentences, etc.), user name visible
- **821-1200px**: Abbreviated labels (Voc, Sent, Listen, 中, Form, KB), user name hidden (tooltip only), icon color indicates login status
- **≤820px**: Hamburger menu with slide-out drawer containing all navigation

**Sub-page toolbars (exercise pages):**
- **>1200px**: Normal layout — title, file selector, item count, action buttons all visible
- **821-1200px**: Compact single-row — smaller file selector, item count hidden
- **≤820px**: Two-row layout — title on first row, controls wrap to second row, smaller action buttons

Use `.app-navbar-full-text` / `.app-navbar-short-text` for navbar labels, `.toolbar-item-count` for item count spans, and `.page-toolbar-item` / `.toolbar-item` for file selectors.

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

`ng test` routes through the Angular builder, which properly compiles inline and external templates/styles before handing off to Vitest. The full suite (44 spec files, ~1400 tests including component, service, dialog, store, and guard tests) passes cleanly this way.

### Patterns

- Use `provideHttpClientTesting()` (from `@angular/common/http/testing`) with `TestBed.configureTestingModule()` — do NOT use the deprecated `HttpClientTestingModule`
- Use `provideHttpClient()` alongside it when the service under test makes HTTP calls
- Get the mock controller: `httpTestingController = TestBed.inject(HttpTestingController)`
- Mock data using `const` variables at the top of spec files
- Test both success and error paths; verify with `httpTestingController.expectOne()` and `req.flush()`
- Test caching behavior (no second request should be made)
- For async tests, use `async`/`await` or Vitest's `waitFor()` — avoid the Jasmine `done` callback pattern
- Mock Howler via `HOWL_FACTORY` and `HOWLER_PROVIDER` tokens (see `audio-service.service.spec.ts`)

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
- UPPER_SNAKE_CASE for constants (`VALID_OPTION_KEYS`, `HOWLER_PROVIDER`)
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

`tools/` also holds the raw knowledge-exercise JSON data files (`1-01.json` ... `2-06.json`, `questions.json`) and a Python venv at `tools/.venv/` (self-ignored via its own internal `.gitignore` — never commit it). Tool documentation lives in `docs/util-tools.md`.

Other docs in `docs/`: `data-models.md` (the data-model reference), `authentication-flow.md`, `vocabulary-exercises-architecture.md` (the as-built vocabulary-page design — container/store/screen/dialog structure, filter pipeline, ratings, and the worksheet-generation & print-rendering flow, which supersedes the former `vocabulary-print.md`), `vocabulary-page-review.md` (code-review findings & fix status), and `chinese-print.md` (Chinese print/format notes).

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
- ❌ Class-based route guards (`canActivate: [MyGuard]`) — use functional guards (`canActivate: [myGuardFn]`)
- ❌ `npx vitest run` to run tests — use `ng test` instead (see Testing section). Direct Vitest invocation skips the Angular Vite plugin and breaks `templateUrl`/`styleUrls` resolution.

## Git Workflow

- Never commit unless explicitly requested by user
- Check git status and diff before committing
- Verify build/test success before committing
- Never commit secrets
