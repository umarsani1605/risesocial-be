import { ProgramsRepository } from '../repositories/programsRepository.js';

/**
 * Programs Service
 * Handles business logic for programs
 */
class ProgramsService {
  constructor() {
    this.programsRepository = new ProgramsRepository();
  }

  /**
   * Generate slug from title
   * @param {string} title - Program title
   * @returns {string} Generated slug
   */
  generateSlug(title) {
    if (!title || typeof title !== 'string') {
      throw new Error('Title is required to generate slug');
    }

    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Ensure unique slug
   * @param {string} baseSlug - Base slug
   * @param {number} excludeId - ID to exclude from check
   * @returns {Promise<string>} Unique slug
   */
  async ensureUniqueSlug(baseSlug, excludeId = null) {
    let slug = baseSlug;
    let counter = 1;

    while (await this.programsRepository.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Enhance program object with computed fields
   * @param {Object} program - Raw program object
   * @returns {Object} Enhanced program object
   */
  enhanceProgram(program) {
    if (!program) return null;

    const enhanced = {
      ...program,
      // Computed fields
      isActive: program.status === 'ACTIVE',
      isDraft: program.status === 'DRAFT',
      isInactive: program.status === 'INACTIVE',

      // Formatted dates
      formattedCreatedAt: program.created_at ? new Date(program.created_at).toLocaleDateString('id-ID') : null,
      formattedUpdatedAt: program.updated_at ? new Date(program.updated_at).toLocaleDateString('id-ID') : null,

      // Time calculations
      createdDaysAgo: program.created_at ? Math.floor((new Date() - new Date(program.created_at)) / (1000 * 60 * 60 * 24)) : null,
      updatedDaysAgo: program.updated_at ? Math.floor((new Date() - new Date(program.updated_at)) / (1000 * 60 * 60 * 24)) : null,

      // Description preview
      descriptionPreview: program.description ? program.description.substring(0, 150) + (program.description.length > 150 ? '...' : '') : null,

      // Status badge properties
      statusBadge: {
        text: program.status,
        color: program.status === 'ACTIVE' ? 'green' : program.status === 'DRAFT' ? 'yellow' : 'red',
        variant: program.status === 'ACTIVE' ? 'success' : program.status === 'DRAFT' ? 'warning' : 'danger',
      },

      // URL-friendly slug
      url: `/programs/${program.slug}`,

      // SEO meta
      seoMeta: {
        title: program.title,
        description: program.description ? program.description.substring(0, 160) : null,
        image: program.image || null,
        url: `/programs/${program.slug}`,
      },
    };

    return enhanced;
  }

  /**
   * Get all programs with search and filtering
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order
   * @returns {Promise<Object>} Programs with pagination
   */
  async getPrograms(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const result = await this.programsRepository.findMany(filters, page, limit, sortBy, sortOrder);

      // Enhance each program
      const enhancedPrograms = result.programs.map((program) => this.enhanceProgram(program));

      return {
        programs: enhancedPrograms,
        pagination: result.pagination,
      };
    } catch (error) {
      throw new Error(`Failed to get programs: ${error.message}`);
    }
  }

  /**
   * Get program by ID or slug
   * @param {string} identifier - Program ID or slug
   * @returns {Promise<Object|null>} Program object or null
   */
  async getProgramById(identifier) {
    try {
      const program = await this.programsRepository.findByIdOrSlug(identifier);
      return this.enhanceProgram(program);
    } catch (error) {
      throw new Error(`Failed to get program: ${error.message}`);
    }
  }

  /**
   * Get featured programs
   * @param {number} limit - Number of programs to fetch
   * @returns {Promise<Array>} Featured programs
   */
  async getFeaturedPrograms(limit = 6) {
    try {
      const programs = await this.programsRepository.getFeatured(limit);
      return programs.map((program) => this.enhanceProgram(program));
    } catch (error) {
      throw new Error(`Failed to get featured programs: ${error.message}`);
    }
  }

  /**
   * Create a new program
   * @param {Object} data - Program data
   * @returns {Promise<Object>} Created program
   */
  async createProgram(data) {
    try {
      // Validate required fields
      if (!data.title || typeof data.title !== 'string') {
        throw new Error('Title is required and must be a string');
      }

      if (!data.description || typeof data.description !== 'string') {
        throw new Error('Description is required and must be a string');
      }

      if (!data.image || typeof data.image !== 'string') {
        throw new Error('Image is required and must be a string');
      }

      // Validate status if provided
      const validStatuses = ['ACTIVE', 'INACTIVE', 'DRAFT'];
      if (data.status && !validStatuses.includes(data.status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      // Generate unique slug
      const baseSlug = this.generateSlug(data.title);
      const uniqueSlug = await this.ensureUniqueSlug(baseSlug);

      // Prepare program data
      const programData = {
        title: data.title.trim(),
        slug: uniqueSlug,
        description: data.description.trim(),
        image: data.image.trim(),
        status: data.status || 'ACTIVE',
      };

      // Create program
      const program = await this.programsRepository.create(programData);
      return this.enhanceProgram(program);
    } catch (error) {
      throw new Error(`Failed to create program: ${error.message}`);
    }
  }

  /**
   * Update a program
   * @param {number} id - Program ID
   * @param {Object} data - Update data
   * @returns {Promise<Object|null>} Updated program or null
   */
  async updateProgram(id, data) {
    try {
      // Validate ID
      if (!id || isNaN(id)) {
        throw new Error('Valid program ID is required');
      }

      // Validate status if provided
      const validStatuses = ['ACTIVE', 'INACTIVE', 'DRAFT'];
      if (data.status && !validStatuses.includes(data.status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      // Prepare update data
      const updateData = {};

      if (data.title) {
        updateData.title = data.title.trim();
        // Generate new slug if title changed
        const baseSlug = this.generateSlug(data.title);
        updateData.slug = await this.ensureUniqueSlug(baseSlug, id);
      }

      if (data.description) {
        updateData.description = data.description.trim();
      }

      if (data.image) {
        updateData.image = data.image.trim();
      }

      if (data.status) {
        updateData.status = data.status;
      }

      // Update program
      const program = await this.programsRepository.update(id, updateData);
      return this.enhanceProgram(program);
    } catch (error) {
      throw new Error(`Failed to update program: ${error.message}`);
    }
  }

  /**
   * Delete a program
   * @param {number} id - Program ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProgram(id) {
    try {
      // Validate ID
      if (!id || isNaN(id)) {
        throw new Error('Valid program ID is required');
      }

      return await this.programsRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete program: ${error.message}`);
    }
  }

  /**
   * Get programs statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getProgramsStatistics() {
    try {
      const stats = await this.programsRepository.getStatistics();

      // Add percentage calculations
      const total = stats.totalPrograms || 1; // Avoid division by zero

      return {
        ...stats,
        statusPercentages: {
          active: Math.round((stats.activePrograms / total) * 100),
          inactive: Math.round((stats.inactivePrograms / total) * 100),
          draft: Math.round((stats.draftPrograms / total) * 100),
        },
        insights: {
          mostCommonStatus:
            stats.activePrograms >= stats.inactivePrograms && stats.activePrograms >= stats.draftPrograms
              ? 'ACTIVE'
              : stats.inactivePrograms >= stats.draftPrograms
              ? 'INACTIVE'
              : 'DRAFT',
          hasRecentActivity: stats.recentPrograms > 0,
          averageProgramsPerMonth: Math.round(stats.totalPrograms / 12), // Assuming 1 year of data
        },
      };
    } catch (error) {
      throw new Error(`Failed to get programs statistics: ${error.message}`);
    }
  }

  /**
   * Get programs for admin (including inactive/draft)
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order
   * @returns {Promise<Object>} Programs with pagination
   */
  async getProgramsForAdmin(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const result = await this.programsRepository.findManyForAdmin(filters, page, limit, sortBy, sortOrder);

      // Enhance each program
      const enhancedPrograms = result.programs.map((program) => this.enhanceProgram(program));

      return {
        programs: enhancedPrograms,
        pagination: result.pagination,
      };
    } catch (error) {
      throw new Error(`Failed to get programs for admin: ${error.message}`);
    }
  }

  /**
   * Validate program data
   * @param {Object} data - Program data
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Validation result
   */
  validateProgramData(data, isUpdate = false) {
    const errors = [];

    // Title validation
    if (!isUpdate && (!data.title || typeof data.title !== 'string')) {
      errors.push('Title is required and must be a string');
    } else if (data.title && (typeof data.title !== 'string' || data.title.trim().length < 3)) {
      errors.push('Title must be at least 3 characters long');
    } else if (data.title && data.title.trim().length > 255) {
      errors.push('Title must be less than 255 characters');
    }

    // Description validation
    if (!isUpdate && (!data.description || typeof data.description !== 'string')) {
      errors.push('Description is required and must be a string');
    } else if (data.description && (typeof data.description !== 'string' || data.description.trim().length < 10)) {
      errors.push('Description must be at least 10 characters long');
    }

    // Image validation
    if (!isUpdate && (!data.image || typeof data.image !== 'string')) {
      errors.push('Image is required and must be a string');
    } else if (data.image && typeof data.image !== 'string') {
      errors.push('Image must be a string');
    }

    // Status validation
    const validStatuses = ['ACTIVE', 'INACTIVE', 'DRAFT'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export { ProgramsService };
