/**
 * Unit Tests: RylsRegistrationService
 * All repository calls are mocked — no real DB access
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---
const mockRegistrationRepository = {
  createFullyFundedFlow: vi.fn(),
  createSelfFundedFlow: vi.fn(),
  findBySubmissionId: vi.fn(),
  findByIdWithRelations: vi.fn(),
  getRegistrations: vi.fn(),
  getRegistrationStats: vi.fn(),
  getNationalityStats: vi.fn(),
  getDiscoverSourceStats: vi.fn(),
  getRegistrationsByDateRange: vi.fn(),
  deleteRegistration: vi.fn(),
  emailExists: vi.fn(),
};

const mockFileUploadService = {
  deleteFile: vi.fn(),
};

vi.mock('../../../../src/repositories/user/rylsRegistrationRepository.js', () => ({
  rylsRegistrationRepository: mockRegistrationRepository,
}));

vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: mockFileUploadService,
}));


const { RylsRegistrationService } = await import('../../../../src/services/user/rylsRegistrationService.js');

// --- Helpers ---
function makeRegistration(overrides = {}) {
  return {
    id: 1,
    full_name: 'Budi Santoso',
    email: 'budi@example.com',
    scholarship_type: 'SELF_FUNDED',
    created_at: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeSubmission(overrides = {}) {
  return { id: 10, ...overrides };
}

// ============================================================
describe('RylsRegistrationService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RylsRegistrationService();
  });

  // ----------------------------------------------------------
  describe('submitRegistration', () => {
    beforeEach(() => {
      // Reset mocks for repository methods
      mockRegistrationRepository.createFullyFundedFlow.mockReset();
      mockRegistrationRepository.createSelfFundedFlow.mockReset();
    });

    it('should route to fully funded flow when scholarshipType is FULLY_FUNDED', async () => {
      const validFormData = {
        step1: {
          fullName: 'Budi',
          email: 'budi@example.com',
          residence: 'Jakarta',
          nationality: 'Indonesian',
          whatsapp: '08123',
          institution: 'UI',
          dateOfBirth: '2000-01-01',
          gender: 'MALE',
          discoverSource: 'Instagram',
          scholarshipType: 'FULLY_FUNDED',
        },
        essayTopic: 'Leadership',
        essayFileId: 5,
        essayDescription: 'My essay',
      };

      const reg = makeRegistration({ scholarship_type: 'FULLY_FUNDED' });
      const sub = makeSubmission({ essay_topic: 'Leadership', essay_description: 'My essay' });
      mockRegistrationRepository.createFullyFundedFlow.mockResolvedValue({ registration: reg, submission: sub });

      const result = await service.submitRegistration(validFormData);

      expect(mockRegistrationRepository.createFullyFundedFlow).toHaveBeenCalledWith({
        step1: validFormData.step1,
        essayTopic: validFormData.essayTopic,
        essayFileId: validFormData.essayFileId,
        essayDescription: validFormData.essayDescription,
      });
      expect(mockRegistrationRepository.createSelfFundedFlow).not.toHaveBeenCalled();
      expect(result.scholarshipType).toBe('FULLY_FUNDED');
    });

    it('should route to self funded flow when scholarshipType is SELF_FUNDED', async () => {
      const validFormData = {
        step1: {
          fullName: 'Rina',
          email: 'rina@example.com',
          residence: 'Surabaya',
          nationality: 'Indonesian',
          whatsapp: '08124',
          institution: 'ITS',
          dateOfBirth: '2001-05-15',
          gender: 'FEMALE',
          discoverSource: 'Friend',
          scholarshipType: 'SELF_FUNDED',
        },
        passportNumber: 'A1234567',
        needVisa: 'NO',
        headshotFileId: 3,
        readPolicies: 'YES',
      };

      const reg = makeRegistration({ scholarship_type: 'SELF_FUNDED' });
      const sub = makeSubmission({ passport_number: 'A1234567', need_visa: false, read_policies: true });
      mockRegistrationRepository.createSelfFundedFlow.mockResolvedValue({ registration: reg, submission: sub });

      const result = await service.submitRegistration(validFormData);

      expect(mockRegistrationRepository.createSelfFundedFlow).toHaveBeenCalledWith({
        step1: validFormData.step1,
        passportNumber: validFormData.passportNumber,
        needVisa: validFormData.needVisa,
        headshotFileId: validFormData.headshotFileId,
        readPolicies: validFormData.readPolicies,
      });
      expect(mockRegistrationRepository.createFullyFundedFlow).not.toHaveBeenCalled();
      expect(result.scholarshipType).toBe('SELF_FUNDED');
    });
  });

  // ----------------------------------------------------------
  describe('submitFullyFundedRegistration', () => {
    const validFormData = {
      step1: {
        fullName: 'Budi',
        email: 'budi@example.com',
        residence: 'Jakarta',
        nationality: 'Indonesian',
        whatsapp: '08123',
        institution: 'UI',
        dateOfBirth: '2000-01-01',
        gender: 'MALE',
        discoverSource: 'Instagram',
      },
      essayTopic: 'Leadership',
      essayFileId: 5,
      essayDescription: 'My essay',
    };

    it('should return formatted result on success', async () => {
      const reg = makeRegistration({ scholarship_type: 'FULLY_FUNDED' });
      const sub = makeSubmission({ essay_topic: 'Leadership', essay_description: 'My essay' });
      mockRegistrationRepository.createFullyFundedFlow.mockResolvedValue({ registration: reg, submission: sub });

      const result = await service.submitFullyFundedRegistration(validFormData);

      expect(mockRegistrationRepository.createFullyFundedFlow).toHaveBeenCalledWith({
        step1: validFormData.step1,
        essayTopic: validFormData.essayTopic,
        essayFileId: validFormData.essayFileId,
        essayDescription: validFormData.essayDescription,
      });
      expect(result.registrationId).toBe(reg.id);
      expect(result.submissionId).toBe(reg.id);
      expect(result.email).toBe(reg.email);
      expect(result.scholarshipType).toBe('FULLY_FUNDED');
      expect(result.submission.essayTopic).toBe('Leadership');
    });

    it('should rethrow errors from repository', async () => {
      mockRegistrationRepository.createFullyFundedFlow.mockRejectedValue(new Error('DB error'));

      await expect(service.submitFullyFundedRegistration(validFormData)).rejects.toThrow('DB error');
    });
  });

  // ----------------------------------------------------------
  describe('FULLY_FUNDED validation errors', () => {
    it('should throw error when essayFileId is missing for FULLY_FUNDED', async () => {
      const formDataWithoutEssayFileId = {
        step1: {
          fullName: 'Budi',
          email: 'budi@example.com',
          residence: 'Jakarta',
          nationality: 'Indonesian',
          whatsapp: '08123',
          institution: 'UI',
          dateOfBirth: '2000-01-01',
          gender: 'MALE',
          discoverSource: 'Instagram',
          scholarshipType: 'FULLY_FUNDED',
        },
        essayTopic: 'Leadership',
        // essayFileId is missing
        essayDescription: 'My essay',
      };

      await expect(service.submitRegistration(formDataWithoutEssayFileId)).rejects.toThrow(
        'essayFileId is required for FULLY_FUNDED scholarship type',
      );
      expect(mockRegistrationRepository.createFullyFundedFlow).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  describe('SELF_FUNDED validation errors', () => {
    it('should throw error when passportNumber is missing for SELF_FUNDED', async () => {
      const formDataWithoutPassportNumber = {
        step1: {
          fullName: 'Rina',
          email: 'rina@example.com',
          residence: 'Surabaya',
          nationality: 'Indonesian',
          whatsapp: '08124',
          institution: 'ITS',
          dateOfBirth: '2001-05-15',
          gender: 'FEMALE',
          discoverSource: 'Friend',
          scholarshipType: 'SELF_FUNDED',
        },
        // passportNumber is missing
        needVisa: 'NO',
        headshotFileId: 3,
        readPolicies: 'YES',
      };

      await expect(service.submitRegistration(formDataWithoutPassportNumber)).rejects.toThrow(
        'Missing required fields for SELF_FUNDED scholarship type: passportNumber',
      );
      expect(mockRegistrationRepository.createSelfFundedFlow).not.toHaveBeenCalled();
    });

    it('should throw error when needVisa is missing for SELF_FUNDED', async () => {
      const formDataWithoutNeedVisa = {
        step1: {
          fullName: 'Rina',
          email: 'rina@example.com',
          residence: 'Surabaya',
          nationality: 'Indonesian',
          whatsapp: '08124',
          institution: 'ITS',
          dateOfBirth: '2001-05-15',
          gender: 'FEMALE',
          discoverSource: 'Friend',
          scholarshipType: 'SELF_FUNDED',
        },
        passportNumber: 'A1234567',
        // needVisa is missing
        headshotFileId: 3,
        readPolicies: 'YES',
      };

      await expect(service.submitRegistration(formDataWithoutNeedVisa)).rejects.toThrow(
        'Missing required fields for SELF_FUNDED scholarship type: needVisa',
      );
      expect(mockRegistrationRepository.createSelfFundedFlow).not.toHaveBeenCalled();
    });

    it('should throw error when headshotFileId is missing for SELF_FUNDED', async () => {
      const formDataWithoutHeadshotFileId = {
        step1: {
          fullName: 'Rina',
          email: 'rina@example.com',
          residence: 'Surabaya',
          nationality: 'Indonesian',
          whatsapp: '08124',
          institution: 'ITS',
          dateOfBirth: '2001-05-15',
          gender: 'FEMALE',
          discoverSource: 'Friend',
          scholarshipType: 'SELF_FUNDED',
        },
        passportNumber: 'A1234567',
        needVisa: 'NO',
        // headshotFileId is missing
        readPolicies: 'YES',
      };

      await expect(service.submitRegistration(formDataWithoutHeadshotFileId)).rejects.toThrow(
        'Missing required fields for SELF_FUNDED scholarship type: headshotFileId',
      );
      expect(mockRegistrationRepository.createSelfFundedFlow).not.toHaveBeenCalled();
    });

    it('should throw error when readPolicies is missing for SELF_FUNDED', async () => {
      const formDataWithoutReadPolicies = {
        step1: {
          fullName: 'Rina',
          email: 'rina@example.com',
          residence: 'Surabaya',
          nationality: 'Indonesian',
          whatsapp: '08124',
          institution: 'ITS',
          dateOfBirth: '2001-05-15',
          gender: 'FEMALE',
          discoverSource: 'Friend',
          scholarshipType: 'SELF_FUNDED',
        },
        passportNumber: 'A1234567',
        needVisa: 'NO',
        headshotFileId: 3,
        // readPolicies is missing
      };

      await expect(service.submitRegistration(formDataWithoutReadPolicies)).rejects.toThrow(
        'Missing required fields for SELF_FUNDED scholarship type: readPolicies',
      );
      expect(mockRegistrationRepository.createSelfFundedFlow).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  describe('Invalid scholarshipType validation', () => {
    it('should throw error when scholarshipType is invalid', async () => {
      const formDataWithInvalidScholarshipType = {
        step1: {
          fullName: 'Ahmad',
          email: 'ahmad@example.com',
          residence: 'Bandung',
          nationality: 'Indonesian',
          whatsapp: '08125',
          institution: 'ITB',
          dateOfBirth: '1999-12-10',
          gender: 'MALE',
          discoverSource: 'Instagram',
          scholarshipType: 'INVALID_TYPE',
        },
      };

      await expect(service.submitRegistration(formDataWithInvalidScholarshipType)).rejects.toThrow('Invalid scholarshipType: INVALID_TYPE');
      expect(mockRegistrationRepository.createFullyFundedFlow).not.toHaveBeenCalled();
      expect(mockRegistrationRepository.createSelfFundedFlow).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  describe('submitSelfFundedRegistration', () => {
    const validFormData = {
      step1: {
        fullName: 'Rina',
        email: 'rina@example.com',
        residence: 'Surabaya',
        nationality: 'Indonesian',
        whatsapp: '08124',
        institution: 'ITS',
        dateOfBirth: '2001-05-15',
        gender: 'FEMALE',
        discoverSource: 'Friend',
      },
      passportNumber: 'A1234567',
      needVisa: 'NO',
      headshotFileId: 3,
      readPolicies: 'YES',
    };

    it('should return formatted result on success', async () => {
      const reg = makeRegistration({ scholarship_type: 'SELF_FUNDED' });
      const sub = makeSubmission({ passport_number: 'A1234567', need_visa: false, read_policies: true });
      mockRegistrationRepository.createSelfFundedFlow.mockResolvedValue({ registration: reg, submission: sub });

      const result = await service.submitSelfFundedRegistration(validFormData);

      expect(mockRegistrationRepository.createSelfFundedFlow).toHaveBeenCalledWith({
        step1: validFormData.step1,
        passportNumber: validFormData.passportNumber,
        needVisa: validFormData.needVisa,
        headshotFileId: validFormData.headshotFileId,
        readPolicies: validFormData.readPolicies,
      });
      expect(result.registrationId).toBe(reg.id);
      expect(result.scholarshipType).toBe('SELF_FUNDED');
      expect(result.submission.passportNumber).toBe('A1234567');
      expect(result.submission.needVisa).toBe(false);
    });

    it('should rethrow errors from repository', async () => {
      mockRegistrationRepository.createSelfFundedFlow.mockRejectedValue(new Error('Unique constraint'));

      await expect(service.submitSelfFundedRegistration(validFormData)).rejects.toThrow('Unique constraint');
    });
  });

  // ----------------------------------------------------------
  describe('getRegistrationBySubmissionId', () => {
    it('should return registration when found', async () => {
      const reg = makeRegistration();
      mockRegistrationRepository.findBySubmissionId.mockResolvedValue(reg);

      const result = await service.getRegistrationBySubmissionId(1);

      expect(mockRegistrationRepository.findBySubmissionId).toHaveBeenCalledWith(1);
      expect(result).toEqual(reg);
    });

    it('should return null when not found', async () => {
      mockRegistrationRepository.findBySubmissionId.mockResolvedValue(null);

      const result = await service.getRegistrationBySubmissionId(999);

      expect(result).toBeNull();
    });

    it('should throw wrapped error on repository failure', async () => {
      mockRegistrationRepository.findBySubmissionId.mockRejectedValue(new Error('Connection lost'));

      await expect(service.getRegistrationBySubmissionId(1)).rejects.toThrow('Failed to retrieve registration');
    });
  });

  // ----------------------------------------------------------
  describe('getRegistrationById', () => {
    it('should return registration when found', async () => {
      const reg = makeRegistration();
      mockRegistrationRepository.findByIdWithRelations.mockResolvedValue(reg);

      const result = await service.getRegistrationById(1);

      expect(mockRegistrationRepository.findByIdWithRelations).toHaveBeenCalledWith(1);
      expect(result).toEqual(reg);
    });

    it('should return null when not found', async () => {
      mockRegistrationRepository.findByIdWithRelations.mockResolvedValue(null);

      const result = await service.getRegistrationById(999);

      expect(result).toBeNull();
    });
  });

  // ----------------------------------------------------------
  describe('getRegistrations', () => {
    it('should flatten nested filters before passing to repository', async () => {
      const mockResult = { registrations: [], pagination: { total: 0, page: 1 } };
      mockRegistrationRepository.getRegistrations.mockResolvedValue(mockResult);

      await service.getRegistrations({
        page: 2,
        limit: 5,
        filters: { scholarshipType: 'SELF_FUNDED', search: 'budi' },
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      expect(mockRegistrationRepository.getRegistrations).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'created_at',
        sortOrder: 'desc',
        scholarshipType: 'SELF_FUNDED',
        search: 'budi',
      });
    });

    it('should use empty filters when not provided', async () => {
      const mockResult = { registrations: [], pagination: { total: 0 } };
      mockRegistrationRepository.getRegistrations.mockResolvedValue(mockResult);

      await service.getRegistrations({ page: 1, limit: 10 });

      expect(mockRegistrationRepository.getRegistrations).toHaveBeenCalledWith(expect.not.objectContaining({ filters: expect.anything() }));
    });
  });

  // ----------------------------------------------------------
  describe('getRegistrationStatistics', () => {
    it('should combine stats, nationality and discover source', async () => {
      mockRegistrationRepository.getRegistrationStats.mockResolvedValue({
        totalRegistrations: 100,
        scholarshipBreakdown: { fullyFunded: 60, selfFunded: 40 },
      });
      mockRegistrationRepository.getNationalityStats.mockResolvedValue(Array(15).fill({ nationality: 'Indonesian', count: 10 }));
      mockRegistrationRepository.getDiscoverSourceStats.mockResolvedValue([{ source: 'Instagram', count: 50 }]);

      const result = await service.getRegistrationStatistics();

      expect(result.totalRegistrations).toBe(100);
      expect(result.demographicBreakdown.byNationality).toHaveLength(10); // capped at 10
      expect(result.demographicBreakdown.byDiscoverSource).toHaveLength(1);
      expect(result).toHaveProperty('generatedAt');
    });
  });

  // ----------------------------------------------------------
  describe('getRegistrationsByDateRange', () => {
    it('should pass startDate, endDate and options to repository', async () => {
      mockRegistrationRepository.getRegistrationsByDateRange.mockResolvedValue([]);

      await service.getRegistrationsByDateRange({ startDate: '2026-01-01', endDate: '2026-03-01', page: 1, limit: 20 });

      expect(mockRegistrationRepository.getRegistrationsByDateRange).toHaveBeenCalledWith('2026-01-01', '2026-03-01', { page: 1, limit: 20 });
    });
  });

  // ----------------------------------------------------------
  describe('deleteRegistration', () => {
    it('should delete files and then delete registration', async () => {
      const reg = makeRegistration({
        fully_funded_submission: { essay_file_id: 10 },
        self_funded_submission: null,
      });
      mockRegistrationRepository.findByIdWithRelations.mockResolvedValue(reg);
      mockFileUploadService.deleteFile.mockResolvedValue(true);
      mockRegistrationRepository.deleteRegistration.mockResolvedValue(true);

      const result = await service.deleteRegistration(1);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(10);
      expect(mockRegistrationRepository.deleteRegistration).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw when registration not found', async () => {
      mockRegistrationRepository.findByIdWithRelations.mockResolvedValue(null);

      await expect(service.deleteRegistration(999)).rejects.toThrow('Registration not found');
    });

    it('should delete headshot file for self-funded', async () => {
      const reg = makeRegistration({
        fully_funded_submission: null,
        self_funded_submission: { headshot_file_id: 7 },
      });
      mockRegistrationRepository.findByIdWithRelations.mockResolvedValue(reg);
      mockFileUploadService.deleteFile.mockResolvedValue(true);
      mockRegistrationRepository.deleteRegistration.mockResolvedValue(true);

      await service.deleteRegistration(1);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(7);
    });
  });

  // ----------------------------------------------------------
  describe('checkEmailExists', () => {
    it('should return { exists: true } when email found', async () => {
      mockRegistrationRepository.emailExists.mockResolvedValue(true);

      const result = await service.checkEmailExists('budi@example.com');

      expect(result).toEqual({ exists: true });
    });

    it('should return { exists: false } when email not found', async () => {
      mockRegistrationRepository.emailExists.mockResolvedValue(false);

      const result = await service.checkEmailExists('new@example.com');

      expect(result).toEqual({ exists: false });
    });
  });

  // ----------------------------------------------------------
  describe('healthCheck', () => {
    it('should return status ok with timestamp', async () => {
      const result = await service.healthCheck();

      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
