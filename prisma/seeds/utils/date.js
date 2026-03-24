/**
 * Date utility for generating dates using date-fns
 */

import { subDays, addDays, addWeeks, format } from 'date-fns';

/**
 * Generate a date range relative to today
 * @param {number} startDaysAgo - Number of days ago for start date
 * @param {number} endDaysAgo - Number of days ago for end date (negative for future)
 * @returns {Object} Object with start and end Date objects
 */
export function generateDateRange(startDaysAgo, endDaysAgo) {
  const today = new Date();
  return {
    start: subDays(today, startDaysAgo),
    end: endDaysAgo >= 0 ? subDays(today, endDaysAgo) : addDays(today, Math.abs(endDaysAgo)),
  };
}

/**
 * Generate a random date within the last N days
 * @param {number} daysAgo - Maximum number of days in the past
 * @returns {Date} Random date within the range
 */
export function randomDateWithinDays(daysAgo) {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  return subDays(today, randomDays);
}

/**
 * Generate a future date N weeks from now
 * @param {number} weeks - Number of weeks in the future
 * @returns {Date} Future date
 */
export function futureWeeks(weeks) {
  return addWeeks(new Date(), weeks);
}

/**
 * Generate a cohort date range with realistic duration
 * @param {number} startDaysFromNow - Days from now to start (negative for past)
 * @param {number} durationWeeks - Duration in weeks (8-12 typical)
 * @returns {Object} Object with start and end Date objects
 */
export function generateCohortDateRange(startDaysFromNow, durationWeeks) {
  const today = new Date();
  const start = startDaysFromNow >= 0 ? addDays(today, startDaysFromNow) : subDays(today, Math.abs(startDaysFromNow));
  const end = addWeeks(start, durationWeeks);

  return { start, end };
}

/**
 * Format a date to ISO string
 * @param {Date} date - Date to format
 * @returns {string} ISO formatted date string
 */
export function toISOString(date) {
  return date.toISOString();
}

/**
 * Generate an array of dates for module sessions
 * @param {Date} startDate - Cohort start date
 * @param {number} moduleCount - Number of modules
 * @returns {Array<Date>} Array of session dates
 */
export function generateModuleSessionDates(startDate, moduleCount) {
  const sessions = [];
  for (let i = 0; i < moduleCount; i++) {
    // Sessions typically once or twice per week
    const daysOffset = i * 3; // Every 3 days
    sessions.push(addDays(startDate, daysOffset));
  }
  return sessions;
}
