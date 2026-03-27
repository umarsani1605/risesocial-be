/**
 * RYLS (Rise Young Leaders Summit) registration seed data
 * Contains 7 registrations — mix of nationalities, scholarship types, and payment statuses.
 * Data is fictional but follows production patterns (international participants, real-world formats).
 *
 * Payment distribution:
 *   - PAYPAL PAID (with proof): registrations 1, 3, 6
 *   - MIDTRANS PAID:            registration 2
 *   - MIDTRANS PENDING:         registrations 4, 5, 7
 */

export const rylsRegistrations = [
  // 1. Taiwanese (also Taiwanese-Spanish), Spain — FULLY_FUNDED — PAYPAL PAID
  {
    full_name: 'Lin Wei Chen',
    email: 'linweichen92@gmail.com',
    residence: 'Spain, Barcelona',
    nationality: 'Taiwanese',
    second_nationality: 'Spanish',
    whatsapp: '+886908123456',
    institution: 'Soochow University / Ramon Llull University',
    date_of_birth: new Date('2002-10-16'),
    gender: 'FEMALE',
    discover_source: 'RISE_INSTAGRAM',
    discover_other_text: null,
    scholarship_type: 'FULLY_FUNDED',
    fully_funded: {},
    payment: {
      provider: 'PAYPAL',
      status: 'paid',
      amount: 249840,
      has_proof: true,
    },
  },

  // 2. Nepalese, Kathmandu — FULLY_FUNDED — MIDTRANS PAID
  {
    full_name: 'Arjun Shrestha',
    email: 'arjunshrestha99@gmail.com',
    residence: 'Kathmandu, Nepal',
    nationality: 'Nepalese',
    second_nationality: null,
    whatsapp: '+9779861234567',
    institution: 'Tribhuvan University',
    date_of_birth: new Date('2000-06-21'),
    gender: 'MALE',
    discover_source: 'RISE_INSTAGRAM',
    discover_other_text: null,
    scholarship_type: 'FULLY_FUNDED',
    fully_funded: {},
    payment: {
      provider: 'MIDTRANS',
      status: 'paid',
      amount: 249840,
      has_proof: false,
    },
  },

  // 3. Indian, Japan — FULLY_FUNDED — PAYPAL PAID
  {
    full_name: 'Priya Nair',
    email: 'priyanair2005@gmail.com',
    residence: 'Beppu City, Japan',
    nationality: 'Indian',
    second_nationality: null,
    whatsapp: '+818079123456',
    institution: 'Ritsumeikan Asia Pacific University',
    date_of_birth: new Date('2005-01-27'),
    gender: 'FEMALE',
    discover_source: 'FRIENDS',
    discover_other_text: null,
    scholarship_type: 'FULLY_FUNDED',
    fully_funded: {},
    payment: {
      provider: 'PAYPAL',
      status: 'paid',
      amount: 249840,
      has_proof: true,
    },
  },

  // 4. Indonesian, Manokwari — FULLY_FUNDED — MIDTRANS PENDING
  {
    full_name: 'Dewi Sekar Arum',
    email: 'dewisekararum02@gmail.com',
    residence: 'Manokwari, Indonesia',
    nationality: 'Indonesian',
    second_nationality: null,
    whatsapp: '+6281214123456',
    institution: 'Universitas Papua',
    date_of_birth: new Date('2002-06-15'),
    gender: 'FEMALE',
    discover_source: 'RISE_INSTAGRAM',
    discover_other_text: null,
    scholarship_type: 'FULLY_FUNDED',
    fully_funded: {},
    payment: {
      provider: 'MIDTRANS',
      status: 'pending',
      amount: 249840,
      has_proof: false,
    },
  },

  // 5. Cambodian, Phnom Penh — FULLY_FUNDED — MIDTRANS PENDING
  {
    full_name: 'Sovan Dara',
    email: 'sovandara02@gmail.com',
    residence: 'Phnom Penh, Cambodia',
    nationality: 'Cambodian',
    second_nationality: null,
    whatsapp: '+85560123456',
    institution: 'Royal University of Phnom Penh',
    date_of_birth: new Date('2002-02-15'),
    gender: 'MALE',
    discover_source: 'OTHER',
    discover_other_text: 'LinkedIn',
    scholarship_type: 'FULLY_FUNDED',
    fully_funded: {},
    payment: {
      provider: 'MIDTRANS',
      status: 'pending',
      amount: 249840,
      has_proof: false,
    },
  },

  // 6. Indonesian, Jakarta — SELF_FUNDED — PAYPAL PAID
  {
    full_name: 'Bagas Adi Nugroho',
    email: 'bagasadinugroho@gmail.com',
    residence: 'Jakarta, Indonesia',
    nationality: 'Indonesian',
    second_nationality: null,
    whatsapp: '+6281226123456',
    institution: 'Universitas Indonesia',
    date_of_birth: new Date('1994-02-20'),
    gender: 'MALE',
    discover_source: 'RISE_INSTAGRAM',
    discover_other_text: null,
    scholarship_type: 'SELF_FUNDED',
    self_funded: {
      passport_number: 'C12345678',
      need_visa: false,
      headshot_file_path: '/uploads/ryls/headshots/seed-headshot-1.jpg',
      read_policies: true,
    },
    payment: {
      provider: 'PAYPAL',
      status: 'paid',
      amount: 749840,
      has_proof: true,
    },
  },

  // 7. Indonesian, Surabaya — SELF_FUNDED — MIDTRANS PENDING
  {
    full_name: 'Fitri Rahmawati',
    email: 'fitrirahmawati04@gmail.com',
    residence: 'Surabaya, Indonesia',
    nationality: 'Indonesian',
    second_nationality: null,
    whatsapp: '+6281231123456',
    institution: 'Universitas Airlangga',
    date_of_birth: new Date('2004-09-24'),
    gender: 'FEMALE',
    discover_source: 'OTHER_INSTAGRAM',
    discover_other_text: null,
    scholarship_type: 'SELF_FUNDED',
    self_funded: {
      passport_number: 'D98765432',
      need_visa: true,
      headshot_file_path: '/uploads/ryls/headshots/seed-headshot-2.jpg',
      read_policies: true,
    },
    payment: {
      provider: 'MIDTRANS',
      status: 'pending',
      amount: 749840,
      has_proof: false,
    },
  },
];
