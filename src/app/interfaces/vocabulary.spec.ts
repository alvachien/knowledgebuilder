import { FilterJoinType, FilterOperation } from 'actslib';
import type { IFilterCondition, IFilterDefinition } from 'actslib';

import {
  VOCABULARY_FILTER_PROPERTIES,
  VOCABULARY_IS_PHRASE,
  VOCABULARY_UPLOAD_MAX_ITEMS,
  buildVocabularyQuizQuestions,
  isVocabularyListFilterEmpty,
  matchVocabularyListFilter,
  parseVocabularyUpload,
  type VocabularyListFilter,
} from './vocabulary';

const baseFilter: VocabularyListFilter = {
  freeText: '',
  // case 0 — the cleared filter (the shared dialog's emptyFilterDefinition shape)
  root: { join: FilterJoinType.AND, conditions: [] },
};

const item = { id: 7, enword: 'Apple Pie', cnword: '苹果派' };

// Definition builders keep the filter tests readable. Condition values are
// written pre-folded (lower-cased) — the dialog's prepareValue hooks fold them
// at emit time, and matchVocabularyListFilter folds the row fields.
const cond = (
  property: string,
  operation: FilterOperation,
  lowValue: string | number,
  highValue?: string | number
): IFilterCondition =>
  highValue === undefined
    ? { property, operation, lowValue }
    : { property, operation, lowValue, highValue };
const andD = (...conditions: Array<IFilterCondition | IFilterDefinition>): IFilterDefinition => ({
  join: FilterJoinType.AND,
  conditions,
});
const orD = (...conditions: Array<IFilterCondition | IFilterDefinition>): IFilterDefinition => ({
  join: FilterJoinType.OR,
  conditions,
});

describe('vocabulary.ts', () => {
  describe('VOCABULARY_FILTER_PROPERTIES (schema)', () => {
    it('offers the two text columns and the rating number', () => {
      expect(VOCABULARY_FILTER_PROPERTIES.map(p => p.key)).toEqual(['enword', 'cnword', 'rating']);
      expect(VOCABULARY_FILTER_PROPERTIES[2].kind).toBe('number');
      // The rating whitelist includes Between (the full numeric operator set).
      expect(VOCABULARY_FILTER_PROPERTIES[2].operations).toContain(FilterOperation.Between);
    });

    it('offers the phrase custom operator only for the English word', () => {
      expect(VOCABULARY_FILTER_PROPERTIES[0].customOperators).toEqual([VOCABULARY_IS_PHRASE]);
      expect(VOCABULARY_FILTER_PROPERTIES[1].customOperators).toBeUndefined();
    });

    it('isPhrase emits Contains-of-space and recognizes it back (round-trip fold)', () => {
      const emitted = VOCABULARY_IS_PHRASE.emit('enword');
      expect(emitted).toEqual({ property: 'enword', operation: FilterOperation.Contains, lowValue: ' ' });
      expect(VOCABULARY_IS_PHRASE.recognize(emitted)).toBe(true);
      expect(
        VOCABULARY_IS_PHRASE.recognize({ property: 'enword', operation: FilterOperation.Contains, lowValue: 'ap' })
      ).toBe(false);
    });

    it('case-folds emitted text values via the prepareValue hook', () => {
      const enword = VOCABULARY_FILTER_PROPERTIES[0];
      expect(enword.prepareValue?.('  AP')).toBe('ap');
    });
  });

  describe('isVocabularyListFilterEmpty', () => {
    it('is empty when the definition carries no condition', () => {
      expect(isVocabularyListFilterEmpty({ ...baseFilter })).toBe(true);
    });

    it('is not empty when free text or a (nested) condition is set', () => {
      expect(isVocabularyListFilterEmpty({ ...baseFilter, freeText: 'a' })).toBe(false);
      expect(
        isVocabularyListFilterEmpty({ ...baseFilter, root: andD(cond('enword', FilterOperation.Contains, 'a')) })
      ).toBe(false);
      expect(
        isVocabularyListFilterEmpty({
          ...baseFilter,
          root: orD(andD(cond('rating', FilterOperation.Equal, 3))),
        })
      ).toBe(false);
    });

    it('treats a definition of only empty sub-groups as empty', () => {
      expect(isVocabularyListFilterEmpty({ ...baseFilter, root: andD(orD()) })).toBe(true);
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

    it('each enword condition honors its operator against enword only', () => {
      const withWord = (operation: FilterOperation, value: string): VocabularyListFilter => ({
        ...baseFilter,
        root: andD(cond('enword', operation, value)),
      });
      expect(matchVocabularyListFilter(item, 0, withWord(FilterOperation.BeginsWith, 'apple'))).toBe(true);
      expect(matchVocabularyListFilter(item, 0, withWord(FilterOperation.BeginsWith, 'pie'))).toBe(false);
      expect(matchVocabularyListFilter(item, 0, withWord(FilterOperation.Contains, 'le pi'))).toBe(true);
      expect(matchVocabularyListFilter(item, 0, withWord(FilterOperation.EndsWith, 'pie'))).toBe(true);
      // property 'enword': the Chinese translation must not match.
      expect(matchVocabularyListFilter(item, 0, withWord(FilterOperation.Contains, '苹果'))).toBe(false);
    });

    it('matches case-insensitively: folded values against the folded row fields', () => {
      // 'Apple Pie' folds to 'apple pie' in the predicate; the dialog folds the
      // condition value at emit time, so a lower-case condition matches.
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, root: andD(cond('enword', FilterOperation.Contains, 'APPLE')) })
      ).toBe(false); // uppercase condition value is NOT folded here (the dialog folds at emit)
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, root: andD(cond('enword', FilterOperation.Contains, 'apple')) })
      ).toBe(true);
    });

    it('cnword conditions match the Chinese explanation, not the English word', () => {
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, root: andD(cond('cnword', FilterOperation.Contains, '苹果')) })
      ).toBe(true);
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, root: andD(cond('cnword', FilterOperation.BeginsWith, '派')) })
      ).toBe(false);
      // A cnword condition must not match against enword.
      expect(
        matchVocabularyListFilter(item, 0, { ...baseFilter, root: andD(cond('cnword', FilterOperation.Contains, 'apple')) })
      ).toBe(false);
    });

    it('ANDs conditions across both fields', () => {
      const filter: VocabularyListFilter = {
        ...baseFilter,
        root: andD(
          cond('enword', FilterOperation.BeginsWith, 'apple'),
          cond('cnword', FilterOperation.EndsWith, '派')
        ),
      };
      expect(matchVocabularyListFilter(item, 0, filter)).toBe(true);
      expect(
        matchVocabularyListFilter(item, 0, {
          ...filter,
          root: andD(
            cond('enword', FilterOperation.BeginsWith, 'apple'),
            cond('cnword', FilterOperation.EndsWith, '果')
          ),
        })
      ).toBe(false);
    });

    it('the phrase operator matches only words containing a space', () => {
      const single = { id: 8, enword: 'Apple', cnword: '苹果' };
      // VOCABULARY_IS_PHRASE emits Contains of a space — matching a phrase.
      const phraseFilter: VocabularyListFilter = { ...baseFilter, root: andD(VOCABULARY_IS_PHRASE.emit('enword')) };
      expect(matchVocabularyListFilter(item, 0, phraseFilter)).toBe(true);
      expect(matchVocabularyListFilter(single, 0, phraseFilter)).toBe(false);
    });

    it('rating conditions compare numerically, unrated (0) included', () => {
      const withRating = (operation: FilterOperation, value: number): VocabularyListFilter => ({
        ...baseFilter,
        root: andD(cond('rating', operation, value)),
      });
      expect(matchVocabularyListFilter(item, 5, withRating(FilterOperation.GreaterOrEqual, 4))).toBe(true);
      expect(matchVocabularyListFilter(item, 4, withRating(FilterOperation.GreaterOrEqual, 4))).toBe(true);
      expect(matchVocabularyListFilter(item, 3, withRating(FilterOperation.GreaterOrEqual, 4))).toBe(false);
      // Unrated (0) words compare numerically: 0 < 2 is true.
      expect(matchVocabularyListFilter(item, 0, withRating(FilterOperation.LessThan, 2))).toBe(true);
      expect(matchVocabularyListFilter(item, 3, withRating(FilterOperation.Equal, 3))).toBe(true);
      expect(matchVocabularyListFilter(item, 3, withRating(FilterOperation.GreaterThan, 3))).toBe(false);
      expect(matchVocabularyListFilter(item, 3, withRating(FilterOperation.LessOrEqual, 3))).toBe(true);
      // Between (inclusive on both bounds), as the dialog's two-input editor emits.
      const between = (low: number, high: number): VocabularyListFilter => ({
        ...baseFilter,
        root: andD({ property: 'rating', operation: FilterOperation.Between, lowValue: low, highValue: high }),
      });
      expect(matchVocabularyListFilter(item, 3, between(2, 4))).toBe(true);
      expect(matchVocabularyListFilter(item, 4, between(2, 4))).toBe(true);
      expect(matchVocabularyListFilter(item, 5, between(2, 4))).toBe(false);
    });

    it('ORs cross-dimension leaves inside a group', () => {
      const filter: VocabularyListFilter = {
        ...baseFilter,
        root: orD(cond('enword', FilterOperation.BeginsWith, 'ban'), cond('rating', FilterOperation.Equal, 5)),
      };
      expect(matchVocabularyListFilter(item, 0, filter)).toBe(false);
      expect(matchVocabularyListFilter(item, 5, filter)).toBe(true);
      expect(
        matchVocabularyListFilter({ id: 9, enword: 'banana', cnword: '香蕉' }, 0, filter)
      ).toBe(true);
    });

    it('evaluates (A OR B) AND C against the definition tree', () => {
      const filter: VocabularyListFilter = {
        ...baseFilter,
        root: andD(
          orD(cond('enword', FilterOperation.BeginsWith, 'zzz'), cond('cnword', FilterOperation.Contains, '苹果')),
          cond('rating', FilterOperation.GreaterOrEqual, 3)
        ),
      };
      expect(matchVocabularyListFilter(item, 3, filter)).toBe(true);
      expect(matchVocabularyListFilter(item, 2, filter)).toBe(false);
    });

    it('ANDs free text with the condition definition', () => {
      const filter: VocabularyListFilter = {
        freeText: '苹果',
        root: andD(cond('enword', FilterOperation.BeginsWith, 'apple'), cond('rating', FilterOperation.Equal, 5)),
      };
      expect(matchVocabularyListFilter(item, 5, filter)).toBe(true);
      expect(matchVocabularyListFilter(item, 4, filter)).toBe(false);
    });

    it('evaluates a three-level tree (AND > OR > AND)', () => {
      const filter: VocabularyListFilter = {
        ...baseFilter,
        root: andD(
          orD(
            andD(cond('cnword', FilterOperation.Contains, '苹果'), cond('enword', FilterOperation.BeginsWith, 'zzz')),
            cond('rating', FilterOperation.LessThan, 1)
          ),
          cond('enword', FilterOperation.EndsWith, 'pie')
        ),
      };
      // inner AND fails (no 'zzz'), but rating 0 < 1 makes the OR true; 'pie' AND holds.
      expect(matchVocabularyListFilter(item, 0, filter)).toBe(true);
      // banana: OR fails (no 苹果, rating 5 not < 1) AND 'pie' fails — two ways to lose.
      expect(
        matchVocabularyListFilter({ id: 9, enword: 'banana', cnword: '香蕉' }, 5, filter)
      ).toBe(false);
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


  describe('parseVocabularyUpload', () => {
    it('parses valid rows', () => {
      const result = parseVocabularyUpload('[{"enword":"hello","cnword":"你好"}]');
      expect(result).toEqual({
        ok: true,
        items: [{ enword: 'hello', cnword: '你好' }],
        skippedCount: 0,
        truncated: false,
      });
    });

    it('rejects UTF-16 content (stray NUL bytes)', () => {
      const text = '[' + String.fromCharCode(0) + ']';
      expect(parseVocabularyUpload(text)).toEqual({ ok: false, reason: 'utf16' });
    });

    it('strips a leading UTF-8 BOM before parsing', () => {
      const text = String.fromCharCode(0xfeff) + '[{"enword":"hi","cnword":"嗨"}]';
      const result = parseVocabularyUpload(text);
      expect(result.ok).toBe(true);
    });

    it('reports malformed JSON as parse failure', () => {
      expect(parseVocabularyUpload('{not json')).toEqual({ ok: false, reason: 'parse' });
    });

    it('reports non-array payloads as not-array', () => {
      expect(parseVocabularyUpload('{"enword":"a","cnword":"b"}')).toEqual({
        ok: false,
        reason: 'not-array',
      });
    });

    it('skips rows that break the word contract and counts them', () => {
      const result = parseVocabularyUpload(
        JSON.stringify([
          { enword: 'good', cnword: '好' },
          { other: 1 },
          { enword: 'a', cnword: '太短' },
          { enword: 'no-cn' },
          null,
          'text',
          { enword: 'also', cnword: '也' },
        ])
      );
      expect(result).toEqual({
        ok: true,
        items: [
          { enword: 'good', cnword: '好' },
          { enword: 'also', cnword: '也' },
        ],
        skippedCount: 5,
        truncated: false,
      });
    });

    it('skips rows whose fields exceed the length cap', () => {
      const longEn = 'x'.repeat(501);
      const result = parseVocabularyUpload(JSON.stringify([{ enword: longEn, cnword: '长' }]));
      expect(result.ok && result.skippedCount === 1 && result.items.length === 0).toBe(true);
    });

    it('truncates at the item cap and flags it', () => {
      const rows = Array.from({ length: VOCABULARY_UPLOAD_MAX_ITEMS + 2 }, (_, i) => ({
        enword: `w${i}`,
        cnword: `词${i}`,
      }));
      const result = parseVocabularyUpload(JSON.stringify(rows));
      expect(result).toEqual({
        ok: true,
        items: expect.any(Array),
        skippedCount: 0,
        truncated: true,
      });
      if (result.ok) {
        expect(result.items.length).toBe(VOCABULARY_UPLOAD_MAX_ITEMS);
      }
    });

    it('treats an all-invalid file as zero items (caller reports empty)', () => {
      const result = parseVocabularyUpload('[{"enword":"a","cnword":"坏"}]');
      expect(result.ok && result.items.length === 0 && result.skippedCount === 1).toBe(true);
    });
  });
});
