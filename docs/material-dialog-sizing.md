# Material Dialog Sizing & Scrollbar Notes

Date: 2026-08-22
Scope: the four vocabulary options dialogs — Review, Spelling, Quiz, Worksheet — in `src/app/pages/vocabulary-exercises/`. The findings are general to any Angular Material `MatDialog` in this app, so they're recorded here for future dialog work.

---

## 1. Prefer auto height — let the dialog size to its content

All four options dialogs were opened with a **fixed `height`** (`480px` for review/spelling/quiz, `660px` for worksheet) plus a `width`. The fixed height was a copy-paste default that had nothing to do with the content: the quiz dialog (a count input + two radio buttons) sat in a 480px box with a large empty lower third, and the worksheet dialog overflowed/separated from its conditional `uniformBlankLengthSize` field.

**Change:** dropped the `height` option from every `this.dialog.open(...)` config in `vocabulary-exercises.component.ts` (`onReviewWithOptions`, `onSpellingWithOptions`, `onQuizWithOptions`, `onWorksheetWithOptions`). The `width` is kept (`500px`, or `600px` for worksheet) for visual consistency; height now follows content. Angular Material's dialog surface already caps itself to the viewport, so an auto-height dialog never overflows the screen.

Guideline for future dialogs: **don't pass `height` unless you genuinely need a fixed box** (e.g. a scrollable list with a known tall body). Pass `width` only; let the content drive height.

---

## 2. Auto height exposed a latent scrollbar on checkbox-last dialogs

Once the fixed height was removed, the Review and Spelling options dialogs showed a thin vertical scrollbar they hadn't shown at 480px (the 480px box was tall enough that the content fit with room to spare). The Quiz dialog did **not** show one.

### Root cause (verified, not guessed)

`mat-mdc-dialog-content` has, from Angular Material's library CSS:

```css
.mat-mdc-dialog-content {
  display: block; flex-grow: 1; box-sizing: border-box; margin: 0;
  overflow: auto;
  max-height: 65vh;
}
/* with-actions variant: zero bottom padding */
.mat-mdc-dialog-content { padding: var(--mat-dialog-with-actions-content-padding, 20px 24px 0); }
.mat-mdc-dialog-content > :last-child { margin-bottom: 0; }
```

The checkbox carries an invisible hit area for touch targets:

```css
.mat-mdc-checkbox { display: inline-block; position: relative; }        /* ~24px tall */
.mat-mdc-checkbox-touch-target {
  position: absolute; top: 50%; left: 50%;
  height: 48px; width: 48px;
  transform: translate(-50%, -50%); display: block;                     /* overflows the host */
}
```

The touch target is `position:absolute` and **48px tall**, centered on a host that is only ~24px tall. It therefore overflows the host by ~12px on each side. Per CSS spec, an absolutely-positioned descendant contributes to the **`scrollHeight`** of its nearest scroll container ancestor — here, `mat-dialog-content` (`overflow:auto`). So when a checkbox is the **last** row of the dialog content, its touch target sticks ~11px below the in-flow content, and:

```
scrollHeight (145) > clientHeight (134)   →   11px vertical scrollbar
```

The `mat-dialog-content` padding being `… 0` on the bottom (the with-actions variant) means there is no padding region to absorb that overflow — it lands directly in the scrollable area.

The **radio button** has an identical `mat-mdc-radio-touch-target` (48px, absolute), so the Quiz dialog *would* overflow too — except its SCSS already gives the radio group `margin-bottom: 12px`:

```scss
/* vocabulary-exercises-quizoptions-dialog.scss */
.test-direction-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
```

That bottom breathing room absorbs the ~11px touch-target overflow, so `scrollHeight == clientHeight` and no scrollbar appears. The Review and Spelling option dialogs had **no SCSS file at all**, so they had zero bottom breathing room and showed the scrollbar.

### Empirical verification (headless Chrome, no app/auth needed)

Confirmed with a standalone HTML repro that replicated the exact library CSS above plus the actual dialog markup, computing `box.scrollHeight - box.clientHeight` on load and reading it via `chrome --headless --dump-dom`:

| Case | scrollHeight | clientHeight | overflow |
|---|---|---|---|
| Review/Spelling structure (checkbox last, `padding-bottom:0`) | 145 | 134 | **+11 → scrollbar** |
| Quiz structure (radio group has `margin-bottom:12px`) | 149 | 149 | 0 → none |
| Review/Spelling + `padding-bottom:12px` | 146 | 146 | 0 → none |

(The repro file is not committed; it lived under `tmp/` while measuring. Rebuild it from the CSS snippets in this section if you need to re-measure.)

### Fix

Added one shared SCSS, `vocabulary-exercises-options-dialogs.scss`, and wired it into the Review, Spelling, and Worksheet option-dialog components via `styleUrl`:

```scss
/* vocabulary-exercises-options-dialogs.scss */
.mat-mdc-dialog-content { padding-bottom: 12px; }
```

`padding-bottom` (not `margin-bottom` on the last child) is the robust choice: padding does not collapse, it adds real space *inside* the `clientHeight` padding box, and the absolute touch-target overflow (~11px) falls within that 12px region so it no longer exceeds `scrollHeight`. Verified: overflow 0 (Case 3 above).

The Quiz dialog was left alone — its existing radio-group `margin-bottom:12px` already prevents the scrollbar. (Switching it to the shared padding rule would be cosmetically equivalent; not worth the churn.)

### The Worksheet dialog is only intermittently affected

The worksheet content's last row is a checkbox (`uniformBlankLength`) **only when `uniformBlankLength` is unchecked**. When it's checked (the default), the conditional `uniformBlankLengthSize` form-field renders as the last row and there's no touch-target overflow. The shared SCSS covers both states, so the scrollbar can't appear in either.

---

## 3. Checklist for future Material dialogs

- **Don't set `height`** unless the body is a fixed, scrollable list. Let content drive height; set `width` only.
- If the dialog's last content row is a `mat-checkbox` / `mat-radio-button` (or anything with a 48px absolute touch target) **and** you see a thin phantom scrollbar, the cause is the touch target overflowing into `scrollHeight`. Fix it with bottom padding on `mat-dialog-content` (≥ 12px) — see `vocabulary-exercises-options-dialogs.scss`.
- The same overflow can appear on `mat-checkbox`/`mat-radio-button` used as the last child of *any* `overflow:auto` container (e.g. a `cdk-virtual-scroll` or a panel with `max-height`), not just dialogs. Same fix: give the scroll container `padding-bottom` ≥ the touch-target overflow, or move the control off the last row.
- When diagnosing "why is there a scrollbar on this small content?", measure `el.scrollHeight - el.clientHeight` in DevTools (or a headless-Chrome repro). The cause is almost always an absolute/touch-target element feeding `scrollHeight`, not the content you can see.
