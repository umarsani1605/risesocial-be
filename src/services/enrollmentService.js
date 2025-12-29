import { enrollmentRepository } from '../repositories/enrollmentRepository.js';
import { getLogger } from '../utils/loggerContext.js';

class EnrollmentService {
  constructor() {
    this.enrollmentRepository = enrollmentRepository;
  }

  get logger() {
    return getLogger();
  }

  async getAllEnrollments(options = {}) {
    this.logger.info('[enrollmentService] getAllEnrollments start');
    try {
      const enrollments = await this.enrollmentRepository.findAllWithDetails(options);

      const enhancedEnrollments = enrollments.data.map((enrollment) => this.enhanceEnrollmentObject(enrollment));

      const result = {
        data: enrollments.data,
        pagination: enrollments.pagination,
      };
      this.logger.info('[enrollmentService] getAllEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getAllEnrollments error');
      throw error;
    }
  }

  async getEnrollmentById(id) {
    this.logger.info({ id }, '[enrollmentService] getEnrollmentById start');
    try {
      const enrollment = await this.enrollmentRepository.findById(id);
      if (!enrollment) {
        const err = new Error('Enrollment tidak ditemukan');
        throw err;
      }
      this.logger.info('[enrollmentService] getEnrollmentById success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getEnrollmentById error');
      throw error;
    }
  }

  async getEnrollmentByUserAndAcademy(userId, academyId) {
    this.logger.info({ userId, academyId }, '[enrollmentService] getEnrollmentByUserAndAcademy start');
    try {
      const enrollment = await this.enrollmentRepository.findByUserAndAcademy(userId, academyId);
      if (!enrollment) {
        const err = new Error('Enrollment tidak ditemukan');
        throw err;
      }
      this.logger.info('[enrollmentService] getEnrollmentByUserAndAcademy success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getEnrollmentByUserAndAcademy error');
      throw error;
    }
  }

  async getUserEnrollments(userId, options = {}) {
    this.logger.info({ userId }, '[enrollmentService] getUserEnrollments start');
    try {
      const enrollments = await this.enrollmentRepository.findByUserId(userId, options);

      const enhancedEnrollments = enrollments.data.map((enrollment) => this.enhanceEnrollmentObject(enrollment));

      const result = {
        data: enrollments.data,
        pagination: enrollments.pagination,
      };
      this.logger.info('[enrollmentService] getUserEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getUserEnrollments error');
      throw error;
    }
  }

  async getAcademyEnrollments(academyId, options = {}) {
    this.logger.info({ academyId }, '[enrollmentService] getAcademyEnrollments start');
    try {
      const enrollments = await this.enrollmentRepository.findByAcademyId(academyId, options);

      const enhancedEnrollments = enrollments.data.map((enrollment) => this.enhanceEnrollmentObject(enrollment));

      const result = {
        data: enrollments.data,
        pagination: enrollments.pagination,
      };
      this.logger.info('[enrollmentService] getAcademyEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getAcademyEnrollments error');
      throw error;
    }
  }

  async createEnrollment(data) {
    this.logger.info('[enrollmentService] createEnrollment start');
    try {
      const validation = await this.enrollmentRepository.validateEnrollment(data);
      if (!validation.valid) {
        const err = new Error(validation.message);
        throw err;
      }

      const enrollment = await this.enrollmentRepository.createEnrollment(data);
      this.logger.info('[enrollmentService] createEnrollment success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] createEnrollment error');
      throw error;
    }
  }

  async updateProgress(enrollmentId, progressPercentage) {
    this.logger.info({ enrollmentId }, '[enrollmentService] updateProgress start');
    try {
      if (progressPercentage < 0 || progressPercentage > 100) {
        const err = new Error('Progress percentage harus antara 0 dan 100');
        throw err;
      }

      const enrollment = await this.enrollmentRepository.updateProgress(enrollmentId, progressPercentage);
      this.logger.info('[enrollmentService] updateProgress success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] updateProgress error');
      throw error;
    }
  }

  async updateStatus(enrollmentId, status) {
    this.logger.info({ enrollmentId, status }, '[enrollmentService] updateStatus start');
    try {
      const validStatuses = ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'];
      if (!validStatuses.includes(status)) {
        const err = new Error('Status tidak valid');
        throw err;
      }

      const enrollment = await this.enrollmentRepository.updateStatus(enrollmentId, status);
      this.logger.info('[enrollmentService] updateStatus success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] updateStatus error');
      throw error;
    }
  }

  async getEnrollmentStats(options = {}) {
    this.logger.info('[enrollmentService] getEnrollmentStats start');
    try {
      const stats = await this.enrollmentRepository.getEnrollmentStats(options);
      this.logger.info('[enrollmentService] getEnrollmentStats success');
      return stats;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getEnrollmentStats error');
      throw error;
    }
  }

  async getExpiringEnrollments(days = 7) {
    this.logger.info({ days }, '[enrollmentService] getExpiringEnrollments start');
    try {
      const enrollments = await this.enrollmentRepository.getExpiringEnrollments(days);

      const result = enrollments.map((enrollment) => this.enhanceEnrollmentObject(enrollment));
      this.logger.info('[enrollmentService] getExpiringEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getExpiringEnrollments error');
      throw error;
    }
  }

  async getTopLearners(options = {}) {
    this.logger.info('[enrollmentService] getTopLearners start');
    try {
      const learners = await this.enrollmentRepository.getTopLearners(options);

      const result = learners.map((enrollment) => this.enhanceEnrollmentObject(enrollment));
      this.logger.info('[enrollmentService] getTopLearners success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getTopLearners error');
      throw error;
    }
  }

  async bulkUpdateStatus(enrollmentIds, status) {
    this.logger.info({ count: Array.isArray(enrollmentIds) ? enrollmentIds.length : 0, status }, '[enrollmentService] bulkUpdateStatus start');
    try {
      const validStatuses = ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'];
      if (!validStatuses.includes(status)) {
        const err = new Error('Status tidak valid');
        throw err;
      }

      const result = await this.enrollmentRepository.bulkUpdateStatus(enrollmentIds, status);
      this.logger.info('[enrollmentService] bulkUpdateStatus success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] bulkUpdateStatus error');
      throw error;
    }
  }

  async getDashboardOverview(options = {}) {
    this.logger.info('[enrollmentService] getDashboardOverview start');
    try {
      const [generalStats, recentEnrollments, topLearners, expiringEnrollments] = await Promise.all([
        this.getEnrollmentStats(options),
        this.getAllEnrollments({
          ...options,
          limit: 5,
          include_user: true,
          include_academy: true,
        }),
        this.getTopLearners({ limit: 5 }),
        this.getExpiringEnrollments(7),
      ]);

      const result = {
        general_stats: generalStats,
        recent_enrollments: recentEnrollments.data,
        top_learners: topLearners,
        expiring_enrollments: expiringEnrollments.slice(0, 5),
        quick_actions: this.generateQuickActions(generalStats),
      };

      this.logger.info('[enrollmentService] getDashboardOverview success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getDashboardOverview error');
      throw error;
    }
  }

  enhanceEnrollmentObject(enrollment) {
    if (!enrollment) return null;

    const enhanced = {
      ...enrollment,

      enrollment_id: enrollment.id,

      status_badge: this.getStatusBadge(enrollment.enrollment_status),

      progress_info: {
        percentage: enrollment.progress_percentage,
        progress_bar: this.getProgressBar(enrollment.progress_percentage),
        progress_category: this.getProgressCategory(enrollment.progress_percentage),
        is_completed: enrollment.progress_percentage >= 100,
      },

      duration_info: {
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        duration_in_days: this.calculateDurationInDays(enrollment.enrolled_at, enrollment.completed_at),
        is_expired: this.isEnrollmentExpired(enrollment.enrolled_at),
        days_since_enrolled: this.calculateDaysSinceEnrolled(enrollment.enrolled_at),
      },

      pricing_info: enrollment.pricing_tier
        ? {
            tier_name: enrollment.pricing_tier.name,
            original_price: enrollment.pricing_tier.original_price,
            discount_price: enrollment.pricing_tier.discount_price,
            savings: enrollment.pricing_tier.original_price - enrollment.pricing_tier.discount_price,
            discount_percentage: Math.round(
              ((enrollment.pricing_tier.original_price - enrollment.pricing_tier.discount_price) / enrollment.pricing_tier.original_price) * 100
            ),
            formatted_original_price: this.formatCurrency(enrollment.pricing_tier.original_price),
            formatted_discount_price: this.formatCurrency(enrollment.pricing_tier.discount_price),
            formatted_savings: this.formatCurrency(enrollment.pricing_tier.original_price - enrollment.pricing_tier.discount_price),
          }
        : null,

      user_info: enrollment.user
        ? {
            id: enrollment.user.id,
            username: enrollment.user.username,
            full_name: `${enrollment.user.first_name} ${enrollment.user.last_name}`,
            email: enrollment.user.email,
            avatar: enrollment.user.avatar,
            initials: this.getInitials(enrollment.user.first_name, enrollment.user.last_name),
          }
        : null,

      academy_info: enrollment.academy
        ? {
            id: enrollment.academy.id,
            title: enrollment.academy.title,
            slug: enrollment.academy.path_slug,
            image_url: enrollment.academy.image_url,
            category: enrollment.academy.category,
            duration: enrollment.academy.duration,
            rating: enrollment.academy.rating,
            has_certificate: enrollment.academy.certificate,
            has_portfolio: enrollment.academy.portfolio,
            rating_display: enrollment.academy.rating ? `⭐ ${enrollment.academy.rating}/5` : 'Belum ada rating',
          }
        : null,

      engagement_metrics: {
        engagement_score: this.calculateEngagementScore(enrollment),
        learning_pace: this.calculateLearningPace(enrollment),
        completion_prediction: this.predictCompletion(enrollment),
      },

      timestamps: {
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        formatted_enrolled_at: this.formatDateIndonesian(enrollment.enrolled_at),
        formatted_completed_at: enrollment.completed_at ? this.formatDateIndonesian(enrollment.completed_at) : null,
      },
    };

    return enhanced;
  }

  getStatusBadge(status) {
    const badges = {
      ENROLLED: { emoji: '📚', text: 'Sedang Belajar', color: 'blue' },
      COMPLETED: { emoji: '🎓', text: 'Selesai', color: 'green' },
      CANCELLED: { emoji: '❌', text: 'Dibatalkan', color: 'red' },
      SUSPENDED: { emoji: '⏸️', text: 'Ditunda', color: 'yellow' },
    };

    return badges[status] || { emoji: '❓', text: 'Tidak Diketahui', color: 'gray' };
  }

  getProgressBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
  }

  getProgressCategory(percentage) {
    if (percentage === 0) return 'Belum Dimulai';
    if (percentage < 25) return 'Baru Memulai';
    if (percentage < 50) return 'Sedang Berlangsung';
    if (percentage < 75) return 'Hampir Selesai';
    if (percentage < 100) return 'Mendekati Selesai';
    return 'Selesai';
  }

  calculateDurationInDays(startDate, endDate) {
    if (!endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  isEnrollmentExpired(enrolledAt) {
    const now = new Date();
    const enrolled = new Date(enrolledAt);
    const daysSinceEnrolled = Math.ceil((now - enrolled) / (1000 * 60 * 60 * 24));
    return daysSinceEnrolled > 90;
  }

  calculateDaysSinceEnrolled(enrolledAt) {
    const now = new Date();
    const enrolled = new Date(enrolledAt);
    return Math.ceil((now - enrolled) / (1000 * 60 * 60 * 24));
  }

  calculateEngagementScore(enrollment) {
    const daysSinceEnrolled = this.calculateDaysSinceEnrolled(enrollment.enrolled_at);
    const progressPerDay = enrollment.progress_percentage / daysSinceEnrolled;

    if (progressPerDay >= 2) return 100;
    if (progressPerDay >= 1.5) return 85;
    if (progressPerDay >= 1) return 70;
    if (progressPerDay >= 0.5) return 55;
    if (progressPerDay >= 0.2) return 40;
    return 25;
  }

  calculateLearningPace(enrollment) {
    const daysSinceEnrolled = this.calculateDaysSinceEnrolled(enrollment.enrolled_at);
    const progressPerDay = enrollment.progress_percentage / daysSinceEnrolled;

    if (progressPerDay >= 2) return 'Sangat Cepat';
    if (progressPerDay >= 1.5) return 'Cepat';
    if (progressPerDay >= 1) return 'Normal';
    if (progressPerDay >= 0.5) return 'Lambat';
    return 'Sangat Lambat';
  }

  predictCompletion(enrollment) {
    if (enrollment.enrollment_status === 'COMPLETED') {
      return {
        status: 'completed',
        message: 'Sudah selesai',
        days_remaining: 0,
      };
    }

    const daysSinceEnrolled = this.calculateDaysSinceEnrolled(enrollment.enrolled_at);
    const progressPerDay = enrollment.progress_percentage / daysSinceEnrolled;

    if (progressPerDay <= 0) {
      return {
        status: 'stalled',
        message: 'Tidak ada progress',
        days_remaining: null,
      };
    }

    const remainingProgress = 100 - enrollment.progress_percentage;
    const estimatedDaysToComplete = Math.ceil(remainingProgress / progressPerDay);

    return {
      status: 'on_track',
      message: `Diperkirakan selesai dalam ${estimatedDaysToComplete} hari`,
      days_remaining: estimatedDaysToComplete,
    };
  }

  calculateAverageProgress(enrollments) {
    if (!enrollments || enrollments.length === 0) return 0;

    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress_percentage, 0);
    return Math.round(totalProgress / enrollments.length);
  }

  categorizeCompletionRate(rate) {
    if (rate >= 80) return 'Sangat Baik';
    if (rate >= 60) return 'Baik';
    if (rate >= 40) return 'Cukup';
    if (rate >= 20) return 'Kurang';
    return 'Sangat Kurang';
  }

  categorizeCancellationRate(rate) {
    if (rate <= 5) return 'Sangat Rendah';
    if (rate <= 10) return 'Rendah';
    if (rate <= 20) return 'Sedang';
    if (rate <= 30) return 'Tinggi';
    return 'Sangat Tinggi';
  }

  calculatePerformanceScore(stats) {
    const completionRate = parseFloat(stats.completion_rate);
    const cancellationRate = parseFloat(stats.cancellation_rate);
    const averageProgress = stats.average_progress;

    const completionScore = (completionRate / 100) * 40;
    const cancellationScore = ((100 - cancellationRate) / 100) * 30;
    const progressScore = (averageProgress / 100) * 30;

    return Math.round(completionScore + cancellationScore + progressScore);
  }

  generateRecommendations(stats) {
    const recommendations = [];
    const completionRate = parseFloat(stats.completion_rate);
    const cancellationRate = parseFloat(stats.cancellation_rate);
    const averageProgress = stats.average_progress;

    if (completionRate < 50) {
      recommendations.push({
        type: 'completion',
        priority: 'high',
        message: 'Tingkatkan engagement dan support untuk meningkatkan completion rate',
      });
    }

    if (cancellationRate > 20) {
      recommendations.push({
        type: 'cancellation',
        priority: 'high',
        message: 'Analisis penyebab pembatalan dan perbaiki konten academy',
      });
    }

    if (averageProgress < 30) {
      recommendations.push({
        type: 'progress',
        priority: 'medium',
        message: 'Berikan motivasi dan reminder untuk meningkatkan progress belajar',
      });
    }

    return recommendations;
  }

  generateQuickActions(stats) {
    const actions = [];
    const completionRate = parseFloat(stats.completion_rate);
    const cancellationRate = parseFloat(stats.cancellation_rate);

    if (completionRate < 60) {
      actions.push({
        action: 'send_motivation',
        title: 'Kirim Motivasi ke Peserta',
        description: 'Kirim pesan motivasi kepada peserta yang belum menyelesaikan',
        icon: '🎯',
      });
    }

    if (cancellationRate > 15) {
      actions.push({
        action: 'analyze_cancellation',
        title: 'Analisis Pembatalan',
        description: 'Analisis penyebab pembatalan dan ambil tindakan perbaikan',
        icon: '📊',
      });
    }

    actions.push({
      action: 'export_report',
      title: 'Export Laporan',
      description: 'Export laporan enrollment untuk analisis lebih lanjut',
      icon: '📄',
    });

    return actions;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  formatDateIndonesian(date) {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
  }
}

export const enrollmentService = new EnrollmentService();
