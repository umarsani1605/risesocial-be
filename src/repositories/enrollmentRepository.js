import { BaseRepository } from './base/BaseRepository.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * EnrollmentRepository - Repository untuk mengelola enrollment bootcamp
 * Menggunakan BaseRepository pattern dengan tambahan method khusus enrollment
 */
class EnrollmentRepository extends BaseRepository {
  constructor(prisma) {
    super(prisma, 'bootcampEnrollment');
  }

  get logger() {
    return getLogger();
  }

  /**
   * Mendapatkan semua enrollment dengan filter dan include
   */
  async findAllWithDetails(options = {}) {
    this.logger.info({ options }, '[enrollmentRepository] findAllWithDetails called');
    const {
      user_id,
      bootcamp_id,
      enrollment_status,
      progress_min,
      progress_max,
      enrolled_from,
      enrolled_to,
      page = 1,
      limit = 10,
      include_user = false,
      include_bootcamp = false,
      include_pricing = false,
    } = options;

    const where = {};
    const include = {};

    if (user_id) where.user_id = user_id;
    if (bootcamp_id) where.bootcamp_id = bootcamp_id;
    if (enrollment_status) where.enrollment_status = enrollment_status;
    if (progress_min !== undefined) where.progress_percentage = { gte: progress_min };
    if (progress_max !== undefined) {
      where.progress_percentage = {
        ...where.progress_percentage,
        lte: progress_max,
      };
    }
    if (enrolled_from || enrolled_to) {
      where.enrolled_at = {};
      if (enrolled_from) where.enrolled_at.gte = new Date(enrolled_from);
      if (enrolled_to) where.enrolled_at.lte = new Date(enrolled_to);
    }

    if (include_user) {
      include.user = {
        select: { id: true, username: true, first_name: true, last_name: true, email: true, avatar: true },
      };
    }

    if (include_bootcamp) {
      include.bootcamp = {
        select: {
          id: true,
          title: true,
          path_slug: true,
          image_url: true,
          category: true,
          duration: true,
          rating: true,
          certificate: true,
          portfolio: true,
        },
      };
    }

    if (include_pricing) {
      include.pricing_tier = { select: { id: true, name: true, original_price: true, discount_price: true } };
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      this.model.findMany({ where, include, skip, take: limit, orderBy: { enrolled_at: 'desc' } }),
      this.model.count({ where }),
    ]);

    return { data: enrollments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Mendapatkan enrollment berdasarkan user dan bootcamp
   */
  async findByUserAndBootcamp(userId, bootcampId) {
    this.logger.info({ userId, bootcampId }, '[enrollmentRepository] findByUserAndBootcamp called');
    return await this.model.findUnique({
      where: { bootcamp_id_user_id: { bootcamp_id: bootcampId, user_id: userId } },
      include: {
        bootcamp: { select: { id: true, title: true, path_slug: true, image_url: true, category: true, duration: true } },
        pricing_tier: { select: { id: true, name: true, original_price: true, discount_price: true } },
      },
    });
  }

  /**
   * Mendapatkan enrollment berdasarkan user ID
   */
  async findByUserId(userId, options = {}) {
    this.logger.info({ userId }, '[enrollmentRepository] findByUserId called');
    const { enrollment_status, progress_min, progress_max, page = 1, limit = 10 } = options;

    const where = { user_id: userId };

    if (enrollment_status) where.enrollment_status = enrollment_status;
    if (progress_min !== undefined) where.progress_percentage = { gte: progress_min };
    if (progress_max !== undefined) {
      where.progress_percentage = { ...where.progress_percentage, lte: progress_max };
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      this.model.findMany({
        where,
        include: {
          bootcamp: {
            select: {
              id: true,
              title: true,
              path_slug: true,
              image_url: true,
              category: true,
              duration: true,
              rating: true,
              certificate: true,
              portfolio: true,
            },
          },
          pricing_tier: { select: { id: true, name: true, original_price: true, discount_price: true } },
        },
        skip,
        take: limit,
        orderBy: { enrolled_at: 'desc' },
      }),
      this.model.count({ where }),
    ]);

    return { data: enrollments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Mendapatkan enrollment berdasarkan bootcamp ID
   */
  async findByBootcampId(bootcampId, options = {}) {
    this.logger.info({ bootcampId }, '[enrollmentRepository] findByBootcampId called');
    const { enrollment_status, progress_min, progress_max, page = 1, limit = 10 } = options;

    const where = { bootcamp_id: bootcampId };
    if (enrollment_status) where.enrollment_status = enrollment_status;
    if (progress_min !== undefined) where.progress_percentage = { gte: progress_min };
    if (progress_max !== undefined) {
      where.progress_percentage = { ...where.progress_percentage, lte: progress_max };
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      this.model.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, first_name: true, last_name: true, email: true, avatar: true } },
          pricing_tier: { select: { id: true, name: true, original_price: true, discount_price: true } },
        },
        skip,
        take: limit,
        orderBy: { enrolled_at: 'desc' },
      }),
      this.model.count({ where }),
    ]);

    return { data: enrollments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Membuat enrollment baru
   */
  async createEnrollment(data) {
    this.logger.info('[enrollmentRepository] createEnrollment called');
    const enrollmentData = {
      user_id: data.user_id,
      bootcamp_id: data.bootcamp_id,
      pricing_tier_id: data.pricing_tier_id || null,
      enrollment_status: data.enrollment_status || 'ENROLLED',
      progress_percentage: data.progress_percentage || 0,
    };

    return await this.model.create({
      data: enrollmentData,
      include: {
        bootcamp: { select: { id: true, title: true, path_slug: true, image_url: true, category: true, duration: true } },
        user: { select: { id: true, username: true, first_name: true, last_name: true, email: true } },
        pricing_tier: { select: { id: true, name: true, original_price: true, discount_price: true } },
      },
    });
  }

  /**
   * Update progress enrollment
   */
  async updateProgress(enrollmentId, progressPercentage) {
    this.logger.info({ enrollmentId }, '[enrollmentRepository] updateProgress called');
    const updateData = { progress_percentage: progressPercentage };
    if (progressPercentage >= 100) {
      updateData.enrollment_status = 'COMPLETED';
      updateData.completed_at = new Date();
    }

    return await this.model.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        bootcamp: { select: { id: true, title: true, path_slug: true, image_url: true } },
        user: { select: { id: true, username: true, first_name: true, last_name: true } },
      },
    });
  }

  /**
   * Update status enrollment
   */
  async updateStatus(enrollmentId, status) {
    this.logger.info({ enrollmentId, status }, '[enrollmentRepository] updateStatus called');
    const updateData = { enrollment_status: status };
    if (status === 'COMPLETED') {
      updateData.completed_at = new Date();
      updateData.progress_percentage = 100;
    }

    return await this.model.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        bootcamp: { select: { id: true, title: true, path_slug: true, image_url: true } },
        user: { select: { id: true, username: true, first_name: true, last_name: true } },
      },
    });
  }

  /**
   * Mendapatkan statistik enrollment
   */
  async getEnrollmentStats(options = {}) {
    this.logger.info({ options }, '[enrollmentRepository] getEnrollmentStats called');
    const { bootcamp_id, user_id, date_from, date_to } = options;

    const where = {};
    if (bootcamp_id) where.bootcamp_id = bootcamp_id;
    if (user_id) where.user_id = user_id;
    if (date_from || date_to) {
      where.enrolled_at = {};
      if (date_from) where.enrolled_at.gte = new Date(date_from);
      if (date_to) where.enrolled_at.lte = new Date(date_to);
    }

    const [total, enrolled, completed, cancelled, suspended, averageProgress] = await Promise.all([
      this.model.count({ where }),
      this.model.count({ where: { ...where, enrollment_status: 'ENROLLED' } }),
      this.model.count({ where: { ...where, enrollment_status: 'COMPLETED' } }),
      this.model.count({ where: { ...where, enrollment_status: 'CANCELLED' } }),
      this.model.count({ where: { ...where, enrollment_status: 'SUSPENDED' } }),
      this.model.aggregate({ where, _avg: { progress_percentage: true } }),
    ]);

    return {
      total_enrollments: total,
      status_breakdown: { enrolled, completed, cancelled, suspended },
      completion_rate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
      cancellation_rate: total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0,
      average_progress: averageProgress._avg.progress_percentage || 0,
    };
  }

  /**
   * Mendapatkan enrollment yang akan berakhir dalam X hari
   */
  async getExpiringEnrollments(days = 7) {
    this.logger.info({ days }, '[enrollmentRepository] getExpiringEnrollments called');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return await this.model.findMany({
      where: {
        enrollment_status: 'ENROLLED',
        enrolled_at: { lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true } },
        bootcamp: { select: { id: true, title: true, path_slug: true, duration: true } },
      },
      orderBy: { enrolled_at: 'asc' },
    });
  }

  /**
   * Mendapatkan top learners berdasarkan progress
   */
  async getTopLearners(options = {}) {
    this.logger.info({ options }, '[enrollmentRepository] getTopLearners called');
    const { limit = 10, bootcamp_id } = options;

    const where = { enrollment_status: 'ENROLLED' };
    if (bootcamp_id) where.bootcamp_id = bootcamp_id;

    return await this.model.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, first_name: true, last_name: true, avatar: true } },
        bootcamp: { select: { id: true, title: true, path_slug: true, image_url: true } },
      },
      orderBy: [{ progress_percentage: 'desc' }, { enrolled_at: 'asc' }],
      take: limit,
    });
  }

  /**
   * Validasi sebelum create enrollment
   */
  async validateEnrollment(data) {
    this.logger.info('[enrollmentRepository] validateEnrollment called');
    const { user_id, bootcamp_id, pricing_tier_id } = data;

    const existingEnrollment = await this.findByUserAndBootcamp(user_id, bootcamp_id);
    if (existingEnrollment) {
      return { valid: false, message: 'User sudah terdaftar di bootcamp ini', existing_enrollment: existingEnrollment };
    }

    const bootcamp = await this.prisma.bootcamp.findUnique({ where: { id: bootcamp_id }, select: { id: true, title: true, status: true } });
    if (!bootcamp) {
      return { valid: false, message: 'Bootcamp tidak ditemukan' };
    }
    if (bootcamp.status !== 'ACTIVE') {
      return { valid: false, message: 'Bootcamp tidak tersedia untuk pendaftaran' };
    }

    if (pricing_tier_id) {
      const pricingTier = await this.prisma.bootcampPricing.findFirst({ where: { id: pricing_tier_id, bootcamp_id } });
      if (!pricingTier) {
        return { valid: false, message: 'Pricing tier tidak valid untuk bootcamp ini' };
      }
    }

    return { valid: true, message: 'Enrollment dapat dibuat' };
  }

  /**
   * Bulk update enrollment status
   */
  async bulkUpdateStatus(enrollmentIds, status) {
    this.logger.info({ count: Array.isArray(enrollmentIds) ? enrollmentIds.length : 0, status }, '[enrollmentRepository] bulkUpdateStatus called');
    const updateData = { enrollment_status: status };
    if (status === 'COMPLETED') {
      updateData.completed_at = new Date();
      updateData.progress_percentage = 100;
    }

    const result = await this.model.updateMany({ where: { id: { in: enrollmentIds } }, data: updateData });

    return { updated_count: result.count, message: `Berhasil mengupdate ${result.count} enrollment` };
  }
}

export { EnrollmentRepository };
