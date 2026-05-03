/**
 * RYLS seeder - seeds RYLS registrations, submissions, file uploads, and payments
 */

import { PrismaClient } from '@prisma/client';
import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { validateEmail, validatePhone } from '../utils/validation.js';
import { rylsRegistrations } from '../data/ryls.js';
import { rylsDrafts } from '../data/rylsDrafts.js';

/**
 * Seed RYLS registrations
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Object>} Statistics object
 */
export async function seedRyls(prisma) {
  try {
    logSeedStart('RYLS');

    // Clear existing RYLS data in dependency order
    await prisma.rylsDraftRegistration.deleteMany({});
    await prisma.rylsPayment.deleteMany({});
    await prisma.transaction.deleteMany({ where: { product_type: 'RYLS' } });
    await prisma.rylsFullyFundedSubmission.deleteMany({});
    await prisma.rylsSelfFundedSubmission.deleteMany({});
    await prisma.fileUpload.deleteMany({
      where: {
        upload_type: { in: ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF'] },
      },
    });
    await prisma.rylsRegistration.deleteMany({});

    let fullyFundedCount = 0;
    let selfFundedCount = 0;
    let fileUploadCount = 0;
    let paymentCount = 0;

    for (const [index, regData] of rylsRegistrations.entries()) {
      const { fully_funded, self_funded, payment: paymentData, ...registrationFields } = regData;

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

      // Create fully funded submission (essay fields null — submitted later by user)
      if (fully_funded !== undefined) {
        await prisma.rylsFullyFundedSubmission.create({
          data: {
            registration_id: registration.id,
            essay_topic: null,
            essay_description: null,
            essay_file_id: null,
          },
        });
        fullyFundedCount++;
      }

      // Create self funded submission (headshot uploaded at registration time)
      if (self_funded) {
        const headshotFile = await prisma.fileUpload.create({
          data: {
            original_name: `${registration.full_name}-headshot.jpg`,
            file_path: self_funded.headshot_file_path,
            file_size: 1024 * 200, // 200KB
            mime_type: 'image/jpeg',
            upload_type: 'HEADSHOT',
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

      // Create payment: Transaction (Layer 1) + RylsPayment (Layer 3)
      if (paymentData) {
        const transactionCode = `RYLS-SEED-${String(index + 1).padStart(3, '0')}`;
        const isPaid = paymentData.status === 'paid';

        // Create payment proof file for PAYPAL/BANK_TRANSFER PAID entries
        let paymentProofId = null;
        if (isPaid && paymentData.has_proof) {
          const proofFile = await prisma.fileUpload.create({
            data: {
              original_name: `payment-proof-${transactionCode}.pdf`,
              file_path: `/uploads/documents/${transactionCode.toLowerCase()}-proof.pdf`,
              file_size: 1024 * 100, // 100KB
              mime_type: 'application/pdf',
              upload_type: 'PAYMENT_PROOF',
            },
          });
          paymentProofId = proofFile.id;
          fileUploadCount++;
        }

        // Layer 1: Transaction
        const transaction = await prisma.transaction.create({
          data: {
            transaction_code: transactionCode,
            amount: paymentData.amount,
            currency: 'IDR',
            status: isPaid ? 'paid' : 'pending',
            provider: paymentData.provider,
            customer_name: registration.full_name,
            customer_email: registration.email,
            customer_phone: registration.whatsapp,
            product_type: 'RYLS',
            product_type_id: registration.id,
            paid_at: isPaid ? new Date() : null,
          },
        });

        // Layer 3: RylsPayment
        const rylsPayment = await prisma.rylsPayment.create({
          data: {
            registration_id: registration.id,
            status: isPaid ? 'paid' : 'pending',
            scholarship_type: registration.scholarship_type,
            payment_method: paymentData.provider,
            transaction_id: transaction.id,
            payment_proof_id: paymentProofId,
          },
        });

        // Link payment back to registration
        await prisma.rylsRegistration.update({
          where: { id: registration.id },
          data: { ryls_payment_id: rylsPayment.id },
        });

        paymentCount++;
      }
    }

    // Seed draft registrations
    let draftCount = 0;
    for (const draft of rylsDrafts) {
      await prisma.rylsDraftRegistration.create({ data: draft });
      draftCount++;
    }

    const stats = {
      registrationCount: rylsRegistrations.length,
      fullyFundedCount,
      selfFundedCount,
      fileUploadCount,
      paymentCount,
      draftCount,
    };

    logSeedSuccess('RYLS', stats);
    return stats;
  } catch (error) {
    logSeedError('RYLS', error);
    throw error;
  }
}
