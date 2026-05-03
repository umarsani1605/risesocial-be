/**
 * Converts a relative period string to an absolute { start, end } date range.
 * Returns { start: null, end: null } when no filter should be applied.
 */
export function periodToDateRange(period, startDate, endDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return { start: today, end: now };
    case 'yesterday': {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      return { start: yest, end: today };
    }
    case '7d':
      return { start: new Date(now - 7 * 86400000), end: now };
    case '1m':
      return { start: new Date(now - 30 * 86400000), end: now };
    case '3m':
      return { start: new Date(now - 90 * 86400000), end: now };
    case 'all-time':
    default:
      if (startDate && endDate) {
        return { start: new Date(startDate), end: new Date(endDate) };
      }
      return { start: null, end: null };
  }
}
