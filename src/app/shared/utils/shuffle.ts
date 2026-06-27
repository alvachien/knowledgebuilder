/**
 * Fisher-Yates (Knuth) shuffle — produces an unbiased uniform random permutation.
 * Returns a NEW array; the input is not mutated.
 */
export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
