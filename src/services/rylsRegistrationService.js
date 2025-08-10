import { RylsRegistrationRepository } from '../repositories/rylsRegistrationRepository.js';
import { FileUploadService } from './fileUploadService.js';

/**
 * RYLS Registration Service
 * Business logic for RYLS registration system
 */
export class RylsRegistrationService {
  constructor() {
    this.registrationRepository = new RylsRegistrationRepository();
    this.fileUploadService = new FileUploadService();
  }

  /**
   * Submit fully funded registration
   * @param {Object} formData - Complete form data
   * @returns {Promise<Object>} Registration result
   */
  async submitFullyFundedRegistration(formData) {
    try {
      // Validate form data
      this.validateRegistrationData(formData.step1);
      this.validateFullyFundedData(formData);

      // Create main registration record
      const registration = await this.registrationRepository.createRegistration({
        ...formData.step1,
        scholarshipType: 'FULLY_FUNDED',
      });

      // Create fully funded submission record
      const submission = await this.registrationRepository.createFullyFundedSubmission(registration.id, {
        essayTopic: formData.essayTopic,
        essayFileId: formData.essayFileId,
        essayDescription: formData.essayDescription,
      });

      return {
        registrationId: registration.id,
        submissionId: registration.submission_id,
        email: registration.email,
        fullName: registration.full_name,
        scholarshipType: 'FULLY_FUNDED',
        status: registration.status,
        createdAt: registration.created_at,
        submission: {
          id: submission.id,
          essayTopic: submission.essay_topic,
          essayDescription: submission.essay_description,
        },
      };
    } catch (error) {
      console.error('Error submitting fully funded registration:', error);
      throw error;
    }
  }

  /**
   * Submit self funded registration
   * @param {Object} formData - Complete form data
   * @returns {Promise<Object>} Registration result
   */
  async submitSelfFundedRegistration(formData) {
    try {
      // Validate form data
      this.validateRegistrationData(formData.step1);
      this.validateSelfFundedData(formData);

      // Create main registration record
      const registration = await this.registrationRepository.createRegistration({
        ...formData.step1,
        scholarshipType: 'SELF_FUNDED',
      });

      // Create self funded submission record
      const submission = await this.registrationRepository.createSelfFundedSubmission(registration.id, {
        passportNumber: formData.passportNumber,
        needVisa: formData.needVisa,
        headshotFileId: formData.headshotFileId,
        readPolicies: formData.readPolicies,
      });

      return {
        registrationId: registration.id,
        submissionId: registration.submission_id,
        email: registration.email,
        fullName: registration.full_name,
        scholarshipType: 'SELF_FUNDED',
        status: registration.status,
        createdAt: registration.created_at,
        submission: {
          id: submission.id,
          passportNumber: submission.passport_number,
          needVisa: submission.need_visa,
          readPolicies: submission.read_policies,
        },
      };
    } catch (error) {
      console.error('Error submitting self funded registration:', error);
      throw error;
    }
  }

  /**
   * Get registration by submission ID
   * @param {string} submissionId - Submission ID
   * @returns {Promise<Object|null>} Registration details
   */
  async getRegistrationBySubmissionId(submissionId) {
    try {
      const registration = await this.registrationRepository.findBySubmissionId(submissionId);

      if (!registration) {
        return null;
      }

      return this.enhanceRegistrationObject(registration);
    } catch (error) {
      console.error('Error getting registration by submission ID:', error);
      throw new Error('Failed to retrieve registration');
    }
  }

  /**
   * Get registration by ID
   * @param {number} id - Registration ID
   * @returns {Promise<Object|null>} Registration details
   */
  async getRegistrationById(id) {
    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);

      if (!registration) {
        return null;
      }

      return this.enhanceRegistrationObject(registration);
    } catch (error) {
      console.error('Error getting registration by ID:', error);
      throw new Error('Failed to retrieve registration');
    }
  }

  /**
   * Get all registrations with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated registrations
   */
  async getRegistrations(options = {}) {
    try {
      console.log('🔵 [RylsService] getRegistrations called');
      console.log('📝 [RylsService] Options received:', JSON.stringify(options, null, 2));

      console.log('🔄 [RylsService] Calling repository.getRegistrations...');
      const result = await this.registrationRepository.getRegistrations(options);

      console.log('✅ [RylsService] Repository returned result');
      console.log('📊 [RylsService] Raw result structure:', {
        registrationsCount: result?.registrations?.length || 0,
        pagination: result?.pagination || 'missing',
        firstRegistration: result?.registrations?.[0] ? 'exists' : 'none',
      });

      console.log('🔄 [RylsService] Enhancing registration objects...');
      const enhancedRegistrations = result.registrations.map((reg) => {
        console.log('🔧 [RylsService] Enhancing registration:', reg.id);
        return this.enhanceRegistrationObject(reg);
      });

      console.log('✅ [RylsService] Enhanced registrations completed');
      console.log('📊 [RylsService] Final result structure:', {
        enhancedCount: enhancedRegistrations.length,
        pagination: result.pagination,
      });

      return {
        registrations: enhancedRegistrations,
        pagination: result.pagination,
      };
    } catch (error) {
      console.error('❌ [RylsService] Error getting registrations:', error);
      console.error('❌ [RylsService] Error stack:', error.stack);
      throw new Error('Failed to retrieve registrations');
    }
  }

  /**
   * Get registration by ID with enhanced details
   * @param {number} id - Registration ID
   * @returns {Object|null} Enhanced registration object or null if not found
   */
  async getRegistrationById(id) {
    console.log('🔵 [RylsService] getRegistrationById called for ID:', id);

    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);

      if (!registration) {
        console.log('❌ [RylsService] Registration not found for ID:', id);
        return null;
      }

      console.log('✅ [RylsService] Registration found, enhancing...');
      const enhanced = this.enhanceRegistrationObject(registration);

      console.log('🎯 [RylsService] Registration enhanced successfully for ID:', id);
      return enhanced;
    } catch (error) {
      console.error('❌ [RylsService] Error getting registration by ID:', error);
      console.error('❌ [RylsService] Error stack:', error.stack);
      throw new Error('Failed to get registration');
    }
  }

  /**
   * Update registration status
   * @param {number} id - Registration ID
   * @param {string} status - New status (PENDING, APPROVED, REJECTED)
   * @returns {Promise<Object>} Updated registration
   */
  async updateRegistrationStatus(id, status) {
    try {
      // Validate status
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      }

      const updatedRegistration = await this.registrationRepository.updateStatus(id, status);
      return this.enhanceRegistrationObject(updatedRegistration);
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw error;
    }
  }

  /**
   * Get registration statistics
   * @returns {Promise<Object>} Registration statistics
   */
  async getRegistrationStatistics() {
    try {
      const [basicStats, nationalityStats, sourceStats] = await Promise.all([
        this.registrationRepository.getRegistrationStats(),
        this.registrationRepository.getNationalityStats(),
        this.registrationRepository.getDiscoverSourceStats(),
      ]);

      return {
        ...basicStats,
        demographicBreakdown: {
          byNationality: nationalityStats.slice(0, 10), // Top 10 nationalities
          byDiscoverSource: sourceStats,
        },
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting registration statistics:', error);
      throw new Error('Failed to retrieve registration statistics');
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
      const registrations = await this.registrationRepository.getRegistrationsByDateRange(startDate, endDate, options);

      return registrations.map((reg) => this.enhanceRegistrationObject(reg));
    } catch (error) {
      console.error('Error getting registrations by date range:', error);
      throw new Error('Failed to retrieve registrations by date range');
    }
  }

  /**
   * Delete registration
   * @param {number} id - Registration ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteRegistration(id) {
    try {
      // Get registration first to check files
      const registration = await this.registrationRepository.findByIdWithRelations(id);

      if (!registration) {
        throw new Error('Registration not found');
      }

      // Delete associated files
      const filesToDelete = [];

      if (registration.fully_funded_submission) {
        if (registration.fully_funded_submission.essay_file_id) {
          filesToDelete.push(registration.fully_funded_submission.essay_file_id);
        }
      }

      if (registration.self_funded_submission) {
        if (registration.self_funded_submission.headshot_file_id) {
          filesToDelete.push(registration.self_funded_submission.headshot_file_id);
        }
      }

      // Delete files
      await Promise.all(filesToDelete.map((fileId) => this.fileUploadService.deleteFile(fileId)));

      // Delete registration
      await this.registrationRepository.deleteRegistration(id);

      return true;
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
  }

  /**
   * Validate basic registration data
   * @private
   * @param {Object} data - Registration data
   */
  validateRegistrationData(data) {
    const requiredFields = [
      'fullName',
      'email',
      'residence',
      'nationality',
      'whatsapp',
      'institution',
      'dateOfBirth',
      'gender',
      'discoverSource',
      'scholarshipType',
    ];

    const missingFields = requiredFields.filter((field) => !data[field] || data[field].trim() === '');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Validate date of birth
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 16 || age > 35) {
      throw new Error('Age must be between 16 and 35 years');
    }

    // Validate gender
    const validGenders = ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'];
    if (!validGenders.includes(data.gender)) {
      throw new Error(`Invalid gender. Must be one of: ${validGenders.join(', ')}`);
    }

    // Validate discover source
    const validSources = ['RISE_INSTAGRAM', 'OTHER_INSTAGRAM', 'FRIENDS_COLLEAGUES', 'OTHER'];
    if (!validSources.includes(data.discoverSource)) {
      throw new Error(`Invalid discover source. Must be one of: ${validSources.join(', ')}`);
    }

    // If discover source is OTHER, check for other text
    if (data.discoverSource === 'OTHER' && (!data.discoverOtherText || data.discoverOtherText.trim() === '')) {
      throw new Error('Discover other text is required when source is OTHER');
    }

    // Validate scholarship type
    const validScholarshipTypes = ['FULLY_FUNDED', 'SELF_FUNDED'];
    if (!validScholarshipTypes.includes(data.scholarshipType)) {
      throw new Error(`Invalid scholarship type. Must be one of: ${validScholarshipTypes.join(', ')}`);
    }
  }

  /**
   * Validate fully funded specific data
   * @private
   * @param {Object} data - Fully funded data
   */
  validateFullyFundedData(data) {
    const requiredFields = ['essayTopic', 'essayFileId'];

    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fully funded fields: ${missingFields.join(', ')}`);
    }

    // Validate essay topic
    const validTopics = [
      'Green Climate – Urban solutions to adapt and thrive in a changing climate',
      'Green Curriculum – Embedding climate literacy in education',
      'Green Innovation – Tech-driven tools for climate resilience',
      'Green Action – Youth-led movements for climate justice',
      'Green Transition – Shifting to low-carbon, renewable energy',
    ];

    if (!validTopics.includes(data.essayTopic)) {
      throw new Error('Invalid essay topic selected');
    }
  }

  /**
   * Validate self funded specific data
   * @private
   * @param {Object} data - Self funded data
   */
  validateSelfFundedData(data) {
    const requiredFields = ['passportNumber', 'needVisa', 'headshotFileId', 'readPolicies'];

    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required self funded fields: ${missingFields.join(', ')}`);
    }

    // Validate visa requirement
    const validVisaOptions = ['YES', 'NO'];
    if (!validVisaOptions.includes(data.needVisa)) {
      throw new Error(`Invalid visa requirement. Must be one of: ${validVisaOptions.join(', ')}`);
    }

    // Validate policy agreement
    const validPolicyOptions = ['YES', 'NO'];
    if (!validPolicyOptions.includes(data.readPolicies)) {
      throw new Error(`Invalid policy agreement. Must be one of: ${validPolicyOptions.join(', ')}`);
    }

    if (data.readPolicies !== 'YES') {
      throw new Error('You must agree to the policies to proceed');
    }

    // Validate passport number format (basic validation)
    if (data.passportNumber.length < 6 || data.passportNumber.length > 20) {
      throw new Error('Passport number must be between 6 and 20 characters');
    }
  }

  /**
   * Enhance registration object with additional properties
   * @private
   * @param {Object} registration - Raw registration object
   * @returns {Object} Enhanced registration object
   */
  enhanceRegistrationObject(registration) {
    console.log('🔧 [RylsService] enhanceRegistrationObject called for ID:', registration?.id);

    if (!registration) {
      console.error('❌ [RylsService] Registration object is null/undefined');
      throw new Error('Registration object is required');
    }

    console.log('🔍 [RylsService] Raw registration structure:', {
      id: registration.id,
      hasPersonalData: !!(registration.full_name && registration.email),
      hasSubmissions: {
        fullyFunded: registration.fully_funded_submission ? 1 : 0,
        selfFunded: registration.self_funded_submission ? 1 : 0,
      },
    });

    const enhanced = {
      id: registration.id,
      submissionId: registration.submission_id,
      personalInfo: {
        fullName: registration.full_name,
        email: registration.email,
        residence: registration.residence,
        nationality: registration.nationality,
        secondNationality: registration.second_nationality,
        whatsapp: registration.whatsapp,
        institution: registration.institution,
        dateOfBirth: registration.date_of_birth,
        age: this.calculateAge(registration.date_of_birth),
        gender: registration.gender,
      },
      applicationInfo: {
        discoverSource: registration.discover_source,
        discoverOtherText: registration.discover_other_text,
        scholarshipType: registration.scholarship_type,
        status: registration.status,
      },
      timestamps: {
        createdAt: registration.created_at,
        updatedAt: registration.updated_at,
      },
    };

    console.log('✅ [RylsService] Basic enhancement completed for ID:', registration.id);

    try {
      // Add submission details based on scholarship type
      console.log('🔄 [RylsService] Processing submission details...');

      if (registration.fully_funded_submission) {
        console.log('📝 [RylsService] Processing fully funded submission');
        const submission = registration.fully_funded_submission;
        enhanced.submissionDetails = {
          type: 'FULLY_FUNDED',
          essayTopic: submission.essay_topic,
          essayDescription: submission.essay_description,
          essayFile: submission.essay_file
            ? {
                id: submission.essay_file.id,
                originalName: submission.essay_file.original_name,
                fileSize: submission.essay_file.file_size,
                uploadDate: submission.essay_file.created_at,
              }
            : null,
        };
        console.log('✅ [RylsService] Fully funded submission processed');
      }

      if (registration.self_funded_submission) {
        console.log('📝 [RylsService] Processing self funded submission');
        const submission = registration.self_funded_submission;
        enhanced.submissionDetails = {
          type: 'SELF_FUNDED',
          passportNumber: submission.passport_number,
          needVisa: submission.need_visa,
          readPolicies: submission.read_policies,
          headshotFile: submission.headshot_file
            ? {
                id: submission.headshot_file.id,
                originalName: submission.headshot_file.original_name,
                fileSize: submission.headshot_file.file_size,
                uploadDate: submission.headshot_file.created_at,
              }
            : null,
        };
        console.log('✅ [RylsService] Self funded submission processed');
      }

      console.log('🎯 [RylsService] Enhanced registration completed for ID:', registration.id);
      return enhanced;
    } catch (error) {
      console.error('❌ [RylsService] Error processing submission details:', error);
      console.error('❌ [RylsService] Registration submissions:', {
        fullyFunded: registration.fully_funded_submission,
        selfFunded: registration.self_funded_submission,
      });
      throw error;
    }
  }

  /**
   * Calculate age from date of birth
   * @private
   * @param {Date} dateOfBirth - Date of birth
   * @returns {number} Age in years
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
