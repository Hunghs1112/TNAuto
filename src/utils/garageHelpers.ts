/**
 * garageHelpers.ts — Utility functions for garage-related logic.
 */

/**
 * Checks if a garage is a super garage using strict boolean equality.
 * Returns true ONLY when value === true (boolean).
 * Values like 1, "true", {}, or any other truthy non-boolean return false.
 * Requirements: 2.1, 2.3, 2.4
 */
export function isSuperGarage(value: unknown): boolean {
  return value === true;
}
