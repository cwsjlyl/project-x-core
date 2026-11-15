/** Coerce combat numbers so HP / floating text never become NaN. */
export function finiteNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function isPositiveDamage(value: unknown): value is number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function formatDamageText(amount: number): string {
  if (!Number.isFinite(amount)) return '';
  return `-${Math.round(amount)}`;
}
