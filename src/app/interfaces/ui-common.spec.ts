import { RatingOperatorEnum, matchRating } from './ui-common';

describe('ui-common.ts', () => {
  describe('matchRating', () => {
    it('Equals matches only the exact rating', () => {
      expect(matchRating(3, RatingOperatorEnum.Equals, 3)).toBe(true);
      expect(matchRating(2, RatingOperatorEnum.Equals, 3)).toBe(false);
      expect(matchRating(0, RatingOperatorEnum.Equals, 3)).toBe(false);
    });

    it('GreaterThan / LargerOrEquals compare against the value', () => {
      expect(matchRating(4, RatingOperatorEnum.GreaterThan, 3)).toBe(true);
      expect(matchRating(3, RatingOperatorEnum.GreaterThan, 3)).toBe(false);
      expect(matchRating(3, RatingOperatorEnum.LargerOrEquals, 3)).toBe(true);
      expect(matchRating(2, RatingOperatorEnum.LargerOrEquals, 3)).toBe(false);
    });

    it('LessThan / LessOrEquals exclude unrated (0) words', () => {
      expect(matchRating(2, RatingOperatorEnum.LessThan, 3)).toBe(true);
      expect(matchRating(3, RatingOperatorEnum.LessThan, 3)).toBe(false);
      expect(matchRating(0, RatingOperatorEnum.LessThan, 3)).toBe(false);
      expect(matchRating(3, RatingOperatorEnum.LessOrEquals, 3)).toBe(true);
      expect(matchRating(0, RatingOperatorEnum.LessOrEquals, 3)).toBe(false);
    });

    it('HasAny / HasNone test ratedness', () => {
      expect(matchRating(1, RatingOperatorEnum.HasAny, 0)).toBe(true);
      expect(matchRating(0, RatingOperatorEnum.HasAny, 0)).toBe(false);
      expect(matchRating(0, RatingOperatorEnum.HasNone, 0)).toBe(true);
      expect(matchRating(4, RatingOperatorEnum.HasNone, 0)).toBe(false);
    });
  });
});
