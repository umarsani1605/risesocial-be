
export class BaseRepository {
  constructor(model) {
    this.model = model;
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
    try {
      const result = await this.model.count({ where });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }
}
