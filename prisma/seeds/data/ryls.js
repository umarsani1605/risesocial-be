/**
 * RYLS (Rise Young Leaders Summit) registration seed data
 * Contains 5 registrations with mix of fully funded and self funded scholarships
 */

export const rylsRegistrations = [
  {
    full_name: 'Andi Pratama',
    email: 'andi.pratama@example.com',
    residence: 'Jakarta, Indonesia',
    nationality: 'Indonesian',
    whatsapp: '+62-812-3456-7890',
    institution: 'Universitas Indonesia',
    date_of_birth: new Date('2002-05-15'),
    gender: 'MALE',
    discover_source: 'RISE_INSTAGRAM',
    scholarship_type: 'FULLY_FUNDED',
    fully_funded: {
      essay_topic: 'How can young leaders drive sustainable development in Indonesia?',
      essay_description:
        'In this essay, I explore the critical role that young leaders play in advancing sustainable development goals in Indonesia. I discuss innovative approaches to environmental conservation, social entrepreneurship, and community empowerment that can create lasting positive impact.',
      essay_file_path: '/uploads/ryls/essays/andi-pratama-essay.pdf',
    },
  },
  {
    full_name: 'Siti Rahma',
    email: 'siti.rahma@example.com',
    residence: 'Bandung, Indonesia',
    nationality: 'Indonesian',
    whatsapp: '+62-813-4567-8901',
    institution: 'Institut Teknologi Bandung',
    date_of_birth: new Date('2001-08-22'),
    gender: 'FEMALE',
    discover_source: 'FRIENDS',
    scholarship_type: 'SELF_FUNDED',
    self_funded: {
      passport_number: 'A12345678',
      need_visa: false,
      headshot_file_path: '/uploads/ryls/headshots/siti-rahma-headshot.jpg',
      read_policies: true,
    },
  },
  {
    full_name: 'Budi Setiawan',
    email: 'budi.setiawan@example.com',
    residence: 'Surabaya, Indonesia',
    nationality: 'Indonesian',
    whatsapp: '+62-814-5678-9012',
    institution: 'Universitas Airlangga',
    date_of_birth: new Date('2003-03-10'),
    gender: 'MALE',
    discover_source: 'OTHER_INSTAGRAM',
    scholarship_type: 'FULLY_FUNDED',
    fully_funded: {
      essay_topic: 'The role of technology in empowering rural communities',
      essay_description:
        'This essay examines how digital technologies and innovative solutions can bridge the urban-rural divide in Indonesia. I present case studies of successful technology interventions in agriculture, education, and healthcare that have transformed rural livelihoods.',
      essay_file_path: '/uploads/ryls/essays/budi-setiawan-essay.pdf',
    },
  },
  {
    full_name: 'Maya Kusuma',
    email: 'maya.kusuma@example.com',
    residence: 'Yogyakarta, Indonesia',
    nationality: 'Indonesian',
    whatsapp: '+62-815-6789-0123',
    institution: 'Universitas Gadjah Mada',
    date_of_birth: new Date('2002-11-30'),
    gender: 'FEMALE',
    discover_source: 'RISE_INSTAGRAM',
    scholarship_type: 'SELF_FUNDED',
    self_funded: {
      passport_number: 'B98765432',
      need_visa: false,
      headshot_file_path: '/uploads/ryls/headshots/maya-kusuma-headshot.jpg',
      read_policies: true,
    },
  },
  {
    full_name: 'Rizki Firmansyah',
    email: 'rizki.firmansyah@example.com',
    residence: 'Semarang, Indonesia',
    nationality: 'Indonesian',
    whatsapp: '+62-816-7890-1234',
    institution: 'Universitas Diponegoro',
    date_of_birth: new Date('2001-07-18'),
    gender: 'MALE',
    discover_source: 'OTHER',
    scholarship_type: 'FULLY_FUNDED',
    fully_funded: {
      essay_topic: 'Building inclusive economies through social entrepreneurship',
      essay_description:
        'My essay explores how social entrepreneurship can address inequality and create inclusive economic opportunities in Indonesia. I analyze successful social enterprises and propose frameworks for scaling impact while maintaining financial sustainability.',
      essay_file_path: '/uploads/ryls/essays/rizki-firmansyah-essay.pdf',
    },
  },
];
