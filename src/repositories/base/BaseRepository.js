import { getLogger } from '../../lib/loggerContext.js';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  get logger() {
    return getLogger();
  }

  async findMany(options = {}) {
    return await this.model.findMany(options);
  }

  async findById(id, options = {}) {
    return await this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  async findFirst(where, options = {}) {
    return await this.model.findFirst({
      where,
      ...options,
    });
  }

  async create(data) {
    return await this.model.create({ data });
  }

  async update(id, data) {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return await this.model.delete({
      where: { id },
    });
  }

  async count(where = {}) {
    this.logger.debug({ where }, '[BaseRepository] count called');
    try {
      const result = await this.model.count({ where });
      return result;
    } catch (error) {
      this.logger.error({ err: error, where }, '[BaseRepository] count error');
      throw error;
    }
  }

  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }
}
