import { adminCohortRepository } from '../../repositories/admin/cohortRepository.js';
import { academyRepository } from '../../repositories/shared/academyRepository.js';
import { fileUploadService } from '../shared/fileUploadService.js';
import { getLogger } from '../../utils/loggerContext.js';
import prisma from '../../config/database.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AdminCohortService {
  constructor() {
    this.repository = adminCohortRepository;
    this.academyRepository = academyRepository;
    this.fileUploadService = fileUploadService;
  }

  get logger() {
    return getLogger();
  }

  // --- Cohort CRUD ---

  async createCohort(data) {
    this.logger.info('[adminCohortService] createCohort start');
    try {
      const academy = await this.academyRepository.findById(data.academy_id);
      if (!academy) {
        const err = new Error('Academy not found');
        err.statusCode = 404;
        throw err;
      }

      if (data.start_date && data.end_date && new Date(data.start_date) >= new Date(data.end_date)) {
        const err = new Error('start_date must be before end_date');
        err.statusCode = 400;
        throw err;
      }

      const cohort = await this.repository.create({
        academy_id: data.academy_id,
        name: data.name,
        description: data.description || null,
        status: data.status || 'not_started',
        start_date: data.start_date ? new Date(data.start_date) : null,
        end_date: data.end_date ? new Date(data.end_date) : null,
      });

      this.logger.info('[adminCohortService] createCohort success');
      return cohort;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] createCohort error');
      throw error;
    }
  }

  async updateCohort(id, data) {
    this.logger.info('[adminCohortService] updateCohort start');
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      const startDate = data.start_date ? new Date(data.start_date) : existing.start_date;
      const endDate = data.end_date ? new Date(data.end_date) : existing.end_date;

      if (startDate && endDate && startDate >= endDate) {
        const err = new Error('start_date must be before end_date');
        err.statusCode = 400;
        throw err;
      }

      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.start_date !== undefined) updateData.start_date = data.start_date ? new Date(data.start_date) : null;
      if (data.end_date !== undefined) updateData.end_date = data.end_date ? new Date(data.end_date) : null;

      const cohort = await this.repository.update(id, updateData);
      this.logger.info('[adminCohortService] updateCohort success');
      return cohort;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] updateCohort error');
      throw error;
    }
  }

  async deleteCohort(id) {
    this.logger.info('[adminCohortService] deleteCohort start');
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      await this.repository.delete(id);
      this.logger.info('[adminCohortService] deleteCohort success');
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] deleteCohort error');
      throw error;
    }
  }

  async getCohorts(params) {
    this.logger.info('[adminCohortService] getCohorts start');
    try {
      const result = await this.repository.findWithPagination(params);
      this.logger.info('[adminCohortService] getCohorts success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] getCohorts error');
      throw error;
    }
  }

  async getCohortById(id) {
    this.logger.info('[adminCohortService] getCohortById start');
    try {
      const cohort = await this.repository.findByIdWithDetails(id);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      const result = { ...cohort, enrollment_count: cohort._count?.enrollments, _count: undefined };
      this.logger.info('[adminCohortService] getCohortById success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] getCohortById error');
      throw error;
    }
  }

  // --- Module management ---

  async createModule(cohortId, data) {
    this.logger.info('[adminCohortService] createModule start');
    try {
      const cohort = await this.repository.findById(cohortId);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      let moduleData = { ...data };
      delete moduleData.copy_from_topic_id;

      // Copy from academy topic if requested
      if (data.copy_from_topic_id) {
        const topic = await prisma.academyTopic.findFirst({
          where: { id: data.copy_from_topic_id, academy_id: cohort.academy_id },
        });

        if (!topic) {
          const err = new Error('Topic not found in this academy');
          err.statusCode = 404;
          throw err;
        }

        // Copy title and description; allow override from request body
        moduleData.title = data.title || topic.title;
        moduleData.description = data.description !== undefined ? data.description : topic.description;
      }

      if (!moduleData.title) {
        const err = new Error('title is required');
        err.statusCode = 400;
        throw err;
      }

      const module = await this.repository.createModule(cohortId, cohort.academy_id, moduleData);
      this.logger.info('[adminCohortService] createModule success');
      return module;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] createModule error');
      throw error;
    }
  }

  async updateModule(cohortId, moduleId, data) {
    this.logger.info('[adminCohortService] updateModule start');
    try {
      const cohort = await this.repository.findById(cohortId);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      const module = await this.repository.updateModule(cohortId, moduleId, data);
      this.logger.info('[adminCohortService] updateModule success');
      return module;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] updateModule error');
      throw error;
    }
  }

  async deleteModule(cohortId, moduleId) {
    this.logger.info('[adminCohortService] deleteModule start');
    try {
      const result = await this.repository.deleteModule(cohortId, moduleId);
      this.logger.info('[adminCohortService] deleteModule success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] deleteModule error');
      throw error;
    }
  }

  // --- Attachment management ---

  async createAttachment(cohortId, moduleId, data) {
    this.logger.info('[adminCohortService] createAttachment start');
    try {
      const cohort = await this.repository.findById(cohortId);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      const module = await prisma.cohortModule.findFirst({ where: { id: moduleId, cohort_id: cohortId } });
      if (!module) {
        const err = new Error('Module not found');
        err.statusCode = 404;
        throw err;
      }

      // Validate by type
      if (data.type === 'file') {
        if (!data.file_path || !data.file_mime) {
          const err = new Error('file_path and file_mime are required for type=file');
          err.statusCode = 400;
          throw err;
        }
      } else if (data.type === 'external_link' || data.type === 'embed_video') {
        if (!data.url) {
          const err = new Error('url is required for type=external_link or embed_video');
          err.statusCode = 400;
          throw err;
        }
      }

      const attachment = await this.repository.createAttachment(moduleId, cohortId, cohort.academy_id, data);
      this.logger.info('[adminCohortService] createAttachment success');
      return attachment;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] createAttachment error');
      throw error;
    }
  }

  async updateAttachment(cohortId, moduleId, attachmentId, data) {
    this.logger.info('[adminCohortService] updateAttachment start');
    try {
      const attachment = await this.repository.updateAttachment(moduleId, attachmentId, data);
      this.logger.info('[adminCohortService] updateAttachment success');
      return attachment;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] updateAttachment error');
      throw error;
    }
  }

  async deleteAttachment(cohortId, moduleId, attachmentId) {
    this.logger.info('[adminCohortService] deleteAttachment start');
    try {
      const result = await this.repository.deleteAttachment(moduleId, attachmentId);

      // Delete physical file if exists
      if (result.filePath) {
        try {
          const uploadsBaseDir = path.join(__dirname, '../../../uploads');
          const absolutePath = path.join(uploadsBaseDir, result.filePath.replace(/^\/uploads\//, ''));
          await fs.remove(absolutePath);
          this.logger.info({ filePath: result.filePath }, '[adminCohortService] physical file deleted');
        } catch (fsErr) {
          this.logger.warn({ err: fsErr }, '[adminCohortService] failed to delete physical file');
        }
      }

      this.logger.info('[adminCohortService] deleteAttachment success');
      return { message: 'Attachment deleted successfully' };
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] deleteAttachment error');
      throw error;
    }
  }

  // --- Enrollment management ---

  async getEnrollments(cohortId, params) {
    this.logger.info('[adminCohortService] getEnrollments start');
    try {
      const result = await this.repository.findEnrollments(cohortId, params);
      this.logger.info('[adminCohortService] getEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] getEnrollments error');
      throw error;
    }
  }

  async manualEnroll(cohortId, userId, notes) {
    this.logger.info('[adminCohortService] manualEnroll start');
    try {
      const cohort = await this.repository.findById(cohortId);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      // Check for duplicate
      const existing = await prisma.cohortEnrollment.findFirst({
        where: { cohort_id: cohortId, user_id: userId },
      });
      if (existing) {
        const err = new Error('User is already enrolled in this cohort');
        err.statusCode = 400;
        throw err;
      }

      const enrollment = await this.repository.createEnrollment(cohortId, cohort.academy_id, userId, notes);
      this.logger.info('[adminCohortService] manualEnroll success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] manualEnroll error');
      throw error;
    }
  }

  async updateEnrollment(cohortId, enrollmentId, data) {
    this.logger.info('[adminCohortService] updateEnrollment start');
    try {
      const updateData = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.completion_date !== undefined) updateData.completion_date = data.completion_date ? new Date(data.completion_date) : null;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const enrollment = await this.repository.updateEnrollment(cohortId, enrollmentId, updateData);
      this.logger.info('[adminCohortService] updateEnrollment success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] updateEnrollment error');
      throw error;
    }
  }

  // --- Mentor management ---

  async createMentor(cohortId, data) {
    this.logger.info('[adminCohortService] createMentor start');
    try {
      const cohort = await this.repository.findById(cohortId);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar = publicUrl;
        } catch (uploadErr) {
          throw new Error('Failed to upload mentor avatar');
        }
        delete data.avatarFile;
      }

      const mentor = await this.repository.createMentor(cohortId, cohort.academy_id, data);
      this.logger.info('[adminCohortService] createMentor success');
      return mentor;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] createMentor error');
      throw error;
    }
  }

  async updateMentor(cohortId, mentorId, data) {
    this.logger.info('[adminCohortService] updateMentor start');
    try {
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar = publicUrl;
        } catch (uploadErr) {
          throw new Error('Failed to upload mentor avatar');
        }
        delete data.avatarFile;
      } else if (data.avatar === '') {
        data.avatar = null;
      }

      const mentor = await this.repository.updateMentor(cohortId, mentorId, data);
      this.logger.info('[adminCohortService] updateMentor success');
      return mentor;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] updateMentor error');
      throw error;
    }
  }

  async deleteMentor(cohortId, mentorId) {
    this.logger.info('[adminCohortService] deleteMentor start');
    try {
      const result = await this.repository.deleteMentor(cohortId, mentorId);
      this.logger.info('[adminCohortService] deleteMentor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] deleteMentor error');
      throw error;
    }
  }

  // --- Certificate generation ---

  async generateCertificates(cohortId) {
    this.logger.info('[adminCohortService] generateCertificates start');
    try {
      const cohort = await this.repository.findByIdWithDetails(cohortId);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      if (cohort.status !== 'completed') {
        const err = new Error('Certificates can only be generated when cohort status is completed');
        err.statusCode = 400;
        throw err;
      }

      const enrollments = await prisma.cohortEnrollment.findMany({
        where: { cohort_id: cohortId, status: 'completed', certificate: null },
        include: {
          user: { select: { id: true, first_name: true, last_name: true } },
        },
      });

      const academy = await this.academyRepository.findById(cohort.academy_id);

      const summary = { generated: 0, skipped: 0, failed: 0 };
      const year = new Date().getFullYear();
      const baseSlug = academy.slug.toUpperCase().padEnd(6, 'X').substring(0, 6);

      // Get starting sequence
      const latestCert = await prisma.cohortCertificate.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
      let sequence = (latestCert?.id || 0) + 1;

      // Ensure upload directory exists
      const certDir = path.join(__dirname, `../../../uploads/certificates/${cohortId}`);
      await fs.ensureDir(certDir);

      for (const enrollment of enrollments) {
        try {
          const certCode = `CERT-${baseSlug}-${year}-${String(sequence).padStart(4, '0')}`;
          const studentName = `${enrollment.user.first_name} ${enrollment.user.last_name}`.trim();
          const filePath = `/uploads/certificates/${cohortId}/${certCode}.pdf`;
          const absolutePath = path.join(__dirname, `../../../uploads/certificates/${cohortId}/${certCode}.pdf`);

          // Generate PDF
          await this._generatePDF(absolutePath, {
            studentName,
            academyTitle: academy.title,
            cohortName: cohort.name,
            issuedAt: new Date(),
            certCode,
          });

          await prisma.cohortCertificate.create({
            data: {
              academy_id: cohort.academy_id,
              cohort_id: cohortId,
              enrollment_id: enrollment.id,
              user_id: enrollment.user_id,
              certificate_code: certCode,
              student_name: studentName,
              academy_title: academy.title,
              cohort_name: cohort.name,
              issued_at: new Date(),
              file_path: filePath,
              file_url: filePath,
            },
          });

          sequence++;
          summary.generated++;
        } catch (certErr) {
          this.logger.error({ err: certErr, enrollmentId: enrollment.id }, '[adminCohortService] certificate generation failed for enrollment');
          summary.failed++;
        }
      }

      this.logger.info({ summary }, '[adminCohortService] generateCertificates success');
      return summary;
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] generateCertificates error');
      throw error;
    }
  }

  async _generatePDF(filePath, { studentName, academyTitle, cohortName, issuedAt, certCode }) {
    const { default: PDFDocument } = await import('pdfkit');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FAFAFA');

      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#C0A060');

      // Title
      doc.fillColor('#2C2C2C').fontSize(36).font('Helvetica-Bold').text('CERTIFICATE OF COMPLETION', 0, 80, { align: 'center' });

      // Issued to
      doc.fontSize(16).font('Helvetica').fillColor('#555').text('This is to certify that', 0, 150, { align: 'center' });

      // Student name
      doc.fontSize(30).font('Helvetica-Bold').fillColor('#1A1A1A').text(studentName, 0, 185, { align: 'center' });

      // Academy & cohort
      doc.fontSize(14).font('Helvetica').fillColor('#555').text('has successfully completed', 0, 240, { align: 'center' });

      doc.fontSize(22).font('Helvetica-Bold').fillColor('#2C2C2C').text(academyTitle, 0, 270, { align: 'center' });

      doc.fontSize(14).font('Helvetica').fillColor('#777').text(`Cohort: ${cohortName}`, 0, 310, { align: 'center' });

      // Date
      const dateStr = issuedAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.fontSize(12).text(`Issued on: ${dateStr}`, 0, 360, { align: 'center' });

      // Certificate code
      doc.fontSize(10).fillColor('#999').text(`Certificate Code: ${certCode}`, 0, 390, { align: 'center' });

      doc.end();

      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}

export const adminCohortService = new AdminCohortService();
