/**
 * Cohort seeder — seeds cohorts, modules, attachments, mentors, enrollments, and certificates.
 * Cohort modules derive titles from academy topics.
 * John Doe (user@risesocial.org) gets 3 special enrollments across 3 different academies.
 */

import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { validateDateRange } from '../utils/validation.js';
import { generateCohorts } from '../data/cohorts.js';

export async function seedCohorts(prisma) {
  try {
    logSeedStart('Cohorts');

    // Clear existing cohort data (FK order: certificates → placements → modules → cohorts)
    await prisma.cohortCertificate.deleteMany({});
    await prisma.cohortPlacement.deleteMany({});
    await prisma.cohortMentor.deleteMany({});
    await prisma.cohortModuleAttachment.deleteMany({});
    await prisma.cohortModule.deleteMany({});
    await prisma.cohort.deleteMany({});

    // Fetch academies with full topic and instructor data
    const academies = await prisma.academy.findMany({
      include: {
        instructors: { orderBy: { order: 'asc' } },
        themes: {
          include: { topics: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Generate cohort data from academy topics and instructors
    const cohortsData = generateCohorts(academies);

    let moduleCount = 0;
    let attachmentCount = 0;
    let mentorCount = 0;

    // Track created cohorts for John Doe override
    // { cohort, academyIndex, status }
    const createdCohorts = [];

    // ── Create cohorts ────────────────────────────────────────────────────────
    for (const cohortData of cohortsData) {
      const { modules, mentors, ...cohortFields } = cohortData;

      if (!validateDateRange(cohortFields.start_date, cohortFields.end_date)) {
        throw new Error(
          `Invalid date range for cohort "${cohortFields.name}": start >= end`,
        );
      }

      const cohort = await prisma.cohort.create({ data: cohortFields });

      // Create modules + attachments
      for (const moduleData of modules) {
        const { attachments, ...moduleFields } = moduleData;
        const module = await prisma.cohortModule.create({
          data: { academy_id: cohort.academy_id, cohort_id: cohort.id, ...moduleFields },
        });
        moduleCount++;

        for (const attachment of attachments) {
          await prisma.cohortModuleAttachment.create({
            data: {
              academy_id: cohort.academy_id,
              cohort_id: cohort.id,
              cohort_module_id: module.id,
              ...attachment,
            },
          });
          attachmentCount++;
        }
      }

      // Create mentors
      for (const mentor of mentors) {
        await prisma.cohortMentor.create({
          data: { academy_id: cohort.academy_id, cohort_id: cohort.id, ...mentor },
        });
        mentorCount++;
      }

      // Track cohort for John Doe override
      const academyIndex = academies.findIndex((a) => a.id === cohort.academy_id);
      createdCohorts.push({ cohort, academyIndex, status: cohort.status });
    }

    const stats = {
      cohortCount: cohortsData.length,
      moduleCount,
      attachmentCount,
      mentorCount,
    };

    logSeedSuccess('Cohorts', stats);
    return stats;
  } catch (error) {
    logSeedError('Cohorts', error);
    throw error;
  }
}
