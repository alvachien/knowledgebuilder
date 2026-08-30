import { pickWeighted } from './shuffle';

describe('shuffle utils', () => {
  describe('pickWeighted', () => {
    // Weights 3, 5, 9 (total 17).
    const items = ['aaa', 'bbbbb', 'ccccccccc'];

    it('returns undefined for an empty list', () => {
      expect(pickWeighted([], () => 1)).toBeUndefined();
    });

    it('maps rolls onto weight-proportional boundaries', () => {
      // roll = random * 17: [0,3) -> first, [3,8) -> second, [8,17) -> third.
      expect(pickWeighted(items, i => i.length, () => 0)).toBe('aaa');
      expect(pickWeighted(items, i => i.length, () => 0.17)).toBe('aaa');
      expect(pickWeighted(items, i => i.length, () => 0.18)).toBe('bbbbb');
      expect(pickWeighted(items, i => i.length, () => 0.46)).toBe('bbbbb');
      expect(pickWeighted(items, i => i.length, () => 0.48)).toBe('ccccccccc');
      expect(pickWeighted(items, i => i.length, () => 0.9999)).toBe('ccccccccc');
    });

    it('favors heavier items over repeated draws', () => {
      const counts = new Map<string, number>();
      for (let i = 0; i < 600; i++) {
        const pick = pickWeighted(items, x => x.length)!;
        counts.set(pick, (counts.get(pick) ?? 0) + 1);
      }

      // Expected counts: ~317 / ~176 / ~106 — ordering must hold, by a wide margin.
      expect(counts.get('ccccccccc')!).toBeGreaterThan(counts.get('bbbbb')!);
      expect(counts.get('bbbbb')!).toBeGreaterThan(counts.get('aaa')!);
    });
  });
});
