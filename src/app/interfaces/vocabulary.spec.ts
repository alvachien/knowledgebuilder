import { RatingOperatorEnum } from './ui-common';
import {
  buildVocabularyQuizQuestions,
  isVocabularyListFilterEmpty,
  matchVocabularyListFilter,
  summarizeWordFilter,
  summarizeRatingFilter,
  type VocabularyListFilter,
  type WordMatchOperator,
} from './vocabulary';

const baseFilter: VocabularyListFilter = {
  freeText: '',
  wordConditions: [],
  ratingConditions: [],
};

const item = { id: 7, enword: 'Apple Pie', cnword: '苹果派' };

describe('vocabulary.ts', () => {
  describe('isVocabularyListFilterEmpty', () => {
    it('is empty when no condition is set', () => {
      expect(isVocabularyListFilterEmpty({ ...baseFilter })).toBe(true);
    });

    it('is not empty when any condition is set', () => {
      expect(isVocabularyListFilterEmpty({ ...baseFilter, freeText: 'a' })).toBe(false);
      expect(
        isVocabularyListFilterEmpty({ ...baseFilter, wordConditions: [{ operator: 'contains', text: 'a' }] })
      ).toBe(false);
      expect(
        isVocabularyListFilterEmpty({
          ...baseFilter,
          ratingConditions: [{ operator: RatingOperatorEnum.Equals, value: 3 }],
        })
      ).toBe(false);
    });

    it('treats a blank-text word condition as inactive (empty)', () => {
      expect(
        isVocabularyListFilterEmpty({ ...baseFilter, wordConditions: [{ operator: 'contains', text: '   ' }] })
      ).toBe(true);
    });

    it('treats a phrase condition as active even with blank text', () => {
      expect(
        isVocabularyListFilterEmpty({ ...baseFilter, wordConditions: [{ operator: 'isPhrase', text: '' }] })
      ).toBe(false);
      expect(
        isVocabularyListFilterEmpty({ ...baseFilter, wordConditions: [{ operator: 'notPhrase', text: '   ' }] })
      ).toBe(false);
    });
  });

  describe('matchVocabularyListFilter', () => {
    it('matches everything when the filter is empty', () => {
      expect(matchVocabularyListFilter(item, 0, { ...baseFilter })).toBe(true);
    });

    it('free text matches id, enword and cnword case-insensitively', () => {
      expect(matchVocabularyListFilter(item, 0, { ...baseFilter, freeText: 'APPLE' })).toBe(true);
      expect(matchVocabularyListFilter(item, 0, { ...baseFilter, freeText: '苹果' })).toBe(true);
      expect(matchVocabularyListFilter(item, 0, { ...baseFilter, freeText: '7' })).toBe(true);
      expect(matchVocabularyListFilter(item, 0, { ...baseFilter, freeText: 'banana' })).toBe(false);
    });

    it('each word condition honors its operator against enword only', () => {
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, wordConditions: [{ operator: 'startsWith', text: 'apple' }] })
      ).toBe(true);
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, wordConditions: [{ operator: 'startsWith', text: 'pie' }] })
      ).toBe(false);
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, wordConditions: [{ operator: 'contains', text: 'le pi' }] })
      ).toBe(true);
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, wordConditions: [{ operator: 'endsWith', text: 'PIE' }] })
      ).toBe(true);
      // enword only: the Chinese translation must not match a word condition.
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, wordConditions: [{ operator: 'contains', text: '苹果' }] })
      ).toBe(false);
    });

    it('ANDs multiple word conditions', () => {
      const filter: VocabularyListFilter = {
        ...baseFilter,
        wordConditions: [
          { operator: 'startsWith', text: 'apple' },
          { operator: 'endsWith', text: 'pie' },
        ],
      };
      expect(matchVocabularyListFilter(item, 0, filter)).toBe(true);
      expect(
        matchVocabularyListFilter(item, 0, {
          ...filter,
          wordConditions: [
            { operator: 'startsWith', text: 'apple' },
            { operator: 'endsWith', text: 'ing' },
          ],
        })
      ).toBe(false);
    });

    it('skips blank-text word conditions', () => {
      expect(
        matchVocabularyListFilter(item, 0, {
          ...baseFilter,
          wordConditions: [{ operator: 'contains', text: '' }, { operator: 'endsWith', text: 'pie' }],
        })
      ).toBe(true);
    });

    it('isPhrase matches only enwords containing a space, notPhrase the reverse', () => {
      const single = { id: 8, enword: 'Apple', cnword: '苹果' };
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, wordConditions: [{ operator: 'isPhrase', text: '' }] })
      ).toBe(true);
      expect(
        matchVocabularyListFilter(single, 0, { ...baseFilter, wordConditions: [{ operator: 'isPhrase', text: '' }] })
      ).toBe(false);
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, wordConditions: [{ operator: 'notPhrase', text: '' }] })
      ).toBe(false);
      expect(
        matchVocabularyListFilter(single, 0, { ...baseFilter, wordConditions: [{ operator: 'notPhrase', text: '' }] })
      ).toBe(true);
    });

    it('ANDs phrase conditions with text conditions', () => {
      const filter: VocabularyListFilter = {
        ...baseFilter,
        wordConditions: [
          { operator: 'isPhrase', text: '' },
          { operator: 'startsWith', text: 'apple' },
        ],
      };
      expect(matchVocabularyListFilter(item, 0, filter)).toBe(true);
      expect(
        matchVocabularyListFilter({ id: 8, enword: 'apple', cnword: '苹果' }, 0, filter)
      ).toBe(false);
    });

    it('rating conditions compare via the shared matchRating rule', () => {
      const filter: VocabularyListFilter = {
        ...baseFilter,
        ratingConditions: [{ operator: RatingOperatorEnum.LargerOrEquals, value: 4 }],
      };
      expect(matchVocabularyListFilter(item, 5, filter)).toBe(true);
      expect(matchVocabularyListFilter(item, 4, filter)).toBe(true);
      expect(matchVocabularyListFilter(item, 3, filter)).toBe(false);
      // Unrated words are excluded from LessThan / LessOrEquals.
      expect(
        matchVocabularyListFilter(item, 0, {
          ...baseFilter,
          ratingConditions: [{ operator: RatingOperatorEnum.LessThan, value: 2 }],
        })
      ).toBe(false);
    });

    it('ANDs free text, word and rating conditions', () => {
      const filter: VocabularyListFilter = {
        freeText: '苹果',
        wordConditions: [{ operator: 'startsWith', text: 'apple' }],
        ratingConditions: [{ operator: RatingOperatorEnum.Equals, value: 5 }],
      };
      expect(matchVocabularyListFilter(item, 5, filter)).toBe(true);
      expect(matchVocabularyListFilter(item, 4, filter)).toBe(false);
    });
  });

  describe('buildVocabularyQuizQuestions', () => {
    const pool = [
      { enword: 'apple', cnword: '苹果' },
      { enword: 'banana', cnword: '香蕉' },
      { enword: 'cherry', cnword: '樱桃' },
      { enword: 'date', cnword: '枣' },
      { enword: 'elderberry', cnword: '接骨木莓' },
    ];

    it('builds a 4-option question per item with the correct answer inside', () => {
      const questions = buildVocabularyQuizQuestions([pool[0]], pool, 'en2cn');

      expect(questions.length).toBe(1);
      const q = questions[0];
      expect(q.enword).toBe('apple');
      expect(q.cnword).toBe('苹果');
      expect(q.direction).toBe('en2cn');
      expect(q.prompt).toBe('apple');
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answerIndex]).toBe('苹果');
    });

    it('flips prompt and options in the cn2en direction', () => {
      const questions = buildVocabularyQuizQuestions([pool[0]], pool, 'cn2en');

      const q = questions[0];
      expect(q.prompt).toBe('苹果');
      expect(q.options[q.answerIndex]).toBe('apple');
      expect(q.options.every(o => /^[a-z]+$/.test(o))).toBe(true);
    });

    it('deduplicates distractors by displayed text', () => {
      // Two other pool entries share the gloss 苹果: they must not produce
      // duplicate options (nor options equal to the correct text).
      const dupPool = [
        { enword: 'apple', cnword: '苹果' },
        { enword: 'banana', cnword: '苹果' },
        { enword: 'cherry', cnword: '苹果' },
        { enword: 'date', cnword: '枣' },
        { enword: 'elderberry', cnword: '枣' },
      ];
      const questions = buildVocabularyQuizQuestions([dupPool[0]], dupPool, 'en2cn');

      expect(questions.length).toBe(1);
      const q = questions[0];
      expect(q.options.length).toBe(2);
      expect(new Set(q.options).size).toBe(2);
      expect(q.options[q.answerIndex]).toBe('苹果');
    });

    it('degrades to fewer options when the pool is small', () => {
      const smallPool = [
        { enword: 'apple', cnword: '苹果' },
        { enword: 'banana', cnword: '香蕉' },
      ];
      const questions = buildVocabularyQuizQuestions([smallPool[0]], smallPool, 'en2cn');

      expect(questions[0].options.length).toBe(2);
      expect(questions[0].options).toContain('苹果');
      expect(questions[0].options).toContain('香蕉');
    });

    it('skips items whose text appears nowhere else in the pool', () => {
      const samePool = [
        { enword: 'apple', cnword: '苹果' },
        { enword: 'apple', cnword: '苹果' },
      ];
      expect(buildVocabularyQuizQuestions([samePool[0]], samePool, 'en2cn')).toEqual([]);
      expect(buildVocabularyQuizQuestions([samePool[0]], samePool, 'cn2en')).toEqual([]);
    });

    it('returns no questions for an empty item list', () => {
      expect(buildVocabularyQuizQuestions([], pool, 'en2cn')).toEqual([]);
    });
  });

  describe('summarizeWordFilter', () => {
    const label = (op: WordMatchOperator) =>
      ({
        startsWith: 'starts with',
        contains: 'contains',
        equal: 'equal',
        endsWith: 'ends with',
        isPhrase: 'is phrase',
        notPhrase: 'not phrase',
      }[op]);

    it('returns empty string when there are no active conditions', () => {
      expect(summarizeWordFilter([], label)).toBe('');
      expect(summarizeWordFilter([{ operator: 'contains', text: '   ' }], label)).toBe('');
    });

    it('joins active conditions as "label value" with "; "', () => {
      expect(
        summarizeWordFilter(
          [{ operator: 'startsWith', text: 'a' }, { operator: 'endsWith', text: 'ing' }],
          label
        )
      ).toBe('starts with a; ends with ing');
    });

    it('skips blank-text rows but keeps the others', () => {
      expect(
        summarizeWordFilter(
          [{ operator: 'contains', text: '' }, { operator: 'equal', text: 'cat' }],
          label
        )
      ).toBe('equal cat');
    });

    it('summarizes phrase conditions as the bare operator label', () => {
      expect(
        summarizeWordFilter(
          [{ operator: 'isPhrase', text: '' }, { operator: 'startsWith', text: 'a' }],
          label
        )
      ).toBe('is phrase; starts with a');
      expect(summarizeWordFilter([{ operator: 'notPhrase', text: '' }], label)).toBe('not phrase');
    });

    it('ellipsizes when the summary exceeds 40 characters', () => {
      const long = 'x'.repeat(50);
      const result = summarizeWordFilter([{ operator: 'contains', text: long }], label);
      expect(result.length).toBe(40);
      expect(result.endsWith('…')).toBe(true);
    });
  });

  describe('summarizeRatingFilter', () => {
    const symbolMap: Record<number, string> = {
      [RatingOperatorEnum.LargerOrEquals]: '>=',
      [RatingOperatorEnum.GreaterThan]: '>',
      [RatingOperatorEnum.Equals]: '=',
      [RatingOperatorEnum.LessOrEquals]: '<=',
      [RatingOperatorEnum.LessThan]: '<',
    };
    const symbol = (op: RatingOperatorEnum): string => symbolMap[op] ?? '?';

    it('returns empty string for no conditions', () => {
      expect(summarizeRatingFilter([], symbol)).toBe('');
    });

    it('joins conditions as "symbolvalue" with "; "', () => {
      expect(
        summarizeRatingFilter(
          [
            { operator: RatingOperatorEnum.LargerOrEquals, value: 3 },
            { operator: RatingOperatorEnum.Equals, value: 5 },
          ],
          symbol
        )
      ).toBe('>=3; =5');
    });
  });
});
