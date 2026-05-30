import prisma from '../../config/database.js';
import { BaseRepository } from '../shared/BaseRepository.js';

const CREATED_BY_SELECT = {
  created_by_user: { select: { id: true, first_name: true, last_name: true, email: true } },
};

export class AdminBroadcastRepository extends BaseRepository {
  constructor() {
    super(prisma.emailBroadcast);
  }

  /** Return every broadcast, newest first. Filtering and pagination are handled client-side. */
  async findAll() {
    return this.model.findMany({
      orderBy: { created_at: 'desc' },
      include: CREATED_BY_SELECT,
    });
  }

  async findByIdWithDetails(id) {
    return this.model.findUnique({ where: { id }, include: CREATED_BY_SELECT });
  }

  async updateStatus(id, status, extra = {}) {
    return this.model.update({ where: { id }, data: { status, ...extra } });
  }

  async setBrevoTag(id, tag) {
    return this.model.update({ where: { id }, data: { brevo_tag: tag } });
  }

  async updateStats(id, stats) {
    return this.model.update({ where: { id }, data: stats });
  }
}

export const adminBroadcastRepository = new AdminBroadcastRepository();
