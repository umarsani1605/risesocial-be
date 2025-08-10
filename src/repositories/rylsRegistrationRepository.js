import { BaseRepository } from './base/BaseRepository.js';
import prisma from '../lib/prisma.js';

/**
 * RYLS Registration Repository
 * Handles database operations for RYLS registration system
 */
export class RylsRegistrationRepository extends BaseRepository {
  constructor() {
    super(prisma.rylsRegistration);
  }

  /**
   * Create a new RYLS registration
   * @param {Object} registrationData - Registration data
   * @returns {Promise<Object>} Created registration record
   */
  async createRegistration(registrationData) {
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
          status: 'PENDING',
          submission_id: this.generateSubmissionId(),
        },
      });

      return registration;
    } catch (error) {
      console.error('Error creating RYLS registration:', error);
      throw new Error('Failed to create registration');
    }
  }

  /**
   * Create fully funded submission
   * @param {number} registrationId - Registration ID
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Created submission record
   */
  async createFullyFundedSubmission(registrationId, submissionData) {
    try {
      const submission = await prisma.rylsFullyFundedSubmission.create({
        data: {
          registration_id: registrationId,
          essay_topic: submissionData.essayTopic,
          essay_file_id: submissionData.essayFileId,
          essay_description: submissionData.essayDescription || null,
        },
      });

      return submission;
    } catch (error) {
      console.error('Error creating fully funded submission:', error);
      throw new Error('Failed to create fully funded submission');
    }
  }

  /**
   * Create self funded submission
   * @param {number} registrationId - Registration ID
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Created submission record
   */
  async createSelfFundedSubmission(registrationId, submissionData) {
    try {
      const submission = await prisma.rylsSelfFundedSubmission.create({
        data: {
          registration_id: registrationId,
          passport_number: submissionData.passportNumber,
          need_visa: submissionData.needVisa === 'YES',
          headshot_file_id: submissionData.headshotFileId,
          read_policies: submissionData.readPolicies === 'YES',
        },
      });

      return submission;
    } catch (error) {
      console.error('Error creating self funded submission:', error);
      throw new Error('Failed to create self funded submission');
    }
  }

  /**
   * Find registration by ID with related data
   * @param {number} id - Registration ID
   * @returns {Promise<Object|null>} Registration record with relations
   */
  async findByIdWithRelations(id) {
    try {
      const registration = await this.model.findUnique({
        where: { id: parseInt(id) },
        include: {
          fully_funded_submission: {
            include: {
              essay_file: true,
            },
          },
          self_funded_submission: {
            include: {
              headshot_file: true,
            },
          },
        },
      });

      return registration;
    } catch (error) {
      console.error('Error finding registration by ID with relations:', error);
      throw new Error('Failed to find registration');
    }
  }

  /**
   * Find registration by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} Registration record
   */
  async findByEmail(email) {
    try {
      const registration = await this.model.findFirst({
        where: {
          email: email.toLowerCase(),
        },
      });

      return registration;
    } catch (error) {
      console.error('Error finding registration by email:', error);
      throw new Error('Failed to find registration by email');
    }
  }

  /**
   * Find registration by submission ID
   * @param {string} submissionId - Submission ID
   * @returns {Promise<Object|null>} Registration record
   */
  async findBySubmissionId(submissionId) {
    try {
      const registration = await this.model.findUnique({
        where: {
          submission_id: submissionId,
        },
        include: {
          fully_funded_submission: {
            include: {
              essay_file: true,
            },
          },
          self_funded_submission: {
            include: {
              headshot_file: true,
            },
          },
        },
      });

      return registration;
    } catch (error) {
      console.error('Error finding registration by submission ID:', error);
      throw new Error('Failed to find registration by submission ID');
    }
  }

  /**
   * Get registrations with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated registrations
   */
  async getRegistrations(options = {}) {
    try {
      console.log('🔵 [RylsRepository] getRegistrations called');
      console.log('📝 [RylsRepository] Options received:', JSON.stringify(options, null, 2));

      const { page = 1, limit = 10, status, scholarshipType, sortBy = 'created_at', sortOrder = 'desc', search } = options;

      const skip = (page - 1) * limit;
      const whereClause = {};

      // Filter by status
      if (status) {
        whereClause.status = status;
        console.log('🔍 [RylsRepository] Added status filter:', status);
      }

      // Filter by scholarship type
      if (scholarshipType) {
        whereClause.scholarship_type = scholarshipType;
        console.log('🔍 [RylsRepository] Added scholarshipType filter:', scholarshipType);
      }

      // Search by name or email
      if (search) {
        whereClause.OR = [
          {
            full_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
        console.log('🔍 [RylsRepository] Added search filter:', search);
      }

      console.log('🔧 [RylsRepository] Final whereClause:', JSON.stringify(whereClause, null, 2));
      console.log('📊 [RylsRepository] Query params:', { skip, limit, sortBy, sortOrder });

      console.log('🔄 [RylsRepository] Executing Prisma queries...');
      const [registrations, total] = await Promise.all([
        this.model.findMany({
          where: whereClause,
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: limit,
          include: {
            fully_funded_submission: true,
            self_funded_submission: true,
          },
        }),
        this.model.count({ where: whereClause }),
      ]);

      console.log('✅ [RylsRepository] Prisma queries completed');
      console.log('📊 [RylsRepository] Query results:', {
        registrationsFound: registrations.length,
        totalCount: total,
        firstRegistrationId: registrations[0]?.id || 'none',
      });

      const result = {
        registrations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      console.log('🎯 [RylsRepository] Final result prepared:', {
        registrationsCount: result.registrations.length,
        pagination: result.pagination,
      });

      return result;
    } catch (error) {
      console.error('❌ [RylsRepository] Error getting registrations:', error);
      console.error('❌ [RylsRepository] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw new Error('Failed to get registrations');
    }
  }

  /**
   * Update registration status
   * @param {number} id - Registration ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated registration
   */
  async updateStatus(id, status) {
    try {
      const updatedRegistration = await this.model.update({
        where: { id: parseInt(id) },
        data: { status },
      });

      return updatedRegistration;
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw new Error('Failed to update registration status');
    }
  }

  /**
   * Get registration statistics
   * @returns {Promise<Object>} Registration statistics
   */
  async getRegistrationStats() {
    try {
      const [
        totalRegistrations,
        pendingRegistrations,
        approvedRegistrations,
        rejectedRegistrations,
        fullyFundedCount,
        selfFundedCount,
        recentRegistrations,
      ] = await Promise.all([
        // Total registrations
        this.model.count(),

        // Pending registrations
        this.model.count({
          where: { status: 'PENDING' },
        }),

        // Approved registrations
        this.model.count({
          where: { status: 'APPROVED' },
        }),

        // Rejected registrations
        this.model.count({
          where: { status: 'REJECTED' },
        }),

        // Fully funded registrations
        this.model.count({
          where: { scholarship_type: 'FULLY_FUNDED' },
        }),

        // Self funded registrations
        this.model.count({
          where: { scholarship_type: 'SELF_FUNDED' },
        }),

        // Recent registrations (last 7 days)
        this.model.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return {
        totalRegistrations,
        statusBreakdown: {
          pending: pendingRegistrations,
          approved: approvedRegistrations,
          rejected: rejectedRegistrations,
        },
        scholarshipBreakdown: {
          fullyFunded: fullyFundedCount,
          selfFunded: selfFundedCount,
        },
        recentRegistrations,
      };
    } catch (error) {
      console.error('Error getting registration stats:', error);
      throw new Error('Failed to get registration statistics');
    }
  }

  /**
   * Get registrations by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Registrations in date range
   */
  async getRegistrationsByDateRange(startDate, endDate, options = {}) {
    try {
      const { status, scholarshipType, sortBy = 'created_at', sortOrder = 'desc' } = options;

      const whereClause = {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (status) {
        whereClause.status = status;
      }

      if (scholarshipType) {
        whereClause.scholarship_type = scholarshipType;
      }

      const registrations = await this.model.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          fully_funded_submission: true,
          self_funded_submission: true,
        },
      });

      return registrations;
    } catch (error) {
      console.error('Error getting registrations by date range:', error);
      throw new Error('Failed to get registrations by date range');
    }
  }

  /**
   * Check if email is already registered
   * @param {string} email - Email address
   * @returns {Promise<boolean>} Email exists status
   */
  async emailExists(email) {
    try {
      const registration = await this.model.findFirst({
        where: {
          email: email.toLowerCase(),
        },
      });

      return !!registration;
    } catch (error) {
      console.error('Error checking email exists:', error);
      throw new Error('Failed to check email existence');
    }
  }

  /**
   * Delete registration and related data
   * @param {number} id - Registration ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteRegistration(id) {
    try {
      // Delete related submissions first (cascade should handle this, but being explicit)
      await Promise.all([
        prisma.rylsFullyFundedSubmission.deleteMany({
          where: { registration_id: parseInt(id) },
        }),
        prisma.rylsSelfFundedSubmission.deleteMany({
          where: { registration_id: parseInt(id) },
        }),
      ]);

      // Delete main registration
      await this.model.delete({
        where: { id: parseInt(id) },
      });

      return true;
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw new Error('Failed to delete registration');
    }
  }

  /**
   * Generate unique submission ID
   * @private
   * @returns {string} Unique submission ID
   */
  generateSubmissionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `RYLS-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Get nationality statistics
   * @returns {Promise<Array>} Nationality breakdown
   */
  async getNationalityStats() {
    try {
      const nationalityStats = await this.model.groupBy({
        by: ['nationality'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      return nationalityStats.map((stat) => ({
        nationality: stat.nationality,
        count: stat._count.id,
      }));
    } catch (error) {
      console.error('Error getting nationality stats:', error);
      throw new Error('Failed to get nationality statistics');
    }
  }

  /**
   * Get discover source statistics
   * @returns {Promise<Array>} Discover source breakdown
   */
  async getDiscoverSourceStats() {
    try {
      const sourceStats = await this.model.groupBy({
        by: ['discover_source'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      return sourceStats.map((stat) => ({
        source: stat.discover_source,
        count: stat._count.id,
      }));
    } catch (error) {
      console.error('Error getting discover source stats:', error);
      throw new Error('Failed to get discover source statistics');
    }
  }
}
