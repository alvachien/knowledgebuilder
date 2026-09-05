# Filter Hierarchy Contract — Observations & Suggestions

Scope: the hierarchy rules of the shared filter dialog
(`src/app/shared/filter-dialog/`), as used by all four list pages.
Design source: `docs/reusable-filter-dialog-design.md` (§9, D1, D3, D7).
This note records the end-user mental model agreed in review (2026-09), how
it maps to the current code, how actslib's root type relates to it (refreshed
for actslib 0.6.83, which added `FilterRoot`), and three suggestions.
**Update 2026-09-03:** S3.1 and the case-0 submit gate have since been
adopted (see §2/§4 markers); the rest of the note is as reviewed.
**Update 2026-09-04:** the editor tree is normalized to a SINGLE top node —
the actslib root itself (bare/1-member seeds → one condition leaf; a 2+
member definition → one root GROUP row); the toolbar is exactly three
buttons with kind-based enablement and the toolbar join select is gone
(see §2 marker) — §1's "visible rows" column follows that.

## 1. The contract, stated positively (three cases)

A submitted filter is a tree in exactly one of three shapes:

| # | Shape | Editor tree (visible rows) | Emitted root | Semantics |
|---|---|---|---|---|
| 0 | **Empty** (no filter) | no rows (transient — deleting the one node; nothing is selected and the toolbar's inserts stand armed); Submit gated off | **not submittable** (Submit gate); the page's Clear Filter button sets `{ join, conditions: [] }` directly | match-all = the cleared-filter state; the menu offers "new filter", `hasActiveFilterDefinition()` returns false |
| 1 | **One node** | the single condition row — the root wrapper is never rendered (it holds at most one member), so the visible tree literally is one node | a bare condition `c` (`emitTree`'s wrapper passed through `Simplify` at Submit) | the whole hierarchy is a single condition; the root wrapper is invisible to the user and irrelevant to matching |
| 2 | **Group tree** | ONE root group row (the seed's definition itself, per 2026-09-04 normalization) with its member rows nested under it | nested definitions as parenthesized groups | leaves are conditions; every group branches — **≥2 children**; e.g. `condA AND (condB OR condC)`; the root group's join edits in the detail pane |

Case 1 has **two interchangeable spellings**. actslib 0.6.83 defines
`FilterRoot = IFilterCondition | IFilterDefinition` (`FilterUtility.ts:113`),
and `MatchFilter`/`FilterList` accept either form at the top: a bare condition
matches exactly like the 1-member wrapper `{ conditions: [c] }`.
`FilterUtility.ToDefinition(c)` (`:207`) turns the bare form into the wrapper;
`FilterUtility.Simplify(def)` (`:222`) turns a 1-member wrapper back into the
bare form. **As of 2026-09-03 the dialog transports the bare spelling** (§2,
S3.1): a single-condition filter leaves Submit as a bare `IFilterCondition`,
and either spelling may seed the dialog.

Rules that complete the picture for case 2:

- **Mixed members are valid.** A group may hold condition leaves *and* nested
  sub-groups side by side. Do not "simplify" the contract into "uniform member
  type per group" — the pages' matchers and `FilterUtility.MatchFilter` all
  support mixed trees, and the dialog relies on it. (actslib names this member
  union `FilterMember`, `:103` — the `IFilterCondition | IFilterDefinition`
  the app currently writes out inline.)
- **Nesting depth is a UI cap, not a validity rule.** `maxDepth` (default 4)
  only disables the "+ group" toolbar button at the deepest level;
  `seedTree` preserves structure at any depth, so a hand-built deeper seed
  stays editable and submittable.

## 2. Mapping to the current implementation

The code enforces the three cases above as the positive taxonomy, with two
post-review changes (2026-09-03): the dialog no longer submits case 0, and
case 1 now travels in its bare spelling.

- `validateTree` (`filter-dialog-model.ts`): flags leaves missing values and
  nested groups with `< 2` members (`invalidGroupIds`); the root is exempt
  from that rule via `walk(root, true)` (1 member = case 1), and a new
  `emptyTree` flag rejects a 0-member root — **case 0 is not submittable**,
  clearing belongs to the pages' Clear Filter button.
- Submit is gated on `canSubmit`, so a filter handed to a page never contains
  a 0-member tree or a 0- or 1-member *nested* group.
- `buildInitialTree` (component) opens an empty seed — the "new filter" case —
  scaffolded with **one blank condition**, selected, so the dialog opens in
  case 1: exactly one node (the detail pane lands on the condition editor
  for scaffolded *and* seeded case-1 trees alike). The editor therefore only
  ever presents cases 1/2; until the leaf is filled, the missing-value rule
  keeps Submit disabled, so case 0 never even becomes reachable at the gate.
- **(Revised 2026-09-04)** `seedTree` normalizes the seed to a SINGLE top
  node — the actslib root itself: a bare condition or any chain of
  1-member definition wrappers seeds one leaf (all case-1 spellings seed
  identically); a 2+ member definition becomes one GROUP node carrying the
  definition's join (case 2); an empty/absent seed yields no node. The
  wrapper remains the S2 recommendation — an invisible scaffold holding 0
  or 1 members, its join inert by construction and unwrapped by `Simplify`
  at Submit — so `treeData`'s top level renders at most one row and the
  navigator mirrors the root exactly. The toolbar is **exactly three
  buttons** (+ condition, + group, delete; the old toolbar join select is
  gone — every rendered group row, the top one included, edits its join in
  the detail pane), enabled by the selected node's kind: nothing selected
  (the empty tree) arms the two inserts (they land on the scaffold as THE
  node), a condition arms delete only, a group arms all three (it is the
  insert target). `onDeleteSelected` moves the selection to the parent
  group — or to nothing when the tree just emptied — so a node is selected
  unless the tree is empty; growth from case 1 runs delete → + group →
  + condition.
- `emitTree` returns an `IFilterDefinition`, but `onSubmit` now closes with
  `FilterUtility.Simplify(emitTree(...))`: a case-1 filter leaves the dialog
  as a **bare condition** (S3.1 adopted). `FilterDialogData.root` and
  `FilterDialogResult.root` are `FilterRoot`, `seedTree` folds a bare
  condition into root+leaf (both spellings seed identically), and
  `hasActiveFilterDefinition` / `summarizeFilterDefinition` accept both.
  Pages type their `filterDefinition` as `FilterRoot`; the pages' matchers
  already handed any `FilterRoot` to `MatchFilter` unchanged.
- Both group shapes the dialog **synthesizes** obey case 2 by construction:
  the enum multi-choice with N>1 values emits an OR group of N `Equal`s
  (always ≥2 members, `emitLeaf` at `filter-dialog-model.ts:420`), and a
  1-value enum emits a bare condition instead. Custom (valueless) operators
  emit bare conditions.
- Transient violations are reachable *during editing* only: "+ group" inserts
  a **single childless group node** (one click, one node — no seeded
  placeholder) which carries the ⚠ hint until its first two members are added,
  or a hand-built seed containing a 1-member sub-group (`seedTree` preserves
  it; the gate blocks Submit until the user fixes it).

## 3. How actslib's root type relates to the contract

Earlier actslib (`IFilterDefinition`-only at the top level) could not carry
case 1 as a bare condition — it had to travel as the 1-member wrapper. That
limitation is **gone in 0.6.83**:

- `FilterRoot = IFilterCondition | IFilterDefinition` (`:113`) and
  `FilterMember` (`:103`) are now exported.
- `MatchFilter` / `FilterList` (`:160`, `:175`) accept a `FilterRoot` (or a
  `FilterRoot[]`, joined by AND), normalizing a bare condition internally via
  `ToDefinition`.
- `ToDefinition(c)` (`:207`) wraps a bare condition into `{ conditions: [c] }`;
  `Simplify(def)` (`:222`) unwraps a 1-member *root* group back to its member
  (once, at the root — nested groups are left alone, since pruning those is
  caller policy). They are exact inverses at the root.

The wrapper is still harmless, and for the same reason: `MatchFilter` on a
1-member definition returns that member's result regardless of `join`
(`:175-198`), so the bare condition and its wrapper evaluate identically. That
is what makes the two case-1 spellings interchangeable. The
`IFilterDefinition` source comment (`:84-93`) now states this very three-case
taxonomy and points at `FilterRoot` — actslib adopted §1's positive
formulation on its own.

The round-trip is still lossless: `seedTree` copies whatever shape it is handed,
so a re-opened case-1 filter (wrapper **or** bare) shows the single condition,
and re-emitting is stable. The one place the wrapper still *matters* is
`emitTree`: it prunes only **empty** sub-groups; a 1-member nested group is
emitted as-is if the model is driven directly (unit tests) instead of through
the Submit gate. The gate is what keeps case 2's "≥2 children" true for emitted
output — remember this when asserting on hand-built trees in model specs.

Consequence for tests: assert at the right level. Editor-tree assertions
expect root + leaf (the wrapper node exists in the model); `emitTree`
assertions still expect the 1-member wrapper (the pure model function is
unchanged), while **Submit-boundary** assertions expect the bare condition —
`onSubmit` runs `Simplify` over `emitTree`'s result. Mixing the two levels is
the easy mistake here.

## 4. Suggestions

**S1 — Adopt the positive formulation in the docs (recommended, no behavior
change).** The upstream half has landed: actslib's own `IFilterDefinition`
comment now uses exactly this taxonomy and names the union `FilterRoot`. The
remaining work is our docs — rewrite the §9 / D7 sentence in
`reusable-filter-dialog-design.md` and the `CLAUDE.md` filter-pipeline bullets
from "nested groups ≥2, root exempt" to the three cases of §1, and state the
mixed-members rule explicitly (§1) so future refactors don't narrow it. The
exemption framing reads like a special case; the taxonomy reads like the model
it actually is.

**S2 — Keep `SharedFilterDialogNode` as the root type (recommendation: do not
re-model).** Letting the *editor* root be a bare leaf (union leaf | node) would
match case 1 in the type, but every recursive helper (`mutateNode`,
`parentIdOf`, `depthOf`, `appendMember`, `removeMember`, template recursion)
would grow a root-is-leaf branch, and case 0 still needs its own shape —
≈10 special cases traded for 1. actslib now offering a union `FilterRoot` does
not change this: `FilterRoot` is a *transport* type, and `ToDefinition` /
`Simplify` already bridge the editor's wrapper to it at the boundary, so the
single `isRoot` line in `validateTree` stays the cheapest carrier of the
taxonomy in the editor. **2026-09-04 note:** upheld — §2's single-top-node
normalization keeps the wrapper as the editor root type (0 or 1 members,
join inert); the case-1 "root node" the user sees is the one leaf it holds.

**S3 — Optional changes at the emit boundary and during editing (decisions
open).** Two separable ideas:

1. *Transport (now possible, one line):* if you want case 1 to leave the dialog
   as a bare condition rather than the 1-member wrapper, wrap the emit in
   `FilterUtility.Simplify(emitTree(...))` at the Submit boundary and widen the
   page-facing type to `FilterRoot`. Purely cosmetic — evaluation is identical
   (§3) — so only do it if the bare form reads better in persisted filters.
   Otherwise leave the wrapper; it is stable and lossless.
   **ADOPTED 2026-09-03** (§2): Submit runs `Simplify`; seed/result and the
   page signals are `FilterRoot`; a companion gate rejects the empty tree
   (case 0 stays the Clear Filter button's job).
2. *Editing hardening:* two paired edits would render `filterGroupNeedsTwo`
   unreachable in normal use — `removeMember` auto-dissolves a nested group
   left with exactly one member (hoist it into the parent), and "+ group" seeds
   two empty rows instead of zero. Trade-off, explicitly: this quietly rewrites
   the tree the user built, while the dialog's stated policy (D7: validate at
   the gate, no silent edits) prefers the transparent ⚠ hint. Users
   mid-construction ("isolate this one condition now, add its sibling later")
   would find the group dissolved under them. The gate-and-warn status quo is
   defensible; adopt the hardening only if testing feedback shows the warning
   is more annoyance than guidance. If adopted, keep `validateTree`'s ≥2 rule
   as the backstop for hand-built seeds.
   **PARTIALLY RESOLVED 2026-09-04:** testing rejected the old behavior from a
   different angle — seeding *one* empty leaf made "+ group" add two nodes per
   click and start every group already invalid. The seed is now **zero** rows
   (a childless group node: one click, one node, honest ⚠ until filled);
   "seeds two" was rejected as two phantoms per click, and `removeMember`
   auto-dissolve stays unadopted (D7: gate + warn, no silent edits).

## 5. Reference

- `src/app/shared/filter-dialog/filter-dialog-model.ts` — `validateTree`,
  `seedTree`, `emitTree` (returns `IFilterDefinition`), `emitLeaf`,
  `hasActiveFilterDefinition`
- `src/app/shared/filter-dialog/filter-dialog.component.ts` — `canSubmit`
  gate, `onSubmit`, `isNodeInvalid`
- `docs/reusable-filter-dialog-design.md` — D1/D3/D7, §7.3, §9
- `docs/vocabulary-exercises-architecture.md` — filter pipeline §, line ~433
- `node_modules/actslib/src/lib/utility/FilterUtility.ts` — evaluation
  semantics and the root taxonomy: `IFilterDefinition` (`:95`, comment
  `:84-93`), `FilterMember` (`:103`), `FilterRoot` (`:113`), `FilterList`
  (`:160`), `MatchFilter` (`:175-198`), `ToDefinition` (`:207`), `Simplify`
  (`:222`)
