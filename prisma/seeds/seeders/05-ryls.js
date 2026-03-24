/**
 * RYLS seeder - seeds RYLS registrations with submissions and file uploads
 */

import { PrismaClient } from '@prisma/client';
import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { validateEmail, validatePhone } from '../utils/validation.js';
import { rylsRegistrations } from '../data/ryls.js';

/**
 * Seed RYLS registrations
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Object>} Statistics object
 */
export async function seedRyls(prisma) {
  try {
    logSeedStart('RYLS');

    // Clear existing data
    await prisma.rylsFullyFundedSubmission.deleteMany({});
    await prisma.rylsSelfFundedSubmission.deleteMany({});
    await prisma.fileUpload.deleteMany({
      where: {
        upload_type: { in: ['essay', 'headshot'] },
      },
    });
    await prisma.rylsRegistration.deleteMany({});

    let fullyFundedCount = 0;
    let selfFundedCount = 0;
    let fileUploadCount = 0;

    // Create registrations
    for (const regData of rylsRegistrations) {
      const { fully_funded, self_funded, ...registrationFields } = regData;

      // Validate email and phone
      if (!validateEmail(registrationFields.email)) {
        throw new Error(`Invalid email: ${registrationFields.email}`);
      }
      if (!validatePhone(registrationFields.whatsapp)) {
        throw new Error(`Invalid phone: ${registrationFields.whatsapp}`);
      }

      // Create registration
      const registration = await prisma.rylsRegistration.create({
        data: registrationFields,
      });

      // Create fully funded submission
      if (fully_funded) {
        // Create essay file upload
        const essayFile = await prisma.fileUpload.create({
          data: {
            original_name: `${registration.full_name}-essay.pdf`,
            file_path: fully_funded.essay_file_path,
            file_size: 1024 * 500, // 500KB
            mime_type: 'application/pdf',
            upload_type: 'essay',
          },
        });
        fileUploadCount++;

        await prisma.rylsFullyFundedSubmission.create({
          data: {
            registration_id: registration.id,
            essay_topic: fully_funded.essay_topic,
            essay_description: fully_funded.essay_description,
            essay_file_id: essayFile.id,
          },
        });
        fullyFundedCount++;
      }

      // Create self funded submission
      if (self_funded) {
        // Create headshot file upload
        const headshotFile = await prisma.fileUpload.create({
          data: {
            original_name: `${registration.full_name}-headshot.jpg`,
            file_path: self_funded.headshot_file_path,
            file_size: 1024 * 200, // 200KB
            mime_type: 'image/jpeg',
            upload_type: 'headshot',
          },
        });
        fileUploadCount++;

        await prisma.rylsSelfFundedSubmission.create({
          data: {
            registration_id: registration.id,
            passport_number: self_funded.passport_number,
            need_visa: self_funded.need_visa,
            headshot_file_id: headshotFile.id,
            read_policies: self_funded.read_policies,
          },
        });
        selfFundedCount++;
      }
    }

    const stats = {
      registrationCount: rylsRegistrations.length,
      fullyFundedCount,
      selfFundedCount,
      fileUploadCount,
    };

    logSeedSuccess('RYLS', stats);
    return stats;
  } catch (error) {
    logSeedError('RYLS', error);
    throw error;
  }
}
