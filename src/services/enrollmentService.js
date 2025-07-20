/**
 * EnrollmentService - Service layer untuk enrollment management
 * Menangani business logic dan enhanced objects untuk enrollment
 */
class EnrollmentService {
  constructor(enrollmentRepository) {
    this.enrollmentRepository = enrollmentRepository;
  }

  /**
   * Mendapatkan semua enrollment dengan enhanced objects
   * @param {Object} options - Options untuk filtering
   * @returns {Promise<Object>} - Enhanced enrollments dengan pagination
   */
  async getAllEnrollments(options = {}) {
    const enrollments = await this.enrollmentRepository.findAllWithDetails(options);

    // Enhance objects
    const enhancedEnrollments = enrollments.data.map((enrollment) => this.enhanceEnrollmentObject(enrollment));

    return {
      data: enhancedEnrollments,
      pagination: enrollments.pagination,
      summary: {
        total: enrollments.pagination.total,
        page: enrollments.pagination.page,
        per_page: enrollments.pagination.limit,
        total_pages: enrollments.pagination.totalPages,
      },
    };
  }

  /**
   * Mendapatkan enrollment berdasarkan ID
   * @param {number} id - ID enrollment
   * @returns {Promise<Object>} - Enhanced enrollment object
   */
  async getEnrollmentById(id) {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new Error('Enrollment tidak ditemukan');
    }

    return this.enhanceEnrollmentObject(enrollment);
  }

  /**
   * Mendapatkan enrollment berdasarkan user dan bootcamp
   * @param {number} userId - ID user
   * @param {number} bootcampId - ID bootcamp
   * @returns {Promise<Object>} - Enhanced enrollment object
   */
  async getEnrollmentByUserAndBootcamp(userId, bootcampId) {
    const enrollment = await this.enrollmentRepository.findByUserAndBootcamp(userId, bootcampId);
    if (!enrollment) {
      throw new Error('Enrollment tidak ditemukan');
    }

    return this.enhanceEnrollmentObject(enrollment);
  }

  /**
   * Mendapatkan enrollment berdasarkan user ID
   * @param {number} userId - ID user
   * @param {Object} options - Options untuk filtering
   * @returns {Promise<Object>} - Enhanced user enrollments
   */
  async getUserEnrollments(userId, options = {}) {
    const enrollments = await this.enrollmentRepository.findByUserId(userId, options);

    // Enhance objects
    const enhancedEnrollments = enrollments.data.map((enrollment) => this.enhanceEnrollmentObject(enrollment));

    return {
      data: enhancedEnrollments,
      pagination: enrollments.pagination,
      summary: {
        total: enrollments.pagination.total,
        active: enhancedEnrollments.filter((e) => e.enrollment_status === 'ENROLLED').length,
        completed: enhancedEnrollments.filter((e) => e.enrollment_status === 'COMPLETED').length,
        cancelled: enhancedEnrollments.filter((e) => e.enrollment_status === 'CANCELLED').length,
        average_progress: this.calculateAverageProgress(enhancedEnrollments),
      },
    };
  }

  /**
   * Mendapatkan enrollment berdasarkan bootcamp ID
   * @param {number} bootcampId - ID bootcamp
   * @param {Object} options - Options untuk filtering
   * @returns {Promise<Object>} - Enhanced bootcamp enrollments
   */
  async getBootcampEnrollments(bootcampId, options = {}) {
    const enrollments = await this.enrollmentRepository.findByBootcampId(bootcampId, options);

    // Enhance objects
    const enhancedEnrollments = enrollments.data.map((enrollment) => this.enhanceEnrollmentObject(enrollment));

    return {
      data: enhancedEnrollments,
      pagination: enrollments.pagination,
      summary: {
        total: enrollments.pagination.total,
        active: enhancedEnrollments.filter((e) => e.enrollment_status === 'ENROLLED').length,
        completed: enhancedEnrollments.filter((e) => e.enrollment_status === 'COMPLETED').length,
        cancelled: enhancedEnrollments.filter((e) => e.enrollment_status === 'CANCELLED').length,
        average_progress: this.calculateAverageProgress(enhancedEnrollments),
      },
    };
  }

  /**
   * Membuat enrollment baru
   * @param {Object} data - Data enrollment
   * @returns {Promise<Object>} - Enhanced enrollment object
   */
  async createEnrollment(data) {
    // Validasi enrollment
    const validation = await this.enrollmentRepository.validateEnrollment(data);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Buat enrollment
    const enrollment = await this.enrollmentRepository.createEnrollment(data);

    return this.enhanceEnrollmentObject(enrollment);
  }

  /**
   * Update progress enrollment
   * @param {number} enrollmentId - ID enrollment
   * @param {number} progressPercentage - Progress percentage (0-100)
   * @returns {Promise<Object>} - Enhanced enrollment object
   */
  async updateProgress(enrollmentId, progressPercentage) {
    // Validasi progress percentage
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new Error('Progress percentage harus antara 0 dan 100');
    }

    const enrollment = await this.enrollmentRepository.updateProgress(enrollmentId, progressPercentage);

    return this.enhanceEnrollmentObject(enrollment);
  }

  /**
   * Update status enrollment
   * @param {number} enrollmentId - ID enrollment
   * @param {string} status - Status baru
   * @returns {Promise<Object>} - Enhanced enrollment object
   */
  async updateStatus(enrollmentId, status) {
    // Validasi status
    const validStatuses = ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status tidak valid');
    }

    const enrollment = await this.enrollmentRepository.updateStatus(enrollmentId, status);

    return this.enhanceEnrollmentObject(enrollment);
  }

  /**
   * Mendapatkan statistik enrollment
   * @param {Object} options - Options untuk filtering
   * @returns {Promise<Object>} - Enhanced enrollment statistics
   */
  async getEnrollmentStats(options = {}) {
    const stats = await this.enrollmentRepository.getEnrollmentStats(options);

    return {
      ...stats,
      insights: {
        completion_rate_category: this.categorizeCompletionRate(parseFloat(stats.completion_rate)),
        cancellation_rate_category: this.categorizeCancellationRate(parseFloat(stats.cancellation_rate)),
        performance_score: this.calculatePerformanceScore(stats),
        recommendations: this.generateRecommendations(stats),
      },
    };
  }

  /**
   * Mendapatkan enrollment yang akan berakhir
   * @param {number} days - Jumlah hari
   * @returns {Promise<Array>} - Enhanced expiring enrollments
   */
  async getExpiringEnrollments(days = 7) {
    const enrollments = await this.enrollmentRepository.getExpiringEnrollments(days);

    return enrollments.map((enrollment) => this.enhanceEnrollmentObject(enrollment));
  }

  /**
   * Mendapatkan top learners
   * @param {Object} options - Options untuk filtering
   * @returns {Promise<Array>} - Enhanced top learners
   */
  async getTopLearners(options = {}) {
    const learners = await this.enrollmentRepository.getTopLearners(options);

    return learners.map((enrollment) => this.enhanceEnrollmentObject(enrollment));
  }

  /**
   * Bulk update enrollment status
   * @param {Array} enrollmentIds - Array of enrollment IDs
   * @param {string} status - Status baru
   * @returns {Promise<Object>} - Update result
   */
  async bulkUpdateStatus(enrollmentIds, status) {
    // Validasi status
    const validStatuses = ['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status tidak valid');
    }

    return await this.enrollmentRepository.bulkUpdateStatus(enrollmentIds, status);
  }

  /**
   * Mendapatkan dashboard overview enrollment
   * @param {Object} options - Options untuk filtering
   * @returns {Promise<Object>} - Dashboard overview
   */
  async getDashboardOverview(options = {}) {
    const [generalStats, recentEnrollments, topLearners, expiringEnrollments] = await Promise.all([
      this.getEnrollmentStats(options),
      this.getAllEnrollments({
        ...options,
        limit: 5,
        include_user: true,
        include_bootcamp: true,
      }),
      this.getTopLearners({ limit: 5 }),
      this.getExpiringEnrollments(7),
    ]);

    return {
      general_stats: generalStats,
      recent_enrollments: recentEnrollments.data,
      top_learners: topLearners,
      expiring_enrollments: expiringEnrollments.slice(0, 5),
      quick_actions: this.generateQuickActions(generalStats),
    };
  }

  /**
   * Enhanced enrollment object dengan computed fields
   * @param {Object} enrollment - Raw enrollment object
   * @returns {Object} - Enhanced enrollment object
   */
  enhanceEnrollmentObject(enrollment) {
    if (!enrollment) return null;

    const enhanced = {
      ...enrollment,

      // Enhanced enrollment info
      enrollment_id: enrollment.id,

      // Status badge dengan emoji
      status_badge: this.getStatusBadge(enrollment.enrollment_status),

      // Progress info
      progress_info: {
        percentage: enrollment.progress_percentage,
        progress_bar: this.getProgressBar(enrollment.progress_percentage),
        progress_category: this.getProgressCategory(enrollment.progress_percentage),
        is_completed: enrollment.progress_percentage >= 100,
      },

      // Duration info
      duration_info: {
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        duration_in_days: this.calculateDurationInDays(enrollment.enrolled_at, enrollment.completed_at),
        is_expired: this.isEnrollmentExpired(enrollment.enrolled_at),
        days_since_enrolled: this.calculateDaysSinceEnrolled(enrollment.enrolled_at),
      },

      // Pricing info (jika ada)
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

      // User info (jika ada)
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

      // Bootcamp info (jika ada)
      bootcamp_info: enrollment.bootcamp
        ? {
            id: enrollment.bootcamp.id,
            title: enrollment.bootcamp.title,
            slug: enrollment.bootcamp.path_slug,
            image_url: enrollment.bootcamp.image_url,
            category: enrollment.bootcamp.category,
            duration: enrollment.bootcamp.duration,
            rating: enrollment.bootcamp.rating,
            has_certificate: enrollment.bootcamp.certificate,
            has_portfolio: enrollment.bootcamp.portfolio,
            rating_display: enrollment.bootcamp.rating ? `⭐ ${enrollment.bootcamp.rating}/5` : 'Belum ada rating',
          }
        : null,

      // Engagement metrics
      engagement_metrics: {
        engagement_score: this.calculateEngagementScore(enrollment),
        learning_pace: this.calculateLearningPace(enrollment),
        completion_prediction: this.predictCompletion(enrollment),
      },

      // Timestamps in Indonesian format
      timestamps: {
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        formatted_enrolled_at: this.formatDateIndonesian(enrollment.enrolled_at),
        formatted_completed_at: enrollment.completed_at ? this.formatDateIndonesian(enrollment.completed_at) : null,
      },
    };

    return enhanced;
  }

  /**
   * Generate status badge dengan emoji
   * @param {string} status - Status enrollment
   * @returns {Object} - Status badge info
   */
  getStatusBadge(status) {
    const badges = {
      ENROLLED: { emoji: '📚', text: 'Sedang Belajar', color: 'blue' },
      COMPLETED: { emoji: '🎓', text: 'Selesai', color: 'green' },
      CANCELLED: { emoji: '❌', text: 'Dibatalkan', color: 'red' },
      SUSPENDED: { emoji: '⏸️', text: 'Ditunda', color: 'yellow' },
    };

    return badges[status] || { emoji: '❓', text: 'Tidak Diketahui', color: 'gray' };
  }

  /**
   * Generate progress bar visual
   * @param {number} percentage - Progress percentage
   * @returns {string} - Progress bar string
   */
  getProgressBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
  }

  /**
   * Get progress category
   * @param {number} percentage - Progress percentage
   * @returns {string} - Progress category
   */
  getProgressCategory(percentage) {
    if (percentage === 0) return 'Belum Dimulai';
    if (percentage < 25) return 'Baru Memulai';
    if (percentage < 50) return 'Sedang Berlangsung';
    if (percentage < 75) return 'Hampir Selesai';
    if (percentage < 100) return 'Mendekati Selesai';
    return 'Selesai';
  }

  /**
   * Calculate duration in days
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {number} - Duration in days
   */
  calculateDurationInDays(startDate, endDate) {
    if (!endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if enrollment is expired
   * @param {Date} enrolledAt - Enrolled date
   * @returns {boolean} - Is expired
   */
  isEnrollmentExpired(enrolledAt) {
    const now = new Date();
    const enrolled = new Date(enrolledAt);
    const daysSinceEnrolled = Math.ceil((now - enrolled) / (1000 * 60 * 60 * 24));
    return daysSinceEnrolled > 90; // Asumsi 90 hari masa berlaku
  }

  /**
   * Calculate days since enrolled
   * @param {Date} enrolledAt - Enrolled date
   * @returns {number} - Days since enrolled
   */
  calculateDaysSinceEnrolled(enrolledAt) {
    const now = new Date();
    const enrolled = new Date(enrolledAt);
    return Math.ceil((now - enrolled) / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate engagement score
   * @param {Object} enrollment - Enrollment object
   * @returns {number} - Engagement score (0-100)
   */
  calculateEngagementScore(enrollment) {
    const daysSinceEnrolled = this.calculateDaysSinceEnrolled(enrollment.enrolled_at);
    const progressPerDay = enrollment.progress_percentage / daysSinceEnrolled;

    // Engagement score berdasarkan progress per hari
    if (progressPerDay >= 2) return 100; // Excellent
    if (progressPerDay >= 1.5) return 85; // Very Good
    if (progressPerDay >= 1) return 70; // Good
    if (progressPerDay >= 0.5) return 55; // Average
    if (progressPerDay >= 0.2) return 40; // Below Average
    return 25; // Poor
  }

  /**
   * Calculate learning pace
   * @param {Object} enrollment - Enrollment object
   * @returns {string} - Learning pace category
   */
  calculateLearningPace(enrollment) {
    const daysSinceEnrolled = this.calculateDaysSinceEnrolled(enrollment.enrolled_at);
    const progressPerDay = enrollment.progress_percentage / daysSinceEnrolled;

    if (progressPerDay >= 2) return 'Sangat Cepat';
    if (progressPerDay >= 1.5) return 'Cepat';
    if (progressPerDay >= 1) return 'Normal';
    if (progressPerDay >= 0.5) return 'Lambat';
    return 'Sangat Lambat';
  }

  /**
   * Predict completion
   * @param {Object} enrollment - Enrollment object
   * @returns {Object} - Completion prediction
   */
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

  /**
   * Calculate average progress
   * @param {Array} enrollments - Array of enrollments
   * @returns {number} - Average progress
   */
  calculateAverageProgress(enrollments) {
    if (!enrollments || enrollments.length === 0) return 0;

    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress_percentage, 0);
    return Math.round(totalProgress / enrollments.length);
  }

  /**
   * Categorize completion rate
   * @param {number} rate - Completion rate
   * @returns {string} - Category
   */
  categorizeCompletionRate(rate) {
    if (rate >= 80) return 'Sangat Baik';
    if (rate >= 60) return 'Baik';
    if (rate >= 40) return 'Cukup';
    if (rate >= 20) return 'Kurang';
    return 'Sangat Kurang';
  }

  /**
   * Categorize cancellation rate
   * @param {number} rate - Cancellation rate
   * @returns {string} - Category
   */
  categorizeCancellationRate(rate) {
    if (rate <= 5) return 'Sangat Rendah';
    if (rate <= 10) return 'Rendah';
    if (rate <= 20) return 'Sedang';
    if (rate <= 30) return 'Tinggi';
    return 'Sangat Tinggi';
  }

  /**
   * Calculate performance score
   * @param {Object} stats - Statistics object
   * @returns {number} - Performance score (0-100)
   */
  calculatePerformanceScore(stats) {
    const completionRate = parseFloat(stats.completion_rate);
    const cancellationRate = parseFloat(stats.cancellation_rate);
    const averageProgress = stats.average_progress;

    // Weighted score calculation
    const completionScore = (completionRate / 100) * 40; // 40% weight
    const cancellationScore = ((100 - cancellationRate) / 100) * 30; // 30% weight
    const progressScore = (averageProgress / 100) * 30; // 30% weight

    return Math.round(completionScore + cancellationScore + progressScore);
  }

  /**
   * Generate recommendations
   * @param {Object} stats - Statistics object
   * @returns {Array} - Array of recommendations
   */
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
        message: 'Analisis penyebab pembatalan dan perbaiki konten bootcamp',
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

  /**
   * Generate quick actions
   * @param {Object} stats - Statistics object
   * @returns {Array} - Array of quick actions
   */
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

  /**
   * Format currency to Indonesian Rupiah
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date to Indonesian format
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date
   */
  formatDateIndonesian(date) {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  /**
   * Get user initials
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @returns {string} - User initials
   */
  getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
  }
}

export { EnrollmentService };
