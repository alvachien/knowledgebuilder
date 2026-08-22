import { fisherYatesShuffle } from "../shared/utils/shuffle";

import type { SelectionModeEnum, RatingOperatorEnum } from "./ui-common";
import { matchRating } from "./ui-common";

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
    for (const candidate of fisherYatesShuffle(pool)) {
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

    const options = fisherYatesShuffle([correctText, ...distractorTexts]);
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

/**
 * Word-text match operators offered by the vocabulary list filter bar. The
 * phrase operators are textless: they match on the word's shape (a phrase is
 * an enword containing a space) and stay active with blank text.
 */
export type WordMatchOperator = 'startsWith' | 'contains' | 'equal' | 'endsWith' | 'isPhrase' | 'notPhrase';

/** One ANDed word-match condition in the vocabulary list filter. */
export interface WordCondition {
  operator: WordMatchOperator;
  text: string;
}

/** True for the textless phrase operators (Is Phrase / Not Phrase). */
export const isPhraseOperator = (op: WordMatchOperator): boolean =>
  op === 'isPhrase' || op === 'notPhrase';

/**
 * True when a word condition participates in filtering: phrase operators are
 * always active, the text operators need non-blank text.
 */
export const isWordConditionActive = (c: WordCondition): boolean =>
  isPhraseOperator(c.operator) || c.text.trim().length > 0;

/** One ANDed rating condition in the vocabulary list filter. */
export interface RatingCondition {
  operator: RatingOperatorEnum;
  value: number;
}

/** Maximum characters before the word-filter summary is ellipsized. */
const WORD_SUMMARY_MAX = 40;

/**
 * Human-readable summary of the active word conditions for the Word menu's
 * dynamic label, e.g. "starts with a; ends with ing…". Blank-text rows are
 * inactive and skipped. `operatorLabel` supplies the localized operator name.
 */
export const summarizeWordFilter = (
  conditions: WordCondition[],
  operatorLabel: (op: WordMatchOperator) => string
): string => {
  const parts: string[] = [];
  for (const c of conditions) {
    if (isPhraseOperator(c.operator)) {
      // Textless condition: the operator label alone is the summary.
      parts.push(operatorLabel(c.operator));
      continue;
    }
    const text = c.text.trim();
    if (text.length === 0) {
      continue;
    }
    parts.push(`${operatorLabel(c.operator)} ${text}`);
  }
  const joined = parts.join('; ');
  if (joined.length <= WORD_SUMMARY_MAX) {
    return joined;
  }
  return `${joined.slice(0, WORD_SUMMARY_MAX - 1).trimEnd()}…`;
};

/**
 * Human-readable summary of the rating conditions for the Rating menu's
 * dynamic label, e.g. ">=3; =5". `operatorSymbol` supplies the operator
 * symbol (the component maps the 5 value-based operators to >= > = <= <).
 */
export const summarizeRatingFilter = (
  conditions: RatingCondition[],
  operatorSymbol: (op: RatingOperatorEnum) => string
): string =>
  conditions.map(c => `${operatorSymbol(c.operator)}${c.value}`).join('; ');

/**
 * Combined criteria of the vocabulary list filter bar. `freeText` applies live
 * (cross-field substring over id/enword/cnword); `wordConditions` and
 * `ratingConditions` are lists defined via the Word/Rating filter dialogs and
 * are ANDed together (and with freeText). A text word condition whose text is
 * blank is inactive (skipped); the phrase operators (`isPhrase`/`notPhrase`)
 * are textless and always active. (See
 * docs/superpowers/specs/2026-08-16-vocabulary-filter-menus-design.md.)
 */
export interface VocabularyListFilter {
  /** Cross-field substring search over id/enword/cnword (legacy behaviour). */
  freeText: string;
  /** ANDed; blank-text rows are inactive. */
  wordConditions: WordCondition[];
  /** ANDed. */
  ratingConditions: RatingCondition[];
}

export const isVocabularyListFilterEmpty = (filter: VocabularyListFilter): boolean =>
  filter.freeText.trim().length === 0 &&
  !filter.wordConditions.some(isWordConditionActive) &&
  filter.ratingConditions.length === 0;

/**
 * Single matching rule for the vocabulary list filter bar. freeText AND every
 * active word condition AND every rating condition. All filtering decisions
 * flow through here: the table predicate calls it and nothing else grows
 * private matching logic.
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

  const enword = item.enword.toLowerCase();
  for (const c of filter.wordConditions) {
    if (isPhraseOperator(c.operator)) {
      // A phrase is an enword containing a space.
      const isPhrase = item.enword.indexOf(' ') !== -1;
      if (c.operator === 'isPhrase' ? !isPhrase : isPhrase) {
        return false;
      }
      continue;
    }
    const text = c.text.trim().toLowerCase();
    if (text.length === 0) {
      continue;
    }
    switch (c.operator) {
      case 'startsWith':
        if (!enword.startsWith(text)) {
          return false;
        }
        break;
      case 'contains':
        if (!enword.includes(text)) {
          return false;
        }
        break;
      case 'equal':
        if (enword !== text) {
          return false;
        }
        break;
      case 'endsWith':
        if (!enword.endsWith(text)) {
          return false;
        }
        break;
    }
  }

  for (const c of filter.ratingConditions) {
    if (!matchRating(rating, c.operator, c.value)) {
      return false;
    }
  }

  return true;
};
