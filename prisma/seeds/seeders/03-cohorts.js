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

    // Clear existing cohort data
    await prisma.cohortCertificate.deleteMany({});
    await prisma.cohortEnrollment.deleteMany({});
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

    // Fetch all non-admin users for random enrollments
    const regularUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, email: true, first_name: true, last_name: true },
    });

    const johnDoe = regularUsers.find((u) => u.email === 'user@risesocial.org');
    const otherUsers = regularUsers.filter((u) => u.email !== 'user@risesocial.org');

    // Generate cohort data from academy topics and instructors
    const cohortsData = generateCohorts(academies);

    let moduleCount = 0;
    let attachmentCount = 0;
    let mentorCount = 0;
    let enrollmentCount = 0;

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

      // Random enrollments: pick 2-4 non-John-Doe users per cohort
      const shuffled = [...otherUsers].sort(() => Math.random() - 0.5);
      const enrollCount = 2 + Math.floor(Math.random() * 3); // 2-4
      const enrollees = shuffled.slice(0, Math.min(enrollCount, otherUsers.length));

      for (const user of enrollees) {
        const enrollStatus =
          cohort.status === 'completed'
            ? 'completed'
            : cohort.status === 'ongoing'
              ? 'active'
              : 'pending';

        const enrollment = await prisma.cohortEnrollment.create({
          data: {
            academy_id: cohort.academy_id,
            cohort_id: cohort.id,
            user_id: user.id,
            status: enrollStatus,
            enrolled_at: cohort.start_date,
            completion_date: enrollStatus === 'completed' ? cohort.end_date : null,
          },
        });
        enrollmentCount++;

      }

      // Track cohort for John Doe override
      const academyIndex = academies.findIndex((a) => a.id === cohort.academy_id);
      createdCohorts.push({ cohort, academyIndex, status: cohort.status });
    }

    // ── John Doe override: 3 enrollments across 3 different academies ─────────
    // academy[0] DRAFT → not_started, academy[1] ACTIVE → ongoing, academy[2] ARCHIVED → completed
    if (johnDoe) {
      const completedEntry = createdCohorts.find(
        (c) => c.academyIndex === 2 && c.status === 'completed',
      );
      const activeEntry = createdCohorts.find(
        (c) => c.academyIndex === 1 && c.status === 'ongoing',
      );
      const pendingEntry = createdCohorts.find(
        (c) => c.academyIndex === 0 && c.status === 'not_started',
      );

      const johnDoeAssignments = [
        completedEntry && { entry: completedEntry, enrollStatus: 'completed' },
        activeEntry && { entry: activeEntry, enrollStatus: 'active' },
        pendingEntry && { entry: pendingEntry, enrollStatus: 'pending' },
      ].filter(Boolean);

      for (const { entry, enrollStatus } of johnDoeAssignments) {
        const { cohort } = entry;

        // Update if already enrolled during random phase, otherwise create
        const existing = await prisma.cohortEnrollment.findFirst({
          where: { cohort_id: cohort.id, user_id: johnDoe.id },
        });

        if (existing) {
          await prisma.cohortEnrollment.update({
            where: { id: existing.id },
            data: {
              status: enrollStatus,
              completion_date: enrollStatus === 'completed' ? cohort.end_date : null,
            },
          });
        } else {
          const enrollment = await prisma.cohortEnrollment.create({
            data: {
              academy_id: cohort.academy_id,
              cohort_id: cohort.id,
              user_id: johnDoe.id,
              status: enrollStatus,
              enrolled_at: cohort.start_date,
              completion_date: enrollStatus === 'completed' ? cohort.end_date : null,
            },
          });
          enrollmentCount++;

        }
      }
    }

    const stats = {
      cohortCount: cohortsData.length,
      moduleCount,
      attachmentCount,
      mentorCount,
      enrollmentCount,
    };

    logSeedSuccess('Cohorts', stats);
    return stats;
  } catch (error) {
    logSeedError('Cohorts', error);
    throw error;
  }
}
