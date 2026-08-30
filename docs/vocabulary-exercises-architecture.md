# Vocabulary Exercises Page — Architecture Design

Date: 2026-08-22
Scope: `src/app/pages/vocabulary-exercises/` — the `/vocabulary` route, an Angular 22 standalone feature page.

This document describes the **as-built** architecture of the vocabulary exercises page after the `feat/voc-refactor` decomposition. It is the design reference for the page's container/store/screen/dialog structure, the filter pipeline, the rating lifecycle, keyboard handling, and the data models that cross those boundaries — including the **Worksheet** exercise's generation and print-rendering flow (§15), which merges and supersedes the former `vocabulary-print.md` with corrected terminology (the feature is *worksheet* throughout; *print* is reserved for the genuine browser-print mechanics). For the line-by-line review findings and their fix status, see [`vocabulary-page-review.md`](./vocabulary-page-review.md); for the data-model field reference, see [`data-models.md`](./data-models.md).

---

## 1. Design goals

The page is a single route (`/vocabulary`, `canActivate: [AuthGuardService]`) that supports four study modes over one loaded word file: **Review** (flashcard auto-play), **Spelling** (letter-by-letter typing), **Quiz** (single-choice EN↔CN), and **Worksheet** (printable fill-in-the-blank, handed off to the knowledge-display page). Over the same file the user can also filter, sort, select, and rate words.

The decomposition targets four concerns:

1. **One source of truth per concern.** The container owns cross-cutting state (file list, table data source, selection, rating map, applied filters, the active screen). Each study mode owns its own session state in a dedicated signal store. The list screen is purely presentational.
2. **Screen isolation.** Exactly one screen is mounted at a time via `@switch`; session screens are created/destroyed on transition, so keyboard listeners and per-session subscriptions live only while their screen is mounted.
3. **Pure, testable helpers.** All filtering and question building lives in pure exported functions (`interfaces/vocabulary.ts`), and shuffling comes from actslib (`FisherYatesShuffle`) — no Angular dependencies, so they are unit-tested directly. `shared/utils/shuffle.ts` retains only `pickWeighted` (weighted cloze distractor picks).
4. **Round-trip-stable dialogs.** Options dialogs round-trip `currentSettings` so reopening shows the last picks; filter dialogs clone their seed so Cancel cannot mutate the caller's state.

---

## 2. Component tree

```
VocabularyExercisesComponent (container)
│  providers: [VocabularySpellingSessionStore, VocabularyReviewSessionStore, VocabularyQuizSessionStore]
│  owns: dataSource, selection, contentRatingMap, filters, mode
│
├─ @switch (mode()) ─────────────────────────────────────────────
│   │
│   ├─ 'list' (default) ─► VocabularyExercisesWordListComponent
│   │                        inputs:  allFiles, selectedFile, dataSource, selection,
│   │                                 contentRatings, ratingsEnabled, filterDefinition,
│   │                                 appliedFreeText, isLoadingContents
│   │                        outputs: fileSelectionChanged, freeTextChanged, defineFilter,
│   │                                 clearFilter,
│   │                                 quickSelect, allRowsToggled, contentRatingChanged,
│   │                                 review, worksheet, spelling, quiz,
│   │                                 downloadTemplate, addFileClick, tempFileSelected
│   │
│   ├─ 'review' ───────► VocabularyExercisesReviewSessionComponent
│   │                        injects: VocabularyReviewSessionStore  (shared w/ container)
│   │                        input: hideExplain    output: quit
│   │
│   ├─ 'spelling' ─────► VocabularyExercisesSpellingSessionComponent
│   │                        injects: VocabularySpellingSessionStore (shared w/ container)
│   │                        input: hideExplain    output: quit
│   │
│   ├─ 'spellingresult' ► VocabularyExercisesSpellingResultComponent
│   │                        injects: VocabularySpellingSessionStore
│   │                        output: backToList
│   │
│   ├─ 'quiz' ─────────► VocabularyExercisesQuizSessionComponent
│   │                        injects: VocabularyQuizSessionStore   (shared w/ container)
│   │                        output: quit
│   │
│   └─ 'quizresult' ───► VocabularyExercisesQuizResultComponent
│                            injects: VocabularyQuizSessionStore
│                            output: backToList
│
└─ dialogs (opened by the container via MatDialog, only while 'list' is active)
    ├─ VocabularySelectDialogComponent          (mode-driven: By Count / Free Selection / By Word)
    ├─ VocabularyExercisesReviewOptionsDialogComponent
    ├─ VocabularyExercisesSpellingOptionsDialogComponent
    ├─ VocabularyExercisesQuizOptionsDialogComponent
    ├─ VocabularyExercisesWorksheetOptionsDialogComponent
    └─ SharedFilterDialogComponent (src/app/shared/filter-dialog, schema-driven)
```

The container's `mode` signal is the screen router. It has six values:

```ts
export type VocabularyExercisesMode =
  'list' | 'review' | 'spelling' | 'spellingresult' | 'quiz' | 'quizresult';
```

The template renders exactly one screen:

```html
@switch (mode()) {
  @case ('review')         { <app-vocabulary-exercises-review-session ...> }
  @case ('spelling')       { <app-vocabulary-exercises-spelling-session ...> }
  @case ('spellingresult') { <app-vocabulary-exercises-spelling-result ...> }
  @case ('quiz')           { <app-vocabulary-exercises-quiz-session ...> }
  @case ('quizresult')     { <app-vocabulary-exercises-quiz-result ...> }
  @default                 { <app-vocabulary-exercises-word-list ...> }   <!-- 'list' -->
}
```

Because `@switch` destroys the screen it leaves, a session screen's `@HostListener('document:keyup'/'document:keydown')` is registered only while that screen is mounted — there is no global key handler leaking across screens.

---

## 3. Container — `VocabularyExercisesComponent`

File: `vocabulary-exercises.component.ts` · template: `vocabulary-exercises.component.html`

The container is the single source of truth for cross-cutting state and the orchestrator of all dialog flows and screen transitions. It does **not** own session state — that lives in the three stores, which it `provide`s in its `providers` array so the container and its session screens share one instance per page instance:

```ts
@Component({
  // ...
  providers: [VocabularySpellingSessionStore, VocabularyReviewSessionStore, VocabularyQuizSessionStore],
})
```

### 3.1 State

| Field | Kind | Purpose |
|---|---|---|
| `allFiles` | `signal<LearningContent[]>` | File list from `getVocabularyContents()`. |
| `selectedFile` | `signal<LearningContent \| undefined>` | Currently selected file. |
| `isLoadingContents` | `signal(true)` | File-list loading spinner state. |
| `mode` | `signal<VocabularyExercisesMode>('list')` | Active screen (the router). |
| `dataSource` | `MatTableDataSource<LearnEnglishWordFileItem>` | Shared table source; its `sort`/`paginator` are wired by the word-list child (where those elements live). |
| `selection` | `SelectionModel<LearnEnglishWordFileItem>(true, [])` | Shared selection; read by both the word-list and queue prep. |
| `contentRatingMap` | `signal(new Map<number, number>())` | Per-itemId rating for the loaded file. Replaced (not mutated) on every update so OnPush consumers see a new reference. |
| `freeText` | `signal('')` | Live free-text filter term. |
| `filterDefinition` | `signal<IFilterDefinition>` | The actslib condition definition from the shared filter dialog (word/rating leaves in AND/OR-joined groups); starts at `emptyVocabularyFilterDefinition()`. |
| `listFilterCriteria` | `private VocabularyListFilter \| null` | Parsed form of the active filter; kept in sync with `dataSource.filter` so the row predicate does not `JSON.parse` per row. `null` = no filter. |
| `studyContentId` | `number` | Backend `ContentId` of the loaded file. Temp uploads get a **negative** id, which disables every `studyContentId > 0` rating guard. |
| `reviewSetting` / `spellingSetting` / `quizSetting` / `worksheetSetting` | option objects | Persisted settings round-tripped by the options dialogs. |
| `fileLoadToken` | `private number` | Monotonic token for last-click-wins file loads. |
| `pendingContentRatings` | `private Map<number, number>` | Latest requested rating per item; drops stale upsert responses. |
| `isDestroyed` | `private boolean` | Guards the `FileReader.onload` callback (which has no `takeUntilDestroyed`) from writing to a destroyed component. |

### 3.2 File loading

`ngOnInit` calls `contentService.getVocabularyContents()` (subscribed via `takeUntilDestroyed(destroyRef)`) to populate `allFiles`.

`onFileSelectionChanged(event: MatSelectChange)` loads a selected file's content and ratings. It is the most concurrency-sensitive method on the page:

1. Clears `selection` and `pendingContentRatings` (stale row references from the previous file would otherwise leak into the next session).
2. Captures a fresh `fileLoadToken` (`++this.fileLoadToken`).
3. **Clears `contentRatingMap` before subscribing to content** — cached content resolves synchronously, so without this the new file's rows would be filtered against the previous file's ratings.
4. Subscribes to `getVocabularyWordContent(fileUrl)`; the `next` handler **returns early if `token !== this.fileLoadToken`** (a newer selection or temp upload superseded this load).
5. In parallel, if `studyContentId > 0`, subscribes to `ratingService.getRatings(studyContentId)`; same token guard, then builds a new `Map` and reassigns `contentRatingMap`. If a filter is active, re-runs the predicate by reassigning `dataSource.filter = dataSource.filter` (the filter string is unchanged, but the predicate closes over `contentRatingMap`).
6. The error paths (content load failure, ratings load failure) mirror the success paths: token-guarded, and they clear/rerun as appropriate so a failed load never leaves the previous file's rows rated under a new `studyContentId` (which would persist ratings into the wrong file).

### 3.3 Temp-file upload

`onAddTempFile(event)` reads a user-picked JSON file via `FileReader`, validates the schema inline (array of `{ enword, cnword }` objects, `enword` longer than one character, length and item-count caps), and registers it through `contentService.addTemporaryContent(tempFileUrl, arwords)`. It synthesizes a `LearningContent` with `id: -(Date.now())` (negative → rating disabled), appends it to `allFiles`, selects it, and sets `dataSource.data`. The `isDestroyed` flag stops the `onload` callback from mutating a gone component (the callback has no `takeUntilDestroyed`). `inputElement.value` is reset immediately so re-picking the same (e.g. corrected) file fires `change` again.

### 3.4 Queue preparation — `prepareWordQueue`

Shared by Review, Spelling, Worksheet, and Quiz. The contract: **explicit table selection bypasses capping; otherwise the visible (filtered) rows are shuffled and capped to `countOfItems`**.

```ts
private prepareWordQueue<T>(items: T[], options: VocabularyOptionCore): T[] {
  let queues = items;
  if (queues.length > options.countOfItems) {
    queues = FisherYatesShuffle(queues);   // actslib; returns a NEW array; input not mutated
    queues = queues.slice(0, options.countOfItems);
  }
  return queues;
}
```

Each exercise's `on…Core()` method follows the same shape:

- **Review** (`onReviewCore`): selection → shuffle; else `prepareWordQueue(getVisibleData(), reviewSetting)`. Maps rows to `ReviewQueueItem` (carrying `itemId` for rating persistence). Calls `reviewStore.start(queue, disableVoice, studyContentId)`; on `true`, `mode.set('review')`.
- **Spelling** (`onSpellingStart`): same selection/`prepareWordQueue` logic over `coverContentToQueue(...)` (rows → `VocabularySpellingQueue`). `spellingStore.start(items, disableVoice)` → `mode.set('spelling')`.
- **Quiz** (`onQuizStart`): builds the question queue via `prepareWordQueue`, then `buildVocabularyQuizQuestions(sourceItems, pool, direction)` where `pool` is the visible rows (fallback to whole file if a stale selection outlived its filter). `quizStore.start(questions)` → `mode.set('quiz')`.
- **Worksheet** (`onNewWorksheetCore`): builds `KnowledgeExerciseFileContent` fill-in-the-blank items, packs a `KnowledgeExercisePrintOption`, hands them to `uiService.setSelectedExerciseItem(...)`, and navigates to `/knowledge/displayv2` (a different page). See §15 for the full flow, the renderer, and blank-length behavior.

`getVisibleData()` returns `dataSource.filteredData` when a filter is active, else `dataSource.data.slice()` — so the filter bar always describes what the exercises use.

### 3.5 Screen transitions

Mode is set imperatively by the container, not by the stores (the stores cannot switch screens). Two `effect()`s in the constructor watch for completion:

```ts
effect(() => { if (this.spellingStore.isComplete() && this.mode() === 'spelling') this.mode.set('spellingresult'); });
effect(() => { if (this.quizStore.isComplete()   && this.mode() === 'quiz')      this.mode.set('quizresult');   });
```

Quitting returns to `'list'` and resets the store:

```ts
onQuitReview()   { merge confirmed ratings back into contentRatingMap; mode.set('list'); }
onQuitSpelling() { spellingStore.reset(); mode.set('list'); }
onQuitQuiz()     { quizStore.reset();     mode.set('list'); }
```

### 3.6 Dialog orchestration

Every dialog is opened with `MatDialog.open(...)` and its `afterClosed()` is piped through `takeUntilDestroyed(this.destroyRef)`. The uniform contract: **`undefined` (Cancel / backdrop / Esc) leaves state untouched; a defined result is applied.**

```ts
dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
  if (result !== undefined) { /* apply */ }
});
```

Each options dialog receives `{ wordQueueCount, withSelection, currentSettings }` (worksheet adds `title`); each filter dialog receives the current conditions array as `MAT_DIALOG_DATA`. The select dialog receives `{ mode, rowCount, visibleWords }` for in-dialog validation.

---

## 4. Signal stores

Three `@Injectable()` classes (intentionally **not** `providedIn: 'root'` — the container `provide`s them so the session and result screens share one instance scoped to the page). State is signal-based: no manual change-detection nudges. They are imported directly, not via the barrel.

### 4.1 `VocabularyReviewSessionStore`

File: `vocabulary-exercises-review-session.store.ts`

State and behavior of one review (flashcard) session: the word queue, cursor, auto-play timer, per-word ratings with their load/save lifecycle.

| Signal | Type | Notes |
|---|---|---|
| `queue` | `signal<ReviewQueueItem[]>` | The study queue. |
| `cursor` | `signal(0)` | Index into `queue`. |
| `isAutoMode` | `signal(false)` | Auto-advance active; disables prev/next. |
| `autoModeSeconds` | `signal(5)` | Seconds per word (toolbar edits). |
| `progress` | `computed` | `(cursor+1)/queue.length * 100`, `0` when empty. |
| `isPreviousDisabled` / `isNextDisabled` | `computed` | Boundary guards. |
| `currentItem` | `computed` | `queue[cursor]` or a stable `EMPTY_ITEM`. |

Private: `disableVoice`, `contentId` (0 disables rating calls), `ratingMap` (server-confirmed ratings, keyed by itemId), `autoModeSubscription`, `ratingSubscriptions[]` (in-flight load/save, cancelled in `reset()`), `userRatedItemIds` (items the user rated this session — a late preload must not overwrite them).

**Methods:**
- `start(items, disableVoice, contentId): boolean` — resets, returns `false` (no-op) for an empty queue, else sets state, speaks the first word, and preloads ratings (skipping `userRatedItemIds`). Queue slots are replaced with copies (not mutated) so OnPush consumers see new references.
- `previous()` / `next()` — move cursor, speak.
- `enableAutoMode()` — restart from word 0, run `interval(seconds*1000)` → `autoAdvance()`, self-stop at the last word.
- `setAutoModeSeconds(n)` — swap a running timer immediately; ignore invalid values.
- `rateCurrent(value)` — validate 1–5, remember the itemId in `userRatedItemIds`, update the queue slot, `saveRating(...)`.
- `setRatingFromToggle(event)` — handle the toggle-group's deselect (value `undefined` → restore the group value; no "clear rating" operation).
- `quit(): Map<number, number>` — stop timer, return only **confirmed** ratings (failed/in-flight upserts do not leak), then `reset()`.
- `reset()` — stop timer, unsubscribe in-flight rating loads/saves, clear all state.

**Audio:** `speakWord(enword)` (Web Speech API) per word; sounds are not used in review.

**Destruction:** `destroyRef.onDestroy` stops auto-mode and cancels in-flight rating subscriptions (navigating away mid-auto-mode must not keep advancing/speaking).

### 4.2 `VocabularySpellingSessionStore`

File: `vocabulary-exercises-spelling-session.store.ts`

State and behavior of one spelling (letter-typing) session: the word queue, per-letter reveal state of the current word, per-word results, completion.

| Signal | Type | Notes |
|---|---|---|
| `queue` | `signal<VocabularySpellingQueue[]>` | The typing queue. |
| `queueIndex` | `signal(-1)` | Current word; `-1` when not started/complete. |
| `letters` | `signal<VocabularySpellingLetter[]>` | Per-letter reveal state of the current word. |
| `letterIndex` (private) | `signal(0)` | Cursor into `letters`. |
| `results` | `signal<VocabularySpellingQueueResult[]>` | Per-word `{ enword, correct }`. Seeded `correct: true`; flipped to `false` on any wrong key/hint/give-up. |
| `isComplete` | `signal(false)` | Set when the last word completes; container's `effect` switches to `'spellingresult'`. |
| `progress` | `computed` | Counts **completed** words (not the cursor) so a single-word session does not read 0% throughout, and reaches 100% on completion. |
| `wordExplain` | `computed` | Current word's `cnword`. |
| `correctCount` / `incorrectCount` | `computed` | Derived from `results`. |
| `currentResultCorrect` | `computed` | Whether the current word's result is still `correct`; drives the live a11y status region. |

**Methods:**
- `start(items, disableVoice): boolean` — reset; `false` for empty; seed `results` (all `correct: true`); `goToQueueIndex(0)`.
- `handleKey(key)` — `Backspace` hides the previous letter; the expected letter reveals it and plays `Default.wav`; any other key calls `markCurrentIncorrect()` + `beep.wav`. Completing the last letter advances to the next word.
- `hint()` — reveal the current letter (word no longer counts as correct).
- `nextWord()` — give up the current word; **no-op after completion** (`isComplete()` or `queueIndex === -1`) so a stray click in the gap before the screen unmounts cannot flip the last correct result and corrupt the tally.
- `reset()` — drop everything.

**Audio:** `Default.wav` on correct letter, `beep.wav` on wrong key, `correct.wav` on session completion; `speakWord` on each new word (unless `disableVoice`).

### 4.3 `VocabularyQuizSessionStore`

File: `vocabulary-exercises-quiz-session.store.ts`

State and behavior of one quiz (single-choice) session. Mirrors the spelling store's shape.

| Signal | Type | Notes |
|---|---|---|
| `questions` | `signal<VocabularyQuizQuestion[]>` | Generated question queue. |
| `currentIndex` | `signal(-1)` | Current question. |
| `selectedIndex` | `signal(-1)` | Picked option; `-1` until answered (answers are final). |
| `results` | `signal<VocabularyQuizQueueResult[]>` | Per-question `{ enword, cnword, correct }`. |
| `isComplete` | `signal(false)` | Set when the last question is answered+advanced. |
| `answeredCount` (private) | `signal(0)` | Drives `progress`. |
| `progress` | `computed` | `answeredCount/questions.length * 100`; `100` when empty. |
| `currentQuestion` | `computed` | `questions[currentIndex]` or `null`. |
| `isAnswered` | `computed` | `selectedIndex >= 0`. |
| `isCorrect` | `computed` | Whether the pick was correct (`false` until answered). |
| `correctCount` / `incorrectCount` | `computed` | Derived from `results`. |

**Methods:**
- `start(questions): boolean` — reset; `false` for empty; seed `results` (all `correct: true`); `currentIndex = 0`.
- `answer(index)` — ignore out-of-range/re-answers; record result, play `correct.wav` or `beep.wav`.
- `next()` — no-op until answered; advance, or on the last question set `isComplete`, clear live state, play `correct.wav`.
- `handleKey(key)` — `Enter`/`ArrowRight` → `next()`; `1`–`4`/`a`–`d` → `answer(optionIndex)`.
- `reset()` — drop everything.

**Post-completion no-ops:** once `isComplete()`, `answer`, `next`, and `handleKey` are all no-ops (no extra sound, no tally change, no cursor drift) — verified by dedicated tests.

---

## 5. Session screens

Each session screen injects its store directly (no state inputs) and owns its keyboard listener(s). Templates are minimal: a `mat-toolbar` (progress bar + control fabs) and a content region. All are `ChangeDetectionStrategy.OnPush`.

### 5.1 Review — `VocabularyExercisesReviewSessionComponent`

- **Store:** `inject(VocabularyReviewSessionStore)`.
- **Input:** `hideExplain` (required). **Output:** `quit`.
- **Template:** progress bar; seconds-per-word `mat-select`; play/prev/next/quit fabs (all with `aria-label`/`matTooltip`); the current EN word; optionally the CN explanation; a 5-toggle rating group bound `[ngModel]="store.currentItem().rating"`.
- **Keyboard (`document:keyup`):** `1`–`5` rate, `ArrowUp`/`Down` nudge rating, `ArrowLeft`/`Right` navigate, `Esc` quits. Guards:
  - modifier chords (`ctrl`/`alt`/`meta`) are never study input;
  - keys landing inside a form control / overlay panel are left alone (arrows navigate the seconds select, `Esc` closes it);
  - **arrows are ignored while a `mat-button-toggle-group` has focus** — the group already applies them on keydown (clicking the neighboring toggle); re-applying on keyup would double-rate and send a duplicate upsert.
- **Keyboard (`document:keydown`) — scroll suppression:** `ArrowUp/Down/Left/Right` from a plain target call `preventDefault()` so the page does not scroll. The same exclusions as keyup apply, plus `button` and `mat-button-toggle-group` (those need their own keydown behavior). State changes stay on keyup; this listener only blocks the browser default.

### 5.2 Spelling — `VocabularyExercisesSpellingSessionComponent`

- **Store:** `inject(VocabularySpellingSessionStore)`.
- **Input:** `hideExplain`. **Output:** `quit`.
- **Template:** progress bar; hint/next-word/quit fabs; optionally the CN explanation; the per-letter row (`@for` over `store.letters()` rendering the letter or `_`); a `role="status" aria-live="polite"` region announcing "Incorrect" when `!store.currentResultCorrect()` (so a wrong key is announced beyond the beep).
- **Keyboard (`document:keyup`):** forward word characters to `store.handleKey(event.key)`. Excludes: modifier chords; `Escape` (quits); `Enter`/`Tab` (not typing); Space when a button is focused (Enter/Space already activated it on keydown). Space from anywhere else stays typeable — phrases contain spaces.

### 5.3 Spelling result — `VocabularyExercisesSpellingResultComponent`

- **Store:** `inject(VocabularySpellingSessionStore)` (reads `correctCount()` / `queue().length` / `results()`).
- **Output:** `backToList`.
- **Template:** score line `correctCount / queue().length`; a back button; a `mat-table` over `store.results()` with columns `word`, `correct` (a disabled `mat-checkbox`). Null-safe on an empty session (renders `0 / 0`, no rows).

### 5.4 Quiz — `VocabularyExercisesQuizSessionComponent`

- **Store:** `inject(VocabularyQuizSessionStore)`.
- **Output:** `quit`.
- **Template:** progress bar; next-question/quit fabs; the prompt (`currentQuestion()?.prompt`); `@for` over options rendering `mat-stroked-button` rows with an A–D key, the option text, and correctness icons (`check_circle`/`cancel`, `aria-hidden`) on the right option after answering. The answered options are **not** `[disabled]` (the store already guards re-answering via `isAnswered()`), so focus stays on the clicked button instead of dropping to `<body>`. A `role="status" aria-live="polite"` region announces "Correct"/"Incorrect".
- **Keyboard (`document:keyup`):** forward keys to `store.handleKey(event.key)`. Excludes modifier chords and `Enter`/Space when a button is focused (it already activated on keydown — forwarding would answer AND skip past the feedback).

### 5.5 Quiz result — `VocabularyExercisesQuizResultComponent`

- **Store:** `inject(VocabularyQuizSessionStore)`.
- **Output:** `backToList`.
- **Template:** score line `correctCount / questions().length`; back button; `mat-table` over `store.results()` with columns `word`, `chinese`, `correct`. Null-safe on an empty session.

---

## 6. List screen — `VocabularyExercisesWordListComponent`

File: `vocabulary-exercises-word-list.component.ts` · template: `…-word-list.component.html`

Purely presentational. The container owns `dataSource`, `selection`, and the applied filters; this component renders them and forwards user intents as outputs. The paginator/sort wiring onto the shared `MatTableDataSource` happens **here** because those elements live in this template:

```ts
@ViewChild(MatPaginator, { static: false }) set content(p: MatPaginator) { if (p) this.dataSource().paginator = p; }
@ViewChild(MatSort,     { static: false }) set contentSort(s: MatSort) { if (s) this.dataSource().sort = s; }
```

### 6.1 Inputs / outputs

- **Inputs (required):** `allFiles`, `selectedFile` (two-way `model`), `isLoadingContents`, `dataSource`, `selection`, `contentRatings`, `filterDefinition`.
- **Input (defaulted):** `ratingsEnabled` (default `true`; disabled for temp content so the toggle group cannot latch a phantom value), `appliedFreeText` (default `''`; seeds the input box on init so a recreated screen shows the still-applied filter).
- **Outputs:** file selection, free-text changes, define/clear filter, quick-select, all-rows-toggled, content-rating-changed, the four exercise intents (review/worksheet/spelling/quiz), download-template, add-file-click, temp-file-selected.

### 6.2 Filter bar

The toolbar renders a Fiori-style filter bar:
- a free-text `matInput` (live, `input` → `freeTextChanged.emit`, suppressed mid-IME-composition via `compositionstart`/`compositionend` so pinyin fragments never flicker the table);
- a single Filter `mat-menu` whose label is a dynamic summary of the condition definition: `filterMenuLabel` calls `summarizeFilterDefinition(...)` (from `shared/filter-dialog`, over `VOCABULARY_FILTER_PROPERTIES`), which renders conditions joined by each group's AND/OR with parentheses for multi-member sub-groups and `>=`-style symbols for numeric properties (e.g. `(word starts with a OR chinese contains 派) AND rating >= 3`), falling back to a "new filter" label when no condition exists; the menu's second item clears the whole definition;
- a Quick Selection menu (Random / Sequence / Words → `quickSelect.emit('random'|'sequence'|'words')`);
- an Exercises menu (Study / Print / Typing / Test);
- a counts strip: total items · filtered rows · selected rows.

`selectionCount` is a **signal mirror** of the shared `SelectionModel.selected.length`: container-side dialog flows (By Count, etc.) mutate the model without changing any input reference, so without this mirror the toolbar count would not update under OnPush. It is seeded in `ngOnInit` from the live selection (a recreated screen inherits an already-checked model whose `changed` only fires on the *next* change) and re-synced via `selection().changed`.

### 6.3 Table

`displayedColumns = ['select', 'id', 'enword', 'cnword', 'rating']`. The header checkbox drives `allRowsToggled.emit()` (the container's `toggleAllRows()` replaces the selection with the visible rows); per-row checkboxes call `selection().toggle(row)`. The rating column renders a 5-toggle group bound `[ngModel]="getRating(element.id)"`, disabled when `!ratingsEnabled()`. `isAllSelected()` compares against the **visible** rows (mirroring the container) so the header checkbox stays honest when the selection also contains filter-hidden rows.

---

## 7. Dialogs

All dialogs are standalone, `OnPush`, and use the `MatDialogTitle`/`MatDialogContent`/`MatDialogActions` directives. They close via `dialogRef.close(value)` (`undefined` for Cancel/backdrop/Esc).

### 7.1 Select dialog — `VocabularySelectDialogComponent`

Mode-driven: one component, three modes via `@switch (data.mode)`:

| Mode | `SelectionModeEnum` | Fields | Validation |
|---|---|---|---|
| By Count | `ByCount` | `countOfItems`, `countOfOffset` | integer count ≥ 1; integer offset in `[0, rowCount)` (so an out-of-range offset can't silently wipe the selection) |
| Free Selection | `FreeSelection` | `countOfItems` | integer ≥ 1 |
| By Word | `ByID` | `importWords` (textarea) | at least one non-empty token, and at least one token matches a visible word (`visibleWords`) |

`parseWordTokens()` splits on commas/newlines and trims (so pasted lists work; multi-word entries like "apple pie" survive). `onYesClick()` clamps count/offset to safe integers and returns a clean comma-joined `importIDs` regardless of how it was pasted. `isFormInvalid` disables OK.

### 7.2 Options dialogs — Review / Spelling / Quiz / Worksheet

Four near-identical dialogs. Each seeds its `model()` fields from `data.currentSettings` so **reopening shows the last picks**, and returns a fresh options object on Close. Shared validation contract:

- `countOfItems` is an integer ≥ 1 (`isCountInvalid` disables OK).
- When `withSelection` is true, the count input advertises the selection size but is disabled; `onYesClick` returns the **persisted** count untouched (never let the selection size silently overwrite the configured count).
- Review/Spelling additionally disable OK when both `disableVoice` and `hideExplain` are on (no output).

The worksheet dialog seeds `subTitle` from `currentSettings.subTitle ?? data.title` (a stored custom subtitle wins over the file name) and exposes `printEntryDate`, `printFirstLetter`, `uniformBlankLength`, `uniformBlankLengthSize` (default `DEFAULT_UNIFORM_BLANK_LENGTH`). It no longer carries any datepicker/radio machinery — that was dead code removed in the review.

### 7.3 Filter dialog — now the shared `SharedFilterDialogComponent`

The vocabulary page no longer owns a filter dialog. The Filter menu opens the project-wide **`SharedFilterDialogComponent`** (`src/app/shared/filter-dialog/` — design, contracts, and the CDK tree invariants are documented in `docs/reusable-filter-dialog-design.md`), configured with the page's schema `VOCABULARY_FILTER_PROPERTIES` (`interfaces/vocabulary.ts`):

- `enword` / `cnword` — string properties with the four match operators (`BeginsWith`/`Contains`/`Equal`/`EndsWith`); emitted values are trimmed + lower-cased via each property's `prepareValue` hook. `isPhrase` survives as a **custom (valueless) operator**: it emits `Contains ' '` and folds back from it via `recognize`, so the phrase leaf stays editable across dialog round-trips. (A `notPhrase` variant was dropped: actslib `FilterUtility` has no negation.)
- `rating` — a number property with the five comparison operators (`>= > = <= <`), 0–5 range. Rating is not a row field; the predicate passes it in the synthesized target (§8).

Word and rating conditions mix freely in the same group — that's what makes cross-dimension OR (`word starts with a OR rating = 5`) expressible; groups nest to any depth (the dialog caps only how deep "+ group" goes, default 4 levels; the evaluator is unbounded). The dialog edits the actslib definition **natively**: seed = the definition in effect, Submit = `{ root: IFilterDefinition }`, `Cancel`/backdrop/Esc = `undefined` (caller keeps the previous filter). Validation gates Submit (missing values; nested groups must have ≥2 members, root exempt — invalid groups are flagged in the tree), the master/detail layout is `mat-tree` + splitter + detail editor with the enum multiple-choice and two-input Between editors, and every edit flows through the dialog's `root` signal. See the design doc for the full UI contract.

---

## 8. Filter pipeline

All filtering decisions flow through one pure function — `matchVocabularyListFilter(item, rating, filter)` in `interfaces/vocabulary.ts` — and nothing else grows private matching logic. The condition **definition** is an actslib `IFilterDefinition` produced directly by the shared filter dialog (no page-side translation step) and evaluated by `FilterUtility.MatchFilter`.

### 8.1 Composition

The filter bar combines two dimensions in a single `VocabularyListFilter`: a live `freeText` term and the structured actslib **definition** built by the shared dialog:

```ts
interface VocabularyListFilter {
  freeText: string;            // cross-field substring over id/enword/cnword (legacy)
  root: IFilterDefinition;     // actslib condition definition (the dialog's result)
}

// IFilterDefinition (actslib): { join?: 'AND'|'OR'; conditions: (IFilterCondition | IFilterDefinition)[] }
// IFilterCondition: { property; operation: FilterOperation; lowValue?; highValue?; enumValues? }
```

Word and rating conditions mix freely in the same group, and groups nest to arbitrary depth (the dialog edits the definition directly, capping only how deep new groups can be added; the evaluator is fully recursive). Matching is `freeText AND definition`, per actslib's own semantics:

- `freeText`: lowercased substring of `${id}${enword}${cnword}` (mirrors the old default `MatTableDataSource` predicate). This is a cross-field concatenation with no per-property condition equivalent, so it stays hand-written in `matchVocabularyListFilter`.
- `root`: evaluated by `FilterUtility.MatchFilter` against a case-folded target `{ enword, cnword, rating }` (the row's text fields lowercased). **String condition values are already folded** — the dialog applies each property's `prepareValue` (trim + lowercase) at emit time — so the matcher only folds the target's fields; both sides meet lower-cased despite FilterUtility's case-sensitive string comparisons. The rating comes from the page's rating map, not the row.
  - Word conditions carry `BeginsWith`/`Contains`/`Equal`/`EndsWith` directly (they are actslib operations now, not a page enum). The textless `isPhrase` emits `Contains` of a space via the schema's custom-operator hook — always active, offered for the English word only.
  - Rating conditions are plain numeric operations on the `rating` property (`>=`, `>`, `=`, `<=`, `<`). An unrated word has rating `0` and compares numerically like any other value — the same semantics as the shared `matchRating` (`ui-common.ts`, still used by the knowledge/Chinese/translate pages), so `< 1` matches unrated words and `>= 1` matches any rated word (ratings are 1–5; the former `HasAny`/`HasNone` operators were removed as redundant).
  - **No empty leaves/groups reach the matcher:** the shared dialog's Submit validation requires every leaf to hold a value and every nested group to branch (≥2 members), and its emit step drops incomplete leaves and empty sub-groups, so a definition can never contain the always-match empty group that would silently turn an OR-joined parent true.

### 8.2 Wiring through `MatTableDataSource`

`MatTableDataSource` exposes a single string `filter` channel. The container serializes the criteria as JSON into it:

```ts
applyListFilter(criteria) {
  this.listFilterCriteria = isVocabularyListFilterEmpty(criteria) ? null : criteria;
  this.dataSource.filter = this.listFilterCriteria === null ? '' : JSON.stringify(criteria);
}
```

The row predicate closes over `this` and reads the **parsed** `listFilterCriteria` (so it does not `JSON.parse` per row) plus `getRating(id)` (rating lives in `contentRatingMap`, not the filter string):

```ts
this.dataSource.filterPredicate = (data) =>
  matchVocabularyListFilter(data, this.getRating(data.id), this.listFilterCriteria!);
```

### 8.3 Forcing a re-filter

Because the predicate closes over `contentRatingMap` and a rating change does not change the filter string, the container re-runs the predicate by reassigning the same value:

```ts
if (this.dataSource.filter) { this.dataSource.filter = this.dataSource.filter; }
```

This is done after every rating upsert, after the async ratings load lands, and after `onQuitReview()` merges confirmed ratings back — anywhere a rating change could move rows in or out of an active rating filter.

---

## 9. Ratings

Ratings are per-user, per-content, per-item, persisted server-side via `LearningRatingService` (`api/…/ratings`), against the backend `ContentId` (`studyContentId`) and per-item `itemId`.

### 9.1 List view

`contentRatingMap: signal(Map<itemId, rating>)` is the list view's source of truth. The word-list rating column binds `[ngModel]="getRating(element.id)"`. Editing it emits `contentRatingChanged`, handled by `onContentRatingChanged`:

- Deselect (value `undefined`) is a no-op restore (there is no "clear rating" operation) — the group value is reset directly because the unchanged `[ngModel]` never triggers `writeValue`.
- `studyContentId <= 0` (temp content) refuses the call; the toggle group is also disabled (`ratingsEnabled=false`) so it cannot latch a phantom value.
- On success: update the map (new reference), drop stale responses via `pendingContentRatings`, force a re-filter.
- On error: revert the toggle group directly to the last confirmed value (again, `[ngModel]` won't do it); a newer in-flight click wins.

### 9.2 Review session

`VocabularyReviewSessionStore` keeps its own `ratingMap` of **server-confirmed** ratings. `start()` preloads ratings (skipping items the user already rated this session — `userRatedItemIds` — so a late preload cannot revert an in-session rating or make a confirmed save look stale). `rateCurrent()` updates the queue slot and calls `saveRating()`, whose response writes into `ratingMap` (dropping stale responses). On `quit()`, the store returns only confirmed ratings; the container merges them back into `contentRatingMap` and forces a re-filter.

### 9.3 Temp content

A temp upload gets `id: -(Date.now())`. Every rating path guards on `studyContentId > 0`, so rating calls are disabled for temp content, and the column's toggle group is disabled so it cannot latch a value the binding would never reset.

---

## 10. Data models

Defined in `src/app/interfaces/vocabulary.ts` and `ui-common.ts` (barrel: `src/app/interfaces/index.ts`).

### 10.1 Word file content

```ts
interface LearnEnglishWordFileItem { id?: number; enword: string; cnword: string; }
```

Loaded per file via `LearningContentService.getVocabularyWordContent(fileUrl)` (HTTP-cached). `LearningContent` (the file-list row) carries `id`, `nameChinese`, `nameEnglish`, `fileUrl`, plus metadata flags.

### 10.2 Session queues

```ts
interface ReviewQueueItem        { enword: string; cnword: string; rating: number; itemId?: number; }
interface VocabularySpellingQueue{ enword: string; cnword: string; completed: boolean; }
interface VocabularySpellingQueueResult  { enword: string; correct: boolean; }
interface VocabularyQuizQueueResult      { enword: string; cnword: string; correct: boolean; }
interface VocabularySpellingLetter { idx: number; visible: boolean; letter: string; }
```

### 10.3 Quiz questions

```ts
type VocabularyQuizDirection = 'en2cn' | 'cn2en';
interface VocabularyQuizQuestion {
  enword: string; cnword: string; direction: VocabularyQuizDirection;
  prompt: string; options: string[]; answerIndex: number;
}
```

Built by `buildVocabularyQuizQuestions(items, pool, direction)`:
- For each queued item, the correct text (`cnword` for `en2cn`, `enword` for `cn2en`) is combined with up to 3 distinct-text distractors drawn from a shuffled `pool`.
- Distractors are **deduplicated by displayed text** — real word files contain duplicate Chinese glosses, and an option identical to the correct answer would be ambiguous.
- Items whose correct text appears nowhere else in the pool are **skipped**; otherwise questions degrade to 2–3 options rather than repeat a text.

### 10.4 Options

```ts
interface VocabularyOptionCore        { countOfItems: number; }
interface VocabularyReviewOption      extends VocabularyOptionCore { disableVoice: boolean; hideExplain: boolean; }
interface VocabularySpellingOption    extends VocabularyOptionCore { disableVoice: boolean; hideExplain: boolean; }
interface VocabularyQuizOption        extends VocabularyOptionCore { direction: VocabularyQuizDirection; }
interface VocabularyWorksheetOption   extends VocabularyOptionCore {
  subTitle?: string; printEntryDate?: boolean; printFirstLetter?: boolean;
  uniformBlankLength?: boolean; uniformBlankLengthSize?: number;
}
interface VocabularySelectOption {
  selectedSelectMode: SelectionModeEnum; importIDs?: string;
  countOfItems?: number; countOfOffset?: number; filterOnTag?: string;
}
```

### 10.5 Filter models

```ts
// actslib (shared filter dialog contract): IFilterDefinition / IFilterCondition /
// FilterOperation / FilterJoinType — the vocabulary filter IS a definition now.
// vocabulary.ts schema:
interface FilterableProperty { key; labelKey; kind: 'string'|'number'|'date'|'enum';
  operations?; enumValues?; choices?; customOperators?; numberRange?; prepareValue?; }
const VOCABULARY_FILTER_PROPERTIES: FilterableProperty[]; // enword, cnword, rating
const VOCABULARY_IS_PHRASE: FilterCustomOperator;          // Contains ' ' emit/recognize
interface VocabularyListFilter { freeText: string; root: IFilterDefinition; }
```

`RatingOperatorEnum` (`Equals`, `GreaterThan`, `LessThan`, `LargerOrEquals`, `LessOrEquals`), `SelectionModeEnum` (`ByID`, `FreeSelection`, `ByCount`), `RatingCondition` and `summarizeRatingFilter()` live in `ui-common.ts` — they are shared by the vocabulary, knowledge, Chinese and translate list filters — alongside `matchRating()`, which compares an unrated (`0`) word numerically (the vocabulary page evaluates its rating conditions via actslib `FilterUtility` with the same semantics).

### 10.6 Pure helpers

| Function | Location | Purpose |
|---|---|---|
| `matchVocabularyListFilter(item, rating, filter)` | `vocabulary.ts` | Single matching rule for the list filter (free text + actslib `FilterUtility.MatchFilter`). |
| `VOCABULARY_FILTER_PROPERTIES` / `VOCABULARY_IS_PHRASE` | `vocabulary.ts` | The page's schema for the shared filter dialog (properties + phrase custom operator). |
| `emptyVocabularyFilterDefinition()` | `vocabulary.ts` | The empty AND-joined root (the clear-filter state). |
| `isVocabularyListFilterEmpty(filter)` | `vocabulary.ts` | True when no dimension is active. |
| `summarizeRatingFilter(...)` | `ui-common.ts` | Human-readable filter-menu label for the rating conditions (shared across pages). |
| `buildVocabularyQuizQuestions(items, pool, direction)` | `vocabulary.ts` | Build the quiz question queue. |
| `matchRating(rating, operator, value)` | `ui-common.ts` | Single rating comparison rule. |
| `FisherYatesShuffle(array)` | `actslib` (`subject`) | Unbiased shuffle; returns a new array. |

---

## 11. Keyboard handling — cross-cutting rules

Keyboard handling is deliberately split between keydown and keyup, and deliberately scoped per-screen:

1. **One screen, one handler.** Each session screen registers `@HostListener('document:keyup')` (review also `document:keydown` for scroll suppression). The container's `@switch` destroys the screen on transition, so the listener dies with it — no cross-screen key leakage.
2. **Modifier chords are never study input.** Every handler returns early on `ctrl`/`alt`/`meta` (Alt+ArrowLeft/Right is browser history; Ctrl+1…5 is an app shortcut).
3. **Keys landing inside a form control / overlay are left alone.** `closest('input, textarea, select, mat-select, [contenteditable="true"], .cdk-overlay-pane')` lets arrows navigate the seconds select and Escape close its panel.
4. **Material controls that handle arrows on keydown own them on keyup too.** The review handler ignores arrows while a `mat-button-toggle-group` has focus (the group already applied them), preventing a double rating change + duplicate upsert. The quiz/spelling handlers ignore `Enter`/Space on a focused button (it already activated on keydown — forwarding the keyup would act a second time).
5. **State changes on keyup, scroll suppression on keydown.** `preventDefault()` on keyup is too late to stop keydown-triggered page scroll, so the review screen adds a `document:keydown` listener that calls `preventDefault()` on plain-target arrows (with the same exclusions, plus `button`/`mat-button-toggle-group`).

---

## 12. Styling

- Component SCSS per screen/dialog; the page uses `_vocabulary-exercises-theme.scss` for theming.
- Shared global table styles (`src/styles/_shared-tables.scss`) and toolbar styles (`_shared-toolbars.scss`) define `mat-table` column widths, zebra striping, sticky headers, and the three-tier responsive toolbar layout. Component SCSS does **not** define its own `.mat-column-*` overrides — the shared file is updated instead.
- Three-tier responsive layout (min 360px): >1200px full; 821–1200px compact; ≤820px two-row/wrap. Toolbar items use `.page-toolbar-item`/`.toolbar-item`/`.toolbar-item-count`.
- Quiz answer feedback uses both color (`-option-correct`/`-option-wrong` classes) **and** icons (`check_circle`/`cancel`, `aria-hidden`) plus an `aria-live` status region, so feedback is not color-only.
- Tailwind utility classes (`w-full` etc.) are used in templates where convenient.

---

## 13. Internationalization

All user-facing strings go through `@jsverse/transloco` (`en` + `zh-CN` in `src/assets/data/i18n/`). Templates use the `*transloco="let t"` structural directive and `t('vocabularyExercises.…')` keys; components use `inject(TranslocoService)` for dynamic labels (e.g. the word/rating menu summaries). The `correct`/`incorrect` keys (added for the L9 live-announcement regions) exist in both languages.

---

## 14. Testing

Framework: Vitest via `@angular/build:unit-test` (jsdom). **Run via `ng test`**, never `npx vitest` directly — direct Vitest invocation skips the Angular Vite plugin and breaks `templateUrl`/`styleUrls` resolution.

Spec files in the folder (one per store, session screen, dialog, and the container/word-list):

- **Store specs** (`…-store.spec.ts`) — start/reset, per-method behavior, derived computeds, audio calls, completion, and post-completion no-ops. Stores are tested with a mock `AudioService` (and `LearningRatingService` for review) and `TestBed.inject`ed.
- **Session screen specs** (`…-component.spec.ts`) — keyboard handling (including the toggle-group/overlay/modifier guards and the keydown scroll-suppression listener), a11y (aria-labels on icon fabs, aria-live regions, correctness icons), and the "answered option buttons stay focusable" contract.
- **Result screen specs** (`…-quiz-result.component.spec.ts`, `…-spelling-result.component.spec.ts`) — score line + one `mat-checkbox` per result row from a populated session, null-safety on an empty session (`0 / 0`, no rows, no throw), and `backToList` emission. Row counts are asserted via `querySelectorAll('mat-checkbox')` (stable host tag name, not MDC classes).
- **Dialog specs** — `isFormInvalid` gating, `onYesClick` clamping, seed-from-`currentSettings`, and Cancel-leaves-state-untouched.
- **Container spec** (`vocabulary-exercises.component.spec.ts`) — file loading (last-click-wins token), temp-upload schema validation, queue prep, select-dialog application (By Count / Free / By Word), rating save/revert/stale guards, dead-machinery removal (L11), and end-to-end list→review→list round-trips.

Patterns: `provideHttpClientTesting()` + `provideHttpClient()`; `HttpTestingController` for caching/error paths; `NoopAnimationsModule`; a `mockTransloco()` helper whose `translate: vi.fn((key) => key)` returns the key (so template text contains the key string for assertions); `takeUntilDestroyed`-style cleanup is verified where relevant.

The full suite is green at 50 files / ~1557 tests.

---

## 15. Worksheet generation & print rendering

The Worksheet exercise (the "Print" item in the Exercises menu — the codebase term is *worksheet*; the menu label is *Print*) produces a printable fill-in-the-blank worksheet. Unlike Review/Spelling/Quiz, it does **not** run an in-page session: the container builds fill-in-the-blank items, hands them to `UIService`, and routes to the shared knowledge print renderer at `/knowledge/displayv2`, which renders Markdown and triggers the browser print dialog.

### 15.1 End-to-end flow

```mermaid
sequenceDiagram
    actor User
    participant VOC as VocabularyExercisesComponent
    participant DLG as WorksheetOptionsDialog
    participant UI as UIService
    participant R as Router
    participant DV2 as DetailV2Component

    User->>VOC: click Print (Worksheet)
    VOC->>DLG: open(wordQueueCount, withSelection, title, currentSettings)
    DLG-->>User: show worksheet options
    User->>DLG: confirm
    DLG-->>VOC: VocabularyWorksheetOption
    Note over VOC: onNewWorksheetCore()<br/>if selection, shuffle all (countOfItems ignored)<br/>else cap to countOfItems (ceiling, not exact)
    VOC->>VOC: map to KnowledgeExerciseFileContent<br/>as FillInTheBlank; question joins cnword, optional first letter, and enword in at-sign delimiters
    VOC->>UI: setSelectedExerciseItem(items, execPrintSetting)
    UI->>UI: convertToQuestionBankItem() then sort by order
    UI->>UI: store _exerciseItems, _exercisePrintSetting
    VOC->>R: navigate to /knowledge/displayv2
    R->>DV2: activate component
    DV2->>UI: ngOnInit reads ExerciseItems, ExercisePrintSetting, IncludeLatex
    Note over DV2: ngAfterViewInit (setTimeout 0)<br/>build markdownStr (header and questions) and markdownAdditionStr (answer key)<br/>via convertQuestionBankItemToMarkdown and convertQuestionBankItemAnswerToMarkdown<br/>then cdr.markForCheck() (OnPush)
    User->>DV2: click Print (NgxPrintModule)
    DV2-->>User: window.print() renders paper output
```

### 15.2 Worksheet options dialog

`onWorksheetWithOptions` opens `VocabularyExercisesWorksheetOptionsDialogComponent` (§7.2) with `{ wordQueueCount, withSelection, title, currentSettings }`:

- `wordQueueCount` — selection length if rows are selected, else total loaded word count;
- `withSelection` — whether any rows are manually selected;
- `title` — the selected file's `nameEnglish` (fallback for `subTitle` when none was saved);
- `currentSettings` — the persisted `VocabularyWorksheetOption` (round-tripped so reopening shows the last picks).

The dialog collects into `VocabularyWorksheetOption` (`interfaces/vocabulary.ts`, extends `VocabularyOptionCore`):

| Field | Meaning |
|---|---|
| `subTitle` | becomes the printed form title (`formTitle`). |
| `countOfItems` | cap on the number of items; the input is disabled when `withSelection`. |
| `printEntryDate` | collected and threaded into `KnowledgeExercisePrintOption.printEntryDate`, but **not read by the `displayv2` renderer** — the header timestamp comes from the component's own `printID = new Date().toISOString()`. |
| `printFirstLetter` | prepend the answer's first letter to the question text (does not affect blank length). |
| `uniformBlankLength` | toggle (default ON) — render the blank at a fixed width that hides the answer's length. |
| `uniformBlankLengthSize` | width in `&nbsp;` cells (default `DEFAULT_UNIFORM_BLANK_LENGTH` = 30, floored to `MIN_UNIFORM_BLANK_LENGTH` = 10). |

Validation: `countOfItems` must be an integer ≥ 1 (`isCountInvalid` disables OK). With a selection, the count input advertises the selection size but returns the persisted count untouched (never let the selection size silently overwrite the configured count).

### 15.3 Building the worksheet queue

`onNewWorksheetCore` follows the same selection-vs-filter contract as the other exercises (§3.4):

- **With a manual selection** (`selection.selected.length > 0`): the queue is the selected rows, shuffled. `countOfItems` is **ignored** — all selected rows print.
- **Without a selection**: the queue is the visible (filtered) rows, capped — if longer than `countOfItems` it is shuffled and sliced to `countOfItems`; if already shorter, all items print (no shuffle, no padding). So `countOfItems` is a **ceiling**, not an exact count.

Each queue item is mapped to a `KnowledgeExerciseFileContent` with:

- `itemType: QuestionBankTypeEnum.FillInTheBlank`;
- `id` / `order` = 1-based index;
- `question` = `cnword[0..50] [firstLetter?] @enword@` — the `@…@` region is the answer placeholder that later becomes the blank.

A `KnowledgeExercisePrintOption` is assembled:

```ts
{
  formTitle: this.worksheetSetting.subTitle ?? '',
  printEntryDate: this.worksheetSetting.printEntryDate ?? true,
  printScore: true,
  printAnswer: true,
  printHintOfAnswer: false,
  printID: false,
  hideLabelOfQuestionType: [QuestionBankTypeEnum.FillInTheBlank],  // suppress the "填空题" label
  uniformBlankLength: this.worksheetSetting.uniformBlankLength,
  uniformBlankLengthSize: this.worksheetSetting.uniformBlankLengthSize,
}
```

Then `uiService.setSelectedExerciseItem(items, execPrintSetting)` is called and the router navigates to `/knowledge/displayv2`.

### 15.4 Handoff via `UIService`

`UIService.setSelectedExerciseItem`:

- converts each `KnowledgeExerciseFileContent` to a concrete `QuestionBankItemBase<string>` via `convertToQuestionBankItem` (the `FillInTheBlank` branch builds a `QuestionBankItemFillInTheBlank`);
- sorts by `order`;
- optionally shuffles single/multiple-choice options (not relevant for fill-in-the-blank);
- stores `_exerciseItems` and `_exercisePrintSetting` for the renderer to read (exposed as `ExerciseItems` / `ExercisePrintSetting`).

### 15.5 Rendering (`displayv2`)

`KnowledgeExercisesDetailV2Component` (`pages/knowledge-exercises/knowledge-exercises-detail-v2/`):

- `ngOnInit` reads `uiService.ExerciseItems` → `questions`, `ExercisePrintSetting` → `printSetting`, and `IncludeLatex`.
- `ngAfterViewInit` builds two Markdown strings inside `setTimeout(..., 0)` (deferred to avoid `ExpressionChangedAfterItHasBeenChecked`):
  - `markdownStr` — a header (`formTitle`, a `printID` ISO timestamp, and Date/Duration/Score blanks gated on `printScore`) followed by each question rendered via `convertQuestionBankItemToMarkdown(item, hideLabelOfQuestionType, printID, uniformBlankLength, uniformBlankLengthSize)`;
  - `markdownAdditionStr` — the answer key, via `convertQuestionBankItemAnswerToMarkdown`, shown when `printAnswer` is set; items are joined inline (em-space) unless `answerLineBreakPerItem` is on (used by Chinese recite prints, not vocabulary).
  - `cdr.markForCheck()` is called because the component is `OnPush`.
- The actual browser print is triggered by `NgxPrintModule` (`window.print()`).

### 15.6 Blank length

**Does the blank reflect the English word's length?**

**No — not for vocabulary.** Vocabulary worksheets render the blank at a **fixed uniform width** that does not reflect the answer's length. A 4-letter word and a 12-letter word produce the same blank; the blank deliberately hides the answer's length. Knowledge Bank fill-in-the-blank prints still use the legacy length-proportional blank (every caller that leaves `uniformBlankLength` unset).

**Signal path:**

1. The worksheet-options dialog collects `uniformBlankLength` (toggle, default ON) and `uniformBlankLengthSize` (default `DEFAULT_UNIFORM_BLANK_LENGTH` = 30, floored to `MIN_UNIFORM_BLANK_LENGTH` = 10). `onNewWorksheetCore` threads them from `worksheetSetting` onto the `KnowledgeExercisePrintOption`.
2. `displayv2` forwards them as the 4th/5th arguments to `convertQuestionBankItemToMarkdown`.
3. `convertFillInTheBlankToMarkdown` computes the effective length and passes it as `replaceAtSymbols`'s `fixedLength` argument when the toggle is on:

```ts
const effectiveBlankLength = uniformBlankLength
  ? Math.max(MIN_UNIFORM_BLANK_LENGTH, uniformBlankLengthSize ?? DEFAULT_UNIFORM_BLANK_LENGTH)
  : undefined;
replaceAtSymbols(
  item.question.replaceAll('_', '\\_'),
  '<u>&nbsp;</u>',
  1,
  effectiveBlankLength
);
```

4. `replaceAtSymbols` (`interfaces/ui-common.ts`) uses `fixedLength` directly as `totalLength`, bypassing the content-length calculation:

```ts
const totalLength =
  fixedLength && fixedLength > 0
    ? fixedLength
    : Math.max(1, Math.round(contentLength * lengthFactor));
```

`MIN_UNIFORM_BLANK_LENGTH = 10` is the floor for the user-configurable `uniformBlankLengthSize`; `DEFAULT_UNIFORM_BLANK_LENGTH = 30` is the default used when the size is unset (and the value the dialog opens at). Both constants live in `interfaces/questionbank-base.ts` near `convertFillInTheBlankToMarkdown`; the dialog reuses `DEFAULT_UNIFORM_BLANK_LENGTH` as its default and `MIN_UNIFORM_BLANK_LENGTH` as its floor, so each is single-sourced.

At the default 30 the blank exceeds `breakInterval` (10), so the output is split with zero-width-break seams every 10 cells rather than rendered as a single underline; sizes at or below 10 stay in the simple render path as one clean `<u>` + N × `&nbsp;` + `</u>`.

### 15.7 Legacy proportional path (Knowledge Bank, unchanged)

Before the uniform flag was added, the blank width was proportional to the answer content's length. This path is still used by Knowledge Bank fill-in-the-blank prints (and any caller that does not set `uniformBlankLength`).

The question string wraps the answer in `@…@`:

```ts
question: `${queueitem.cnword.substring(0, 50)} ${this.worksheetSetting.printFirstLetter ? queueitem.enword[0] : ''} @${queueitem.enword}@`,
```

When `fixedLength` is unset, `replaceAtSymbols` sizes the blank from the captured content:

```ts
const contentLength = hasChineseInContent ? content.length * 4 : content.length * 2;
const totalLength =
  fixedLength && fixedLength > 0
    ? fixedLength
    : Math.max(1, Math.round(contentLength * lengthFactor));
```

**Known quirk (KB-only, out of scope):** the multiplier is meant to depend on whether the **answer content** is Chinese (CJK glyphs are full-width, so `×4`; Latin gets `×2`), but the flag is computed from the **whole question string** (`hasChineseInContent = hasChinese(str)` where `str` is the entire question, not the captured `content`). So any question containing Chinese (e.g. a vocabulary `cnword`, or a Chinese KB question) forces `×4` even for Latin answers. For vocabulary this is now **moot** — the uniform-length path bypasses `contentLength` entirely. For Knowledge Bank fill-in-the-blank the quirk remains; fixing it (switching to `hasChinese(content)`) is a separate task.

### 15.8 Notes

- `printFirstLetter` does not affect blank length. With it enabled the question becomes `n. 测试 t @test@`; the only `@…@` region is still `test`, so the blank is unchanged.
- Blanks longer than 10 cells are split with a zero-width-space break opportunity (`</u>&#8203;<u>`) every 10 cells to allow line wrapping. At the default `uniformBlankLengthSize` of 30 the uniform vocabulary blank exceeds this threshold, so it renders as three seam-separated 10-cell segments that still form one visual blank and wrap on overflow; lowering the size to 10 (the floor) yields a single unbroken underline.
- The same `replaceAtSymbols` helper is also used by `shared/mathitem/mathitem.ts`; the `fixedLength` argument defaults to unset, so that call site is unaffected.
- Vocabulary worksheet blank behavior is covered by `src/app/interfaces/questionbank-base.spec.ts` (uniform vs. proportional).

---

## 16. File inventory

```
src/app/pages/vocabulary-exercises/
├─ vocabulary-exercises.component.ts/html/scss/spec          # container
├─ vocabulary-exercises-word-list.component.ts/html/scss/spec  # list screen
├─ vocabulary-exercises-review-session.store.ts/spec          # review store
├─ vocabulary-exercises-spelling-session.store.ts/spec        # spelling store
├─ vocabulary-exercises-quiz-session.store.ts/spec            # quiz store
├─ vocabulary-exercises-review-session.component.ts/html/scss/spec
├─ vocabulary-exercises-spelling-session.component.ts/html/scss/spec
├─ vocabulary-exercises-spelling-result.component.ts/html/scss/spec
├─ vocabulary-exercises-quiz-session.component.ts/html/scss/spec
├─ vocabulary-exercises-quiz-result.component.ts/html/scss/spec
├─ vocabulary-exercises-select-dialog.component.ts/html      # mode-driven select
├─ vocabulary-exercises-reviewoptions-dialog.component.ts/html
├─ vocabulary-exercises-spellingoptions-dialog.component.ts/html
├─ vocabulary-exercises-quizoptions-dialog.component.ts/html/scss
├─ vocabulary-exercises-worksheetoptions-dialog.component.ts/html
├─ vocabulary-exercises-filter-dialog.component.ts/html/scss/spec
├─ _vocabulary-exercises-theme.scss
└─ index.ts                                                   # barrel
```

Supporting code outside the folder:
- `src/app/interfaces/vocabulary.ts` — session/quiz/filter models and pure helpers (`matchVocabularyListFilter`, `buildVocabularyQuizQuestions`, `summarize…`).
- `src/app/interfaces/ui-common.ts` — `SelectionModeEnum`, `RatingOperatorEnum`, `matchRating`, `replaceAtSymbols` (print blank rendering).
- `src/app/shared/utils/shuffle.ts` — `pickWeighted` (shuffle moved to actslib `FisherYatesShuffle`).
- `src/app/services/` — `LearningContentService` (file list + content), `LearningRatingService` (ratings), `AudioService` (Howler + Web Speech), `UIService` (worksheet handoff).
- `src/assets/data/i18n/{en,zh-CN}.json` — translation keys.
