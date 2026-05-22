import { BaseRepository } from '../shared/BaseRepository.js';
import prisma from '../../config/database.js';

export class RylsRegistrationRepository extends BaseRepository {
  constructor() {
    super(prisma.rylsRegistration);
  }


  /**
   * Create a fully funded registration + submission in one transaction
   */
  async createFullyFundedFlow({ step1, essayTopic, essayFileId, essayDescription, paymentId }) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const registration = await tx.rylsRegistration.create({
          data: {
            full_name: step1.fullName,
            email: step1.email.toLowerCase(),
            residence: step1.residence,
            nationality: step1.nationality,
            second_nationality: step1.secondNationality || null,
            whatsapp: step1.whatsapp,
            institution: step1.institution,
            date_of_birth: new Date(step1.dateOfBirth),
            gender: step1.gender,
            discover_source: step1.discoverSource,
            discover_other_text: step1.discoverOtherText || null,
            scholarship_type: 'FULLY_FUNDED',
          },
        });

        const submissionData = {
          registration: { connect: { id: registration.id } },
          essay_topic: essayTopic || null,
          essay_description: essayDescription || null,
        };
        if (essayFileId) {
          submissionData.essay_file = { connect: { id: parseInt(essayFileId) } };
        }

        const submission = await tx.rylsFullyFundedSubmission.create({ data: submissionData });

        if (paymentId) {
          await tx.rylsPayment.update({
            where: { id: parseInt(paymentId) },
            data: { registration: { connect: { id: registration.id } } },
          });
        }

        return { registration, submission };
      });

      return result;
    } catch (error) {
      throw new Error('Failed to create fully funded registration');
    }
  }

  /**
   * Create a self-funded registration + submission in one transaction
   */
  async createSelfFundedFlow({ step1, passportNumber, needVisa, headshotFileId, readPolicies, paymentId }) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const registration = await tx.rylsRegistration.create({
          data: {
            full_name: step1.fullName,
            email: step1.email.toLowerCase(),
            residence: step1.residence,
            nationality: step1.nationality,
            second_nationality: step1.secondNationality || null,
            whatsapp: step1.whatsapp,
            institution: step1.institution,
            date_of_birth: new Date(step1.dateOfBirth),
            gender: step1.gender,
            discover_source: step1.discoverSource,
            discover_other_text: step1.discoverOtherText || null,
            scholarship_type: 'SELF_FUNDED',
          },
        });

        const submission = await tx.rylsSelfFundedSubmission.create({
          data: {
            registration_id: registration.id,
            passport_number: passportNumber,
            need_visa: needVisa === 'YES',
            headshot_file_id: parseInt(headshotFileId),
            read_policies: readPolicies === 'YES',
          },
        });

        if (paymentId) {
          await tx.rylsPayment.update({
            where: { id: parseInt(paymentId) },
            data: { registration: { connect: { id: registration.id } } },
          });
        }

        return { registration, submission };
      });

      return result;
    } catch (error) {
      throw new Error('Failed to create self funded registration');
    }
  }

  /**
   * Find registration by ID (used as submissionId in routes)
   */
  async findBySubmissionId(submissionId) {
    try {
      const id = parseInt(submissionId);
      if (isNaN(id)) return null;
      return await this.model.findUnique({
        where: { id },
        include: {
          fully_funded_submission: { include: { essay_file: true } },
          self_funded_submission: { include: { headshot_file: true } },
          payments: { include: { transaction: true, payment_proof: true }, orderBy: { created_at: 'desc' } },
        },
      });
    } catch (error) {
      throw new Error('Failed to find registration');
    }
  }

  /**
   * Find registration by ID with all relations (alias used by service)
   */
  async findByIdWithRelations(id) {
    try {
      return await this.model.findUnique({
        where: { id: parseInt(id) },
        include: {
          fully_funded_submission: { include: { essay_file: true } },
          self_funded_submission: { include: { headshot_file: true } },
          payments: { include: { transaction: true, payment_proof: true }, orderBy: { created_at: 'desc' } },
        },
      });
    } catch (error) {
      throw new Error('Failed to find registration');
    }
  }

  async createRegistration(registrationData, paymentId = null) {
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
          ryls_payment_id: paymentId ? parseInt(paymentId) : null,
        },
      });


      if (paymentId) {
        const payment = await prisma.rylsPayment.update({
          where: { id: parseInt(paymentId) },
          data: { registration: { connect: { id: registration.id } } },
        });

        if (!payment) {
          throw new Error('Failed to link payment to registration');
        }

      }

      return registration;
    } catch (error) {
      throw new Error('Failed to process registration');
    }
  }

  async createFullyFundedSubmission(registrationId, submissionData) {
    try {
      const data = {
        essay_topic: submissionData.essayTopic || null,
        essay_description: submissionData.essayDescription || null,
        registration: { connect: { id: parseInt(registrationId) } },
      };
      if (submissionData.essayFileId) {
        data.essay_file = { connect: { id: parseInt(submissionData.essayFileId) } };
      }
      const submission = await prisma.rylsFullyFundedSubmission.create({ data });
      return submission;
    } catch (error) {
      throw new Error('Failed to create fully funded submission');
    }
  }

  async createSelfFundedSubmission(registrationId, submissionData) {
    try {
      const submission = await prisma.rylsSelfFundedSubmission.create({
        data: {
          registration_id: parseInt(registrationId),
          passport_number: submissionData.passportNumber,
          need_visa: submissionData.needVisa === 'YES',
          headshot_file_id: parseInt(submissionData.headshotFileId),
          read_policies: submissionData.readPolicies === 'YES',
        },
      });
      return submission;
    } catch (error) {
      throw new Error('Failed to create self funded submission');
    }
  }

  async getRegistrationById(id) {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          fully_funded_submission: true,
          self_funded_submission: true,
          payments: { include: { transaction: true, payment_proof: true }, orderBy: { created_at: 'desc' } },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getRegistrationWithPayments(id) {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          payments: { include: { transaction: true, payment_proof: true }, orderBy: { created_at: 'desc' } },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async findByIdWithPayments(id, { includePayments = true } = {}) {
    try {
      const include = { fully_funded_submission: true, self_funded_submission: true };
      if (includePayments) {
        include.payments = { include: { transaction: true, payment_proof: true }, orderBy: { created_at: 'desc' } };
      }
      return await this.model.findUnique({ where: { id: parseInt(id) }, include });
    } catch (error) {
      throw new Error('Failed to find registration with payments');
    }
  }

  async findByEmail(email) {
    try {
      const registration = await this.model.findFirst({
        where: { email: email.toLowerCase() },
        include: { payments: { include: { transaction: true, payment_proof: true }, orderBy: { created_at: 'desc' } } },
      });
      return registration;
    } catch (error) {
      throw new Error('Failed to find registration by email');
    }
  }

  async findById(id) {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          fully_funded_submission: true,
          self_funded_submission: true,
          payments: { include: { transaction: true, payment_proof: true }, orderBy: { created_at: 'desc' } },
        },
      });
    } catch (error) {
      throw new Error('Failed to find registration by ID');
    }
  }

  async getRegistrations(options = {}) {
    try {
      const {
        page = 1,
        limit,
        id,
        scholarshipType,
        sortBy = 'created_at',
        sortOrder = 'desc',
        search,
        startDate,
        endDate,
      } = options;
      const numericLimit = limit ? Number(limit) : undefined;
      const skip = numericLimit ? (page - 1) * numericLimit : undefined;
      const whereClause = {};

      if (id) whereClause.id = Number(id);
      if (scholarshipType) {
        whereClause.scholarship_type = scholarshipType;
      }

      if (search) {
        whereClause.OR = [{ full_name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
      }

      if (startDate && endDate) {
        whereClause.created_at = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [registrations, total] = await Promise.all([
        this.model.findMany({
          where: whereClause,
          orderBy: { [sortBy]: sortOrder },
          ...(skip !== undefined ? { skip } : {}),
          ...(numericLimit !== undefined ? { take: numericLimit } : {}),
          include: {
            fully_funded_submission: { include: { essay_file: true } },
            self_funded_submission: { include: { headshot_file: true } },
            payments: { include: { transaction: true, payment_proof: true } },
          },
        }),
        this.model.count({ where: whereClause }),
      ]);

      const resolvedLimit = numericLimit ?? total;
      const result = {
        registrations,
        pagination: {
          page,
          limit: resolvedLimit,
          total,
          totalPages: resolvedLimit > 0 ? Math.ceil(total / resolvedLimit) : 1
        }
      };
      return result;
    } catch (error) {
      throw new Error('Failed to get registrations');
    }
  }

  async getRegistrationStats() {
    try {
      const [totalRegistrations, fullyFundedCount, selfFundedCount, recentRegistrations] = await Promise.all([
        this.model.count(),
        this.model.count({ where: { scholarship_type: 'FULLY_FUNDED' } }),
        this.model.count({ where: { scholarship_type: 'SELF_FUNDED' } }),
        this.model.count({ where: { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      ]);

      return {
        totalRegistrations,
        scholarshipBreakdown: { fullyFunded: fullyFundedCount, selfFunded: selfFundedCount },
        recentRegistrations,
      };
    } catch (error) {
      throw new Error('Failed to get registration statistics');
    }
  }

  async getRegistrationsByDateRange(startDate, endDate, options = {}) {
    try {
      const { scholarshipType, sortBy = 'created_at', sortOrder = 'desc' } = options;

      const whereClause = { created_at: { gte: new Date(startDate), lte: new Date(endDate) } };
      if (scholarshipType) whereClause.scholarship_type = scholarshipType;

      const registrations = await this.model.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        include: { fully_funded_submission: true, self_funded_submission: true },
      });

      return registrations;
    } catch (error) {
      throw new Error('Failed to get registrations by date range');
    }
  }

  async emailExists(email) {
    try {
      const registration = await this.model.findFirst({ where: { email: email.toLowerCase() } });
      return !!registration;
    } catch (error) {
      throw new Error('Failed to check email existence');
    }
  }

  async deleteRegistration(id) {
    try {
      await Promise.all([
        prisma.rylsFullyFundedSubmission.deleteMany({ where: { registration_id: parseInt(id) } }),
        prisma.rylsSelfFundedSubmission.deleteMany({ where: { registration_id: parseInt(id) } }),
      ]);

      await this.model.delete({ where: { id: parseInt(id) } });

      return true;
    } catch (error) {
      throw new Error('Failed to delete registration');
    }
  }

  async getNationalityStats() {
    try {
      const nationalityStats = await this.model.groupBy({ by: ['nationality'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } });
      return nationalityStats.map((stat) => ({ nationality: stat.nationality, count: stat._count.id }));
    } catch (error) {
      throw new Error('Failed to get nationality statistics');
    }
  }

  async getDiscoverSourceStats() {
    try {
      const sourceStats = await this.model.groupBy({ by: ['discover_source'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } });
      return sourceStats.map((stat) => ({ source: stat.discover_source, count: stat._count.id }));
    } catch (error) {
      throw new Error('Failed to get discover source statistics');
    }
  }
}

export const rylsRegistrationRepository = new RylsRegistrationRepository();
