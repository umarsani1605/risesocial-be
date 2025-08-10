import prisma from '../lib/prisma.js';
import { BaseRepository } from './base/BaseRepository.js';

/**
 * User repository for data access operations
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email, options = {}) {
    return await this.model.findUnique({
      where: { email },
      ...options,
    });
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} User or null
   */
  async findByUsername(username, options = {}) {
    return await this.model.findUnique({
      where: { username },
      ...options,
    });
  }

  /**
   * Create user with settings
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user with settings
   */
  async createWithSettings(userData) {
    return await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: userData,
        include: {
          user_setting: true,
        },
      });

      // Create default settings if not exists
      if (!user.user_setting) {
        await tx.userSetting.create({
          data: {
            user_id: user.id,
            job_notification: user.role === 'USER',
            program_notification: true,
            promo_notification: user.role === 'USER',
          },
        });

        // Re-fetch user with settings
        return await tx.user.findUnique({
          where: { id: user.id },
          include: {
            user_setting: true,
          },
        });
      }

      return user;
    });
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated users
   */
  async findManyWithPagination(options = {}) {
    const { page = 1, limit = 10, role, search } = options;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          user_setting: true,
        },
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if username exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if exists
   */
  async usernameExists(username) {
    return await this.exists({ username });
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if exists
   */
  async emailExists(email) {
    return await this.exists({ email });
  }
}

// Export instance
export const userRepository = new UserRepository();
