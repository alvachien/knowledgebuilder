//
// Filter pipeline of the knowledge exercises list page.
//
// The filter is edited by SharedFilterDialogComponent; its seed and result are
// actslib `IFilterDefinition`, so this page keeps no tree model of its own
// (see docs/reusable-filter-dialog-design.md — this page is the enum proof).

import {
  FilterJoinType,
  FilterOperation,
  FilterUtility,
  type IFilterDefinition,
} from 'actslib';

import { hasActiveFilterDefinition } from "../shared/filter-dialog/filter-dialog-model";
import type { FilterEnumChoice, FilterableProperty } from "../shared/filter-dialog/filter-dialog-model";

import { QuestionBankTypeEnum } from "./questionbank";
import { getAllQuestionBankTypes } from "./questionbank-base";
import type { KnowledgeExerciseFileContent } from "./questionbank-base";

/** actslib string comparisons are case-sensitive while the page matches
 *  case-insensitively — the dialog folds emitted text values (this hook) and
 *  `matchKnowledgeListFilter` folds the row fields the same way. Never
 *  applied to the itemType enum values (they must match raw). */
const foldKnowledgeText = (value: string | number): string => String(value).trim().toLowerCase();

const TEXT_MATCH_OPERATIONS: FilterOperation[] = [
  FilterOperation.BeginsWith,
  FilterOperation.Contains,
  FilterOperation.Equal,
  FilterOperation.EndsWith,
];

/**
 * Options of the Type multi-select: the SAME literal descriptions the table's
 * Type column renders (`getQuestionBankTypeDescription`), passed through as
 * label keys — Transloco returns an unknown key unchanged, so they display
 * as-is and the picker matches the column.
 */
const ITEM_TYPE_CHOICES: FilterEnumChoice[] = Array.from(
  getAllQuestionBankTypes(),
  ([value, label]) => ({ value, labelKey: label })
);

/**
 * Knowledge's filterable properties: the two text columns, the question-type
 * enum, and the per-user rating. Lexicographic string comparisons are not
 * offered (the same call the word/Chinese/sentence pages make). `itemType` is
 * the enum proof (§7.3): N picks emit an OR-of-`Equal` group that folds back
 * losslessly. `rating` is not a row field — the predicate passes it in the
 * synthesized target (see `matchKnowledgeListFilter`); unrated rows carry 0
 * and compare numerically.
 */
export const KNOWLEDGE_FILTER_PROPERTIES: FilterableProperty[] = [
  {
    key: 'id',
    labelKey: 'id',
    kind: 'string',
    operations: TEXT_MATCH_OPERATIONS,
    prepareValue: foldKnowledgeText,
  },
  {
    key: 'itemType',
    labelKey: 'knowledgeExercises.fieldType',
    kind: 'enum',
    enumValues: QuestionBankTypeEnum,
    choices: ITEM_TYPE_CHOICES,
  },
  {
    key: 'tags',
    labelKey: 'knowledgeExercises.tags',
    kind: 'string',
    operations: TEXT_MATCH_OPERATIONS,
    prepareValue: foldKnowledgeText,
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
export const emptyKnowledgeFilterDefinition = (): IFilterDefinition => ({
  join: FilterJoinType.AND,
  conditions: [],
});

/**
 * Combined criteria of the knowledge list filter bar. `freeText` applies live
 * (multi-term cross-field substring over id/question/tags/options/answers/
 * hint/extraInfo/sub-items, every whitespace-separated term required); `root`
 * is the actslib condition definition produced by the shared filter dialog.
 * The definition and freeText are ANDed. Text condition values arrive
 * case-folded (the dialog's `prepareValue` hooks on
 * `KNOWLEDGE_FILTER_PROPERTIES`); itemType values are raw enum members.
 */
export interface KnowledgeListFilter {
  /** Cross-field substring search (every term must match somewhere). */
  freeText: string;
  /** actslib filter definition (text/enum/rating leaves and nested groups). */
  root: IFilterDefinition;
}

/**
 * True when the filter carries nothing: blank freeText and no condition
 * anywhere in the definition (an empty root, or only empty sub-groups).
 */
export const isKnowledgeListFilterEmpty = (filter: KnowledgeListFilter): boolean =>
  filter.freeText.trim().length === 0 && !hasActiveFilterDefinition(filter.root);

/** Every searchable text of a row, joined. Mirrors the fields the former
 *  weighted free-text search covered (including sub-items of composite
 *  types); array-valued fields are flattened. */
const knowledgeItemSearchText = (
  item: Pick<
    KnowledgeExerciseFileContent,
    'id' | 'question' | 'tags' | 'options' | 'answer' | 'answers' | 'hintofanswer' | 'extraInfo' | 'items'
  >
): string => {
  const parts: string[] = [
    item.id ?? '',
    item.question ?? '',
    (item.tags ?? []).join(' '),
  ];
  if (item.options) {
    parts.push(...Object.values(item.options));
  }
  if (item.answer) {
    parts.push(item.answer);
  }
  if (item.answers) {
    parts.push(...item.answers);
  }
  if (item.hintofanswer) {
    parts.push(item.hintofanswer);
  }
  if (item.extraInfo) {
    parts.push(...item.extraInfo);
  }
  for (const sub of item.items ?? []) {
    parts.push(knowledgeItemSearchText(sub));
  }
  return parts.join(' ').toLowerCase();
};

/**
 * Single matching rule for the knowledge list filter bar: freeText (every
 * whitespace-separated term) AND the actslib definition. All filtering
 * decisions flow through here: the table predicate calls it and nothing else
 * grows private matching logic.
 */
export const matchKnowledgeListFilter = (
  item: KnowledgeExerciseFileContent,
  rating: number,
  filter: KnowledgeListFilter
): boolean => {
  const freeText = filter.freeText.trim().toLowerCase();
  if (freeText.length > 0) {
    const haystack = knowledgeItemSearchText(item);
    // Multi-term search: every whitespace-separated term must appear
    // somewhere (mirrors the former ranked search's all-terms gate).
    const terms = freeText.split(/\s+/).filter(term => term.length > 0);
    if (!terms.every(term => haystack.includes(term))) {
      return false;
    }
  }

  // FilterUtility compares strings case-sensitively, so the text condition
  // values are folded by the dialog's prepareValue hooks and the row's text
  // fields fold here. itemType rides along RAW — actslib validates it against
  // `enumValues` and compares exact members. The rating is not a row field:
  // it lives in the page's rating map; unrated rows pass 0 and compare
  // numerically, like unrated rows on every other list page.
  const target = {
    id: (item.id ?? '').toLowerCase(),
    itemType: item.itemType,
    tags: (item.tags ?? []).join(' ').toLowerCase(),
    rating,
  };
  return FilterUtility.MatchFilter(target, filter.root);
};
