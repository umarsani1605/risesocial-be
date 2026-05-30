import prisma from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }


  async findByEmail(email, options = {}) {
    try {
      const user = await this.model.findUnique({ where: { email }, ...options });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findByUsername(username, options = {}) {
    try {
      const user = await this.model.findUnique({ where: { username }, ...options });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async createWithSettings(userData) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: userData, include: { user_settings: true } });

        const defaultNotificationPreferences = {
          job_notification: true,
          program_notification: true,
        };

        await tx.userSetting.create({
          data: {
            user_id: user.id,
            key: 'notification_preferences',
            value: defaultNotificationPreferences,
          },
        });

        return user;
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async findManyWithPagination(options = {}) {
    try {
      const { page, limit, role, search, id } = options;

      const skip = page && limit ? (page - 1) * limit : undefined;
      const take = limit ? Number(limit) : undefined;

      const where = {};
      if (id) where.id = Number(id);
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
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
          orderBy: { created_at: 'desc' },
          include: { user_settings: true },
        }),
        this.model.count({ where }),
      ]);

      const result = { data };
      if (page && limit) {
        result.meta = {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async usernameExists(username) {
    return await this.exists({ username });
  }

  async emailExists(email) {
    return await this.exists({ email });
  }
}

export const userRepository = new UserRepository();
