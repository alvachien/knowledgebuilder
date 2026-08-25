import { RatingOperatorEnum, matchRating } from './ui-common';

describe('ui-common.ts', () => {
  describe('matchRating', () => {
    it('Equals matches only the exact rating, including unrated (0)', () => {
      expect(matchRating(3, RatingOperatorEnum.Equals, 3)).toBe(true);
      expect(matchRating(2, RatingOperatorEnum.Equals, 3)).toBe(false);
      expect(matchRating(0, RatingOperatorEnum.Equals, 0)).toBe(true);
    });

    it('GreaterThan / LargerOrEquals compare against the value', () => {
      expect(matchRating(4, RatingOperatorEnum.GreaterThan, 3)).toBe(true);
      expect(matchRating(3, RatingOperatorEnum.GreaterThan, 3)).toBe(false);
      expect(matchRating(3, RatingOperatorEnum.LargerOrEquals, 3)).toBe(true);
      expect(matchRating(2, RatingOperatorEnum.LargerOrEquals, 3)).toBe(false);
    });

    it('LessThan / LessOrEquals compare against the value and include unrated (0)', () => {
      expect(matchRating(2, RatingOperatorEnum.LessThan, 3)).toBe(true);
      expect(matchRating(3, RatingOperatorEnum.LessThan, 3)).toBe(false);
      expect(matchRating(0, RatingOperatorEnum.LessThan, 3)).toBe(true);
      expect(matchRating(0, RatingOperatorEnum.LessThan, 1)).toBe(true);
      expect(matchRating(1, RatingOperatorEnum.LessThan, 1)).toBe(false);
      expect(matchRating(3, RatingOperatorEnum.LessOrEquals, 3)).toBe(true);
      expect(matchRating(0, RatingOperatorEnum.LessOrEquals, 3)).toBe(true);
    });
  });
});
