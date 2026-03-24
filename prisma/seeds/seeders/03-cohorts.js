/**
 * Cohort seeder - seeds cohorts with modules, attachments, mentors, enrollments, and certificates
 */

import { PrismaClient } from '@prisma/client';
import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { validateDateRange } from '../utils/validation.js';
import { generateCohorts } from '../data/cohorts.js';

/**
 * Seed cohorts with all related data
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Object>} Statistics object
 */
export async function seedCohorts(prisma) {
  try {
    logSeedStart('Cohorts');

    // Clear existing data
    await prisma.cohortCertificate.deleteMany({});
    await prisma.cohortEnrollment.deleteMany({});
    await prisma.cohortMentor.deleteMany({});
    await prisma.cohortModuleAttachment.deleteMany({});
    await prisma.cohortModule.deleteMany({});
    await prisma.cohort.deleteMany({});

    // Fetch academy IDs
    const academies = await prisma.academy.findMany({
      select: { id: true },
    });
    const academyIds = academies.map((a) => a.id);

    // Fetch user IDs for enrollments
    const users = await prisma.user.findMany({
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    // Generate cohort data
    const cohortsData = generateCohorts(academyIds);

    let moduleCount = 0;
    let attachmentCount = 0;
    let mentorCount = 0;
    let enrollmentCount = 0;
    let certificateCount = 0;

    // Create cohorts and related records
    for (const cohortData of cohortsData) {
      const { modules, mentors, ...cohortFields } = cohortData;

      // Validate dates
      if (!validateDateRange(cohortFields.start_date, cohortFields.end_date)) {
        throw new Error(`Invalid date range for cohort: start_date (${cohortFields.start_date}) >= end_date (${cohortFields.end_date})`);
      }

      // Create cohort
      const cohort = await prisma.cohort.create({
        data: cohortFields,
      });

      // Create modules
      for (const moduleData of modules) {
        const { attachments, ...moduleFields } = moduleData;

        const module = await prisma.cohortModule.create({
          data: {
            academy_id: cohort.academy_id,
            cohort_id: cohort.id,
            ...moduleFields,
          },
        });
        moduleCount++;

        // Create attachments
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
          data: {
            academy_id: cohort.academy_id,
            cohort_id: cohort.id,
            ...mentor,
          },
        });
        mentorCount++;
      }

      // Create enrollments (2 users per cohort)
      const enrollmentUsers = userIds.slice(0, Math.min(2, userIds.length));
      for (let i = 0; i < enrollmentUsers.length; i++) {
        const userId = enrollmentUsers[i];
        const isCompleted = cohort.status === 'completed' && i === 0;

        const enrollment = await prisma.cohortEnrollment.create({
          data: {
            academy_id: cohort.academy_id,
            cohort_id: cohort.id,
            user_id: userId,
            status: isCompleted ? 'completed' : cohort.status === 'ongoing' ? 'active' : 'pending',
            enrolled_at: cohort.start_date,
            completion_date: isCompleted ? cohort.end_date : null,
          },
        });
        enrollmentCount++;

        // Create certificate for completed enrollments
        if (isCompleted) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { first_name: true, last_name: true },
          });

          const academy = await prisma.academy.findUnique({
            where: { id: cohort.academy_id },
            select: { title: true },
          });

          await prisma.cohortCertificate.create({
            data: {
              academy_id: cohort.academy_id,
              cohort_id: cohort.id,
              enrollment_id: enrollment.id,
              user_id: userId,
              certificate_code: `CERT-${cohort.id}-${userId}-${Date.now()}`,
              student_name: `${user.first_name} ${user.last_name}`,
              academy_title: academy.title,
              cohort_name: cohort.name,
              issued_at: cohort.end_date,
              file_path: `/certificates/cert-${cohort.id}-${userId}.pdf`,
            },
          });
          certificateCount++;
        }
      }
    }

    const stats = {
      cohortCount: cohortsData.length,
      moduleCount,
      attachmentCount,
      mentorCount,
      enrollmentCount,
      certificateCount,
    };

    logSeedSuccess('Cohorts', stats);
    return stats;
  } catch (error) {
    logSeedError('Cohorts', error);
    throw error;
  }
}
