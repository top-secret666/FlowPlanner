/**
 * Generates a pseudo-random unique identifier.
 * Format: timestamp-randomHex (e.g. "1714202400000-a3f8c2d1")
 */
export function generateId(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
  return `${timestamp}-${random}`;
}