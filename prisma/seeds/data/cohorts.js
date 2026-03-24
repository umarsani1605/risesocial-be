/**
 * Cohort seed data generator
 * Generates 2 cohorts per academy with modules, attachments, and mentors
 */

import { generateCohortDateRange, generateModuleSessionDates } from '../utils/date.js';

/**
 * Generate cohort data for given academies
 * @param {Array} academyIds - Array of academy IDs
 * @returns {Array} Array of cohort objects with nested data
 */
export function generateCohorts(academyIds) {
  const cohorts = [];

  academyIds.forEach((academyId, index) => {
    // Generate 2 cohorts per academy
    for (let i = 0; i < 2; i++) {
      const cohortNumber = index * 2 + i + 1;
      const isOngoing = i === 0;
      const isCompleted = i === 1;

      // Generate date range (8-12 weeks duration)
      const durationWeeks = 10;
      const startDaysFromNow = isCompleted ? -90 : isOngoing ? -30 : 30;
      const { start, end } = generateCohortDateRange(startDaysFromNow, durationWeeks);

      // Determine status based on dates
      const now = new Date();
      let status = 'not_started';
      if (start <= now && end >= now) status = 'ongoing';
      if (end < now) status = 'completed';

      const moduleCount = 10;
      const sessionDates = generateModuleSessionDates(start, moduleCount);

      cohorts.push({
        academy_id: academyId,
        name: `Cohort ${cohortNumber}`,
        description: `This is cohort ${cohortNumber} for the academy. Join a community of learners and grow together with expert guidance.`,
        status,
        start_date: start,
        end_date: end,
        modules: generateModules(moduleCount, sessionDates),
        mentors: generateMentors(cohortNumber),
      });
    }
  });

  return cohorts;
}

/**
 * Generate modules for a cohort
 * @param {number} count - Number of modules to generate
 * @param {Array<Date>} sessionDates - Array of session dates
 * @returns {Array} Array of module objects
 */
function generateModules(count, sessionDates) {
  const modules = [];
  const moduleTopics = [
    'Introduction & Orientation',
    'Fundamentals & Core Concepts',
    'Intermediate Techniques',
    'Advanced Strategies',
    'Practical Applications',
    'Case Studies & Analysis',
    'Hands-on Workshop',
    'Project Development',
    'Best Practices & Optimization',
    'Final Project & Presentation',
  ];

  for (let i = 0; i < count; i++) {
    modules.push({
      title: `Module ${i + 1}: ${moduleTopics[i] || `Topic ${i + 1}`}`,
      description: `In this module, you will learn essential concepts and practical skills. Includes live sessions, assignments, and hands-on exercises.`,
      is_published: true,
      session_timestamp: sessionDates[i],
      meeting_link: `https://zoom.us/j/meeting${i + 1}`,
      attendance_link: `https://forms.google.com/attendance${i + 1}`,
      assignment_link: `https://classroom.google.com/assignment${i + 1}`,
      order: i + 1,
      attachments: generateAttachments(i + 1),
    });
  }

  return modules;
}

/**
 * Generate attachments for a module
 * @param {number} moduleNumber - Module number for unique naming
 * @returns {Array} Array of attachment objects
 */
function generateAttachments(moduleNumber) {
  return [
    {
      type: 'file',
      label: `Module ${moduleNumber} Slides`,
      file_path: `/uploads/modules/module-${moduleNumber}-slides.pdf`,
      url: null,
      order: 1,
    },
    {
      type: 'link',
      label: 'Additional Reading Materials',
      file_path: null,
      url: `https://resources.risesocial.org/module-${moduleNumber}`,
      order: 2,
    },
    {
      type: 'video',
      label: 'Recorded Session',
      file_path: null,
      url: `https://youtube.com/watch?v=module${moduleNumber}`,
      order: 3,
    },
  ];
}

/**
 * Generate mentors for a cohort
 * @param {number} cohortNumber - Cohort number for unique naming
 * @returns {Array} Array of mentor objects
 */
function generateMentors(cohortNumber) {
  const mentorPool = [
    {
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=25',
      job_title: 'Senior Consultant',
    },
    {
      name: 'Ahmad Rizki',
      avatar: 'https://i.pravatar.cc/150?img=11',
      job_title: 'Technical Lead',
    },
    {
      name: 'Maria Garcia',
      avatar: 'https://i.pravatar.cc/150?img=48',
      job_title: 'Product Manager',
    },
    {
      name: 'Yuki Tanaka',
      avatar: 'https://i.pravatar.cc/150?img=56',
      job_title: 'Solutions Architect',
    },
  ];

  // Return 2 mentors per cohort, cycling through the pool
  const startIndex = ((cohortNumber - 1) * 2) % mentorPool.length;
  return [mentorPool[startIndex % mentorPool.length], mentorPool[(startIndex + 1) % mentorPool.length]];
}
