/**
 * Academy seed data — 3 ESG/sustainability-domain academies, one per status
 * [0] DRAFT   — Carbon Accounting & GHG Management
 * [1] ACTIVE  — ESG Integration for Financial Professionals
 * [2] ARCHIVED — Sustainability Reporting Masterclass
 *
 * Each: 2 pricing tiers, 4 features, 3 themes × 4 topics = 12 topics, 3 instructors, 3 testimonials, 5 FAQs
 */
export const academies = [
  // ── ACADEMY 1 — DRAFT ──────────────────────────────────────────────────────
  {
    title: 'Carbon Accounting & GHG Management Masterclass',
    slug: 'carbon-accounting-ghg-management',
    description:
      'Program intensif 8 minggu ini dirancang untuk para profesional yang ingin memahami dan menguasai prinsip-prinsip akuntansi karbon, mulai dari GHG Protocol Corporate Standard, klasifikasi emisi Scope 1–3, hingga penyusunan inventori GRK dan pengungkapan CDP serta TCFD — dilengkapi dengan latihan langsung menggunakan data perusahaan nyata dan sesi verifikasi oleh auditor bersertifikat.',
    duration: '8 Minggu',
    format: 'Online Live Sessions',
    category: 'Sustainability',
    image_url: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800',
    certificate: true,
    portfolio: false,
    status: 'DRAFT',
    pricing: [
      { name: 'Early Bird', original_price: 2500000, discount_price: 1750000, order: 1 },
      { name: 'Standard', original_price: 2500000, discount_price: 2500000, order: 2 },
    ],
    features: [
      { title: 'Live Session dengan Auditor Karbon Bersertifikat', description: 'Belajar langsung dari praktisi yang telah memverifikasi laporan GRK perusahaan publik.', icon: 'leaf', order: 1 },
      { title: 'Latihan Inventori GRK dengan Data Nyata', description: 'Praktik menghitung emisi menggunakan data aktivitas dari sektor energi, manufaktur, dan transportasi.', icon: 'calculator', order: 2 },
      { title: 'Panduan CDP & TCFD Disclosure', description: 'Simulasi pengisian kuesioner CDP dan penyusunan laporan TCFD siap audit.', icon: 'file-text', order: 3 },
      { title: 'Sertifikat Internasional', description: 'Sertifikat penyelesaian program yang diakui oleh mitra korporat Rise Social.', icon: 'certificate', order: 4 },
    ],
    themes: [
      {
        title: 'Fondasi GHG Protocol',
        description: 'Memahami standar akuntansi GRK yang menjadi acuan global.',
        order: 1,
        topics: [
          { title: 'Perubahan Iklim & Pasar Karbon: Konteks Global', description: 'Tinjauan krisis iklim, mekanisme pasar karbon, dan peran akuntansi karbon.', order: 1 },
          { title: 'GHG Protocol Corporate Standard: Ikhtisar', description: 'Struktur, prinsip, dan ruang lingkup GHG Protocol Corporate Standard.', order: 2 },
          { title: 'Klasifikasi Emisi: Scope 1, 2, dan 3', description: 'Definisi, contoh, dan cara mengidentifikasi emisi di tiap scope.', order: 3 },
          { title: 'Penetapan Batas Organisasi & Operasional', description: 'Pendekatan equity share vs. control dalam mendefinisikan batas perusahaan.', order: 4 },
        ],
      },
      {
        title: 'Inventori & Pengukuran GRK',
        description: 'Metodologi pengumpulan data dan penghitungan emisi secara akurat.',
        order: 2,
        topics: [
          { title: 'Metode Pengumpulan Data Aktivitas', description: 'Sumber data, hierarki kualitas, dan teknik estimasi untuk inventori GRK.', order: 1 },
          { title: 'Faktor Emisi & Pendekatan Perhitungan', description: 'Faktor emisi IPCC, UNFCCC, dan sumber nasional; pendekatan tier 1–3.', order: 2 },
          { title: 'Penilaian Ketidakpastian & Quality Assurance', description: 'Teknik QA/QC, propagasi error, dan dokumentasi inventori.', order: 3 },
          { title: 'Software Tools untuk Inventori GRK', description: 'Demo dan latihan menggunakan tools: SimaPro, GHG Manager, dan Excel-based calculator.', order: 4 },
        ],
      },
      {
        title: 'Pelaporan & Pengungkapan Karbon',
        description: 'Menyiapkan laporan yang memenuhi standar CDP, TCFD, dan SBTi.',
        order: 3,
        topics: [
          { title: 'CDP Questionnaire Walkthrough', description: 'Panduan lengkap mengisi kuesioner CDP Climate Change dari awal hingga submission.', order: 1 },
          { title: 'Kerangka TCFD & Pengungkapan Risiko Iklim', description: 'Empat pilar TCFD dan cara mengintegrasikan risiko iklim dalam laporan keuangan.', order: 2 },
          { title: 'SBTi dan Penetapan Target Net Zero', description: 'Metodologi Science Based Targets dan cara menghitung jalur penurunan emisi.', order: 3 },
          { title: 'Verifikasi & Asuransi Pihak Ketiga', description: 'Proses verifikasi eksternal, standar ISO 14064-3, dan memilih verifier yang tepat.', order: 4 },
        ],
      },
    ],
    instructors: [
      { name: 'Dr. Amelia Hartono', job_title: 'Senior Carbon Accounting Expert, KPMG ESG Advisory', avatar_url: 'https://i.pravatar.cc/150?img=47', description: 'Doktor Teknik Lingkungan dengan 12 tahun pengalaman dalam verifikasi GRK perusahaan multinasional.', order: 1 },
      { name: 'Reza Firmansyah', job_title: 'GHG Verification Lead, Bureau Veritas Indonesia', avatar_url: 'https://i.pravatar.cc/150?img=12', description: 'Auditor GRK bersertifikat ISO 14064 dengan portofolio verifikasi lebih dari 50 perusahaan.', order: 2 },
      { name: 'Lisa Tan', job_title: 'Climate Risk & TCFD Specialist, Swiss Re Asia', avatar_url: 'https://i.pravatar.cc/150?img=44', description: 'Spesialis integrasi risiko iklim dalam model keuangan dan pelaporan TCFD.', order: 3 },
    ],
    testimonials: [
      { name: 'Eko Pradipta', avatar_url: 'https://i.pravatar.cc/150?img=15', comment: 'Materi CDP walkthrough sangat praktis — saya langsung bisa menerapkannya untuk submission perusahaan kami tahun ini.', order: 1 },
      { name: 'Fitri Handayani', avatar_url: 'https://i.pravatar.cc/150?img=32', comment: 'Instruktur sangat berpengalaman dan sabar menjelaskan perbedaan Scope 1, 2, dan 3 dengan contoh nyata.', order: 2 },
      { name: 'Gunawan Setiadi', avatar_url: 'https://i.pravatar.cc/150?img=18', comment: 'Program terbaik untuk memulai karir di bidang carbon accounting. Sangat direkomendasikan!', order: 3 },
    ],
    faqs: [
      { question: 'Apakah ada prasyarat untuk mengikuti program ini?', answer: 'Tidak ada prasyarat khusus. Program ini dirancang untuk pemula hingga profesional berpengalaman yang ingin memformalkan pengetahuan mereka.', order: 1 },
      { question: 'Berapa lama akses ke materi setelah program selesai?', answer: 'Peserta mendapatkan akses seumur hidup ke semua rekaman sesi dan materi pendukung.', order: 2 },
      { question: 'Apakah sertifikat ini diakui secara internasional?', answer: 'Sertifikat Rise Social diakui oleh mitra korporat kami dan dapat dilampirkan sebagai bukti pengembangan profesional dalam portofolio CDP atau laporan ESG.', order: 3 },
      { question: 'Bagaimana format sesi live-nya?', answer: 'Setiap sesi live berlangsung 2 jam via Zoom, terdiri dari 90 menit materi dan 30 menit tanya jawab interaktif.', order: 4 },
      { question: 'Apakah ada tugas atau proyek akhir?', answer: 'Ya, peserta diminta menyusun inventori GRK mini untuk sebuah studi kasus perusahaan sebagai syarat kelulusan.', order: 5 },
    ],
  },

  // ── ACADEMY 2 — ACTIVE ─────────────────────────────────────────────────────
  {
    title: 'ESG Integration for Financial Professionals',
    slug: 'esg-integration-financial-professionals',
    description:
      'Program 6 minggu ini membekali analis investasi, manajer portofolio, dan bankir dengan kemampuan mengintegrasikan faktor ESG ke dalam proses pengambilan keputusan investasi — mulai dari membaca rating MSCI dan Sustainalytics, melakukan ESG screening pada portofolio, memahami regulasi SFDR dan OJK Green Finance, hingga menyusun laporan ESG tingkat fund sesuai standar ISSB/IFRS S1 & S2.',
    duration: '6 Minggu',
    format: 'Online Self-Paced + Live Q&A Mingguan',
    category: 'Finance & Sustainability',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    certificate: true,
    portfolio: true,
    status: 'ACTIVE',
    pricing: [
      { name: 'Early Bird', original_price: 1800000, discount_price: 1200000, order: 1 },
      { name: 'Standard', original_price: 1800000, discount_price: 1800000, order: 2 },
    ],
    features: [
      { title: 'Data ESG dari MSCI, Sustainalytics & Bloomberg', description: 'Akses data platform ESG terkemuka dan latihan interpretasi rating untuk saham dan obligasi.', icon: 'chart-bar', order: 1 },
      { title: 'Workshop Screening & Integrasi Portofolio', description: 'Latihan hands-on membangun portofolio ESG-integrated menggunakan dataset nyata.', icon: 'briefcase', order: 2 },
      { title: 'Lanskap Regulasi: EU SFDR & OJK Keuangan Berkelanjutan', description: 'Panduan compliance untuk manajer investasi beroperasi di Indonesia dan pasar global.', icon: 'scales', order: 3 },
      { title: 'Peer Learning dengan Profesional Investasi', description: 'Jaringan eksklusif bersama manajer portofolio, analis kredit, dan bankir investasi.', icon: 'network', order: 4 },
    ],
    themes: [
      {
        title: 'ESG Fundamentals for Investors',
        description: 'Landasan konseptual ESG dalam konteks investasi dan pasar keuangan.',
        order: 1,
        topics: [
          { title: 'Pengantar ESG: Sejarah, Pendorong & Momentum Pasar', description: 'Evolusi ESG dari SRI hingga mainstream, katalis regulasi, dan tren investor institusional.', order: 1 },
          { title: 'Metodologi Rating ESG: MSCI, S&P, Sustainalytics', description: 'Perbandingan metodologi, divergensi rating, dan implikasi bagi investor.', order: 2 },
          { title: 'Material ESG Issues by Sector (SASB Materiality Map)', description: 'Isu ESG yang secara finansial material untuk 77 industri SASB.', order: 3 },
          { title: 'Sumber Data ESG: Bloomberg, Refinitiv, CDP', description: 'Cara mengakses, membaca, dan memvalidasi data ESG dari berbagai provider.', order: 4 },
        ],
      },
      {
        title: 'ESG Investment Strategies',
        description: 'Strategi dan pendekatan investasi berbasis ESG dari screening hingga engagement.',
        order: 2,
        topics: [
          { title: 'Negative Screening & Exclusionary Policies', description: 'Implementasi daftar eksklusif (tembakau, senjata, batu bara) dan implikasi kinerja.', order: 1 },
          { title: 'ESG Integration dalam Analisis Fundamental', description: 'Memasukkan risiko dan peluang ESG ke dalam model DCF dan credit assessment.', order: 2 },
          { title: 'Impact Investing & Thematic Funds', description: 'SDG-aligned funds, green bonds, dan cara mengukur impact secara kuantitatif.', order: 3 },
          { title: 'Engagement & Active Ownership', description: 'Strategi votasi, dialog dengan manajemen, dan kolaborasi investor (CA100+).', order: 4 },
        ],
      },
      {
        title: 'Regulation & ESG Reporting',
        description: 'Kerangka regulasi dan standar pelaporan ESG di tingkat global dan Indonesia.',
        order: 3,
        topics: [
          { title: 'EU Taxonomy & Sustainable Finance Disclosure Regulation (SFDR)', description: 'Klasifikasi aktivitas berkelanjutan EU dan kewajiban disclosure Level 1 & 2.', order: 1 },
          { title: 'OJK Roadmap Keuangan Berkelanjutan Indonesia', description: 'POJK 51/2017, taksonomi hijau Indonesia, dan rencana aksi OJK 2021–2025.', order: 2 },
          { title: 'ISSB / IFRS S1 & S2 Standards', description: 'Standar baru ISSB untuk general sustainability dan climate disclosure — timeline implementasi.', order: 3 },
          { title: 'Fund-Level ESG Reporting & Disclosure', description: 'Menyusun laporan ESG untuk reksa dana, PE fund, dan produk investasi lainnya.', order: 4 },
        ],
      },
    ],
    instructors: [
      { name: 'Taufiq Hidayat', job_title: 'ESG Portfolio Manager, Mandiri Investment Management', avatar_url: 'https://i.pravatar.cc/150?img=11', description: 'Manajer portofolio ESG-integrated dengan AUM lebih dari Rp 5 triliun dan pengalaman 10 tahun di pasar modal Indonesia.', order: 1 },
      { name: 'Stefanie Kurz', job_title: 'ESG Research Analyst, MSCI', avatar_url: 'https://i.pravatar.cc/150?img=49', description: 'Analis MSCI yang berspesialisasi dalam metodologi rating ESG untuk pasar Asia Tenggara.', order: 2 },
      { name: 'Irwan Santoso', job_title: 'Sustainable Finance Lead, OJK Indonesia', avatar_url: 'https://i.pravatar.cc/150?img=13', description: 'Praktisi regulasi keuangan berkelanjutan dengan pengalaman langsung dalam penyusunan regulasi OJK.', order: 3 },
    ],
    testimonials: [
      { name: 'Hana Permata', avatar_url: 'https://i.pravatar.cc/150?img=38', comment: 'Sesi tentang SFDR dan OJK sangat membantu — saya akhirnya paham perbedaan keduanya dan implikasinya bagi portofolio kami.', order: 1 },
      { name: 'Kevin Sutrisno', avatar_url: 'https://i.pravatar.cc/150?img=7', comment: 'Workshop screening portofolio menggunakan data Bloomberg yang nyata adalah pengalaman yang sangat berharga.', order: 2 },
      { name: 'Ratna Dewi', avatar_url: 'https://i.pravatar.cc/150?img=35', comment: 'Instruktur dari OJK memberikan perspektif regulasi yang tidak bisa ditemukan di tempat lain.', order: 3 },
    ],
    faqs: [
      { question: 'Apakah program ini cocok untuk fresh graduate?', answer: 'Program ini lebih cocok untuk mereka yang sudah memiliki dasar di bidang keuangan atau investasi. Fresh graduate dengan background ekonomi/keuangan dapat mengikuti, namun disarankan untuk mempelajari konsep dasar investasi terlebih dahulu.', order: 1 },
      { question: 'Apakah tersedia akses ke platform data ESG (Bloomberg, MSCI)?', answer: 'Ya, peserta mendapat akses terbatas ke demo environment Bloomberg dan MSCI selama durasi program.', order: 2 },
      { question: 'Berapa kali sesi live Q&A per minggu?', answer: 'Satu sesi live Q&A per minggu selama 90 menit, plus sesi tambahan menjelang tenggat proyek akhir.', order: 3 },
      { question: 'Apakah ada proyek akhir?', answer: 'Ya, peserta diminta menyusun ESG brief untuk satu emiten Indonesia sebagai portofolio presentasi.', order: 4 },
      { question: 'Bagaimana mekanisme corporate bundle?', answer: 'Corporate bundle memungkinkan 5 kursi dengan satu invoice perusahaan. Hubungi tim kami untuk onboarding khusus.', order: 5 },
    ],
  },

  // ── ACADEMY 3 — ARCHIVED ───────────────────────────────────────────────────
  {
    title: 'Sustainability Reporting Masterclass: GRI, SASB & TCFD',
    slug: 'sustainability-reporting-gri-sasb-tcfd',
    description:
      'Program 10 minggu berbasis proyek ini membawa peserta dari nol hingga mampu menyusun laporan keberlanjutan yang memenuhi standar GRI Universal Standards, SASB industry-specific standards, dan kerangka TCFD — termasuk melakukan materiality assessment, menyusun narrative disclosure, dan mempersiapkan laporan untuk external assurance oleh auditor independen.',
    duration: '10 Minggu',
    format: 'Online Live Sessions + Project-Based Learning',
    category: 'Sustainability',
    image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
    certificate: true,
    portfolio: true,
    status: 'ARCHIVED',
    pricing: [
      { name: 'Early Bird', original_price: 3200000, discount_price: 2400000, order: 1 },
      { name: 'Standard', original_price: 3200000, discount_price: 3200000, order: 2 },
    ],
    features: [
      { title: 'Penulisan Laporan GRI dengan Studi Kasus Nyata', description: 'Latihan hands-on menyusun disclosure GRI menggunakan laporan keberlanjutan perusahaan Fortune 500.', icon: 'pencil-line', order: 1 },
      { title: 'Deep Dive SASB Standards per Sektor', description: 'Workshop intensif standar SASB untuk sektor energi, keuangan, dan teknologi.', icon: 'factory', order: 2 },
      { title: 'Workshop Materiality Assessment', description: 'Panduan lengkap double materiality assessment mengikuti GRI 3 dan ESRS.', icon: 'clipboard-text', order: 3 },
      { title: 'Review Laporan oleh Pakar', description: 'Draft laporan keberlanjutan peserta diulas langsung oleh instruktur berpengalaman.', icon: 'magnifying-glass', order: 4 },
    ],
    themes: [
      {
        title: 'GRI Standards',
        description: 'Penguasaan komprehensif GRI Universal Standards dan Topic Standards.',
        order: 1,
        topics: [
          { title: 'GRI Universal Standards: Fondasi, General Disclosures & Management Approach', description: 'GRI 1, 2, dan 3 — struktur baru GRI 2021 dan perubahan dari versi sebelumnya.', order: 1 },
          { title: 'GRI Topic Standards: Environmental (Seri 300)', description: 'Material topics lingkungan: energi, air, biodiversitas, emisi, limbah, dan kepatuhan.', order: 2 },
          { title: 'GRI Topic Standards: Social (Seri 400)', description: 'Material topics sosial: ketenagakerjaan, K3, HAM, masyarakat lokal, dan privasi pelanggan.', order: 3 },
          { title: 'Materiality Assessment & Stakeholder Engagement', description: 'Metodologi double materiality, pemetaan pemangku kepentingan, dan validasi topik material.', order: 4 },
        ],
      },
      {
        title: 'SASB & Industry Standards',
        description: 'Standar pelaporan keberlanjutan berbasis industri untuk keputusan investor.',
        order: 2,
        topics: [
          { title: 'SASB Framework & Industry Classification System', description: 'Struktur SASB, 77 industri SICS, dan prinsip materiality finansial.', order: 1 },
          { title: 'SASB Standards: Sektor Energi & Ekstraktif', description: 'Disclosure spesifik untuk minyak & gas, batu bara, dan pertambangan logam.', order: 2 },
          { title: 'SASB Standards: Sektor Keuangan & Teknologi', description: 'Disclosure untuk perbankan, asuransi, software, dan e-commerce.', order: 3 },
          { title: 'Menyelaraskan SASB dengan GRI & Integrated Reporting', description: 'Strategi menggunakan SASB dan GRI secara bersamaan tanpa duplikasi.', order: 4 },
        ],
      },
      {
        title: 'TCFD & Climate Disclosure',
        description: 'Menyiapkan pengungkapan risiko iklim sesuai TCFD dan standar ISSB terbaru.',
        order: 3,
        topics: [
          { title: 'Rekomendasi TCFD: Governance & Strategi', description: 'Dua pilar pertama TCFD — struktur pengawasan dewan dan integrasi iklim dalam strategi bisnis.', order: 1 },
          { title: 'TCFD: Risk Management & Metrics/Targets', description: 'Dua pilar terakhir — proses identifikasi risiko iklim dan pengungkapan metrik serta target.', order: 2 },
          { title: 'Climate Scenario Analysis untuk Perusahaan Non-Keuangan', description: 'Metodologi analisis skenario 1.5°C–4°C dan cara menyajikannya dalam laporan tahunan.', order: 3 },
          { title: 'Transisi ISSB: Dari TCFD ke IFRS S2', description: 'Kompatibilitas TCFD dengan IFRS S2, timeline adopsi, dan gap analysis.', order: 4 },
        ],
      },
    ],
    instructors: [
      { name: 'Dr. Sari Widianingrum', job_title: 'Sustainability Reporting Expert & GRI Certified Trainer', avatar_url: 'https://i.pravatar.cc/150?img=45', description: 'Trainer tersertifikasi GRI dengan pengalaman mendampingi lebih dari 30 perusahaan BUMN dan swasta dalam menyusun laporan keberlanjutan.', order: 1 },
      { name: 'Marcus Webb', job_title: 'SASB Implementation Specialist, Deloitte Sustainability', avatar_url: 'https://i.pravatar.cc/150?img=3', description: 'Konsultan Deloitte dengan spesialisasi implementasi SASB dan ISSB untuk klien di sektor keuangan dan energi Asia Pasifik.', order: 2 },
      { name: 'Yuna Park', job_title: 'TCFD & Climate Disclosure Advisor, KPMG', avatar_url: 'https://i.pravatar.cc/150?img=46', description: 'Advisor KPMG untuk pengungkapan risiko iklim dengan pengalaman klien di 8 negara Asia.', order: 3 },
    ],
    testimonials: [
      { name: 'Mira Lestari', avatar_url: 'https://i.pravatar.cc/150?img=36', comment: 'Setelah mengikuti program ini, saya berhasil memimpin penyusunan laporan GRI pertama perusahaan kami yang mendapat rating B+ dari GRI.', order: 1 },
      { name: 'Dimas Prabowo', avatar_url: 'https://i.pravatar.cc/150?img=9', comment: 'Workshop materiality assessment sangat membuka wawasan — sekarang saya paham mengapa topik yang berbeda relevan untuk industri yang berbeda.', order: 2 },
      { name: 'Citra Ayu', avatar_url: 'https://i.pravatar.cc/150?img=31', comment: 'Instruktur sangat responsif dan selalu siap memberikan feedback detail atas draft laporan kami.', order: 3 },
    ],
    faqs: [
      { question: 'Apakah peserta perlu pengalaman sebelumnya dalam sustainability reporting?', answer: 'Tidak diperlukan, namun pemahaman dasar tentang operasional bisnis akan sangat membantu.', order: 1 },
      { question: 'Apakah tersedia template GRI dan SASB?', answer: 'Ya, semua template yang digunakan dalam latihan tersedia untuk diunduh dan digunakan oleh peserta.', order: 2 },
      { question: 'Bagaimana proses review laporan oleh pakar?', answer: 'Peserta mengirimkan draft laporan di minggu ke-8, dan akan menerima feedback tertulis + sesi 1-on-1 30 menit dengan instruktur.', order: 3 },
      { question: 'Apakah program ini mengikuti standar GRI terbaru (2021)?', answer: 'Ya, seluruh materi diperbarui mengikuti GRI Universal Standards 2021 dan GRI Sector Standards terbaru.', order: 4 },
      { question: 'Apa perbedaan program ini dengan pelatihan GRI resmi?', answer: 'Program ini lebih praktis dan fokus pada implementasi nyata, sedangkan pelatihan GRI resmi lebih bersifat pengenalan konseptual.', order: 5 },
    ],
  },
];
