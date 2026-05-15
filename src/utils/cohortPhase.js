/**
 * Derive visual phase of a cohort from stored status + dates.
 * Stored cohort.status only meaningfully has 'completed' as authoritative value.
 * 'not_started' vs 'ongoing' is purely a date-based label.
 */
export function getCohortPhase(cohort) {
  if (cohort.status === 'completed') return 'completed';
  if (cohort.start_date && new Date() < new Date(cohort.start_date)) return 'not_started';
  return 'ongoing';
}
