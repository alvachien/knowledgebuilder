/**
 * Weighted random pick: an item's chance of being chosen is proportional to
 * its weight. `random` returns [0, 1) and is injectable for tests. Returns
 * undefined for an empty list; a list whose weights are all 0 yields the last
 * item.
 */
export function pickWeighted<T>(
  items: readonly T[],
  weight: (item: T) => number,
  random: () => number = Math.random
): T | undefined {
  if (items.length === 0) {
    return undefined;
  }
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let roll = random() * total;
  for (const item of items) {
    roll -= weight(item);
    if (roll < 0) {
      return item;
    }
  }
  return items[items.length - 1];
}
