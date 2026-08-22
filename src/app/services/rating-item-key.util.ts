/**
 * Maps a content item ID (which may be a non-numeric string such as "1-001"
 * or "wk1-monday") to the numeric `ItemId` key used by the UserLearningRatings
 * API (`int?` on the backend).
 *
 * - Numeric IDs pass through unchanged (non-negative range).
 * - Non-numeric strings are FNV-1a hashed into the negative int32 range, so a
 *   hashed key can never collide with a numeric passthrough key.
 *
 * Previously `parseInt` was used, which collapsed distinct IDs ("1-001" and
 * "1-002" both became 1) and produced NaN (silently dropped) for alphabetic IDs.
 */
export function ratingItemKey(id: string | number | undefined): number | undefined {
  if (id === undefined) {
    return undefined;
  }
  if (typeof id === 'number') {
    return Number.isInteger(id) ? id : undefined;
  }
  if (/^\d+$/.test(id)) {
    return parseInt(id, 10);
  }
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return -((hash >>> 0) % 2147483647) - 1;
}
