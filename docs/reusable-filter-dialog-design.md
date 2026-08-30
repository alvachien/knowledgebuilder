# Design: Shared Filter Dialog (reusable condition-tree filter editor)

Status: **implemented; vocabulary page migrated (Phase 1 + 2)** — the shared
dialog lives in `src/app/shared/filter-dialog/` and the vocabulary page uses it
(`VOCABULARY_FILTER_PROPERTIES` schema in `interfaces/vocabulary.ts`); the old
`vocabulary-exercises-filter-dialog.*` files and the `VocabularyFilterGroup`
model are deleted. Phases 3–5 (knowledge, Chinese, translate adoption) are
pending. Implementation deltas from this doc, all deliberate:
- the leaf holds **three value slots** (`single` / `between` / `choices`)
  rather than the five named fields of §6.1;
- the date editor is a native `<input type="date">` (no `matDatepicker`, so the
  dialog needs no date-adapter providers);
- summaries render **comparison symbols** (`>=`, `<`) for numeric/date
  properties and word labels otherwise, keeping rating phrases compact;
- the join word in summaries is **translated** (`common.joinAnd`/`joinOr`)
  rather than hardcoded English, matching the localization-first rule.

Author: Claude Code session 2026-08-30
Base implementation: the (now deleted) vocabulary filter dialog, which this
component generalizes and replaced.

---

## 1. Purpose & scope

One project-wide dialog for defining list-page filters as a **condition tree**
(SQL-WHERE shape: leaves = property conditions, inner nodes = AND/OR joins),
covering all six exercise pages. The dialog is configured per page with a
**property schema** whose operator set derives from actslib's filter semantics;
its seed and result are actslib-native (`IFilterDefinition`), so pages store,
translate-free, and evaluate exactly what the dialog returns.

The name "Filter Dialog" (not "filter *options* dialog") avoids a collision
with the existing options dialogs (`reviewoptions`, `spellingoptions`, …),
which configure exercise options, not filters.

### Goals

1. **actslib-driven operators.** Each property's allowed operations are derived
   from actslib (`FilterOperation` + the per-kind support matrix) and narrowed
   by a per-page whitelist. Two special editor cases per the brief:
   - **enum properties** render their value editor as a **multiple-choice list**
     (checkboxes), compiled to actslib conditions on Submit (§7.3);
   - **`Between`** renders **two inputs** (low + high) (§7.2).
2. **mat-tree + detail-pane design**, matching the vocabulary dialog: tree
   navigator (left), editor for the selected node (right), draggable splitter,
   insert/delete toolbar, live expression preview, Submit gated by validation.
3. **Replace, then unify**: first adopter is the vocabulary page (replacing
   `VocabularyFilterGroup` + its bespoke dialog); the knowledge, Chinese and
   translation pages' five legacy filter dialogs follow (§12).

### Non-goals

- The **free-text search box** stays on each page's filter bar (hand-written
  cross-field matching; never enters the dialog).
- **Where values come from** (row fields vs. the user's rating from
  `contentRatingMap`) is the page's concern — pages keep evaluating against a
  synthesized target.
- No negation / NOT groups: actslib `FilterUtility` cannot express them.
- No persistence of filter presets (in-memory per page, as today).

---

## 2. Current state (what gets replaced)

| Page | Dialog today | Model today | Notes |
|---|---|---|---|
| vocabulary | `vocabulary-exercises-filter-dialog` | tree (`VocabularyFilterGroup`), edited via bespoke node/row copies | **reference design**; tree + panel + validation already built |
| knowledge-exercises | `knowledge-exercises-filter-dialog` | flat rows (`KnowledgeCondition[]` + `RatingCondition[]`), AND-only | **migrated** (shared dialog over `KNOWLEDGE_FILTER_PROPERTIES`; the `itemType` enum multi-select is §7.3's proof) |
| chinese-exercises | `chinese-exercises-content-filter-dialog` + `-rating-filter-dialog` | flat condition lists | two dialogs → one — **migrated** (shared dialog over `CHINESE_FILTER_PROPERTIES`) |
| translate-exercises | `translate-exercises-word-filter-dialog` + `-rating-filter-dialog` | flat `SentenceCondition[]` + `RatingCondition[]` | two dialogs → one — **migrated** (shared dialog over `SENTENCE_FILTER_PROPERTIES`) |

Common shape: each page hardcodes its field union (`'enword' | 'cnword' |
'rating'`…), its operator list, its row editor template, and a translation
function to actslib. All of that becomes the **property schema** input; the
dialog owns tree editing, validation, and the `IFilterDefinition` I/O.

---

## 3. Design decisions at a glance

| # | Decision | Rationale |
|---|---|---|
| D1 | Seed + result are **actslib `IFilterDefinition`** | Pages already evaluate it (`FilterUtility.MatchFilter`); kills every page-specific dialog model and the `VocabularyFilterGroup` ↔ definition translation. The dialog is generic precisely because its I/O is the evaluator's language. |
| D2 | **Property schema** passed via `MAT_DIALOG_DATA`, operators defaulted per kind from actslib's matrix, narrowed by whitelist | "allowed options per property" without every page re-listing `>`/`>=`/… ; whitelist still controls what's *offered* (e.g. rating offers only `=`). |
| D3 | Enum multi-select compiles to **one leaf that emits an OR-of-`Equal` group**; seeds fold back | actslib has no `In` operation; OR-of-equals is the only faithful encoding, and `enumValues` per condition keeps actslib's enum validation. Fold-back keeps round-trips editable (§7.3). |
| D4 | Valueless custom operators via **`customOperators` hook** (`emit` + `recognize`) | Vocabulary's `isPhrase` (→ `Contains ' '`) is app semantics actslib can't express; the hook keeps the dialog reusable without hardcoding word knowledge (§7.4). |
| D5 | Keep the vocabulary editor-state pattern: numeric-id nodes, **reference `trackBy`**, **id `expansionKey`**, all edits **immutable through the root signal** | These are load-bearing CDK facts, not style choices (see §6.3 and the bug history); encoding them in the shared component prevents re-introducing them page by page. |
| D6 | `prepareValue?` hook per property for case-folding / trimming | actslib string comparison is case-sensitive; the vocabulary page lowercases folded values *and* folded row fields. Keeping the hook on the property lets the page decide match semantics while the dialog stays content-agnostic (§8.4). |
| D7 | Validation rules move into the dialog model, same contract as today: blank/missing values and non-branching nested groups block Submit; root exempt | Just implemented in the vocabulary dialog; promoted verbatim to shared code (§9). |

---

## 4. Component overview

```
src/app/shared/filter-dialog/
├── index.ts                          # public surface barrel
├── filter-dialog.component.ts        # dialog shell (MAT_DIALOG_DATA consumer)
├── filter-dialog.component.html      # mat-tree + splitter + detail pane
├── filter-dialog.component.scss      # copied from the vocabulary dialog
├── filter-dialog.component.spec.ts   # DOM tests
├── filter-dialog-model.ts            # editor types + ALL pure logic (seed,
│                                     # mutate, validation, emit, summarize)
└── filter-dialog-model.spec.ts       # pure-function tests (no Angular)
```

- `SharedFilterDialogComponent`, selector `app-filter-dlg`, standalone,
  `OnPush`, template/SCSS imported per project conventions.
- **All tree logic lives in `filter-dialog-model.ts` as pure functions over
  plain objects** (the vocabulary component's private methods promoted to
  module functions taking explicit args). The component is then thin: hold the
  `root`/`selectedId` signals, call model functions, wire the template. This
  makes the interesting logic testable without `TestBed` and reusable for a
  future flat-mode variant.
- Imports: `MatTree`/`MatNestedTreeNode`/`MatTreeNodeDef`/`MatTreeNodeOutlet`,
  `FormsModule`, Material form fields/select/checkbox-list, `TranslocoModule`.
- Naming: types are `Shared…` (prefix `FilterDialog…`) to avoid clashing with
  the per-page `KnowledgeFilterDialogRow` etc. during the migration window.

## 5. Public contract

```ts
import type { EnumLike, FilterOperation } from 'actslib';
import type { IFilterCondition, IFilterDefinition } from 'actslib';

/** What kind of values a property carries. Drives the default operator list
 *  (§5.2), the value editor (§7), and the seed/emit dispatch. */
export type FilterPropertyKind = 'string' | 'number' | 'date' | 'enum';

/** One choice of an enum property's multiple-choice editor. */
export interface FilterEnumChoice {
  value: string | number;
  labelKey: string;          // i18n key, translated by the dialog
}

/** A valueless, app-specific operator (e.g. vocabulary 'isPhrase'). The page
 *  supplies the actslib encoding and the fold-back recognizer. */
export interface FilterCustomOperator {
  /** editor-local id, never crosses the dialog boundary */
  id: string;
  labelKey: string;
  /** actslib condition this operator emits on Submit */
  emit(property: string): IFilterCondition;
  /** true when `condition` is one of this operator's emissions (seed fold-back) */
  recognize(condition: IFilterCondition): boolean;
}

/** One filterable property of the page's target shape. */
export interface FilterableProperty {
  /** actslib condition property name (matched against the evaluated target) */
  key: string;
  labelKey: string;
  kind: FilterPropertyKind;
  /** offered operators; default = per-kind actslib set (§5.2), ∩ when given. */
  operations?: FilterOperation[];
  /** kind 'enum': actslib enum validation, passed through to each condition. */
  enumValues?: EnumLike;
  /** kind 'enum': choices rendered as the multiple-value editor (§7.3). */
  choices?: FilterEnumChoice[];
  /** valueless operators appended to the operator select (§7.4). */
  customOperators?: FilterCustomOperator[];
  /** number/date editors: input constraints (ui only; not enforced on text input). */
  numberRange?: { min?: number; max?: number };
  /** transforms the raw editor value before it is emitted (D6: trim + lowercase). */
  prepareValue?: (value: string | number) => string | number;
}

export interface FilterDialogData {
  properties: FilterableProperty[];
  /** seed = the filter currently in effect; empty/undefined starts blank */
  root?: IFilterDefinition;
  /** deepest group level the toolbar offers; default 4 */
  maxDepth?: number;
  /** dialog title key; default 'common.editFilter' */
  titleKey?: string;
}

export interface FilterDialogResult {
  root: IFilterDefinition;
}
```

The **uniform close contract is unchanged**: Submit → `{ root }`;
Cancel/backdrop/Esc → `undefined` (caller leaves state untouched).

### 5.1 Operator derivation from actslib

actslib's support matrix (FilterUtility docs + `MatchCondition`):

| kind | default operators (actslib order) |
|---|---|
| `string` | `BeginsWith`, `Contains`, `Equal`, `EndsWith`, `>` `>=` `<` `<=` (lexicographic), `Between` |
| `number` | `>`, `>=`, `=`, `<=`, `<`, `Between` |
| `date`   | same as `number` (actslib detects dates at runtime) |
| `enum`   | `Equal` only at the *leaf* level (multi-choice compiles to OR-of-`Equal`; §7.3) |

Rules:

- The dialog offers `customOperators` **in addition** to the (whitelist-narrowed)
  default list — `hasValue: false` by definition (they encode the value).
- Ordering follows the table above (familiar → exotic); pages that care pass
  an explicit `operations` list, which also fixes order.
- A property whose effective operator list is empty is a schema bug: dev-mode
  `console.warn`, property skipped in the select.

### 5.2 Per-page schema examples

```ts
// vocabulary page (the migration's first target)
const VOCABULARY_FILTER_PROPERTIES: FilterableProperty[] = [
  { key: 'enword', labelKey: 'vocabularyExercises.word', kind: 'string',
    operations: [BeginsWith, Contains, Equal, EndsWith],
    customOperators: [IS_PHRASE],          // emit: Contains ' '; recognize: op=Contains && lowValue=' '
    prepareValue: v => String(v).trim().toLowerCase() },
  { key: 'cnword', labelKey: 'chinese', kind: 'string',
    operations: [BeginsWith, Contains, Equal, EndsWith],
    prepareValue: v => String(v).trim().toLowerCase() },
  { key: 'rating', labelKey: 'rating', kind: 'number',
    operations: [GreaterThan, LargerOrEquals /* >= */, Equal, LessOrEquals, LessThan],
    numberRange: { min: 0, max: 5 } },
];
```

(The rating property replaces today's hand-mapped `RatingOperatorEnum`: the
dialog works in actslib ops directly; `matchRating` stays for legacy paths
until phase 4.)

## 6. Editor state model

### 6.1 Types

```ts
/** One editable leaf. All value kinds COEXIST (today's VocabularyFilterDialogRow
 *  pattern): switching property/operator never loses input, and the template
 *  only shows the controls the current dispatch selects. */
export interface SharedFilterDialogLeaf {
  id: number;
  propertyKey: string;
  /** a FilterOperation value, or a customOperator id */
  operator: string;
  textValue: string;                       // string editor
  numberValue: number | null;              // number/date single-value editor
  lowValue: number | null;                 // Between bounds
  highValue: number | null;
  selectedChoices: (string | number)[];    // enum editor (§7.3)
}

export interface SharedFilterDialogNode {
  id: number;
  join: FilterJoinType;
  members: Array<SharedFilterDialogLeaf | SharedFilterDialogNode>;
}
```

### 6.2 Pure functions in `filter-dialog-model.ts`

| function | role |
|---|---|
| `seedTree(def: IFilterDefinition \| undefined, schema): SharedFilterDialogNode` | copy-in: conditions → leaves (fold-back: custom `recognize`, Between, enum OR-of-equals → one multi-choice leaf, single value); nested groups → nodes; **structure preserved at any depth**; never mutates the caller's def |
| `emitTree(root, schema): IFilterDefinition` | Submit output: leaves → conditions/groups (§7 dispatch); drops nothing (validation already guarantees completeness); root may emit `conditions: []` (= match-all = cleared filter) |
| `insertMember / deleteMember / patchNode / patchLeaf` | the vocabulary `mutateNode`/`replaceRow` immutables, generalized: every edit returns a new object along the mutation path |
| `emptyLeaf(schema): SharedFilterDialogLeaf` | new row = first property, its first operator, blank values |
| `validateTree(root, schema): ValidationState` | `hasMissingValue` + `invalidGroupIds` (§9) |
| `summarizeFilterDefinition(def, schema, labels): string` | preview + menu label (parenthesized notation, per-group join, choice lists as `a/b/c`, Between as `low ≤ x ≤ high`); mirrors today's `summarizeVocabularyFilterTree` |

`patchLeaf` replaces a leaf by id inside its parent (same `parentIdOf` +
`members.map` trick as the vocabulary dialog).

### 6.3 The CDK tree invariants (load-bearing — do not "simplify")

Proven twice in the vocabulary dialog's bug history; the shared component must
carry them forward verbatim:

1. **`[trackBy]` = object reference** (`(_i, m) => m`). CdkTree's nested nodes
   read their children *once* at view creation; its differ defaults trackBy to
   the expansion key. An id-keyed differ therefore "keeps" mutated (replaced)
   nodes whose views render stale children forever. Reference keys make every
   immutable replacement re-create the affected views.
2. **`[expansionKey]` = node id** + `[isExpanded]="true"` per
   `mat-nested-tree-node` — always-expanded navigator that survives view
   re-creation (expansion model keyed by id; recreated groups stay open).
3. **Every edit flows through the root signal** (`root.update(...)`); nothing
   mutates editor objects in place. The dialog is OnPush: an in-place write
   (e.g. `[(ngModel)]="leaf.textValue"`) dirties no signal, so tree labels and
   the preview show stale values. All detail-pane bindings are
   `[ngModel]` + `(ngModelChange)` → patch handlers.
4. `treeData = computed(() => [root()])` as `[dataSource]` — one top-level row
   (the root node); member ids are unique editor-local counters.

## 7. Value editors (detail pane), by dispatch

The detail pane's **property select** drives everything: picking a property
swaps the operator select contents (per §5.1) and the **value editor** below.
Dispatch table:

| effective editor | condition | controls |
|---|---|---|
| text | `kind: string`, valued operator | `matInput` (single) |
| number | `kind: number`, single-value operator | `matInput type=number` with `numberRange` |
| date | `kind: date`, single-value operator | datepicker (`MatDatepickerModule`, `date-fns` adapter per project convention) |
| **between** | any valued kind, `operation = Between` | **two inputs** (low, high) — §7.2 |
| **enum choices** | `kind: enum` (operator fixed to `Equal`) | **multiple-choice checkbox list** — §7.3 |
| custom (valueless) | `operator ∈ customOperators` | none ("this needs no value" hint row) |

### 7.1 State co-location

All five value fields live on the leaf (§6.1) and keep their values across
switches (the user's phrase→contains→phrase round-trip must not lose typed
text). `emitTree` reads only the one field the dispatch selects — the others
are discarded, mirroring the existing dialog.

### 7.2 Between

- Two inputs (`lowValue`, `highValue`); actslib `Between` is **inclusive on
  both bounds** and examines both.
- Validation: both filled; `low <= high` (numeric and date compare; string
  Between compares lexicographically per actslib — allowed, no extra rule).
- Emit: `{ property, operation: Between, lowValue, highValue }` (+
  `enumValues` passthrough if the property has it).
- Seed fold-back: a condition with `operation === Between` populates
  `lowValue`/`highValue` directly (no group involved).

### 7.3 Enum: multiple-choice (the first special case)

The leaf for a `kind: 'enum'` property offers `choices[]` as checkboxes
(`MatSelectionList`+`MatCheckbox` or a checkbox group; label =
`t(labelKey)`); its operator select shows `Equal` (disabled select — operator
is implied by the kind).

**Emit (Submit):**

- 1 value chosen → single condition
  `{ property, operation: Equal, lowValue: v, enumValues }`
- N > 1 values → a nested group
  `{ join: OR, conditions: [ {Equal, v₁, enumValues}, …, {Equal, vₙ, enumValues} ] }`
- 0 values → **invalid** (§9: enum leaf must pick at least one). There is no
  "inactive" escape: an all-empty tree is the way to clear the filter.

Rationale: actslib has no `In` operation; OR-of-`Equal` is the only faithful
encoding of "row's enum value ∈ chosen set", and attaching `enumValues` to
each condition reuses actslib's enum validation (non-members never match).

**Seed fold-back:** when `seedTree` meets an **OR group whose every member is**
`Equal` **on the same enum property**, it collapses it into ONE multi-choice
leaf (values = the `lowValue`s). The fold is deliberately strict (direct
members, all-`Equal`, same property) so hand-built or legacy definitions that
don't match stay editable as an OR group of word-level `Equal` leaves against…
nothing — the enum editor's operator select only offers `Equal`, so such
groups seed into leaves with the property's editor anyway; a lone
`Equal v` on an enum property seeds to the same leaf with `[v]` checked.

Consequence: the knowledge page's existing
`KnowledgeItemTypeCondition { field: 'itemType', itemTypes: [] }` maps 1:1 to
the enum leaf (its emit/fold round-trip is lossless for the
`itemTypes → OR-of-Equal` shape the page already evaluates by `includes`).

### 7.4 Custom (valueless) operators — `isPhrase`

`FilterCustomOperator.recognize` runs first during seed fold-back, so
`Contains ' '` on a property that declares the `isPhrase` custom op folds back
into that custom leaf (today's behavior, where `isPhrase` is stored natively
in `VocabularyCondition`). The `emit()` runs on Submit. `prepareValue` is
*skipped* for custom operators (they own their value). The recognizer must be
unambiguous — pages that also offer literal `' '` contains (none today) would
lose that distinction; documented as the hook's contract.

## 8. UI layout (follows the vocabulary dialog)

```
┌───────────────────────────── title: t(titleKey) ─────────────────────────────┐
│ ┌─ tree pane (splitLeft%) ──────┐ │ ┌─ detail pane (rest) ──────────────────┐ │
│ │ [+cond] [+group] [delete]    │ │ │ (group → join select + hint)          │ │
│ │ ─────────────────────────────│ │ │ (leaf  → property select             │ │
│ │ ▾ mat-tree, always expanded  │ │ │          operator select              │ │
│ │   rows: icon + label +       │◄┼►│          value editor per §7)         │ │
│ │   invalid ⚠ icon             │ │ │                                       │ │
│ │   (draggable splitter)       │ │ │                                       │ │
│ └──────────────────────────────┘ │ └───────────────────────────────────────┘ │
│ preview:  <label>  word starts app AND (chinese contains 派 OR rating ≥3)    │
│                                                    [Cancel]  [Submit]         │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Grid `splitLeft% / 8px splitter / 1fr`, 25–65 clamp, pointer + keyboard
  resize, stacked panes below ~720px — all copied from the vocabulary dialog
  (SCSS moves nearly verbatim; the `filter-` prefixes become `fdlg-` to read
  well outside the vocabulary page).
- Tree row label via `summarizeFilterDefinition`'s leaf renderer (`nodeLabel`):
  `"<property> <op> <value>"`, enum leaves `"<property> a/b"`, Between
  `"<property> 2≤x≤4"`, custom `"<property> <opLabel>"`.
- **Live preview**: same function, uncapped; menu labels on pages call it with
  their own cap (40 chars, ellipsis) — the summarize helper lives in the model
  file so both use one implementation.
- Toolbar: insert condition / insert group (depth-capped) / delete selected —
  identical targets/semantics as today.
- The whole thing sits in `mat-dialog` with the existing sizing conventions
  (`docs/material-dialog-sizing.md`).

### 8.1 Selection & keyboard

Unchanged from the vocabulary dialog: click or `(activation)` selects;
selection is id-based (`selectedId` signal) so immutable replacements don't
drop it; root preselected.

## 9. Validation (Submit gate)

`validateTree` returns per-leaf "missing value" flags + `invalidGroupIds`
(nested groups with `< 2` members; **root exempt**: 0 = clear-filter, 1 =
single-condition filter). A leaf is missing its value when the dispatch
selects an input and it is blank (`textValue.trim() === ''`,
`numberValue/dateValue == null`, any Between bound null,
`selectedChoices.length === 0`), or when Between has `low > high`.

- **Submit button** `[disabled]="!canSubmit()"` — the rule from the vocabulary
  session: `canSubmit = noMissingValue && noInvalidGroups`.
- Offending rows get the invalid class + `error` icon (tree), and the detail
  pane shows the matching hint below the offending control; group hints reuse
  `vocabularyExercises.filterGroupNeedsTwo`… → promoted to
  `common.filterGroupNeedsTwo` (§11).
- **No silent pruning on Submit** (today's `nodeToGroup` drops empty groups):
  validation prevents submitting one, so `emitTree` becomes total and the
  "empty group would match everything" hazard is blocked at the gate instead
  of cleaned up afterwards. `Cancel` still mutates nothing.
- `maxDepth` disables "+ group" at the deepest level (default 4), same as
  `VOCABULARY_FILTER_DIALOG_MAX_DEPTH` today.

## 10. Evaluation contract (page side)

Pages apply the result like the vocabulary page does today:

```ts
onDefineFilter(): void {
  this.dialog.open(SharedFilterDialogComponent, {
    data: { properties: PAGE_FILTER_PROPERTIES, root: this.filterDefinition() },
    width: '880px',
  }).afterClosed().pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(result => {
      if (result) { this.filterDefinition.set(result.root); this.applyCurrentFilter(); }
    });
}
```

The page's matcher is `FilterUtility.MatchFilter(target, definition)` with the
target carrying the evaluated fields — including the **per-user rating**
(`{ ...foldedRowFields, rating }`). `prepareValue` (D6) is invoked by the
dialog at emit time, so the definition the page stores already carries
case-folded string values (vocabulary's `enword`/`cnword` lowercasing).

## 11. i18n

- Reuse root `submit`/`cancel`, `common.joinAnd/joinOr`,
  `common.editFilter`, `common.addCondition`,
  `vocabularyExercises.filterJoinHint/filterJoinSelect/filterPreview/
  filterPreviewEmpty/filterDetailEmpty/filterSplitter` — **all these move to
  `common.*`** (one owner; the vocabulary keys stay as aliases during the
  migration and are removed in phase 4).
- New keys: `common.filterGroupNeedsTwo` (promoted), `common.opBetween`
  ("Between" / "介于"), `common.filterNeedsValue` (per-editor hint),
  `common.filterEnumNeedsChoice`, `common.filterEnumNoValueHint` (custom op
  hint), date picker keys (existing datepicker i18n via date-fns adapter).
- Operator labels for `FilterOperation` values need a shared
  `opLabel(op)` — the per-page `common.op*` keys already cover all of them
  (`opStartsWith`, `opContains`, …, `opLessThan`); a tiny
  `FILTER_OPERATION_LABEL_KEYS: Record<FilterOperation, string>` map lives in
  the model file.
- Property labels and enum choice labels are supplied by the schema (page's
  responsibility), so no new keys beyond the above.

## 12. Migration plan

**Phase 1 — build.** Shared dialog + model + specs (§13). No page touched.
Estimate: mostly *move*, not *write* — the vocabulary dialog's template/SCSS/
model functions generalize with the property-schema dispatch.

**Phase 2 — vocabulary adopts (proof).**
- `filterTree: VocabularyFilterGroup` → `filterDefinition: IFilterDefinition`.
- Delete `vocabulary-exercises-filter-dialog.*` and `VocabularyFilterGroup`,
  `toVocabularyFilterDefinition`, `summarizeVocabularyFilterTree`;
  `matchVocabularyListFilter` keeps its signature but the tree part becomes
  `FilterUtility.MatchFilter(foldedTarget, filter.root)` (values are already
  folded via `prepareValue`, so the predicate's fold of `enword`/`cnword`
  fields stays).
- Page filter bar's menu label switches to `summarizeFilterDefinition`.
- The worksheet/quiz/queue paths consume `getVisibleData()` unchanged (they
  never read the tree shape).
- Update `docs/vocabulary-exercises-architecture.md` §7.3/§8 to point here.

**Phase 3 — knowledge adopts (the enum proof).** Replace
`knowledge-exercises-filter-dialog` + the flat `KnowledgeListFilter` tree part
with one `IFilterDefinition` (`id`/`tags` string props, `itemType` enum with
`choices` from `getAllQuestionBankTypes()` + `QuestionBankTypeEnum` labels,
`rating` number). `matchKnowledgeListFilter` collapses to freeText-multi-term
AND `MatchFilter`. (D3/D7 get their real-world validation here — the
itemType multi-select existed as flat-AND before; now it also nests.)

*Status:* landed — `KNOWLEDGE_FILTER_PROPERTIES` (id/tags string + itemType
enum, `enumValues: QuestionBankTypeEnum`, choices labeled with the table's own
`getQuestionBankTypeDescription` strings + rating 0–5); the dialog deleted and
`matchKnowledgeListFilter` runs the multi-term freeText AND
`FilterUtility.MatchFilter` over a `{ id, itemType, tags, rating }` target
(text fields folded, itemType raw for enum validation).

**Phase 4 — chinese + translate.** Content filter and both rating filters
merge into one dialog per page (rating becomes just another property:
`kind: number`, ops `= > >= < <=`). Delete
`{chinese,translate}-exercises-*-filter-dialog.*`; drop `RatingCondition` /
`RatingOperatorEnum` from `ui-common.ts` once no hand-written matcher uses
them (`matchRating` retires with its last caller); bump app version
(`/bump-version`) at each adopter's landing.

*Status:* both landed. Chinese: subject/author/content (`string`, shape-match
whitelist, `prepareValue` fold) + rating (`number`, 0–5, unrated = 0) in one
`CHINESE_FILTER_PROPERTIES` schema. Translate: ensent/cnsent (`string`, same
fold) + rating in `SENTENCE_FILTER_PROPERTIES` (label key `english` — a new
top-level i18n key, the old dialog rendered the raw key). All four legacy
dialogs deleted; both page predicates delegate to `FilterUtility`; the two
menus per page collapsed into one Filter ▾. With no hand-written matcher left,
`RatingOperatorEnum`/`RatingCondition`/`matchRating`/`summarizeRatingFilter`/
`getRatingOperatorName` are now retired from `ui-common.ts`. All four pages'
rating whitelists carry the full numeric set including `Between` (inclusive
both bounds) — the legacy dialogs never offered it, the shared editor does.

**Phase 5 — doc + cleanup sweep.** Remove `common.*` aliases the old dialogs
needed, update CLAUDE.md's dialog list.

## 13. Testing strategy

`filter-dialog-model.spec.ts` (pure, the bulk of the value):

- seed fold-back: custom-ops, Between, OR-of-`Equal`→multi-choice, mixed
  nesting depth preserved, caller's def never mutated;
- emit: every dispatch row of §7, `prepareValue` applied (incl. skipped for
  custom ops), enum 0/1/N behavior, empty root → `conditions: []`;
- round-trip: `emitTree(seedTree(emitTree(seed))) === emitTree(seed)` for
  representative trees (the vocabulary spec's round-trip tests promoted);
- `validateTree` matrix; `summarize` (parens, cap, choice/between rendering).

`filter-dialog.component.spec.ts` (DOM, `TestBed` with the mocked-Transloco
harness the vocabulary spec established):

- tree refreshes after toolbar inserts/deletes (reference-trackBy guard);
- **join/operator/value edits flow through the signal** — assert
  `root()` identity changed (guards the OnPush staleness class of bug; note
  `fixture.detectChanges()` checks the whole tree and *masks* staleness, so
  the identity assertion is the real guard);
- enum editor renders checkboxes from schema, multi-select emits OR group
  (drive the real DOM), fold-back keeps the checkboxes checked;
- Between shows two inputs, validates low≤high;
- Submit disabled/enabled tracks `validateTree` live; invalid-group ⚠ icon;
- schema dispatch: switching property switches operator list and editor;
- depth cap hides +group; root never deletable; Cancel never mutates.

Run via `ng test` (never `npx vitest` directly); single-file runs with
concrete paths, not `**` globs (known builder gotcha).

## 14. Risks & open issues

| risk | mitigation |
|---|---|
| Fold-back ambiguity (`Contains ' '` = `isPhrase` or literal space?) | custom-op `recognize` runs first — the page's hook owns the interpretation; documented as its contract (§7.4). No page offers literal-space contains today. |
| Enum OR-of-equals emits groups the "≥2 members" rule could later reject after folding | the *emitted* definition is evaluated, not re-validated; `validateTree` only sees editor leaves. Single-value enums emit bare conditions anyway. |
| `prepareValue` double-folding (page also folds target fields) | the vocabulary page already folds both sides; the hook makes it explicit and single-sourced — page folds target, hook folds condition values, one rule each. |
| actslib string ops are case-sensitive | D6: folded at emit; target folded in the predicate — mirrors today, documented per page. |
| `date` kind has no current adopter | implemented in the dispatch table but untested against a page until one appears (spec covers the emit/seed path). Acceptable YAGNI line: kept because actslib supports dates natively and the cost is one editor case. |
| Knowledge page's per-term free-text search stays hand-written | out of scope by design (non-goal); the dialog replaces only the structured condition part. |

## 15. Explicitly deferred

- Negation (`NOT`) — needs actslib `IFilterDefinition` support first.
- `In` as a first-class actslib operation (would replace the OR-of-equals
  encoding; the leaf model and UI would not change — only `emitTree`).
- Saved filter presets / server-persisted per-user filters.
- A flat (non-tree) "simple mode" for casual users — the tree handles single
  conditions fine (root with one leaf).

---

## Appendix A — vocabulary `isPhrase` as a `FilterCustomOperator`

```ts
const IS_PHRASE: FilterCustomOperator = {
  id: 'isPhrase',
  labelKey: 'vocabularyExercises.wordOpIsPhrase',
  emit: property => ({ property, operation: FilterOperation.Contains, lowValue: ' ' }),
  recognize: c =>
    c.operation === FilterOperation.Contains && c.lowValue === ' '
};
```

## Appendix B — what is *not* reusable (stays per page)

1. freeText box + its predicate (each page's haystack differs — e.g.
   knowledge's multi-term recursive sub-item search);
2. the evaluated-target synthesis (which row fields + rating go into the
   object `MatchFilter` receives);
3. the property schema itself (that's the configuration);
4. the filter menu label cap and placement.
