import {
  FisherYatesShuffle,
  FilterJoinType,
  FilterOperation,
  FilterUtility,
  type IFilterDefinition,
} from 'actslib';

import { hasActiveFilterDefinition } from "../shared/filter-dialog/filter-dialog-model";
import type { FilterCustomOperator, FilterableProperty } from "../shared/filter-dialog/filter-dialog-model";

import type { LearnEnglishWordFileItem } from "./learnenglish";
import type { SelectionModeEnum } from "./ui-common";

// Letter in word
export interface VocabularySpellingLetter {
  idx: number;
  visible: boolean;
  letter: string;    
}

// Options of Vocaublary
export interface VocabularyOptionCore {
  countOfItems: number;
}

// Select options
export interface VocabularySelectOption {
  selectedSelectMode: SelectionModeEnum;
  importIDs?: string;
  countOfItems?: number;
  countOfOffset?: number;
  filterOnTag?: string;
}

// Printing vocabulary options
export interface VocabularyWorksheetOption extends VocabularyOptionCore {
  subTitle?: string;
  printEntryDate?: boolean;
  printFirstLetter?: boolean;
  // When true, FillInTheBlank blanks render at a fixed uniform width (hides word length).
  uniformBlankLength?: boolean;
  // Width (in &nbsp; cells) of the uniform blank; floored to 10 by the converter.
  uniformBlankLengthSize?: number;
}

// Typing vocabulary options
export interface VocabularySpellingOption extends VocabularyOptionCore {
  disableVoice: boolean;
  hideExplain: boolean;
}

// Dictation vocabulary options. Dictation plays each word's audio in turn on a
// fixed interval; there is no typing and no hide-audio/hide-description toggle,
// so only the item count is configurable.
export type VocabularyDictationOption = VocabularyOptionCore;

export interface VocabularyReviewOption extends VocabularyOptionCore {
  disableVoice: boolean;
  hideExplain: boolean;
}

/** Direction of a vocabulary test question: EN word -> CN explanation, or the reverse. */
export type VocabularyQuizDirection = 'en2cn' | 'cn2en';

// Test vocabulary options
export interface VocabularyQuizOption extends VocabularyOptionCore {
  direction: VocabularyQuizDirection;
}

/**
 * One generated single-choice question of a vocabulary test: the word pair it
 * tests, the prompt shown to the user, the shuffled candidate answers, and the
 * index of the correct one. Modeled on the knowledge-exercise SingleChoice
 * item (question + A-D options + answer), simplified for in-page sessions.
 */
export interface VocabularyQuizQuestion {
  enword: string;
  cnword: string;
  direction: VocabularyQuizDirection;
  /** Prompt text: the English word (en2cn) or the Chinese explanation (cn2en). */
  prompt: string;
  /** Candidate answers (2-4 entries), displayed in this order. */
  options: string[];
  /** Index into `options` of the correct answer. */
  answerIndex: number;
}

/** Per-word outcome of a finished vocabulary test. */
export interface VocabularyQuizQueueResult {
  enword: string;
  cnword: string;
  correct: boolean;
}

/** Candidate answers per question: the correct one plus this many distractors. */
const TEST_DISTRACTOR_COUNT = 3;

/**
 * Build single-choice questions for a vocabulary test. For each queued item,
 * the correct text (cnword in en2cn direction, enword in cn2en) is combined
 * with distinct-text distractors drawn from `pool` into a shuffled option
 * list. Distractors are deduplicated by displayed text - real word files
 * contain duplicate Chinese glosses, and an option identical to the correct
 * answer (or to another option) would be ambiguous. Items whose correct text
 * appears nowhere else in the pool (nothing to choose from) are skipped;
 * otherwise questions degrade to 2-3 options rather than repeat a text.
 */
export const buildVocabularyQuizQuestions = (
  items: { enword: string; cnword: string }[],
  pool: { enword: string; cnword: string }[],
  direction: VocabularyQuizDirection
): VocabularyQuizQuestion[] => {
  const questions: VocabularyQuizQuestion[] = [];
  for (const item of items) {
    const correctText = direction === 'en2cn' ? item.cnword : item.enword;

    const distractorTexts = new Set<string>();
    for (const candidate of FisherYatesShuffle(pool)) {
      const text = direction === 'en2cn' ? candidate.cnword : candidate.enword;
      if (text !== correctText) {
        distractorTexts.add(text);
        if (distractorTexts.size === TEST_DISTRACTOR_COUNT) {
          break;
        }
      }
    }

    // Every pool entry has the same text as the correct answer: no real choice.
    if (distractorTexts.size === 0) {
      continue;
    }

    const options = FisherYatesShuffle([correctText, ...distractorTexts]);
    questions.push({
      enword: item.enword,
      cnword: item.cnword,
      direction,
      prompt: direction === 'en2cn' ? item.enword : item.cnword,
      options,
      answerIndex: options.indexOf(correctText),
    });
  }
  return questions;
};

export enum VocabularySpellingStatusEnum {
  'NotStarted' = 0,
  'InProgress' = 1,
  'Completed' = 2,
}

export interface VocabularySpellingStatus {
  status: VocabularySpellingStatusEnum;
  correctWordCount: number;
  incorrectWordCount: number;
  totalWordCount: number;
  startTime: Date;
  endTime: Date;
}

export interface VocabularySpellingQueue {
  enword: string;
  cnword: string;
  completed: boolean;    
}

export interface VocabularySpellingQueueResult {
  enword: string;
  correct: boolean;
}

export interface ReviewQueueItem {
  enword: string;
  cnword: string;
  rating: number;
  itemId?: number;
};

// ── Filter-bar schema (shared filter dialog) ─────────────────────────────────
//
// The vocabulary filter is edited by SharedFilterDialogComponent; its seed and
// result are actslib `IFilterDefinition`, so this page keeps no tree model of
// its own (see docs/reusable-filter-dialog-design.md).

/** The `isPhrase` custom operator: a phrase is English text containing a
 *  space. Valueless (the editor shows no input) and recognized from its own
 *  `Contains ' '` emission when re-seeding. */
export const VOCABULARY_IS_PHRASE: FilterCustomOperator = {
  id: 'isPhrase',
  labelKey: 'vocabularyExercises.wordOpIsPhrase',
  emit: property => ({ property, operation: FilterOperation.Contains, lowValue: ' ' }),
  recognize: c => c.operation === FilterOperation.Contains && c.lowValue === ' ',
};

/** actslib string comparisons are case-sensitive while the page matches
 *  case-insensitively — the dialog folds emitted text values (this hook) and
 *  `matchVocabularyListFilter` folds the row fields the same way. */
const foldVocabularyText = (value: string | number): string => String(value).trim().toLowerCase();

const WORD_MATCH_OPERATIONS: FilterOperation[] = [
  FilterOperation.BeginsWith,
  FilterOperation.Contains,
  FilterOperation.Equal,
  FilterOperation.EndsWith,
];

/**
 * Vocabulary's filterable properties: the two text columns plus the per-user
 * rating. The phrase operator is offered only for the English word, and a
 * "notPhrase" variant was dropped (actslib `FilterUtility` has no negation).
 * `rating` is not a row field — the predicate passes it in the synthesized
 * target (see `matchVocabularyListFilter`); unrated words carry 0 and compare
 * numerically.
 */
export const VOCABULARY_FILTER_PROPERTIES: FilterableProperty[] = [
  {
    key: 'enword',
    labelKey: 'vocabularyExercises.word',
    kind: 'string',
    operations: WORD_MATCH_OPERATIONS,
    customOperators: [VOCABULARY_IS_PHRASE],
    prepareValue: foldVocabularyText,
  },
  {
    key: 'cnword',
    labelKey: 'chinese',
    kind: 'string',
    operations: WORD_MATCH_OPERATIONS,
    prepareValue: foldVocabularyText,
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

/** A fresh (empty) filter definition: matches everything, shown as "new filter". */
export const emptyVocabularyFilterDefinition = (): IFilterDefinition => ({
  join: FilterJoinType.AND,
  conditions: [],
});

/**
 * Combined criteria of the vocabulary list filter bar. `freeText` applies live
 * (cross-field substring over id/enword/cnword); `root` is the actslib
 * condition definition produced by the shared filter dialog. The definition
 * and freeText are ANDed. Condition values arrive case-folded (the dialog's
 * `prepareValue` hooks on `VOCABULARY_FILTER_PROPERTIES`).
 */
export interface VocabularyListFilter {
  /** Cross-field substring search over id/enword/cnword (legacy behaviour). */
  freeText: string;
  /** actslib filter definition (word/rating leaves and nested AND/OR groups). */
  root: IFilterDefinition;
}

/**
 * True when the filter carries nothing: blank freeText and no condition
 * anywhere in the definition (an empty root, or only empty sub-groups).
 */
export const isVocabularyListFilterEmpty = (filter: VocabularyListFilter): boolean =>
  filter.freeText.trim().length === 0 && !hasActiveFilterDefinition(filter.root);

/**
 * Single matching rule for the vocabulary list filter bar: freeText AND the
 * actslib definition. The definition is produced by the shared filter dialog
 * (its string values already trimmed + lowercased via `prepareValue`) and is
 * evaluated here by `FilterUtility.MatchFilter` against a case-folded target
 * carrying the row's rating; the free-text check concatenates id/enword/cnword
 * and has no per-property condition equivalent, so it stays hand-written. All
 * filtering decisions flow through here: the table predicate calls it and
 * nothing else grows private matching logic.
 */
export const matchVocabularyListFilter = (
  item: { id?: number; enword: string; cnword: string },
  rating: number,
  filter: VocabularyListFilter
): boolean => {
  const freeText = filter.freeText.trim().toLowerCase();
  if (freeText.length > 0) {
    // Mirrors the old default MatTableDataSource predicate: the row's
    // id/enword/cnword values concatenated, lowercased, substring-matched.
    const haystack = `${item.id ?? ''}${item.enword}${item.cnword}`.toLowerCase();
    if (!haystack.includes(freeText)) {
      return false;
    }
  }

  // FilterUtility compares strings case-sensitively, so the condition values
  // are folded by the dialog's prepareValue hooks and the row's text fields
  // fold here. The rating rides along as a numeric property: it lives in the
  // page's rating map, not on the row; unrated words pass 0 and compare
  // numerically, like unrated rows on every other list page.
  const target = {
    enword: item.enword.toLowerCase(),
    cnword: item.cnword.toLowerCase(),
    rating,
  };
  return FilterUtility.MatchFilter(target, filter.root);
};

export const VOCABULARY_UPLOAD_MAX_ITEMS = 10000;
export const VOCABULARY_UPLOAD_MAX_WORD_LENGTH = 500;

/** Hard failures that reject the whole upload. */
export type VocabularyUploadFailureReason = 'utf16' | 'parse' | 'not-array';

export type VocabularyUploadParseResult =
  | { ok: false; reason: VocabularyUploadFailureReason }
  | {
      ok: true;
      items: LearnEnglishWordFileItem[];
      /** Rows dropped because enword/cnword were missing or out of contract. */
      skippedCount: number;
      /** True when the import stopped early at VOCABULARY_UPLOAD_MAX_ITEMS rows. */
      truncated: boolean;
    };

/**
 * Parses a user-uploaded vocabulary JSON file (the Add Temp. File flow). The
 * same row contract as LearningContentService's word files applies; invalid
 * rows are skipped (and counted) instead of rejecting the whole file, and
 * hitting the item cap is reported rather than silently truncating.
 */
export const parseVocabularyUpload = (fileContent: string): VocabularyUploadParseResult => {
  // readAsText decodes UTF-16 files as mojibake; stray NUL bytes are the tell.
  if (fileContent.includes('\u0000')) {
    return { ok: false, reason: 'utf16' };
  }
  let parsed: unknown;
  try {
    // Excel/Notepad/PowerShell exports often carry a UTF-8 BOM that JSON.parse rejects.
    parsed = JSON.parse(fileContent.replace(/^\uFEFF/, ''));
  } catch {
    return { ok: false, reason: 'parse' };
  }
  if (!Array.isArray(parsed)) {
    return { ok: false, reason: 'not-array' };
  }

  const items: LearnEnglishWordFileItem[] = [];
  let skippedCount = 0;
  for (const raw of parsed) {
    const obj = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : undefined;
    const enword = typeof obj?.['enword'] === 'string' ? obj['enword'] : undefined;
    const cnword = typeof obj?.['cnword'] === 'string' ? obj['cnword'] : undefined;
    if (
      enword === undefined ||
      cnword === undefined ||
      enword.length <= 1 ||
      enword.length > VOCABULARY_UPLOAD_MAX_WORD_LENGTH ||
      cnword.length > VOCABULARY_UPLOAD_MAX_WORD_LENGTH
    ) {
      skippedCount++;
      continue;
    }
    items.push({ enword, cnword });
    if (items.length >= VOCABULARY_UPLOAD_MAX_ITEMS) {
      return { ok: true, items, skippedCount, truncated: true };
    }
  }
  return { ok: true, items, skippedCount, truncated: false };
};
