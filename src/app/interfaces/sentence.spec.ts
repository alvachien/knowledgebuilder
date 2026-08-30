import { FilterJoinType, FilterOperation, type IFilterCondition, type IFilterDefinition } from 'actslib';

import {
  buildSentenceQuizQuestions,
  isSentenceListFilterEmpty,
  matchSentenceListFilter,
  normalizeSentenceAnswer,
  SENTENCE_FILTER_PROPERTIES,
  SENTENCE_QUIZ_BLANK,
  type SentenceListFilter,
} from './sentence';

const emptyRoot: IFilterDefinition = { join: FilterJoinType.AND, conditions: [] };
const baseFilter: SentenceListFilter = { freeText: '', root: emptyRoot };

const item = { id: 's-7', ensent: 'Apple pie is sweet.', cnsent: '苹果派很甜。' };

/** Shorthand for a leaf condition (values as the dialog emits them, folded). */
const cond = (property: string, operation: FilterOperation, lowValue: string | number): IFilterCondition => ({
  property,
  operation,
  lowValue,
});

const filterWith = (...conditions: Array<IFilterCondition | IFilterDefinition>): SentenceListFilter => ({
  freeText: '',
  root: { join: FilterJoinType.AND, conditions },
});

describe('sentence.ts', () => {
  describe('SENTENCE_FILTER_PROPERTIES', () => {
    it('covers the two text columns plus the rating', () => {
      expect(SENTENCE_FILTER_PROPERTIES.map(p => p.key)).toEqual(['ensent', 'cnsent', 'rating']);
      expect(SENTENCE_FILTER_PROPERTIES.map(p => p.kind)).toEqual(['string', 'string', 'number']);
    });

    it('whitelists shape-match operators on text and folds values', () => {
      const en = SENTENCE_FILTER_PROPERTIES.find(p => p.key === 'ensent');
      expect(en?.operations).toEqual([
        FilterOperation.BeginsWith,
        FilterOperation.Contains,
        FilterOperation.Equal,
        FilterOperation.EndsWith,
      ]);
      expect(en?.prepareValue?.('  Apple  ')).toBe('apple');
    });

    it('offers the full comparison set on rating (incl. Between), ranged 0..5', () => {
      const rating = SENTENCE_FILTER_PROPERTIES.find(p => p.key === 'rating');
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

  describe('isSentenceListFilterEmpty', () => {
    it('is empty when no condition is set', () => {
      expect(isSentenceListFilterEmpty({ ...baseFilter })).toBe(true);
    });

    it('is not empty when free text or a condition is set', () => {
      expect(isSentenceListFilterEmpty({ ...baseFilter, freeText: 'a' })).toBe(false);
      expect(isSentenceListFilterEmpty(filterWith(cond('ensent', FilterOperation.Contains, 'a')))).toBe(false);
    });

    it('is empty when the root holds only empty sub-groups', () => {
      expect(
        isSentenceListFilterEmpty({
          ...baseFilter,
          root: { join: FilterJoinType.AND, conditions: [{ join: FilterJoinType.OR, conditions: [] }] },
        })
      ).toBe(true);
    });
  });

  describe('matchSentenceListFilter', () => {
    it('matches everything when the filter is empty', () => {
      expect(matchSentenceListFilter(item, 0, { ...baseFilter })).toBe(true);
    });

    it('free text matches id, ensent and cnsent case-insensitively', () => {
      expect(matchSentenceListFilter(item, 0, { ...baseFilter, freeText: 'APPLE' })).toBe(true);
      expect(matchSentenceListFilter(item, 0, { ...baseFilter, freeText: '苹果' })).toBe(true);
      expect(matchSentenceListFilter(item, 0, { ...baseFilter, freeText: 's-7' })).toBe(true);
      expect(matchSentenceListFilter(item, 0, { ...baseFilter, freeText: 'banana' })).toBe(false);
    });

    it('each condition honors its operator against the chosen field, case-folded', () => {
      // Dialog-emitted values arrive folded; the row fields fold in the predicate.
      expect(matchSentenceListFilter(item, 0, filterWith(cond('ensent', FilterOperation.BeginsWith, 'apple pie')))).toBe(true);
      expect(matchSentenceListFilter(item, 0, filterWith(cond('ensent', FilterOperation.BeginsWith, 'pie')))).toBe(false);
      expect(matchSentenceListFilter(item, 0, filterWith(cond('ensent', FilterOperation.EndsWith, 'sweet.')))).toBe(true);
      expect(matchSentenceListFilter(item, 0, filterWith(cond('ensent', FilterOperation.Equal, 'apple pie is sweet.')))).toBe(true);
      expect(matchSentenceListFilter(item, 0, filterWith(cond('cnsent', FilterOperation.Contains, '苹果')))).toBe(true);
      // ensent field only: the Chinese sentence must not match an 'ensent' condition.
      expect(matchSentenceListFilter(item, 0, filterWith(cond('ensent', FilterOperation.Contains, '苹果')))).toBe(false);
    });

    it('ANDs multiple conditions across fields', () => {
      expect(
        matchSentenceListFilter(item, 0, filterWith(
          cond('ensent', FilterOperation.BeginsWith, 'apple'),
          cond('cnsent', FilterOperation.EndsWith, '。')
        ))
      ).toBe(true);
      expect(
        matchSentenceListFilter(item, 0, filterWith(
          cond('ensent', FilterOperation.BeginsWith, 'apple'),
          cond('cnsent', FilterOperation.EndsWith, '？')
        ))
      ).toBe(false);
    });

    it('ANDs rating conditions with unrated (0) semantics', () => {
      expect(
        matchSentenceListFilter(item, 3, filterWith(
          cond('ensent', FilterOperation.Contains, 'pie'),
          cond('rating', FilterOperation.GreaterOrEqual, 3)
        ))
      ).toBe(true);
      expect(matchSentenceListFilter(item, 2, filterWith(cond('rating', FilterOperation.GreaterOrEqual, 3)))).toBe(false);
      // Unrated rows carry 0 and compare numerically.
      expect(matchSentenceListFilter(item, 0, filterWith(cond('rating', FilterOperation.LessThan, 1)))).toBe(true);
      expect(matchSentenceListFilter(item, 0, filterWith(cond('rating', FilterOperation.Equal, 0)))).toBe(true);
      // Between is inclusive on both bounds (as the dialog's editor emits).
      const between = (low: number, high: number) => ({
        property: 'rating',
        operation: FilterOperation.Between,
        lowValue: low,
        highValue: high,
      });
      expect(matchSentenceListFilter(item, 3, filterWith(between(2, 4)))).toBe(true);
      expect(matchSentenceListFilter(item, 0, filterWith(between(0, 1)))).toBe(true);
      expect(matchSentenceListFilter(item, 5, filterWith(between(2, 4)))).toBe(false);
    });

    it('evaluates nested AND/OR groups (SQL-WHERE nesting)', () => {
      const group: SentenceListFilter = {
        freeText: '',
        root: {
          join: FilterJoinType.AND,
          conditions: [
            cond('ensent', FilterOperation.Contains, 'pie'),
            {
              join: FilterJoinType.OR,
              conditions: [
                cond('cnsent', FilterOperation.Contains, '香蕉'),
                cond('rating', FilterOperation.GreaterOrEqual, 2),
              ],
            },
          ],
        },
      };
      expect(matchSentenceListFilter(item, 2, group)).toBe(true);
      expect(matchSentenceListFilter(item, 1, group)).toBe(false);
    });

    it('ANDs free text with the definition', () => {
      expect(
        matchSentenceListFilter(item, 0, {
          freeText: 'apple',
          root: { join: FilterJoinType.AND, conditions: [cond('cnsent', FilterOperation.Contains, '香蕉')] },
        })
      ).toBe(false);
      expect(
        matchSentenceListFilter(item, 0, {
          freeText: 'apple',
          root: { join: FilterJoinType.AND, conditions: [cond('cnsent', FilterOperation.Contains, '苹果')] },
        })
      ).toBe(true);
    });
  });

  describe('buildSentenceQuizQuestions', () => {
    const pool = [
      { ensent: 'Apple pie is sweet.', cnsent: '苹果派很甜。' },
      { ensent: 'The sky is blue.', cnsent: '天空是蓝色的。' },
      { ensent: 'Cats like fish.', cnsent: '猫喜欢鱼。' },
      { ensent: 'Dogs bark loudly.', cnsent: '狗大声吠叫。' },
    ];

    it('builds one cloze question per item with the answer at answerIndex', () => {
      const questions = buildSentenceQuizQuestions([pool[0]], pool);
      expect(questions.length).toBe(1);
      const q = questions[0];
      expect(q.ensent).toBe(pool[0].ensent);
      expect(q.cnsent).toBe(pool[0].cnsent);

      // Exactly one blank in the prompt; restoring it yields the sentence.
      expect(q.prompt.split(SENTENCE_QUIZ_BLANK).length - 1).toBe(1);
      expect(q.prompt.replace(SENTENCE_QUIZ_BLANK, 'x').split(/\s+/).length)
        .toBe(pool[0].ensent.trim().split(/\s+/).length);

      // The answer is a lowercase word from the sentence, never its first
      // (capitalized) token, so casing cannot leak it.
      const answer = q.options[q.answerIndex];
      expect(answer).toMatch(/^[a-z]+$/);
      expect(q.ensent.toLowerCase()).toContain(answer);
      expect(q.ensent.trim().split(/\s+/)[0].toLowerCase()).not.toBe(answer);
    });

    it('draws distinct distractors from pool words', () => {
      const questions = buildSentenceQuizQuestions([pool[0]], pool);
      const q = questions[0];
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      const lowered = q.options.map(o => o.toLowerCase());
      expect(new Set(lowered).size).toBe(q.options.length);
      for (const option of q.options) {
        expect(pool.some(p => p.ensent.toLowerCase().includes(option))).toBe(true);
      }
    });

    it('treats words seen capitalized mid-sentence as names, even lowercase', () => {
      const namePool = [
        { ensent: 'She met Tom yesterday.', cnsent: '她昨天遇到了汤姆。' },
        { ensent: 'A tom cat sat on the mat.', cnsent: '一只猫坐在垫子上。' },
      ];

      const questions = buildSentenceQuizQuestions([namePool[1]], namePool);

      expect(questions.length).toBe(1);
      const lowered = questions[0].options.map(o => o.toLowerCase());
      expect(lowered).not.toContain('tom');
      expect(lowered[questions[0].answerIndex]).not.toBe('tom');
    });

    it('skips items without a blankable word', () => {
      const questions = buildSentenceQuizQuestions([{ ensent: 'Hello', cnsent: '你好。' }], pool);
      expect(questions.length).toBe(0);
    });

    it('skips items whose pool offers no distinct distractor', () => {
      const questions = buildSentenceQuizQuestions(
        [{ ensent: 'To be or not', cnsent: '存还是亡。' }],
        [{ ensent: 'To be or not', cnsent: '存还是亡。' }, { ensent: 'Do it', cnsent: '做吧。' }]
      );
      expect(questions.length).toBe(0);
    });
  });

  describe('normalizeSentenceAnswer', () => {
    it('trims and lowercases', () => {
      expect(normalizeSentenceAnswer('  Hello World. ')).toBe('hello world');
    });

    it('strips trailing runs of EN or CN sentence punctuation', () => {
      expect(normalizeSentenceAnswer('苹果派很甜。')).toBe('苹果派很甜');
      expect(normalizeSentenceAnswer('Really?!')).toBe('really');
      expect(normalizeSentenceAnswer('Wait...')).toBe('wait');
    });

    it('collapses internal whitespace', () => {
      expect(normalizeSentenceAnswer('a   b\t c')).toBe('a b c');
    });
  });
});
