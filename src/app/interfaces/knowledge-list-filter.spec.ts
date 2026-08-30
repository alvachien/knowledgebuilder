import { FilterJoinType, FilterOperation, type IFilterCondition, type IFilterDefinition } from 'actslib';

import {
  isKnowledgeListFilterEmpty,
  KNOWLEDGE_FILTER_PROPERTIES,
  matchKnowledgeListFilter,
  type KnowledgeListFilter,
} from './knowledge-list-filter';
import { QuestionBankTypeEnum } from './questionbank';
import { getAllQuestionBankTypes } from './questionbank-base';
import type { KnowledgeExerciseFileContent } from './questionbank-base';

const makeItem = (overrides: Partial<KnowledgeExerciseFileContent> = {}): KnowledgeExerciseFileContent => ({
  id: '1',
  order: 1,
  itemType: QuestionBankTypeEnum.SingleChoice,
  question: 'What is 1+1?',
  options: { A: 'one', B: 'two', C: 'three', D: 'four' },
  answer: 'B',
  tags: ['math'],
  itemTypeString: '单选题',
  hasAnswer: true,
  ...overrides,
});

const emptyRoot: IFilterDefinition = { join: FilterJoinType.AND, conditions: [] };
const emptyFilter: KnowledgeListFilter = { freeText: '', root: emptyRoot };

/** Shorthand for a leaf condition (values as the dialog emits them). */
const cond = (
  property: string,
  operation: FilterOperation,
  lowValue: string | number,
  enumValues?: IFilterCondition['enumValues']
): IFilterCondition => ({ property, operation, lowValue, ...(enumValues ? { enumValues } : {}) });

const filterWith = (...conditions: Array<IFilterCondition | IFilterDefinition>): KnowledgeListFilter => ({
  freeText: '',
  root: { join: FilterJoinType.AND, conditions },
});

describe('knowledge-list-filter', () => {
  describe('KNOWLEDGE_FILTER_PROPERTIES', () => {
    it('covers the text columns, the type enum and the rating', () => {
      expect(KNOWLEDGE_FILTER_PROPERTIES.map(p => p.key)).toEqual(['id', 'itemType', 'tags', 'rating']);
      expect(KNOWLEDGE_FILTER_PROPERTIES.map(p => p.kind)).toEqual(['string', 'enum', 'string', 'number']);
    });

    it('declares itemType as the question-type enum with a choice per type', () => {
      const itemType = KNOWLEDGE_FILTER_PROPERTIES.find(p => p.key === 'itemType');
      expect(itemType?.enumValues).toBe(QuestionBankTypeEnum);
      // One choice per offered type, valued with the raw enum member.
      const types = getAllQuestionBankTypes();
      expect(itemType?.choices?.map(c => c.value)).toEqual(Array.from(types.keys()));
      // Labels match the table's Type column descriptions.
      expect(itemType?.choices?.[0]?.labelKey).toBe(types.get(QuestionBankTypeEnum.SingleChoice));
    });

    it('whitelists shape-match operators on text and comparisons on rating', () => {
      const id = KNOWLEDGE_FILTER_PROPERTIES.find(p => p.key === 'id');
      expect(id?.operations).toEqual([
        FilterOperation.BeginsWith,
        FilterOperation.Contains,
        FilterOperation.Equal,
        FilterOperation.EndsWith,
      ]);
      expect(id?.prepareValue?.('  Ab  ')).toBe('ab');
      const rating = KNOWLEDGE_FILTER_PROPERTIES.find(p => p.key === 'rating');
      expect(rating?.operations).toEqual([
        FilterOperation.GreaterOrEqual,
        FilterOperation.GreaterThan,
        FilterOperation.Equal,
        FilterOperation.LessOrEqual,
        FilterOperation.LessThan,
        FilterOperation.Between,
      ]);
      expect(rating?.numberRange).toEqual({ min: 0, max: 5 });
    });
  });

  describe('isKnowledgeListFilterEmpty', () => {
    it('should be empty for the default criteria', () => {
      expect(isKnowledgeListFilterEmpty({ ...emptyFilter })).toBe(true);
    });

    it('should be non-empty for free text or any condition', () => {
      expect(isKnowledgeListFilterEmpty({ ...emptyFilter, freeText: 'x' })).toBe(false);
      expect(isKnowledgeListFilterEmpty(filterWith(cond('tags', FilterOperation.Contains, 'math')))).toBe(false);
      expect(isKnowledgeListFilterEmpty(filterWith(cond('rating', FilterOperation.Equal, 3)))).toBe(false);
    });

    it('should be empty when the root holds only empty sub-groups', () => {
      expect(
        isKnowledgeListFilterEmpty({
          ...emptyFilter,
          root: { join: FilterJoinType.AND, conditions: [{ join: FilterJoinType.OR, conditions: [] }] },
        })
      ).toBe(true);
    });
  });

  describe('matchKnowledgeListFilter', () => {
    it('should match everything for the empty filter', () => {
      expect(matchKnowledgeListFilter(makeItem(), 0, { ...emptyFilter })).toBe(true);
    });

    describe('free text', () => {
      it('should require every whitespace-separated term (case-insensitive)', () => {
        expect(matchKnowledgeListFilter(makeItem(), 0, { ...emptyFilter, freeText: 'What 1+1' })).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, { ...emptyFilter, freeText: 'WHAT' })).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, { ...emptyFilter, freeText: 'what missing' })).toBe(false);
      });

      it('should search across id, tags, options, answers, hint and extra info', () => {
        expect(matchKnowledgeListFilter(makeItem(), 0, { ...emptyFilter, freeText: 'math' })).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, { ...emptyFilter, freeText: 'two' })).toBe(true);
        expect(matchKnowledgeListFilter(makeItem({ extraInfo: ['deep note'] }), 0, { ...emptyFilter, freeText: 'deep' })).toBe(true);
        expect(matchKnowledgeListFilter(makeItem({ hintofanswer: 'hint text' }), 0, { ...emptyFilter, freeText: 'hint' })).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, { ...emptyFilter, freeText: 'absent' })).toBe(false);
      });

      it('should search sub-items of composite types', () => {
        const composite = makeItem({
          itemType: QuestionBankTypeEnum.ReadingComprehension,
          question: 'Passage',
          items: [
            {
              id: '1-1', order: 1, itemType: QuestionBankTypeEnum.TrueFalse, question: 'Sub question text',
            },
          ],
        });
        expect(matchKnowledgeListFilter(composite, 0, { ...emptyFilter, freeText: 'sub' })).toBe(true);
      });
    });

    describe('text conditions', () => {
      it('should match per field and operator, case-folded', () => {
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(cond('id', FilterOperation.Equal, '1')))).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(cond('id', FilterOperation.Equal, '2')))).toBe(false);
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(cond('id', FilterOperation.BeginsWith, '1')))).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(cond('id', FilterOperation.EndsWith, '2')))).toBe(false);
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(cond('tags', FilterOperation.Contains, 'ath')))).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(cond('tags', FilterOperation.Contains, 'sci')))).toBe(false);
        // The tags array is matched as its space-joined, folded text.
        const mixedCase = makeItem({ tags: ['Math', 'Algebra'] });
        expect(matchKnowledgeListFilter(mixedCase, 0, filterWith(cond('tags', FilterOperation.Contains, 'algebra')))).toBe(true);
      });

      it('should AND multiple conditions', () => {
        expect(
          matchKnowledgeListFilter(makeItem(), 0, filterWith(
            cond('tags', FilterOperation.Contains, 'math'),
            cond('id', FilterOperation.Equal, '1')
          ))
        ).toBe(true);
        expect(
          matchKnowledgeListFilter(makeItem(), 0, filterWith(
            cond('tags', FilterOperation.Contains, 'math'),
            cond('id', FilterOperation.Equal, '2')
          ))
        ).toBe(false);
      });
    });

    describe('itemType enum (the shared dialog proof)', () => {
      // The dialog emits one choice as a single Equal and N choices as an
      // OR-of-Equal group, both carrying enumValues.
      const eqType = (type: QuestionBankTypeEnum): IFilterCondition =>
        cond('itemType', FilterOperation.Equal, type, QuestionBankTypeEnum);

      it('matches a single type pick', () => {
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(eqType(QuestionBankTypeEnum.SingleChoice)))).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(eqType(QuestionBankTypeEnum.Essay)))).toBe(false);
      });

      it('matches an OR group (multi-select) when the row type is among the picks', () => {
        const anyOf: IFilterDefinition = {
          join: FilterJoinType.OR,
          conditions: [eqType(QuestionBankTypeEnum.Essay), eqType(QuestionBankTypeEnum.SingleChoice)],
        };
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(anyOf))).toBe(true);
        const noneOf: IFilterDefinition = {
          join: FilterJoinType.OR,
          conditions: [eqType(QuestionBankTypeEnum.Essay), eqType(QuestionBankTypeEnum.TrueFalse)],
        };
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(noneOf))).toBe(false);
      });

      it('never matches a non-member value (actslib enum validation)', () => {
        expect(
          matchKnowledgeListFilter(makeItem(), 0, filterWith(cond('itemType', FilterOperation.Equal, 'Nonsense', QuestionBankTypeEnum)))
        ).toBe(false);
      });
    });

    describe('rating conditions', () => {
      it('should apply numeric comparisons with unrated (0) semantics', () => {
        expect(matchKnowledgeListFilter(makeItem(), 5, filterWith(cond('rating', FilterOperation.LessThan, 1)))).toBe(false);
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(cond('rating', FilterOperation.LessThan, 1)))).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 3, filterWith(cond('rating', FilterOperation.GreaterOrEqual, 3)))).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 2, filterWith(cond('rating', FilterOperation.GreaterThan, 3)))).toBe(false);
        // Between is inclusive on both bounds (as the dialog's editor emits).
        const between = (low: number, high: number) => ({
          property: 'rating',
          operation: FilterOperation.Between,
          lowValue: low,
          highValue: high,
        });
        expect(matchKnowledgeListFilter(makeItem(), 3, filterWith(between(2, 4)))).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 0, filterWith(between(0, 1)))).toBe(true);
        expect(matchKnowledgeListFilter(makeItem(), 5, filterWith(between(2, 4)))).toBe(false);
      });
    });

    it('should AND free text, text, enum and rating dimensions', () => {
      const orTypes: IFilterDefinition = {
        join: FilterJoinType.OR,
        conditions: [
          cond('itemType', FilterOperation.Equal, QuestionBankTypeEnum.SingleChoice, QuestionBankTypeEnum),
          cond('itemType', FilterOperation.Equal, QuestionBankTypeEnum.Essay, QuestionBankTypeEnum),
        ],
      };
      const filter: KnowledgeListFilter = {
        freeText: 'what',
        root: { join: FilterJoinType.AND, conditions: [cond('tags', FilterOperation.Contains, 'math'), orTypes, cond('rating', FilterOperation.LessThan, 1)] },
      };
      expect(matchKnowledgeListFilter(makeItem(), 0, filter)).toBe(true);
      expect(matchKnowledgeListFilter(makeItem(), 4, filter)).toBe(false);
      expect(matchKnowledgeListFilter(makeItem({ tags: ['history'] }), 0, filter)).toBe(false);
    });
  });
});
