/** Small local-time date helpers. Avoids a date-fns dependency for 4 functions. */

function pad(n: number) {
  return `${n}`.padStart(2, '0');
}

/** Today's date as YYYY-MM-DD in LOCAL time (not UTC). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Add N days to an ISO date string, returning YYYY-MM-DD. */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Add N days to "now", returning YYYY-MM-DD. */
export function addDaysFromNow(days: number): string {
  return addDaysISO(todayISO(), days);
}
