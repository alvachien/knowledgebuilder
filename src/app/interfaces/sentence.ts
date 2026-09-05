import {
  FilterOperation,
  FilterUtility,
  FisherYatesShuffle,
  type FilterRoot,
} from 'actslib';

import { hasActiveFilterDefinition } from "../shared/filter-dialog/filter-dialog-model";
import type { FilterableProperty } from "../shared/filter-dialog/filter-dialog-model";
import { pickWeighted } from "../shared/utils/shuffle";

// ── Filter-bar schema (shared filter dialog) ───────────────────────────────
//
// The sentence list filter is edited by SharedFilterDialogComponent; its seed
// and result are actslib `FilterRoot` (a group definition, or a bare condition
// for a single-condition filter), so this page keeps no tree model of its own
// (see docs/reusable-filter-dialog-design.md).

/** actslib string comparisons are case-sensitive while the page matches
 *  case-insensitively — the dialog folds emitted text values (this hook) and
 *  `matchSentenceListFilter` folds the row fields the same way. */
const foldSentenceText = (value: string | number): string => String(value).trim().toLowerCase();

const SENTENCE_MATCH_OPERATIONS: FilterOperation[] = [
  FilterOperation.BeginsWith,
  FilterOperation.Contains,
  FilterOperation.Equal,
  FilterOperation.EndsWith,
];

/**
 * Sentence's filterable properties: the two text columns plus the per-user
 * rating. Lexicographic string comparisons are not offered (the same call the
 * word/Chinese pages make). `rating` is not a row field — the predicate passes
 * it in the synthesized target (see `matchSentenceListFilter`); unrated
 * sentences carry 0 and compare numerically.
 */
export const SENTENCE_FILTER_PROPERTIES: FilterableProperty[] = [
  {
    key: 'ensent',
    labelKey: 'english',
    kind: 'string',
    operations: SENTENCE_MATCH_OPERATIONS,
    prepareValue: foldSentenceText,
  },
  {
    key: 'cnsent',
    labelKey: 'chinese',
    kind: 'string',
    operations: SENTENCE_MATCH_OPERATIONS,
    prepareValue: foldSentenceText,
  },
  {
    key: 'rating',
    labelKey: 'rating',
    kind: 'number',
    operations: [
      FilterOperation.GreaterOrEqual,
      FilterOperation.GreaterThan,
      FilterOperation.Equal,
      FilterOperation.LessOrEqual,
      FilterOperation.LessThan,
      FilterOperation.Between,
    ],
    numberRange: { min: 0, max: 5 },
  },
];

/**
 * Combined criteria of the sentence list filter bar. `freeText` applies live
 * (cross-field substring over id/ensent/cnsent); `root` is the actslib
 * condition definition produced by the shared filter dialog. The definition
 * and freeText are ANDed. Condition values arrive case-folded (the dialog's
 * `prepareValue` hooks on `SENTENCE_FILTER_PROPERTIES`).
 */
export interface SentenceListFilter {
  /** Cross-field substring search over id/ensent/cnsent (legacy behaviour). */
  freeText: string;
  /** actslib filter root (text/rating leaves and nested AND/OR groups; a bare
   *  condition when the filter is a single condition). */
  root: FilterRoot;
}

/**
 * True when the filter carries nothing: blank freeText and no condition
 * anywhere in the definition (an empty root, or only empty sub-groups).
 */
export const isSentenceListFilterEmpty = (filter: SentenceListFilter): boolean =>
  filter.freeText.trim().length === 0 && !hasActiveFilterDefinition(filter.root);

/**
 * Single matching rule for the sentence list filter bar: freeText AND the
 * actslib definition. All filtering decisions flow through here: the table
 * predicate calls it and nothing else grows private matching logic.
 */
export const matchSentenceListFilter = (
  item: { id?: string; ensent: string; cnsent: string },
  rating: number,
  filter: SentenceListFilter
): boolean => {
  const freeText = filter.freeText.trim().toLowerCase();
  if (freeText.length > 0) {
    // Mirrors the old default MatTableDataSource predicate: the row's
    // id/ensent/cnsent values concatenated, lowercased, substring-matched.
    const haystack = `${item.id ?? ''}${item.ensent}${item.cnsent}`.toLowerCase();
    if (!haystack.includes(freeText)) {
      return false;
    }
  }

  // FilterUtility compares strings case-sensitively, so the condition values
  // are folded by the dialog's prepareValue hooks and the row's text fields
  // fold here. The rating rides along as a numeric property: it lives in the
  // page's rating map, not on the row; unrated sentences pass 0 and compare
  // numerically, like unrated rows on every other list page.
  const target = {
    ensent: item.ensent.toLowerCase(),
    cnsent: item.cnsent.toLowerCase(),
    rating,
  };
  return FilterUtility.MatchFilter(target, filter.root);
};

/** Marker replacing the blanked-out word in a cloze question's prompt. */
export const SENTENCE_QUIZ_BLANK = '_____';

/**
 * One generated cloze (fill-in-the-blank) question of a sentence quiz: one
 * English word is blanked out of the EN sentence (`prompt`) and must be
 * picked from `options`; the CN sentence is the meaning hint.
 */
export interface SentenceQuizQuestion {
  ensent: string;
  cnsent: string;
  /** The EN sentence with the blanked word replaced by SENTENCE_QUIZ_BLANK. */
  prompt: string;
  /** Candidate answers (2-4 entries), displayed in this order. */
  options: string[];
  /** Index into `options` of the correct answer. */
  answerIndex: number;
}

/** Per-sentence outcome of a finished sentence quiz. */
export interface SentenceQuizQueueResult {
  ensent: string;
  cnsent: string;
  correct: boolean;
}

/** Minimum bare-word length for a cloze blank candidate or distractor. */
const CLOZE_MIN_WORD_LENGTH = 3;
/** Distractors gathered per cloze question. */
const CLOZE_DISTRACTOR_COUNT = 3;

/**
 * Strip leading/trailing non-letter characters from one whitespace token;
 * internal apostrophes survive ("don't" stays whole).
 */
const stripTokenPunctuation = (token: string): string =>
  token.replace(/^[^\p{L}']+|[^\p{L}']+$/gu, '');

/**
 * Whether a bare word can serve as a cloze blank/answer: long enough and
 * lowercase-initial, so the casing of pool distractors never leaks the answer
 * (sentence-initial words and capitalized tokens are excluded by this).
 */
const isClozeWord = (word: string): boolean =>
  word.length >= CLOZE_MIN_WORD_LENGTH && /^[a-z]/.test(word);

/**
 * Words appearing capitalized at a non-initial position anywhere in the pool
 * are treated as proper nouns (names): they are never blanked nor offered as
 * options, even when the same word occurs lowercase in another sentence.
 */
const collectNameWords = (pool: { ensent: string }[]): Set<string> => {
  const names = new Set<string>();
  for (const sentence of pool) {
    const tokens = sentence.ensent.trim().split(/\s+/);
    for (let i = 1; i < tokens.length; i++) {
      const word = stripTokenPunctuation(tokens[i]);
      if (/^[A-Z]/.test(word)) {
        names.add(word.toLowerCase());
      }
    }
  }
  return names;
};

/** Qualifying bare words of a sentence with their token indexes. */
const clozeCandidates = (
  ensent: string,
  nameWords: ReadonlySet<string>
): { word: string; index: number }[] => {
  const tokens = ensent.trim().split(/\s+/);
  const candidates: { word: string; index: number }[] = [];
  // Index 0 (sentence-initial) is excluded: its capitalization would stand
  // out among lowercase distractors.
  for (let i = 1; i < tokens.length; i++) {
    const word = stripTokenPunctuation(tokens[i]);
    if (isClozeWord(word) && !nameWords.has(word.toLowerCase())) {
      candidates.push({ word, index: i });
    }
  }
  return candidates;
};

/**
 * Build cloze questions for a sentence quiz: per item, one qualifying EN word
 * is blanked out of the sentence and must be picked from candidates drawn
 * from the pool's words. The blank is chosen randomly with a bias towards
 * longer (content) words; words seen capitalized mid-sentence anywhere in the
 * pool count as names and are never used. Items without a blankable word, or
 * whose pool yields no distinct distractor, are skipped; options end up 2-4
 * entries.
 */
export const buildSentenceQuizQuestions = (
  items: { ensent: string; cnsent: string }[],
  pool: { ensent: string; cnsent: string }[]
): SentenceQuizQuestion[] => {
  const nameWords = collectNameWords(pool);
  const poolWords = FisherYatesShuffle(
    pool.flatMap(s => clozeCandidates(s.ensent, nameWords).map(c => c.word))
  );
  const questions: SentenceQuizQuestion[] = [];
  for (const item of items) {
    // Longer words weigh more, so the blank lands on a content word more
    // often than on a short filler one.
    const answer = pickWeighted(clozeCandidates(item.ensent, nameWords), c => c.word.length);
    if (!answer) {
      continue;
    }

    const distractors: string[] = [];
    const seen = new Set<string>([answer.word.toLowerCase()]);
    for (const word of poolWords) {
      const key = word.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      distractors.push(word);
      if (distractors.length === CLOZE_DISTRACTOR_COUNT) {
        break;
      }
    }
    // Every pool word matches the answer: no real choice.
    if (distractors.length === 0) {
      continue;
    }

    const tokens = item.ensent.trim().split(/\s+/);
    tokens[answer.index] = SENTENCE_QUIZ_BLANK;
    const options = FisherYatesShuffle([answer.word, ...distractors]);
    questions.push({
      ensent: item.ensent,
      cnsent: item.cnsent,
      prompt: tokens.join(' '),
      options,
      answerIndex: options.indexOf(answer.word),
    });
  }
  return questions;
};

/** One item of a sentence review session: the sentence pair and its live rating. */
export interface SentenceReviewQueueItem {
  ensent: string;
  cnsent: string;
  rating: number;
  /** Pre-hashed rating item key (ratingItemKey of the sentence id), when rated. */
  itemId?: number;
}

/** Review options of the sentence page. */
export interface SentenceReviewOption {
  countOfItems: number;
  disableVoice: boolean;
}

/** Quiz options of the sentence page. */
export interface SentenceQuizOption {
  countOfItems: number;
}

/** Per-sentence outcome of a finished typing (translation) session. */
export interface SentenceTypingResult {
  ensent: string;
  cnsent: string;
  inputted: string;
  correct: boolean;
}

/**
 * Normalize a typed sentence for grading: trim, strip any run of trailing
 * sentence punctuation (EN or CN), lowercase, collapse internal whitespace.
 * The normalized input and target are then compared for equality.
 */
export const normalizeSentenceAnswer = (text: string): string =>
  text
    .trim()
    .replace(/[.?!。？！]+$/u, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
