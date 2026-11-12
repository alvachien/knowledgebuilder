/**
 * The single source of truth for the icon that stands for each study destination.
 *
 * These names are Material Icons *ligatures* (the font renders the glyph from the
 * text), so they are plain strings — no icon registry, no SVG assets. The homepage
 * ledger rows, its feature notes and the navbar drawer all point at the same seven
 * routes, and they had drifted (`translate` meant "Vocabulary" on the ledger but
 * "Sentences" in the navbar; Knowledge Bank was `school` / `library_books` /
 * `account_balance` in three places). One key per route, one glyph per key: if a
 * page needs a new entry point, add it here rather than picking an icon locally.
 *
 * Key = the route's path segment (`/translating` is the Sentences page). Both the header
 * bar's destinations (icon-only, name in the tooltip) and the mobile drawer bind to this
 * map, so one destination never gets two glyphs in the same app.
 */
export const NAV_ICON = {
  /** Word lists, EN <-> CN — the book is the vocabulary ledger. */
  vocabulary: 'menu_book',
  /** Sentence translation — the route is literally /translating. */
  translating: 'translate',
  listening: 'headphones',
  /** Chinese classics; `font_download` reads as 字/字体 on the KaiTi-heavy pages. */
  chinese: 'font_download',
  /** Math/physics/chemistry formulas. */
  formula: 'functions',
  /** Knowledge Bank exercises — books, not the columned-bank glyph. */
  knowledge: 'library_books',
  habits: 'track_changes',
  /** The AI-assistance feature note (not a route). */
  ai: 'smart_toy',
  /** Broad "covers several languages" feature note — kept off `translate`,
   *  which is claimed by the Sentences route. */
  languages: 'language',
  /** Entry point, not a study category: the help page (`/help`, homepage CTA + navbar). */
  help: 'help_outline',
} as const;
