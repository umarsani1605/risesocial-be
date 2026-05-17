/**
 * RYLS draft registration seed data — 225 records.
 *
 * Step distribution:
 *   Step 1 (i < 90):   90 drafts — basic personal info, no scholarship yet
 *   Step 2 (90–169):   80 drafts — full info + scholarship type chosen
 *   Step 3 (170–224):  55 drafts — form complete, not yet submitted
 *
 * Scholarship type (step 2+):
 *   FULLY_FUNDED: even index
 *   SELF_FUNDED:  odd index
 *
 * Persistence:
 *   Drafts do not expire and remain available until submitted or deleted.
 */

const NATIONALITY_POOL = [
  ['Indonesian', 'Universitas Indonesia', 'Jakarta, Indonesia'],
  ['Indonesian', 'Institut Teknologi Bandung', 'Bandung, Indonesia'],
  ['Indonesian', 'Universitas Gadjah Mada', 'Yogyakarta, Indonesia'],
  ['Indonesian', 'Institut Teknologi Sepuluh Nopember', 'Surabaya, Indonesia'],
  ['Indonesian', 'Universitas Airlangga', 'Surabaya, Indonesia'],
  ['Indonesian', 'Universitas Brawijaya', 'Malang, Indonesia'],
  ['Indonesian', 'Universitas Diponegoro', 'Semarang, Indonesia'],
  ['Malaysian', 'Universiti Malaya', 'Kuala Lumpur, Malaysia'],
  ['Malaysian', 'Universiti Teknologi Malaysia', 'Johor Bahru, Malaysia'],
  ['Filipino', 'University of the Philippines Diliman', 'Quezon City, Philippines'],
  ['Filipino', 'Ateneo de Manila University', 'Manila, Philippines'],
  ['Vietnamese', 'Vietnam National University', 'Hanoi, Vietnam'],
  ['Thai', 'Chulalongkorn University', 'Bangkok, Thailand'],
  ['Indian', 'University of Mumbai', 'Mumbai, India'],
  ['Indian', 'Delhi University', 'New Delhi, India'],
  ['Nepalese', 'Tribhuvan University', 'Kathmandu, Nepal'],
  ['Bangladeshi', 'University of Dhaka', 'Dhaka, Bangladesh'],
  ['South Korean', 'Seoul National University', 'Seoul, South Korea'],
  ['Japanese', 'Waseda University', 'Tokyo, Japan'],
  ['Pakistani', 'Lahore Univ of Management Sciences', 'Lahore, Pakistan'],
];

const FIRST_NAMES = [
  'Ahmad', 'Siti', 'Budi', 'Dewi', 'Rizky', 'Nurul', 'Eko', 'Fitri',
  'Hendra', 'Ika', 'Joko', 'Karina', 'Lukman', 'Maya', 'Nanda',
  'Panji', 'Ratna', 'Sigit', 'Tika', 'Umar', 'Vera', 'Wahyu',
  'Yuni', 'Zain', 'Amir', 'Bella', 'Carlo', 'Diana', 'Eko', 'Fia',
];

const LAST_NAMES = [
  'Santoso', 'Kusuma', 'Pratama', 'Rahman', 'Wijaya',
  'Susanto', 'Putri', 'Nugroho', 'Rahayu', 'Permana',
  'Wibowo', 'Handoko', 'Setiawan', 'Cahyadi', 'Firmansyah',
  'Gunawan', 'Hartono', 'Irawan', 'Juliana', 'Kristianto',
];

const DISCOVER_SOURCES = ['RISE_INSTAGRAM', 'RISE_INSTAGRAM', 'FRIENDS', 'OTHER_INSTAGRAM', 'OTHER'];
const DISCOVER_OTHERS = ['LinkedIn', 'TikTok', 'Campus Poster', 'Twitter'];
const GENDERS = ['MALE', 'FEMALE', 'FEMALE', 'MALE', 'PREFER_NOT_TO_SAY'];

// Fixed seed date for deterministic created_at values
const SEED_DATE = new Date('2026-05-01T00:00:00.000Z');

function makeToken(i) {
  // Produces a unique 64-char hex-like string for each index (0–255 safe)
  return i.toString(16).padStart(4, '0').repeat(16);
}

function generateDraft(i) {
  const [nationality, institution, residence] = NATIONALITY_POOL[i % NATIONALITY_POOL.length];
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
  const fullName = `${firstName} ${lastName}`;
  const email = `draft.ryls.${i + 1}@example.com`;
  const gender = GENDERS[i % GENDERS.length];
  const year = 1997 + (i % 10);
  const month = String((i % 12) + 1).padStart(2, '0');
  const day = String((i % 28) + 1).padStart(2, '0');
  const dob = `${year}-${month}-${day}`;
  const discoverSrc = DISCOVER_SOURCES[i % DISCOVER_SOURCES.length];
  const discoverOther = discoverSrc === 'OTHER' ? DISCOVER_OTHERS[i % DISCOVER_OTHERS.length] : null;
  const whatsapp = `+628${String(12000000000 + i).slice(-10)}`;

  const step = i < 90 ? 1 : i < 170 ? 2 : 3;
  const scholarshipType = step === 1 ? null : i % 2 === 0 ? 'FULLY_FUNDED' : 'SELF_FUNDED';

  // Spread 225 drafts over last 7 months (210 days): oldest first, newest last
  const daysBackCreated = Math.round((224 - i) * (210 / 224));
  const createdAt = new Date(SEED_DATE.getTime() - daysBackCreated * 24 * 60 * 60 * 1000);

  const step1Data = {
    full_name: fullName,
    residence,
    nationality,
    second_nationality: null,
    gender,
    date_of_birth: dob,
    discover_source: discoverSrc,
    discover_other_text: discoverOther,
  };

  let formData = { ...step1Data };
  if (step >= 2) {
    formData = { ...formData, whatsapp, institution, scholarship_type: scholarshipType };
  }
  if (step === 3 && scholarshipType === 'SELF_FUNDED') {
    formData = {
      ...formData,
      passport_number: `${String.fromCharCode(65 + (i % 26))}${String(i + 10000000).slice(1)}`,
      need_visa: i % 2 === 0,
      read_policies: true,
    };
  }

  return {
    email,
    resume_token: makeToken(i),
    current_step: step,
    form_data: formData,
    scholarship_type: scholarshipType,
    created_at: createdAt,
  };
}

export const rylsDrafts = Array.from({ length: 225 }, (_, i) => generateDraft(i));
