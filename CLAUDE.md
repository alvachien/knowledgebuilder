# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**alvachien.com** is an Angular 21 AI-powered learning platform for English, Chinese, and Knowledge Bank exercises. Built with Angular CLI 21.1.2. The app is fully standalone (no NgModules for feature code) and uses `@jsverse/transloco` for i18n (English + Chinese).

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
ng test --include "src/app/services/storage.service.spec.ts"  # Single test file
ng test --exclude "**/*.extended.spec.ts"   # Exclude files by glob
ng test --filter "StorageService"        # Filter tests by name regex
ng lint                                  # Lint (ESLint via @angular-eslint)
ng generate component component-name     # Generate component (uses SCSS)
ng generate service service-name         # Generate service
```

## Code Architecture

### App Structure

```
src/
  app/
    pages/            # Feature page components (routed views, lazy-loaded)
    shared/           # Reusable components, directives, theme/style-manager
    services/         # Injectable services (audio, storage, AI, UI, util, katex, marked, user-code)
    interfaces/       # TypeScript interfaces, enums, and data models
  assets/
    data/i18n/        # Transloco translation files (en.json, zh-CN.json)
  environments/       # environment.ts (dev) and environment.prod.ts
  test-setup.ts       # Vitest setup: test env init, polyfills, global stubs
public/
  data/               # Static JSON exercise data served at /data/
tools/                # Validation scripts, schema, converters (Python, JS, PowerShell)
```

### Routing (`app.routes.ts`)

All routes are lazy-loaded via `loadComponent` / `loadChildren`:
- `/` → Homepage
- `/vocabulary` → Vocabulary exercises
- `/translating` → Translation exercises
- `/listening` → English listening
- `/chinese` → Chinese exercises (child routes via `chinese-exercises.routes.ts`)
- `/formula` → Formula recites
- `/knowledge` → Knowledge exercises (child routes: list + `displayv2`)
- `/404` → Not found (`**` catch-all redirects here)

### Key Services

- **StorageService** — Central data loading service with HTTP response caching via Maps. Loads JSON exercise data from `public/data/`.
- **AudioService** — Audio playback via Howler.js. Uses DI tokens for testability: `HOWLER_PROVIDER` (global Howler), `HOWL_FACTORY` (Howl instance factory).
- **KaTeXService** — Math formula rendering.
- **MarkedService** — Markdown parsing.
- **AiService** — AI integration for learning assistance.
- **UiService** — UI utilities.
- **UserCodeService** — Tracks user-entered access codes.
- **AppPageTitle** (`pages/page-title/`) — Sets page-level browser title via `@angular/platform-browser` `Title` service, with environment-configured suffix.

### Internationalization (Transloco)

- Library: `@jsverse/transloco` (v8+)
- Config: `transloco-root.module.ts` exports `provideTranslocoStandalone()` used in `app.config.ts`
- Languages: `en` (default), `zh-CN`
- Translation files: `src/assets/data/i18n/{en,zh-CN}.json`
- Usage in templates: `{{ t('key') }}` via `TranslocoModule` import; in components: `inject(TranslocoService)`

### Data Models

- **QuestionBank** (`interfaces/questionbank.ts`) — Enums for question types (`QuestionBankTypeEnum`), content formats, option keys, and item levels.
- **QuestionBankItemBase** (`interfaces/questionbank-base.ts`) — Abstract base class for all question types. Concrete implementations: `QuestionBankItemSingleChoice`, `QuestionBankItemMultipleChoice`, `QuestionBankItemFillInTheBlank`, `QuestionBankItemDictation`, `QuestionBankItemShortAnswer`, `QuestionBankItemEssay`, `QuestionBankItemReadingComprehension`, `QuestionBankItemListeningComprehension`, `QuestionBankItemCloze`, `QuestionBankItemTrueFalse`.
- **convertToQuestionBankItem()** — Converts `QuestionBankItemCombinedInterface` (raw JSON) to concrete `QuestionBankItemBase` instances.
- **KnowledgeExerciseFile** (`interfaces/questionbank-base.ts`) — File metadata for knowledge exercises. Has `id?: number` (populated from API's `LearningContent.id`), `name`, `file`, `version`, `includeLatex`. The component merges data from the API (`id`, `name`, `file`) with `StorageService.getKnowledgeExerciseFile()` metadata (`includeLatex`).

### Content Data

Static JSON data lives in `public/data/`:
- `knowledge-exercises/` — Schema-validated exercise files (validated by `tools/validate-schema.js` against `tools/exercise-schema.json`)
- `englishlistening/` — Listening exercise audio and data
- `learnchinese/` — Chinese learning content
- `learnenglish/` — English learning content (sentences, vocabulary)
- `formula/` — Formula recitation data

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
- **RxJS** for observables; `async` pipe in templates when possible; manual subscriptions must unsubscribe in `OnDestroy`
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

`ng test` routes through the Angular builder, which properly compiles inline and external templates/styles before handing off to Vitest. The full suite (37 spec files, 1188 tests including component, service, dialog, and guard tests) passes cleanly this way.

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
- PascalCase for classes/interfaces/enums (`QuestionBankTypeEnum`, `StorageService`)
- camelCase for variables (`mobileQuery`, `daysleft1`)
- kebab-case for files (`homepage.ts`, `storage.service.ts`)
- UPPER_SNAKE_CASE for constants (`VALID_OPTION_KEYS`, `HOWLER_PROVIDER`)
- Private members with underscore prefix (`_mobileQueryListener`, `_queryParamSubscription`)

### Imports
- Group: Angular core → Angular modules → third-party → project imports
- Alphabetical within groups
- Barrel file imports: `import { LearnChineseDataFile } from '../interfaces'`

### Type Safety
- Always define explicit types for function parameters and return values
- Use interfaces for complex data structures, enums for fixed sets
- Leverage TypeScript utility types (`Partial`, `Record`, `Pick`)
- `as const` for enum-like objects; avoid `any` — use `unknown` or specific types

### Error Handling
- `throwError(() => new Error(...))` for RxJS error cases
- Optional chaining (`?.`) and nullish coalescing (`??`) for null safety
- Handle HTTP errors gracefully with proper error messages

## Documentation

- `docs/knowledge-exercises-sequence.md` — Mermaid sequence diagrams for the Knowledge Exercises feature (initialization, file selection, rating, preview flows). Includes the original buggy approach for historical reference.

## Tools

Located in `tools/`:
- `validate-schema.js` — Validates exercise JSON files against schema: `node tools/validate-schema.js`
- `exercise-schema.json` — JSON Schema for knowledge exercises (2020-12 draft)
- `exercise-validation-report.md` — Validation results report
- `parse_questions.py` / `parse_questions.ps1` — Question parsing utilities
- `analyze_vocabularies.py` — Vocabulary analysis
- `clean-cet6.js` — CET-6 data cleanup
- `cutmp3.py` / `cutmp3v2.py` — Audio file processing
- `enwordjson2excel.py` — Word data to Excel export
- `find_duplicates.py` — Duplicate detection in data files

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
