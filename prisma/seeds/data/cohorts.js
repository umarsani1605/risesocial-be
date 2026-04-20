/**
 * Cohort seed data generator
 * Accepts full academy objects (with instructors and topics) from the seeder.
 * - 1 cohort per academy, one per status
 *   academy[0] DRAFT    → cohort not_started
 *   academy[1] ACTIVE   → cohort ongoing
 *   academy[2] ARCHIVED → cohort completed
 * - Module count = total topics of parent academy (3 themes × 4 topics = 12 modules)
 * - Module titles = topic titles from academy
 * - Mentors = copied from academy instructors
 * - The ongoing cohort has one module currently live (module index 3)
 */

import { addDays, subDays, addWeeks } from 'date-fns';

const COHORT_STATUSES = ['not_started', 'ongoing', 'completed'];

/**
 * Generate all cohorts for the given academies
 * @param {Array} academies - Full academy objects with id, title, instructors, themes (with topics)
 * @returns {Array} Flat array of cohort objects with nested modules, attachments, mentors
 */
export function generateCohorts(academies) {
  return academies.map((academy, index) => {
    const status = COHORT_STATUSES[index] ?? 'not_started';
    const { startDate, endDate } = getCohortSchedule(status);

    const allTopics = academy.themes
      .sort((a, b) => a.order - b.order)
      .flatMap((theme) => theme.topics.sort((t1, t2) => t1.order - t2.order));

    return {
      academy_id: academy.id,
      name: 'Batch 1',
      description: buildCohortDescription(academy.title, status),
      status,
      start_date: startDate,
      end_date: endDate,
      modules: buildModules(allTopics, startDate, endDate, status),
      mentors: buildMentors(academy.instructors),
    };
  });
}

/**
 * Determine cohort dates based on status.
 */
function getCohortSchedule(status) {
  const now = new Date();

  if (status === 'completed') {
    return { startDate: subDays(now, 120), endDate: subDays(now, 50) };
  }

  if (status === 'ongoing') {
    return { startDate: subDays(now, 14), endDate: addWeeks(now, 8) };
  }

  // not_started
  return { startDate: addDays(now, 30), endDate: addWeeks(addDays(now, 30), 10) };
}

/**
 * Build module list with session times derived from academy topics.
 * For ongoing cohorts, module at index 3 is currently live.
 */
function buildModules(topics, cohortStart, cohortEnd, status) {
  const now = new Date();
  const totalMs = cohortEnd.getTime() - cohortStart.getTime();
  const intervalMs = totalMs / topics.length;

  return topics.map((topic, i) => {
    let sessionStart, sessionEnd;

    if (status === 'ongoing' && i === 3) {
      sessionStart = new Date(now.getTime() - 30 * 60 * 1000);
      sessionEnd = new Date(now.getTime() + 90 * 60 * 1000);
    } else {
      sessionStart = new Date(cohortStart.getTime() + i * intervalMs);
      sessionEnd = new Date(sessionStart.getTime() + 2 * 60 * 60 * 1000);
    }

    const isPublished = status === 'completed' || (status === 'ongoing' && i <= 4);

    return {
      title: topic.title,
      description: `Sesi mendalam membahas "${topic.title}" — mencakup teori, studi kasus, dan latihan praktis yang dapat langsung diterapkan.`,
      is_published: isPublished,
      session_start_time: sessionStart,
      session_end_time: sessionEnd,
      meeting_link: `https://zoom.us/j/9${String(topic.order).padStart(3, '0')}${String(i + 1).padStart(3, '0')}`,
      attendance_link: `https://forms.gle/attendance-${slugify(topic.title)}-${i + 1}`,
      assignment_link: i % 4 === 3 ? `https://classroom.google.com/c/assignment-${slugify(topic.title)}` : null,
      order: i + 1,
      attachments: buildAttachments(topic.title, i),
    };
  });
}

/**
 * Build 3 file attachments per module: PDF, XLSX, PPTX
 */
function buildAttachments(topicTitle, moduleIndex) {
  const slug = slugify(topicTitle);
  return [
    {
      type: 'file',
      label: `Slides: ${topicTitle}`,
      file_path: `/uploads/cohorts/${slug}-slides.pdf`,
      file_mime: 'application/pdf',
      file_size_kb: 800 + moduleIndex * 120,
      url: null,
      embed_provider: null,
      order: 1,
    },
    {
      type: 'file',
      label: `Worksheet: ${topicTitle}`,
      file_path: `/uploads/cohorts/${slug}-worksheet.xlsx`,
      file_mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      file_size_kb: 150 + moduleIndex * 30,
      url: null,
      embed_provider: null,
      order: 2,
    },
    {
      type: 'file',
      label: `Presentasi: ${topicTitle}`,
      file_path: `/uploads/cohorts/${slug}-presentation.pptx`,
      file_mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      file_size_kb: 2000 + moduleIndex * 250,
      url: null,
      embed_provider: null,
      order: 3,
    },
  ];
}

/**
 * Copy academy instructors as cohort mentors
 */
function buildMentors(instructors) {
  return instructors.map((instructor) => ({
    name: instructor.name,
    avatar: instructor.avatar_url,
    job_title: instructor.job_title,
  }));
}

function buildCohortDescription(academyTitle, status) {
  const statusDesc = {
    completed: 'Cohort ini telah berhasil diselesaikan.',
    ongoing: 'Cohort ini sedang berjalan — peserta aktif mengikuti sesi live dan mengerjakan tugas.',
    not_started: 'Cohort ini akan segera dibuka — daftarkan diri Anda sekarang untuk mendapatkan harga terbaik.',
  };
  return `Batch ke-1 dari program ${academyTitle}. ${statusDesc[status]}`;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}
