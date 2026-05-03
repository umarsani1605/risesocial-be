/**
 * RYLS (Rise Young Leaders Summit) registration seed data
 * 55 registrations — realistic international mix.
 *
 * Scholarship distribution (by index % 5):
 *   FULLY_FUNDED (0,1,2): 33 entries
 *   SELF_FUNDED  (3,4):   22 entries
 *
 * Payment distribution (by index % 10):
 *   MIDTRANS PAID  (0–3): 24 entries
 *   PAYPAL PAID    (4–5): 11 entries
 *   MIDTRANS PENDING(6–8):15 entries
 *   No payment     (9):    5 entries
 */

// [name, email, nationality, second_nationality, residence, institution, dob, gender, discover_source, discover_other_text, whatsapp]
const PEOPLE = [
  // === INDONESIAN (15) — index 0–14 ===
  ['Farhan Rizki', 'farhanrizki01@gmail.com', 'Indonesian', null, 'Jakarta, Indonesia', 'Universitas Indonesia', '2001-03-15', 'MALE', 'RISE_INSTAGRAM', null, '+6281234100001'],
  ['Nadira Kusuma', 'nadirakusuma99@gmail.com', 'Indonesian', null, 'Bandung, Indonesia', 'Institut Teknologi Bandung', '1999-07-22', 'FEMALE', 'FRIENDS', null, '+6281234100002'],
  ['Bagas Santoso', 'bagassantoso03@gmail.com', 'Indonesian', null, 'Yogyakarta, Indonesia', 'Universitas Gadjah Mada', '2003-11-08', 'MALE', 'OTHER_INSTAGRAM', null, '+6281234100003'],
  ['Citra Maharani', 'citramaharani02@gmail.com', 'Indonesian', null, 'Surabaya, Indonesia', 'Institut Teknologi Sepuluh Nopember', '2002-05-30', 'FEMALE', 'RISE_INSTAGRAM', null, '+6281234100004'],
  ['Reza Pratama', 'rezapratama00@gmail.com', 'Indonesian', null, 'Surabaya, Indonesia', 'Universitas Airlangga', '2000-09-14', 'MALE', 'RISE_INSTAGRAM', null, '+6281234100005'],
  ['Salma Azzahra', 'salmaazzahra03@gmail.com', 'Indonesian', null, 'Malang, Indonesia', 'Universitas Brawijaya', '2003-02-17', 'FEMALE', 'OTHER', 'TikTok', '+6281234100006'],
  ['Hafiz Ramadhan', 'hafizramadhan01@gmail.com', 'Indonesian', null, 'Semarang, Indonesia', 'Universitas Diponegoro', '2001-12-03', 'MALE', 'RISE_INSTAGRAM', null, '+6281234100007'],
  ['Tiara Wulandari', 'tiarawulandari02@gmail.com', 'Indonesian', null, 'Bandung, Indonesia', 'Universitas Padjadjaran', '2002-04-25', 'FEMALE', 'FRIENDS', null, '+6281234100008'],
  ['Dimas Nugraha', 'dimasnugraha00@gmail.com', 'Indonesian', null, 'Makassar, Indonesia', 'Universitas Hasanuddin', '2000-08-11', 'MALE', 'RISE_INSTAGRAM', null, '+6281234100009'],
  ['Rizky Aditya', 'rizkyaditya02@gmail.com', 'Indonesian', null, 'Denpasar, Indonesia', 'Universitas Udayana', '2002-01-28', 'MALE', 'OTHER_INSTAGRAM', null, '+6281234100010'],
  ['Nabila Rahayu', 'nabilarahayu01@gmail.com', 'Indonesian', null, 'Padang, Indonesia', 'Universitas Andalas', '2001-06-19', 'FEMALE', 'RISE_INSTAGRAM', null, '+6281234100011'],
  ['Gilang Permana', 'gilangpermana03@gmail.com', 'Indonesian', null, 'Palembang, Indonesia', 'Universitas Sriwijaya', '2003-10-07', 'MALE', 'FRIENDS', null, '+6281234100012'],
  ['Laras Setiawati', 'larassetiawati00@gmail.com', 'Indonesian', null, 'Banjarmasin, Indonesia', 'Universitas Lambung Mangkurat', '2000-03-22', 'FEMALE', 'RISE_INSTAGRAM', null, '+6281234100013'],
  ['Arief Wibowo', 'ariefwibowo01@gmail.com', 'Indonesian', null, 'Manado, Indonesia', 'Universitas Sam Ratulangi', '2001-07-16', 'MALE', 'OTHER', 'LinkedIn', '+6281234100014'],
  ['Intan Permatasari', 'intanpermatasari04@gmail.com', 'Indonesian', null, 'Jayapura, Indonesia', 'Universitas Cenderawasih', '2004-09-04', 'FEMALE', 'RISE_INSTAGRAM', null, '+6281234100015'],

  // === MALAYSIAN (5) — index 15–19 ===
  ['Ahmad Faizal', 'ahmadfaizal99@gmail.com', 'Malaysian', null, 'Kuala Lumpur, Malaysia', 'Universiti Malaya', '1999-11-20', 'MALE', 'RISE_INSTAGRAM', null, '+60112345001'],
  ['Nurul Aina', 'nurulaina01@gmail.com', 'Malaysian', null, 'Johor Bahru, Malaysia', 'Universiti Teknologi Malaysia', '2001-04-13', 'FEMALE', 'FRIENDS', null, '+60112345002'],
  ['Zheng Wei Lim', 'zhengweilim02@gmail.com', 'Malaysian', 'Singaporean', 'Serdang, Malaysia', 'Universiti Putra Malaysia', '2002-08-07', 'MALE', 'OTHER_INSTAGRAM', null, '+60112345003'],
  ['Siti Hazwani', 'sitihazwani00@gmail.com', 'Malaysian', null, 'Bangi, Malaysia', 'Universiti Kebangsaan Malaysia', '2000-12-29', 'FEMALE', 'RISE_INSTAGRAM', null, '+60112345004'],
  ['Haridas Krishnan', 'haridaskrishnan98@gmail.com', 'Malaysian', null, 'Penang, Malaysia', 'Universiti Sains Malaysia', '1998-06-02', 'MALE', 'FRIENDS', null, '+60112345005'],

  // === FILIPINO (5) — index 20–24 ===
  ['Maria Santos', 'mariasantos03@gmail.com', 'Filipino', null, 'Quezon City, Philippines', 'University of the Philippines Diliman', '2003-02-14', 'FEMALE', 'RISE_INSTAGRAM', null, '+639123456001'],
  ['Juan dela Cruz', 'juandelacruz01@gmail.com', 'Filipino', null, 'Manila, Philippines', 'Ateneo de Manila University', '2001-09-05', 'MALE', 'FRIENDS', null, '+639123456002'],
  ['Anna Reyes', 'annareyes02@gmail.com', 'Filipino', null, 'Manila, Philippines', 'De La Salle University', '2002-11-18', 'FEMALE', 'OTHER_INSTAGRAM', null, '+639123456003'],
  ['Carlo Villanueva', 'carlovillanueva00@gmail.com', 'Filipino', null, 'Manila, Philippines', 'University of Santo Tomas', '2000-07-23', 'MALE', 'RISE_INSTAGRAM', null, '+639123456004'],
  ['Bianca Gomez', 'biancagomez03@gmail.com', 'Filipino', null, 'Manila, Philippines', 'Mapua University', '2003-04-08', 'FEMALE', 'OTHER', 'Facebook Group', '+639123456005'],

  // === VIETNAMESE (3) — index 25–27 ===
  ['Nguyen Thi Hoa', 'nguyenthihoa02@gmail.com', 'Vietnamese', null, 'Hanoi, Vietnam', 'Vietnam National University', '2002-01-11', 'FEMALE', 'RISE_INSTAGRAM', null, '+84981234001'],
  ['Tran Minh Duc', 'tranminhduc01@gmail.com', 'Vietnamese', null, 'Ho Chi Minh City, Vietnam', 'Ho Chi Minh City University of Technology', '2001-06-30', 'MALE', 'OTHER_INSTAGRAM', null, '+84981234002'],
  ['Le Thi Thu', 'lethithu03@gmail.com', 'Vietnamese', null, 'Da Nang, Vietnam', 'University of Da Nang', '2003-10-24', 'FEMALE', 'FRIENDS', null, '+84981234003'],

  // === THAI (3) — index 28–30 ===
  ['Siriporn Thongchai', 'siripornthongchai01@gmail.com', 'Thai', null, 'Bangkok, Thailand', 'Chulalongkorn University', '2001-03-28', 'FEMALE', 'RISE_INSTAGRAM', null, '+66812345001'],
  ['Nattawut Srisuk', 'nattawasutsrisuk02@gmail.com', 'Thai', null, 'Nakhon Pathom, Thailand', 'Mahidol University', '2002-08-16', 'MALE', 'FRIENDS', null, '+66812345002'],
  ['Wanida Phommasak', 'wanidaphommasak00@gmail.com', 'Thai', null, 'Chiang Mai, Thailand', 'Chiang Mai University', '2000-12-05', 'FEMALE', 'OTHER_INSTAGRAM', null, '+66812345003'],

  // === INDIAN (5) — index 31–35 ===
  ['Ananya Gupta', 'ananyagupta02@gmail.com', 'Indian', null, 'Mumbai, India', 'University of Mumbai', '2002-05-09', 'FEMALE', 'RISE_INSTAGRAM', null, '+919876540001'],
  ['Rohan Mehta', 'rohanmehta01@gmail.com', 'Indian', null, 'New Delhi, India', 'Delhi University', '2001-02-22', 'MALE', 'FRIENDS', null, '+919876540002'],
  ['Kavya Nair', 'kavyanair03@gmail.com', 'Indian', null, 'Kolkata, India', 'Jadavpur University', '2003-07-14', 'FEMALE', 'OTHER_INSTAGRAM', null, '+919876540003'],
  ['Aditya Singh', 'adityasingh00@gmail.com', 'Indian', null, 'Noida, India', 'Amity University', '2000-11-01', 'MALE', 'RISE_INSTAGRAM', null, '+919876540004'],
  ['Shreya Iyer', 'shreyaiyer02@gmail.com', 'Indian', null, 'Bangalore, India', 'Christ University', '2002-09-17', 'FEMALE', 'OTHER', 'University Newsletter', '+919876540005'],

  // === NEPALESE (4) — index 36–39 ===
  ['Sanjay Thapa', 'sanjaythapa99@gmail.com', 'Nepalese', null, 'Kathmandu, Nepal', 'Tribhuvan University', '1999-04-03', 'MALE', 'RISE_INSTAGRAM', null, '+97798123400001'],
  ['Pooja Shrestha', 'poojashrestha01@gmail.com', 'Nepalese', null, 'Dhulikhel, Nepal', 'Kathmandu University', '2001-09-20', 'FEMALE', 'FRIENDS', null, '+97798123400002'],
  ['Bikas Rai', 'bikasrai02@gmail.com', 'Nepalese', null, 'Pokhara, Nepal', 'Pokhara University', '2002-12-11', 'MALE', 'OTHER_INSTAGRAM', null, '+97798123400003'],
  ['Sunita Tamang', 'sunitatamang00@gmail.com', 'Nepalese', null, 'Kathmandu, Nepal', 'Tribhuvan University', '2000-06-08', 'FEMALE', 'RISE_INSTAGRAM', null, '+97798123400004'],

  // === BANGLADESHI (2) — index 40–41 ===
  ['Md. Rakibul Islam', 'mdrakibulislam01@gmail.com', 'Bangladeshi', null, 'Dhaka, Bangladesh', 'University of Dhaka', '2001-03-27', 'MALE', 'RISE_INSTAGRAM', null, '+880181234001'],
  ['Farzana Akhter', 'farzanaakhter02@gmail.com', 'Bangladeshi', null, 'Dhaka, Bangladesh', 'Bangladesh Univ of Engineering and Technology', '2002-10-15', 'FEMALE', 'FRIENDS', null, '+880181234002'],

  // === PAKISTANI (2) — index 42–43 ===
  ['Hamza Malik', 'hamzamalik00@gmail.com', 'Pakistani', null, 'Lahore, Pakistan', 'Lahore Univ of Management Sciences', '2000-08-19', 'MALE', 'OTHER_INSTAGRAM', null, '+92301234001'],
  ['Fatima Zahra', 'fatimazahra03@gmail.com', 'Pakistani', null, 'Islamabad, Pakistan', 'National Univ of Sciences and Technology', '2003-01-04', 'FEMALE', 'RISE_INSTAGRAM', null, '+92301234002'],

  // === SOUTH KOREAN (3) — index 44–46 ===
  ['Park Jiyeon', 'parkjiyeon01@gmail.com', 'South Korean', null, 'Seoul, South Korea', 'Seoul National University', '2001-07-08', 'FEMALE', 'FRIENDS', null, '+821012340001'],
  ['Kim Seojun', 'kimseojun02@gmail.com', 'South Korean', null, 'Seoul, South Korea', 'Yonsei University', '2002-11-22', 'MALE', 'RISE_INSTAGRAM', null, '+821012340002'],
  ['Choi Yuna', 'choiyuna00@gmail.com', 'South Korean', null, 'Daejeon, South Korea', 'KAIST', '2000-04-17', 'FEMALE', 'OTHER_INSTAGRAM', null, '+821012340003'],

  // === JAPANESE (2) — index 47–48 ===
  ['Tanaka Yuki', 'tanakayuki03@gmail.com', 'Japanese', null, 'Tokyo, Japan', 'Waseda University', '2003-02-26', 'FEMALE', 'RISE_INSTAGRAM', null, '+819012340001'],
  ['Yamamoto Kenji', 'yamamotokenji01@gmail.com', 'Japanese', null, 'Tokyo, Japan', 'Keio University', '2001-06-13', 'MALE', 'FRIENDS', null, '+819012340002'],

  // === TAIWANESE (1) — index 49 ===
  ['Chen Mingzhi', 'chenmingzhi02@gmail.com', 'Taiwanese', null, 'Taipei, Taiwan', 'National Taiwan University', '2002-09-01', 'MALE', 'RISE_INSTAGRAM', null, '+886912340001'],

  // === CAMBODIAN (2) — index 50–51 ===
  ['Phally Sok', 'phallysok03@gmail.com', 'Cambodian', null, 'Phnom Penh, Cambodia', 'Royal University of Phnom Penh', '2003-05-18', 'FEMALE', 'OTHER_INSTAGRAM', null, '+85512340001'],
  ['Bunthoeurn Chea', 'bunthoeurnchea01@gmail.com', 'Cambodian', null, 'Phnom Penh, Cambodia', 'Univ of Management and Economics', '2001-12-07', 'MALE', 'FRIENDS', null, '+85512340002'],

  // === NIGERIAN (1) — index 52 ===
  ['Oluwaseun Adeyemi', 'oluwaseunadeyemi00@gmail.com', 'Nigerian', null, 'Lagos, Nigeria', 'University of Lagos', '2000-10-30', 'MALE', 'RISE_INSTAGRAM', null, '+234812340001'],

  // === GHANAIAN (1) — index 53 ===
  ['Akosua Mensah', 'akosuamensah02@gmail.com', 'Ghanaian', null, 'Accra, Ghana', 'University of Ghana', '2002-03-12', 'FEMALE', 'OTHER', 'Campus Poster', '+233242340001'],

  // === KENYAN (1) — index 54 ===
  ['Wanjiru Mwangi', 'wanjirimwangi01@gmail.com', 'Kenyan', null, 'Nairobi, Kenya', 'University of Nairobi', '2001-08-24', 'FEMALE', 'FRIENDS', null, '+254712340001'],
];

// Fixed seed date for deterministic created_at values
const SEED_DATE = new Date('2026-05-01T00:00:00.000Z');

function buildRegistration(person, i) {
  const [fullName, email, nationality, secondNationality, residence, institution, dob, gender, discoverSource, discoverOtherText, whatsapp] = person;

  // Spread 55 entries evenly over the last 5 months (150 days): oldest first, newest last
  const daysBack = Math.round((PEOPLE.length - 1 - i) * (150 / (PEOPLE.length - 1)));
  const createdAt = new Date(SEED_DATE.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const scholarshipType = i % 5 < 3 ? 'FULLY_FUNDED' : 'SELF_FUNDED';
  const amount = scholarshipType === 'SELF_FUNDED' ? 749840 : 249840;

  const payMode = i % 10;
  let payment = null;
  if (payMode < 4) {
    payment = { provider: 'MIDTRANS', status: 'paid', amount, has_proof: false };
  } else if (payMode < 6) {
    payment = { provider: 'PAYPAL', status: 'paid', amount, has_proof: true };
  } else if (payMode < 9) {
    payment = { provider: 'MIDTRANS', status: 'pending', amount, has_proof: false };
  }
  // payMode === 9: null (no payment yet)

  const fullyFunded = scholarshipType === 'FULLY_FUNDED' ? {} : undefined;
  const selfFunded =
    scholarshipType === 'SELF_FUNDED'
      ? {
          passport_number: `${String.fromCharCode(65 + (i % 26))}${String(i + 10000000).slice(1)}`,
          need_visa: i % 3 !== 0,
          headshot_file_path: `/uploads/ryls/headshots/seed-headshot-sf-${i + 1}.jpg`,
          read_policies: true,
        }
      : undefined;

  return {
    full_name: fullName,
    email,
    residence,
    nationality,
    second_nationality: secondNationality,
    whatsapp,
    institution,
    date_of_birth: new Date(dob),
    gender,
    discover_source: discoverSource,
    discover_other_text: discoverOtherText,
    scholarship_type: scholarshipType,
    created_at: createdAt,
    fully_funded: fullyFunded,
    self_funded: selfFunded,
    payment,
  };
}

export const rylsRegistrations = PEOPLE.map(buildRegistration);
