/**
 * RYLS Test Fixtures
 * Provides sample data and seeding functions for RYLS feature testing
 */

import { getTestPrisma } from './testDb.js';

// ============================================================
// Sample Data
// ============================================================

export const validStep1Data = {
  fullName: 'Budi Santoso',
  email: 'budi.santoso@example.com',
  residence: 'Jakarta, Indonesia',
  nationality: 'Indonesian',
  secondNationality: null,
  whatsapp: '081234567890',
  institution: 'Universitas Indonesia',
  dateOfBirth: '2000-05-15',
  gender: 'MALE',
  discoverSource: 'RISE_INSTAGRAM',
  discoverOtherText: null,
  scholarshipType: 'FULLY_FUNDED',
};

export const validFullyFundedBody = {
  step1: { ...validStep1Data, scholarshipType: 'FULLY_FUNDED' },
  essayTopic: 'Sustainable leadership in Southeast Asia',
  essayFileId: null, // will be set after creating FileUpload
  essayDescription: 'My essay describes my vision for sustainable leadership.',
};

export const validSelfFundedBody = {
  step1: { ...validStep1Data, scholarshipType: 'SELF_FUNDED', email: 'siti.rahayu@example.com' },
  passportNumber: 'A1234567',
  needVisa: 'YES',
  headshotFileId: null, // will be set after creating FileUpload
  readPolicies: 'YES',
};

// ============================================================
// Database Seeding Functions
// ============================================================

/**
 * Create a test admin user
 */
export async function createAdminUser(overrides = {}) {
  const prisma = getTestPrisma();
  return prisma.user.create({
    data: {
      username: 'admin_ryls_test',
      first_name: 'Admin',
      last_name: 'RYLS',
      email: 'admin.ryls@test.com',
      password: 'hashed_password',
      role: 'ADMIN',
      ...overrides,
    },
  });
}

/**
 * Create a minimal FileUpload record for testing
 */
export async function createFileUpload(overrides = {}) {
  const prisma = getTestPrisma();
  return prisma.fileUpload.create({
    data: {
      original_name: overrides.original_name || 'essay.pdf',
      file_path: overrides.file_path || '/uploads/test-essay.pdf',
      file_size: overrides.file_size || 102400,
      mime_type: overrides.mime_type || overrides.mimetype || 'application/pdf',
      upload_type: overrides.upload_type || 'ryls_essay',
      ...overrides,
    },
  });
}

/**
 * Create a complete RYLS registration with fully funded submission
 */
export async function createFullyFundedRegistration(overrides = {}) {
  const prisma = getTestPrisma();

  const essayFile = await createFileUpload({ original_name: 'essay.pdf' });

  const registration = await prisma.rylsRegistration.create({
    data: {
      full_name: 'Ahmad Fauzi',
      email: `ahmad.fauzi+${Date.now()}@example.com`,
      residence: 'Bandung, Indonesia',
      nationality: 'Indonesian',
      whatsapp: '082345678901',
      institution: 'Institut Teknologi Bandung',
      date_of_birth: new Date('1999-03-20'),
      gender: 'MALE',
      discover_source: 'RISE_INSTAGRAM',
      scholarship_type: 'FULLY_FUNDED',
      ...overrides,
    },
  });

  const submission = await prisma.rylsFullyFundedSubmission.create({
    data: {
      registration_id: registration.id,
      essay_topic: 'Leadership for Sustainability',
      essay_file_id: essayFile.id,
      essay_description: 'My vision for sustainable development.',
    },
  });

  return { registration, submission, essayFile };
}

/**
 * Create a complete RYLS registration with self-funded submission
 */
export async function createSelfFundedRegistration(overrides = {}) {
  const prisma = getTestPrisma();

  const headshotFile = await createFileUpload({
    original_name: 'headshot.jpg',
    mime_type: 'image/jpeg',
  });

  const registration = await prisma.rylsRegistration.create({
    data: {
      full_name: 'Dewi Kusuma',
      email: `dewi.kusuma+${Date.now()}@example.com`,
      residence: 'Surabaya, Indonesia',
      nationality: 'Indonesian',
      whatsapp: '083456789012',
      institution: 'Universitas Airlangga',
      date_of_birth: new Date('2001-07-10'),
      gender: 'FEMALE',
      discover_source: 'FRIENDS',
      scholarship_type: 'SELF_FUNDED',
      ...overrides,
    },
  });

  const submission = await prisma.rylsSelfFundedSubmission.create({
    data: {
      registration_id: registration.id,
      passport_number: 'B9876543',
      need_visa: true,
      headshot_file_id: headshotFile.id,
      read_policies: true,
    },
  });

  return { registration, submission, headshotFile };
}

/**
 * Create a transaction + rylsPayment for a registration
 */
export async function createRylsPayment(registrationId, scholarshipType = 'SELF_FUNDED', overrides = {}) {
  const prisma = getTestPrisma();

  const transaction = await prisma.transaction.create({
    data: {
      transaction_code: `RYLS01TEST${Date.now().toString(16).toUpperCase().slice(-4)}`,
      amount: 11250000,
      currency: 'IDR',
      status: 'pending',
      provider: 'midtrans',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '08123456789',
      product_type: 'Rise Young Leaders Scholarship',
      product_type_id: registrationId,
      ...overrides.transaction,
    },
  });

  const rylsPayment = await prisma.rylsPayment.create({
    data: {
      transaction_id: transaction.id,
      registration_id: registrationId,
      scholarship_type: scholarshipType,
      payment_method: 'midtrans',
      status: 'pending',
      ...overrides.payment,
    },
  });

  return { transaction, rylsPayment };
}
