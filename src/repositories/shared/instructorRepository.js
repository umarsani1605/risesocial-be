import prisma from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';

class InstructorRepository extends BaseRepository {
  constructor() {
    super(prisma.instructor);
    this.prisma = prisma;
  }


  async findManyWithPagination(options = {}) {
    const { page = 1, limit = 10, search, includeAcademies = false } = options;
    const skip = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { job_title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const includeClause = includeAcademies
      ? {
          academy_instructors: {
            include: {
              academy: { select: { id: true, title: true, slug: true, category: true, status: true } },
            },
            orderBy: { instructor_order: 'asc' },
          },
        }
      : {};


    const [instructors, total] = await Promise.all([
      this.findMany({ where: whereClause, include: includeClause, orderBy: { created_at: 'desc' }, skip, take: limit }),
      this.count(whereClause),
    ]);


    return {
      data: instructors,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }

  async findByIdWithAcademies(id, includeAcademies = false) {
    const includeClause = includeAcademies
      ? {
          academy_instructors: {
            include: {
              academy: {
                select: { id: true, title: true, slug: true, category: true, status: true, image_url: true, duration: true, rating: true },
              },
            },
            orderBy: { instructor_order: 'asc' },
          },
        }
      : {};

    return this.findById(id, { include: includeClause });
  }

  async findByName(name) {
    return this.findMany({ where: { name: { contains: name, mode: 'insensitive' } }, orderBy: { name: 'asc' } });
  }

  async findByJobTitle(jobTitle) {
    return this.findMany({ where: { job_title: { contains: jobTitle, mode: 'insensitive' } }, orderBy: { name: 'asc' } });
  }

  async findAvailableForAcademy(academyId) {
    return this.findMany({ where: { academy_instructors: { none: { academy_id: academyId } } }, orderBy: { name: 'asc' } });
  }

  async findByAcademyId(academyId) {
    const academyInstructors = await this.prisma.academyInstructor.findMany({
      where: { academy_id: academyId },
      include: { instructor: true },
      orderBy: { instructor_order: 'asc' },
    });

    return academyInstructors.map((bi) => ({ ...bi.instructor, instructor_order: bi.instructor_order, academy_id: bi.academy_id }));
  }

  async findAcademiesByInstructorId(instructorId) {
    const academyInstructors = await this.prisma.academyInstructor.findMany({
      where: { instructor_id: instructorId },
      include: { academy: true },
      orderBy: { instructor_order: 'asc' },
    });

    return academyInstructors.map((bi) => ({ ...bi.academy, instructor_order: bi.instructor_order, instructor_id: bi.instructor_id }));
  }

  async findPopularInstructors(limit = 10) {
    return this.findMany({
      include: { academy_instructors: { include: { academy: { select: { id: true, title: true, status: true } } } } },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async getInstructorStats() {
    const [totalInstructors, instructorsWithAvatar, instructorsWithDescription, instructorsWithJobTitle, totalAcademyAssociations] =
      await Promise.all([
        this.count(),
        this.count({ where: { avatar_url: { not: null } } }),
        this.count({ where: { description: { not: null } } }),
        this.count({ where: { job_title: { not: null } } }),
        this.prisma.academyInstructor.count(),
      ]);

    const instructorWithMostAcademies = await this.prisma.instructor.findFirst({
      include: { academy_instructors: { include: { academy: { select: { title: true } } } } },
      orderBy: { created_at: 'desc' },
    });

    return {
      total_instructors: totalInstructors,
      instructors_with_avatar: instructorsWithAvatar,
      instructors_with_description: instructorsWithDescription,
      instructors_with_job_title: instructorsWithJobTitle,
      total_academy_associations: totalAcademyAssociations,
      profile_completion_rate:
        totalInstructors > 0
          ? Math.round(((instructorsWithAvatar + instructorsWithDescription + instructorsWithJobTitle) / (totalInstructors * 3)) * 100)
          : 0,
      most_active_instructor: instructorWithMostAcademies
        ? {
            name: instructorWithMostAcademies.name,
            academy_count: instructorWithMostAcademies.academy_instructors.length,
            academys: instructorWithMostAcademies.academy_instructors.map((bi) => bi.academy.title),
          }
        : null,
    };
  }

  async createInstructor(data) {
    const existingInstructor = await this.findFirst({ where: { name: data.name } });
    if (existingInstructor) {
      throw new Error('Instructor dengan nama tersebut sudah ada');
    }
    return this.create(data);
  }

  async updateInstructor(id, data) {
    const instructor = await this.findById(id);
    if (!instructor) {
      throw new Error('Instructor tidak ditemukan');
    }

    if (data.name && data.name !== instructor.name) {
      const existingInstructor = await this.findFirst({ where: { name: data.name, id: { not: id } } });
      if (existingInstructor) {
        throw new Error('Instructor dengan nama tersebut sudah ada');
      }
    }

    return this.update(id, data);
  }

  async deleteInstructor(id) {
    const instructor = await this.findById(id);
    if (!instructor) {
      throw new Error('Instructor tidak ditemukan');
    }

    const academyAssociations = await this.prisma.academyInstructor.count({ where: { instructor_id: id } });
    if (academyAssociations > 0) {
      throw new Error('Tidak dapat menghapus instructor yang masih di-assign ke academy. Hapus assignment terlebih dahulu.');
    }

    return this.delete(id);
  }
}

export const instructorRepository = new InstructorRepository();
