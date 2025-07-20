/**
 * Base Repository Class
 * Provides common database operations following KISS principle
 */
export class BaseRepository {
  /**
   * @param {Object} model - Prisma model instance
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all records with optional filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  async findMany(options = {}) {
    return await this.model.findMany(options);
  }

  /**
   * Find single record by ID
   * @param {number|string} id - Record ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Record or null
   */
  async findById(id, options = {}) {
    return await this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  /**
   * Find single record by condition
   * @param {Object} where - Where condition
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Record or null
   */
  async findFirst(where, options = {}) {
    return await this.model.findFirst({
      where,
      ...options,
    });
  }

  /**
   * Create new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    return await this.model.create({ data });
  }

  /**
   * Update record by ID
   * @param {number|string} id - Record ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<Object>} Deleted record
   */
  async delete(id) {
    return await this.model.delete({
      where: { id },
    });
  }

  /**
   * Count records with optional filtering
   * @param {Object} where - Filter conditions
   * @returns {Promise<number>} Record count
   */
  async count(where = {}) {
    return await this.model.count({ where });
  }

  /**
   * Check if record exists
   * @param {Object} where - Filter conditions
   * @returns {Promise<boolean>} True if exists
   */
  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }
}
