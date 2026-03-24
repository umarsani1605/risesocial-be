import prisma from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import { getLogger } from '../../utils/loggerContext.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  get logger() {
    return getLogger();
  }

  async findByEmail(email, options = {}) {
    this.logger.info({ email }, '[userRepository] findByEmail start');
    try {
      const user = await this.model.findUnique({ where: { email }, ...options });
      this.logger.info({ found: !!user }, '[userRepository] findByEmail success');
      return user;
    } catch (error) {
      this.logger.error({ err: error }, '[userRepository] findByEmail error');
      throw error;
    }
  }

  async findByUsername(username, options = {}) {
    this.logger.info({ username }, '[userRepository] findByUsername start');
    try {
      const user = await this.model.findUnique({ where: { username }, ...options });
      this.logger.info({ found: !!user }, '[userRepository] findByUsername success');
      return user;
    } catch (error) {
      this.logger.error({ err: error }, '[userRepository] findByUsername error');
      throw error;
    }
  }

  async createWithSettings(userData) {
    this.logger.info('[userRepository] createWithSettings start');
    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: userData, include: { user_settings: true } });

        const defaultNotificationPreferences = {
          promo_notification: true,
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

        this.logger.info({ id: user.id }, '[userRepository] default notification preferences created');
        return user;
      });

      this.logger.info({ id: result.id }, '[userRepository] createWithSettings success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userRepository] createWithSettings error');
      throw error;
    }
  }

  async findManyWithPagination(options = {}) {
    this.logger.info({ options }, '[userRepository] findManyWithPagination start');
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

      this.logger.info('[userRepository] findManyWithPagination success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userRepository] findManyWithPagination error');
      throw error;
    }
  }

  async usernameExists(username) {
    this.logger.debug({ username }, '[userRepository] usernameExists');
    return await this.exists({ username });
  }

  async emailExists(email) {
    this.logger.debug({ email }, '[userRepository] emailExists');
    return await this.exists({ email });
  }
}

export const userRepository = new UserRepository();
