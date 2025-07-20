import { BaseRepository } from './base/BaseRepository.js';

class InstructorRepository extends BaseRepository {
  constructor() {
    super('instructor');
  }

  /**
   * Mendapatkan semua instructor dengan pagination
   * @param {Object} options - Options untuk query
   * @returns {Promise<Array>} Array instructor
   */
  async findManyWithPagination(options = {}) {
    const { page = 1, limit = 10, search, includeBootcamps = false } = options;
    const skip = (page - 1) * limit;

    const whereClause = {};

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { job_title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const includeClause = includeBootcamps
      ? {
          bootcamp_instructors: {
            include: {
              bootcamp: {
                select: {
                  id: true,
                  title: true,
                  path_slug: true,
                  category: true,
                  status: true,
                },
              },
            },
            orderBy: { instructor_order: 'asc' },
          },
        }
      : {};

    const [instructors, total] = await Promise.all([
      this.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.count({ where: whereClause }),
    ]);

    return {
      data: instructors,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Mendapatkan instructor berdasarkan ID dengan bootcamp associations
   * @param {number} id - ID instructor
   * @param {boolean} includeBootcamps - Include bootcamp associations
   * @returns {Promise<Object>} Instructor object
   */
  async findByIdWithBootcamps(id, includeBootcamps = false) {
    const includeClause = includeBootcamps
      ? {
          bootcamp_instructors: {
            include: {
              bootcamp: {
                select: {
                  id: true,
                  title: true,
                  path_slug: true,
                  category: true,
                  status: true,
                  image_url: true,
                  duration: true,
                  rating: true,
                },
              },
            },
            orderBy: { instructor_order: 'asc' },
          },
        }
      : {};

    return this.findById(id, { include: includeClause });
  }

  /**
   * Mencari instructor berdasarkan nama
   * @param {string} name - Nama instructor
   * @returns {Promise<Array>} Array instructor
   */
  async findByName(name) {
    return this.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Mendapatkan instructor berdasarkan job title
   * @param {string} jobTitle - Job title
   * @returns {Promise<Array>} Array instructor
   */
  async findByJobTitle(jobTitle) {
    return this.findMany({
      where: {
        job_title: { contains: jobTitle, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Mendapatkan instructor yang belum di-assign ke bootcamp tertentu
   * @param {number} bootcampId - ID bootcamp
   * @returns {Promise<Array>} Array instructor
   */
  async findAvailableForBootcamp(bootcampId) {
    return this.findMany({
      where: {
        bootcamp_instructors: {
          none: {
            bootcamp_id: bootcampId,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Mendapatkan instructor yang sudah di-assign ke bootcamp tertentu
   * @param {number} bootcampId - ID bootcamp
   * @returns {Promise<Array>} Array instructor dengan order
   */
  async findByBootcampId(bootcampId) {
    const bootcampInstructors = await this.prisma.bootcampInstructor.findMany({
      where: { bootcamp_id: bootcampId },
      include: {
        instructor: true,
      },
      orderBy: { instructor_order: 'asc' },
    });

    return bootcampInstructors.map((bi) => ({
      ...bi.instructor,
      instructor_order: bi.instructor_order,
      bootcamp_id: bi.bootcamp_id,
    }));
  }

  /**
   * Mendapatkan bootcamp yang diajar oleh instructor tertentu
   * @param {number} instructorId - ID instructor
   * @returns {Promise<Array>} Array bootcamp
   */
  async findBootcampsByInstructorId(instructorId) {
    const bootcampInstructors = await this.prisma.bootcampInstructor.findMany({
      where: { instructor_id: instructorId },
      include: {
        bootcamp: true,
      },
      orderBy: { instructor_order: 'asc' },
    });

    return bootcampInstructors.map((bi) => ({
      ...bi.bootcamp,
      instructor_order: bi.instructor_order,
      instructor_id: bi.instructor_id,
    }));
  }

  /**
   * Mendapatkan instructor terpopuler berdasarkan jumlah bootcamp
   * @param {number} limit - Limit hasil
   * @returns {Promise<Array>} Array instructor dengan bootcamp count
   */
  async findPopularInstructors(limit = 10) {
    return this.findMany({
      include: {
        bootcamp_instructors: {
          include: {
            bootcamp: {
              select: { id: true, title: true, status: true },
            },
          },
        },
      },
      orderBy: {
        bootcamp_instructors: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  /**
   * Mendapatkan statistik instructor
   * @returns {Promise<Object>} Statistik instructor
   */
  async getInstructorStats() {
    const [totalInstructors, instructorsWithAvatar, instructorsWithDescription, instructorsWithJobTitle, totalBootcampAssociations] =
      await Promise.all([
        this.count(),
        this.count({ where: { avatar_url: { not: null } } }),
        this.count({ where: { description: { not: null } } }),
        this.count({ where: { job_title: { not: null } } }),
        this.prisma.bootcampInstructor.count(),
      ]);

    // Get instructor with most bootcamps
    const instructorWithMostBootcamps = await this.prisma.instructor.findFirst({
      include: {
        bootcamp_instructors: {
          include: {
            bootcamp: { select: { title: true } },
          },
        },
      },
      orderBy: {
        bootcamp_instructors: {
          _count: 'desc',
        },
      },
    });

    return {
      total_instructors: totalInstructors,
      instructors_with_avatar: instructorsWithAvatar,
      instructors_with_description: instructorsWithDescription,
      instructors_with_job_title: instructorsWithJobTitle,
      total_bootcamp_associations: totalBootcampAssociations,
      profile_completion_rate:
        totalInstructors > 0
          ? Math.round(((instructorsWithAvatar + instructorsWithDescription + instructorsWithJobTitle) / (totalInstructors * 3)) * 100)
          : 0,
      most_active_instructor: instructorWithMostBootcamps
        ? {
            name: instructorWithMostBootcamps.name,
            bootcamp_count: instructorWithMostBootcamps.bootcamp_instructors.length,
            bootcamps: instructorWithMostBootcamps.bootcamp_instructors.map((bi) => bi.bootcamp.title),
          }
        : null,
    };
  }

  /**
   * Membuat instructor baru dengan validasi
   * @param {Object} data - Data instructor
   * @returns {Promise<Object>} Instructor yang dibuat
   */
  async createInstructor(data) {
    // Cek apakah nama sudah ada
    const existingInstructor = await this.findFirst({
      where: { name: data.name },
    });

    if (existingInstructor) {
      throw new Error('Instructor dengan nama tersebut sudah ada');
    }

    return this.create(data);
  }

  /**
   * Update instructor dengan validasi
   * @param {number} id - ID instructor
   * @param {Object} data - Data untuk update
   * @returns {Promise<Object>} Instructor yang diupdate
   */
  async updateInstructor(id, data) {
    // Cek apakah instructor exists
    const instructor = await this.findById(id);
    if (!instructor) {
      throw new Error('Instructor tidak ditemukan');
    }

    // Cek apakah nama baru sudah ada (jika nama diubah)
    if (data.name && data.name !== instructor.name) {
      const existingInstructor = await this.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });

      if (existingInstructor) {
        throw new Error('Instructor dengan nama tersebut sudah ada');
      }
    }

    return this.update(id, data);
  }

  /**
   * Menghapus instructor dengan validasi
   * @param {number} id - ID instructor
   * @returns {Promise<Object>} Instructor yang dihapus
   */
  async deleteInstructor(id) {
    // Cek apakah instructor exists
    const instructor = await this.findById(id);
    if (!instructor) {
      throw new Error('Instructor tidak ditemukan');
    }

    // Cek apakah instructor masih di-assign ke bootcamp
    const bootcampAssociations = await this.prisma.bootcampInstructor.count({
      where: { instructor_id: id },
    });

    if (bootcampAssociations > 0) {
      throw new Error('Tidak dapat menghapus instructor yang masih di-assign ke bootcamp. Hapus assignment terlebih dahulu.');
    }

    return this.delete(id);
  }
}

export default InstructorRepository;
