import { BaseRepository } from '../shared/BaseRepository.js';
import prisma from '../../config/database.js';
import { getLogger } from '../../utils/loggerContext.js';

export class RylsRegistrationRepository extends BaseRepository {
  constructor() {
    super(prisma.rylsRegistration);
  }

  get logger() {
    return getLogger();
  }

  async createRegistration(registrationData, paymentId = null) {
    this.logger.info('[rylsRegistrationRepository] createRegistration called');
    try {
      const registration = await this.model.create({
        data: {
          full_name: registrationData.fullName,
          email: registrationData.email,
          residence: registrationData.residence,
          nationality: registrationData.nationality,
          second_nationality: registrationData.secondNationality || null,
          whatsapp: registrationData.whatsapp,
          institution: registrationData.institution,
          date_of_birth: new Date(registrationData.dateOfBirth),
          gender: registrationData.gender,
          discover_source: registrationData.discoverSource,
          discover_other_text: registrationData.discoverOtherText || null,
          scholarship_type: registrationData.scholarshipType,
          ryls_payment_id: parseInt(paymentId),
        },
      });

      this.logger.info({ id: registration.id }, '[rylsRegistrationRepository] registration created');

      const payment = await prisma.rylsPayment.update({
        where: { id: parseInt(paymentId) },
        data: { registration: { connect: { id: registration.id } } },
      });

      if (!payment) {
        throw new Error('Failed to link payment to registration');
      }

      this.logger.info({ paymentId }, '[rylsRegistrationRepository] payment linked');

      return registration;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] createRegistration error');
      throw new Error('Failed to process registration');
    }
  }

  async createFullyFundedSubmission(registrationId, submissionData) {
    this.logger.info({ registrationId }, '[rylsRegistrationRepository] createFullyFundedSubmission called');
    try {
      const submission = await prisma.rylsFullyFundedSubmission.create({
        data: {
          essay_topic: submissionData.essayTopic || null,
          essay_description: submissionData.essayDescription || null,
          registration: { connect: { id: parseInt(registrationId) } },
        },
      });
      this.logger.info({ submissionId: submission.id }, '[rylsRegistrationRepository] fully funded submission created');
      return submission;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] createFullyFundedSubmission error');
      throw new Error('Failed to create fully funded submission');
    }
  }

  async createSelfFundedSubmission(registrationId, submissionData) {
    this.logger.info({ registrationId }, '[rylsRegistrationRepository] createSelfFundedSubmission called');
    try {
      const submission = await prisma.rylsSelfFundedSubmission.create({
        data: {
          registration_id: parseInt(registrationId),
          passport_number: submissionData.passportNumber,
          need_visa: submissionData.needVisa === 'YES',
          headshot_file_id: parseInt(submissionData.headshotFile),
          read_policies: submissionData.readPolicies === 'YES',
        },
      });
      this.logger.info({ submissionId: submission.id }, '[rylsRegistrationRepository] self funded submission created');
      return submission;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] createSelfFundedSubmission error');
      throw new Error('Failed to create self funded submission');
    }
  }

  async getRegistrationById(id) {
    this.logger.info({ id }, '[rylsRegistrationRepository] getRegistrationById called');
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          fully_funded_submission: true,
          self_funded_submission: true,
          payments: { include: { midtrans: true, payment_proof: true }, orderBy: { created_at: 'desc' } },
        },
      });
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] getRegistrationById error');
      throw error;
    }
  }

  async getRegistrationWithPayments(id) {
    this.logger.info({ id }, '[rylsRegistrationRepository] getRegistrationWithPayments called');
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          payments: { include: { midtrans: true, payment_proof: true }, orderBy: { created_at: 'desc' } },
        },
      });
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] getRegistrationWithPayments error');
      throw error;
    }
  }

  async findByIdWithPayments(id, { includePayments = true } = {}) {
    this.logger.info({ id, includePayments }, '[rylsRegistrationRepository] findByIdWithPayments called');
    try {
      const include = { fully_funded_submission: true, self_funded_submission: true };
      if (includePayments) {
        include.payments = { include: { midtrans: true, payment_proof: true }, orderBy: { created_at: 'desc' } };
      }
      return await this.model.findUnique({ where: { id: parseInt(id) }, include });
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] findByIdWithPayments error');
      throw new Error('Failed to find registration with payments');
    }
  }

  async findByEmail(email) {
    this.logger.info({ email }, '[rylsRegistrationRepository] findByEmail called');
    try {
      const registration = await this.model.findFirst({
        where: { email: email.toLowerCase() },
        include: { payments: { include: { midtrans: true, payment_proof: true }, orderBy: { created_at: 'desc' } } },
      });
      return registration;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] findByEmail error');
      throw new Error('Failed to find registration by email');
    }
  }

  async findById(id) {
    this.logger.info({ id }, '[rylsRegistrationRepository] findById called');
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          fully_funded_submission: true,
          self_funded_submission: true,
          payments: { include: { midtrans: true, payment_proof: true }, orderBy: { created_at: 'desc' } },
        },
      });
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] findById error');
      throw new Error('Failed to find registration by ID');
    }
  }

  async getRegistrations(options = {}) {
    this.logger.info({ options }, '[rylsRegistrationRepository] getRegistrations called');
    try {
      const { page = 1, limit = 10, status, scholarshipType, sortBy = 'created_at', sortOrder = 'desc', search } = options;

      const skip = (page - 1) * limit;
      const whereClause = {};

      if (status) {
        whereClause.status = status;
        this.logger.debug({ status }, '[rylsRegistrationRepository] filter status');
      }

      if (scholarshipType) {
        whereClause.scholarship_type = scholarshipType;
        this.logger.debug({ scholarshipType }, '[rylsRegistrationRepository] filter scholarshipType');
      }

      if (search) {
        whereClause.OR = [{ full_name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
        this.logger.debug({ search }, '[rylsRegistrationRepository] filter search');
      }

      const [registrations, total] = await Promise.all([
        this.model.findMany({
          where: whereClause,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
          include: {
            fully_funded_submission: { include: { essay_file: true } },
            self_funded_submission: { include: { headshot_file: true } },
            payments: { include: { midtrans: true, payment_proof: true } },
          },
        }),
        this.model.count({ where: whereClause }),
      ]);

      const result = { registrations, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
      this.logger.info('[rylsRegistrationRepository] getRegistrations success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] getRegistrations error');
      throw new Error('Failed to get registrations');
    }
  }

  async updateStatus(id, status) {
    this.logger.info({ id, status }, '[rylsRegistrationRepository] updateStatus called');
    try {
      const updatedRegistration = await this.model.update({ where: { id: parseInt(id) }, data: { payment_status: status } });
      return updatedRegistration;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] updateStatus error');
      throw new Error('Failed to update registration status');
    }
  }

  async getRegistrationStats() {
    this.logger.info('[rylsRegistrationRepository] getRegistrationStats called');
    try {
      const [
        totalRegistrations,
        pendingRegistrations,
        paidRegistrations,
        failedRegistrations,
        expiredRegistrations,
        fullyFundedCount,
        selfFundedCount,
        recentRegistrations,
      ] = await Promise.all([
        this.model.count(),
        this.model.count({ where: { payment_status: 'PENDING' } }),
        this.model.count({ where: { payment_status: 'PAID' } }),
        this.model.count({ where: { payment_status: 'FAILED' } }),
        this.model.count({ where: { payment_status: 'EXPIRED' } }),
        this.model.count({ where: { scholarship_type: 'FULLY_FUNDED' } }),
        this.model.count({ where: { scholarship_type: 'SELF_FUNDED' } }),
        this.model.count({ where: { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      ]);

      return {
        totalRegistrations,
        statusBreakdown: { pending: pendingRegistrations, paid: paidRegistrations, failed: failedRegistrations, expired: expiredRegistrations },
        scholarshipBreakdown: { fullyFunded: fullyFundedCount, selfFunded: selfFundedCount },
        recentRegistrations,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] getRegistrationStats error');
      throw new Error('Failed to get registration statistics');
    }
  }

  async getRegistrationsByDateRange(startDate, endDate, options = {}) {
    this.logger.info({ startDate, endDate }, '[rylsRegistrationRepository] getRegistrationsByDateRange called');
    try {
      const { status, scholarshipType, sortBy = 'created_at', sortOrder = 'desc' } = options;

      const whereClause = { created_at: { gte: startDate, lte: endDate } };
      if (status) whereClause.payment_status = status;
      if (scholarshipType) whereClause.scholarship_type = scholarshipType;

      const registrations = await this.model.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        include: { fully_funded_submission: true, self_funded_submission: true },
      });

      return registrations;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] getRegistrationsByDateRange error');
      throw new Error('Failed to get registrations by date range');
    }
  }

  async emailExists(email) {
    this.logger.info({ email }, '[rylsRegistrationRepository] emailExists called');
    try {
      const registration = await this.model.findFirst({ where: { email: email.toLowerCase() } });
      return !!registration;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] emailExists error');
      throw new Error('Failed to check email existence');
    }
  }

  async deleteRegistration(id) {
    this.logger.info({ id }, '[rylsRegistrationRepository] deleteRegistration called');
    try {
      await Promise.all([
        prisma.rylsFullyFundedSubmission.deleteMany({ where: { registration_id: parseInt(id) } }),
        prisma.rylsSelfFundedSubmission.deleteMany({ where: { registration_id: parseInt(id) } }),
      ]);

      await this.model.delete({ where: { id: parseInt(id) } });

      return true;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] deleteRegistration error');
      throw new Error('Failed to delete registration');
    }
  }

  generateSubmissionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `RYLS-${timestamp}-${random}`.toUpperCase();
  }

  async getNationalityStats() {
    this.logger.info('[rylsRegistrationRepository] getNationalityStats called');
    try {
      const nationalityStats = await this.model.groupBy({ by: ['nationality'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } });
      return nationalityStats.map((stat) => ({ nationality: stat.nationality, count: stat._count.id }));
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] getNationalityStats error');
      throw new Error('Failed to get nationality statistics');
    }
  }

  async getDiscoverSourceStats() {
    this.logger.info('[rylsRegistrationRepository] getDiscoverSourceStats called');
    try {
      const sourceStats = await this.model.groupBy({ by: ['discover_source'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } });
      return sourceStats.map((stat) => ({ source: stat.discover_source, count: stat._count.id }));
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationRepository] getDiscoverSourceStats error');
      throw new Error('Failed to get discover source statistics');
    }
  }
}

export const rylsRegistrationRepository = new RylsRegistrationRepository();
