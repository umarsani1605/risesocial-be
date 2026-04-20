import { adminCohortRepository } from '../../repositories/admin/cohortRepository.js';
import { academyRepository } from '../../repositories/shared/academyRepository.js';
import { fileUploadService } from '../shared/fileUploadService.js';
import { getLogger } from '../../utils/loggerContext.js';
import { formatCertificateCode, safeFilename, formatIssuedDate } from '../../utils/certificateHelpers.js';
import { toFileUrl } from '../../utils/response.js';
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

      let cohort;
      if (updateData.status === 'completed') {
        await prisma.$transaction(async (tx) => {
          cohort = await tx.cohort.update({ where: { id }, data: updateData });
          await tx.cohortEnrollment.updateMany({
            where: { cohort_id: id, status: 'active' },
            data: { status: 'completed', completion_date: new Date(), updated_at: new Date() },
          });
        });
      } else {
        cohort = await this.repository.update(id, updateData);
      }
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
      result.data = result.data.map((e) => ({
        ...e,
        certificate: e.certificate
          ? { ...e.certificate, file_url: toFileUrl(e.certificate.file_path) }
          : null,
      }));
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

  async generateCertificate(cohortId, enrollmentId, grades = {}) {
    this.logger.info('[adminCohortService] generateCertificate start');
    try {
      const cohort = await this.repository.findByIdWithDetails(cohortId);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      const enrollment = await prisma.cohortEnrollment.findUnique({
        where: { id: enrollmentId },
        include: { user: { select: { first_name: true, last_name: true, email: true } } },
      });

      if (!enrollment || enrollment.cohort_id !== cohortId) {
        const err = new Error('Enrollment not found');
        err.statusCode = 404;
        throw err;
      }

      const academy = await this.academyRepository.findById(cohort.academy_id);
      const studentName = `${enrollment.user.first_name} ${enrollment.user.last_name}`.trim();
      const gradesTranscript = {
        assignments: grades.assignments ?? null,
        case_study: grades.case_study ?? null,
        final_test: grades.final_test ?? null,
        final_score: grades.final_score ?? null,
      };

      const certDir = path.join(__dirname, `../../../uploads/certificates/${cohortId}`);
      await fs.ensureDir(certDir);

      const cert = await prisma.$transaction(async (tx) => {
        await tx.cohortCertificate.deleteMany({ where: { enrollment_id: enrollmentId } });

        // Insert without code/path first to get the id
        const record = await tx.cohortCertificate.create({
          data: {
            academy_id: cohort.academy_id,
            cohort_id: cohortId,
            enrollment_id: enrollmentId,
            user_id: enrollment.user_id,
            certificate_code: `PENDING-${Date.now()}`,
            student_name: studentName,
            academy_title: academy.title,
            cohort_name: cohort.name,
            grades_transcript: gradesTranscript,
          },
        });

        const certCode = formatCertificateCode(record.id, record.created_at);
        const filename = safeFilename(certCode);
        const absolutePath = path.join(certDir, filename);
        const relPath = `certificates/${cohortId}/${filename}`;

        await this._generatePDF(absolutePath, {
          studentName,
          certCode,
          academyName: academy.title,
          issuedDate: formatIssuedDate(record.created_at),
          grades: gradesTranscript,
        });

        return await tx.cohortCertificate.update({
          where: { id: record.id },
          data: { certificate_code: certCode, file_path: relPath },
        });
      });

      this.logger.info('[adminCohortService] generateCertificate success');
      return { ...cert, file_url: toFileUrl(cert.file_path) };
    } catch (error) {
      this.logger.error({ err: error }, '[adminCohortService] generateCertificate error');
      throw error;
    }
  }

  async _generatePDF(outputPath, { studentName, certCode, academyName, issuedDate, grades }) {
    const { PDFDocument, rgb } = await import('pdf-lib');
    const fontkit = (await import('@pdf-lib/fontkit')).default;
    const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);

    const templatePath = path.join(__dirname, '../../../uploads/certificates/template.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);

    const FONTS = path.join(__dirname, '../../../uploads/certificates/fonts');
    const corinthiaBold = await pdfDoc.embedFont(await fs.readFile(path.join(FONTS, 'Corinthia/Corinthia-Bold.ttf')));
    const openSansBold = await pdfDoc.embedFont(await fs.readFile(path.join(FONTS, 'Open_Sans/static/OpenSans-Bold.ttf')));

    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page2 = pages[1];

    const brandColor = hex('#405F56');

    // Page 1: name, cert code, academy name, issued date
    page1.drawText(studentName, {
      x: 230,
      y: 300,
      size: 60,
      font: corinthiaBold,
      color: brandColor,
    });

    page1.drawText(certCode, {
      x: 230,
      y: 420,
      size: 13,
      font: openSansBold,
      color: brandColor,
    });

    page1.drawText(academyName, {
      x: 226,
      y: 216,
      size: 14,
      font: openSansBold,
      color: brandColor,
    });

    page1.drawText(issuedDate, {
      x: 230,
      y: 110,
      size: 13,
      font: openSansBold,
      color: brandColor,
    });

    // Page 2: grade values
    const gradeColor = rgb(0.1, 0.1, 0.1);
    const gradeSize = 15;
    const fmt = (v) => (v != null ? Number(v).toFixed(2) : '-');

    page2.drawText(fmt(grades.assignments), {
      x: 695,
      y: 325,
      size: gradeSize,
      font: openSansBold,
      color: gradeColor,
    });

    page2.drawText(fmt(grades.case_study), {
      x: 695,
      y: 269,
      size: gradeSize,
      font: openSansBold,
      color: gradeColor,
    });

    page2.drawText(fmt(grades.final_test), {
      x: 695,
      y: 213,
      size: gradeSize,
      font: openSansBold,
      color: gradeColor,
    });

    page2.drawText(fmt(grades.final_score), {
      x: 695,
      y: 154,
      size: gradeSize,
      font: openSansBold,
      color: gradeColor,
    });

    await fs.writeFile(outputPath, await pdfDoc.save());
  }
}

export const adminCohortService = new AdminCohortService();
