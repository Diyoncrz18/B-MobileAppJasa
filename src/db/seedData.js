// All seed data arrays — extracted from the original server.js
// Used by seed.js

const categories = [
  { slug: 'service-ac', title: 'Service AC', description: 'Cuci AC, isi freon, dan cek efisiensi energi.', icon: 'snowflake', eco_score: 'A', tone: 'brand', price_label: 'Mulai Rp 85k' },
  { slug: 'cleaning-service', title: 'Cleaning Service', description: 'Home cleaning, deep cleaning, dan eco-cleaning.', icon: 'broom', eco_score: 'A+', tone: 'accent', price_label: 'Mulai Rp 75k' },
  { slug: 'jasa-listrik', title: 'Jasa Listrik', description: 'Instalasi, perbaikan, dan audit listrik ringan.', icon: 'lightning-bolt', eco_score: 'B+', tone: 'amber', price_label: 'Mulai Rp 85k' },
  { slug: 'plumbing', title: 'Plumbing', description: 'Pipa bocor, saluran mampet, dan pompa air.', icon: 'water', eco_score: 'B', tone: 'blue', price_label: 'Mulai Rp 95k' },
  { slug: 'jasa-las', title: 'Jasa Las', description: 'Pengerjaan rak, pagar, kanopi, dan las ringan.', icon: 'fire', eco_score: 'B', tone: 'orange', price_label: 'Mulai Rp 150k' },
  { slug: 'servis-peralatan-rumah-tangga', title: 'Servis Peralatan RT', description: 'Perbaikan mesin cuci, dispenser, kipas, dan perangkat rumah.', icon: 'washing-machine', eco_score: 'A', tone: 'rose', price_label: 'Mulai Rp 95k' },
];

const services = [
  { category_slug: 'service-ac', slug: 'service-ac', title: 'Service AC', description: 'Perawatan dan perbaikan AC untuk rumah, kos, dan apartemen dengan pendekatan eco-friendly.', about: 'Layanan kategori AC untuk pengecekan, perawatan, dan optimasi pendinginan rumah agar tetap nyaman sekaligus hemat energi.', duration: '45-120 mnt', price: 'Mulai Rp 85k', eco_score: 'A', guarantee: 'Garansi pengerjaan 7 hari', coverage: 'Bandung, Cimahi, Jakarta, Bekasi', response: '< 10 menit', jobs: '1.240+ job selesai', rating: '4.8', benefits: ['Teknisi bersertifikat', 'Diagnosis efisiensi energi', 'Pilihan jadwal fleksibel'], includes: ['Pemeriksaan unit', 'Cek aliran udara', 'Cek konsumsi daya', 'Rekomendasi perawatan'], process: ['Survey keluhan & kondisi AC', 'Pemeriksaan teknis unit', 'Tindakan servis sesuai kebutuhan', 'Tes akhir dan saran perawatan'], reviews: [{ name: 'Ahmad Rizki', rating: '4.9', text: 'Teknisi cepat menjelaskan masalah AC dan unit jadi lebih dingin tanpa boros listrik.' }, { name: 'Nadia Putri', rating: '4.8', text: 'Flow booking rapi dan detail eco-score membantu saya pilih layanan yang lebih hemat.' }] },
  { category_slug: 'service-ac', slug: 'cuci-ac-standard', title: 'Cuci AC Standard', description: 'Pilihan paling populer untuk menjaga AC tetap bersih, dingin, dan efisien digunakan setiap hari.', about: 'Paket servis detail untuk pencucian AC indoor lengkap dengan pengecekan performa pendinginan dan evaluasi freon.', duration: '60 mnt', price: 'Rp 90k', eco_score: 'A', guarantee: 'Garansi servis 7 hari', coverage: 'Bandung, Jakarta, Tangerang', response: '< 10 menit', jobs: '684+ job selesai', rating: '4.8', benefits: ['Harga transparan', 'Checklist pengerjaan jelas', 'Rekomendasi hemat energi setelah servis'], includes: ['Cuci indoor unit', 'Cek freon', 'Tes performa pendinginan', 'Pembersihan ringan filter'], process: ['Konfirmasi jadwal dan lokasi', 'Pemeriksaan awal unit', 'Pencucian dan pengecekan freon', 'Tes dingin dan edukasi penggunaan'], reviews: [{ name: 'Dian Sari', rating: '4.9', text: 'Servis rapi, AC jadi lebih dingin dan teknisinya komunikatif.' }, { name: 'Farhan K.', rating: '4.8', text: 'Suka karena setelah servis dikasih saran setting suhu yang lebih hemat listrik.' }] },
  { category_slug: 'cleaning-service', slug: 'cleaning-service', title: 'Cleaning Service', description: 'Solusi kebersihan rumah untuk rutinitas mingguan, kebutuhan khusus, atau persiapan hunian lebih higienis.', about: 'Kategori layanan cleaning untuk kebersihan rumah harian, deep cleaning, hingga opsi eco-cleaning dengan bahan lebih ramah lingkungan.', duration: '2-5 jam', price: 'Mulai Rp 75k', eco_score: 'A+', guarantee: 'Revisit area jika ada yang terlewat', coverage: 'Bandung, Jakarta, Depok, Bekasi', response: '< 15 menit', jobs: '980+ job selesai', rating: '4.9', benefits: ['Mitra terlatih', 'Pilihan eco-cleaning', 'Checklist area kerja jelas'], includes: ['Pembersihan area utama', 'Peralatan cleaning standar', 'Checklist area selesai', 'Opsional eco-cleaning'], process: ['Brief kebutuhan area', 'Pemetaan prioritas ruangan', 'Pembersihan bertahap', 'Final walkthrough bersama user'], reviews: [{ name: 'Nabila Putri', rating: '5.0', text: 'Area dapur dan kamar mandi dibersihkan detail, hasilnya bersih dan cepat.' }, { name: 'Sinta A.', rating: '4.9', text: 'Tim datang tepat waktu dan pilihan eco-cleaning benar-benar terasa lebih aman.' }] },
  { category_slug: 'cleaning-service', slug: 'home-cleaning-reguler', title: 'Home Cleaning Reguler', description: 'Layanan home cleaning yang paling sering dipilih untuk rutinitas bersih rumah mingguan atau dua mingguan.', about: 'Paket cleaning rutin paling fleksibel untuk hunian aktif, cocok untuk menjaga rumah tetap bersih tanpa repot menyiapkan alat sendiri.', duration: '2-3 jam', price: 'Rp 75k', eco_score: 'A+', guarantee: 'Klarifikasi area kerja sebelum selesai', coverage: 'Bandung, Jakarta, Depok', response: '< 15 menit', jobs: '532+ job selesai', rating: '4.9', benefits: ['Tim datang terjadwal', 'Bisa fokus area prioritas', 'Opsional eco-cleaning'], includes: ['Sapu & pel', 'Lap permukaan', 'Rapikan area', 'Opsional cairan eco-clean'], process: ['Konfirmasi area prioritas', 'Persiapan alat dan bahan', 'Pembersihan terstruktur', 'Review hasil akhir'], reviews: [{ name: 'Mega P.', rating: '4.9', text: 'Hasil cleaning konsisten bersih dan timnya enak diajak koordinasi.' }, { name: 'Rani D.', rating: '5.0', text: 'Sangat membantu untuk jadwal mingguan, rumah jadi lebih rapi tanpa ribet.' }] },
  { category_slug: 'jasa-listrik', slug: 'jasa-listrik', title: 'Jasa Listrik', description: 'Mulai dari saklar bermasalah sampai optimasi penggunaan listrik rumah, semua ditangani dengan langkah kerja yang jelas.', about: 'Kategori jasa listrik untuk instalasi ringan, perbaikan gangguan rumah, dan audit sederhana agar sistem listrik lebih aman dan efisien.', duration: '45-120 mnt', price: 'Mulai Rp 85k', eco_score: 'B+', guarantee: 'Garansi pengecekan ulang 3 hari', coverage: 'Bandung, Jakarta, Surabaya', response: '< 12 menit', jobs: '640+ job selesai', rating: '4.7', benefits: ['Teknisi berpengalaman', 'Pengecekan keamanan dasar', 'Saran upgrade hemat energi'], includes: ['Identifikasi masalah', 'Perbaikan ringan', 'Cek keamanan dasar', 'Saran LED upgrade'], process: ['Cek sumber gangguan', 'Estimasi tindakan', 'Pengerjaan inti', 'Tes keamanan dan fungsi'], reviews: [{ name: 'Bagas W.', rating: '4.8', text: 'Masalah saklar cepat selesai dan teknisi kasih penjelasan yang gampang dipahami.' }, { name: 'Dio Ramadhan', rating: '4.7', text: 'Saya suka karena ada saran upgrade lampu agar konsumsi listrik lebih efisien.' }] },
  { category_slug: 'jasa-listrik', slug: 'perbaikan-listrik-rumah', title: 'Perbaikan Listrik Rumah', description: 'Layanan cepat untuk keluhan listrik rumah dengan pengecekan fungsi dan keamanan dasar setelah pengerjaan.', about: 'Paket paling populer untuk penanganan listrik rumah seperti saklar, lampu, korsleting ringan, dan pengecekan efisiensi pemakaian.', duration: '45-90 mnt', price: 'Rp 85k', eco_score: 'B+', guarantee: 'Garansi pengecekan ulang 3 hari', coverage: 'Bandung, Jakarta, Surabaya', response: '< 12 menit', jobs: '298+ job selesai', rating: '4.7', benefits: ['Same day service', 'Cocok untuk keluhan rumah tangga', 'Rekomendasi lampu hemat energi'], includes: ['Cek korsleting', 'Perbaikan saklar', 'Pemasangan lampu', 'Saran LED upgrade'], process: ['Identifikasi titik masalah', 'Pengerjaan utama', 'Tes arus dan fungsi', 'Edukasi penggunaan aman'], reviews: [{ name: 'Rudi H.', rating: '4.7', text: 'Lampu dan saklar beres cepat, teknisi juga cek titik rawan lain.' }, { name: 'Tasya M.', rating: '4.8', text: 'Helpful untuk rumah lama karena sekalian dicek potensi masalah lainnya.' }] },
  { category_slug: 'plumbing', slug: 'plumbing', title: 'Plumbing', description: 'Solusi kebocoran dan masalah aliran air rumah dengan pendekatan perbaikan yang rapi dan mudah dipantau.', about: 'Layanan plumbing untuk kebocoran, saluran mampet, pompa air, dan pengecekan instalasi pipa rumah secara lebih efisien.', duration: '45-120 mnt', price: 'Mulai Rp 95k', eco_score: 'B', guarantee: 'Garansi cek ulang area servis', coverage: 'Bandung, Cimahi, Jakarta', response: '< 15 menit', jobs: '410+ job selesai', rating: '4.6', benefits: ['Respons cepat untuk kebocoran', 'Diagnosis area sumber masalah', 'Bisa untuk rumah dan kost'], includes: ['Pemeriksaan sumber bocor', 'Pembersihan saluran dasar', 'Tes aliran air', 'Saran pencegahan'], process: ['Identifikasi sumber masalah', 'Pembongkaran ringan bila perlu', 'Perbaikan atau pembersihan', 'Tes aliran dan finishing'], reviews: [{ name: 'Ayu N.', rating: '4.7', text: 'Saluran mampet selesai tanpa bikin area berantakan.' }, { name: 'Rafli H.', rating: '4.6', text: 'Teknisi jelas menjelaskan opsi perbaikan sebelum mulai kerja.' }] },
  { category_slug: 'jasa-las', slug: 'jasa-las', title: 'Jasa Las', description: 'Cocok untuk perbaikan atau pembuatan kebutuhan besi rumah dengan proses kerja yang aman dan terukur.', about: 'Kategori jasa las untuk kebutuhan rumah tangga ringan seperti kanopi, pagar, rak, dan perbaikan struktur logam sederhana.', duration: '2-6 jam', price: 'Mulai Rp 150k', eco_score: 'B', guarantee: 'Penyesuaian minor setelah pemasangan', coverage: 'Bandung, Jakarta, Bekasi', response: '< 20 menit', jobs: '220+ job selesai', rating: '4.5', benefits: ['Survey kebutuhan lebih dulu', 'Bisa custom ukuran', 'Pengerjaan rapi untuk rumah'], includes: ['Survey ukuran', 'Estimasi material', 'Pengerjaan las ringan', 'Finishing dasar'], process: ['Brief kebutuhan', 'Ukur dan estimasi', 'Pengerjaan las', 'Pengecekan hasil akhir'], reviews: [{ name: 'Bima S.', rating: '4.6', text: 'Rak besi custom jadi sesuai ukuran dan prosesnya komunikatif.' }, { name: 'Nanda P.', rating: '4.5', text: 'Cocok untuk kebutuhan rumah, hasil sambungan rapi dan kuat.' }] },
  { category_slug: 'servis-peralatan-rumah-tangga', slug: 'servis-peralatan-rumah-tangga', title: 'Servis Peralatan RT', description: 'Membantu memperpanjang umur peralatan rumah tangga melalui perbaikan yang lebih efisien dan ramah biaya.', about: 'Layanan servis peralatan rumah tangga untuk mesin cuci, dispenser, kipas, dan perangkat rumah lain yang perlu penanganan teknis ringan.', duration: '45-120 mnt', price: 'Mulai Rp 95k', eco_score: 'A', guarantee: 'Garansi pengecekan fungsi', coverage: 'Bandung, Jakarta, Tangerang', response: '< 15 menit', jobs: '350+ job selesai', rating: '4.7', benefits: ['Diagnosis awal cepat', 'Fokus perbaikan sebelum ganti unit', 'Transparan soal kemungkinan sparepart'], includes: ['Diagnosis kerusakan', 'Perbaikan ringan', 'Tes fungsi akhir', 'Saran perawatan alat'], process: ['Cek gejala unit', 'Analisis komponen utama', 'Perbaikan ringan', 'Tes fungsi dan edukasi'], reviews: [{ name: 'Luthfi A.', rating: '4.8', text: 'Mesin cuci normal lagi dan saya jadi paham cara mencegah error yang sama.' }, { name: 'Sarah M.', rating: '4.7', text: 'Lebih hemat daripada ganti unit, teknisinya juga rapi.' }] },
];

const providersByService = {
  'service-ac': [
    { name: 'Rizky Pratama', company: 'CoolAir Bandung', address: 'Dago Atas, Bandung', distance: '1.2 km', eta: '12 menit', response: '< 5 menit', jobs: '420+ job', rating: '4.9', price: 'Mulai Rp 90k', availability: 'Bisa hari ini', tags: ['Cuci AC', 'Isi freon', 'Eco-check'], is_recommended: true },
    { name: 'Fajar Nugraha', company: 'Sejuk Teknik', address: 'Ciumbuleuit, Bandung', distance: '2.4 km', eta: '18 menit', response: '< 9 menit', jobs: '318+ job', rating: '4.8', price: 'Mulai Rp 85k', availability: 'Slot 14.00', tags: ['Service AC rumah', 'Perawatan rutin', 'Tes performa'], is_recommended: false },
  ],
  'cuci-ac-standard': [
    { name: 'Rizky Pratama', company: 'CoolAir Bandung', address: 'Cihampelas, Bandung', distance: '0.9 km', eta: '10 menit', response: '< 5 menit', jobs: '420+ job', rating: '4.9', price: 'Rp 90k', availability: 'Bisa hari ini', tags: ['Cuci indoor', 'Tes dingin', 'Filter cleaning'], is_recommended: true },
    { name: 'Rafi Maulana', company: 'FreshBreeze AC', address: 'Sukajadi, Bandung', distance: '1.7 km', eta: '14 menit', response: '< 7 menit', jobs: '295+ job', rating: '4.8', price: 'Rp 92k', availability: 'Slot 13.30', tags: ['Cuci AC 1 PK', 'Cek freon', 'Home service'], is_recommended: false },
  ],
  'home-cleaning-reguler': [
    { name: 'Nina Maharani', company: 'CleanSpace Home Service', address: 'Buah Batu, Bandung', distance: '1.3 km', eta: '13 menit', response: '< 6 menit', jobs: '510+ job', rating: '5.0', price: 'Rp 75k', availability: 'Bisa hari ini', tags: ['Sapu & pel', 'Lap permukaan', 'Jadwal rutin'], is_recommended: true },
    { name: 'Salsa Nur', company: 'RumahKinclong', address: 'Kiaracondong, Bandung', distance: '2.0 km', eta: '16 menit', response: '< 10 menit', jobs: '364+ job', rating: '4.9', price: 'Rp 78k', availability: 'Slot 14.30', tags: ['Home cleaning', 'Area prioritas', 'Eco-clean'], is_recommended: false },
  ],
  'perbaikan-listrik-rumah': [
    { name: 'Andri Setiawan', company: 'ElektrikPro', address: 'Buah Batu, Bandung', distance: '1.1 km', eta: '10 menit', response: '< 7 menit', jobs: '387+ job', rating: '4.8', price: 'Rp 85k', availability: 'Bisa hari ini', tags: ['Saklar', 'Lampu LED', 'Cek korslet'], is_recommended: true },
    { name: 'Bayu Saputra', company: 'VoltCare Home', address: 'Tegalega, Bandung', distance: '1.9 km', eta: '15 menit', response: '< 9 menit', jobs: '241+ job', rating: '4.7', price: 'Rp 87k', availability: 'Slot 15.30', tags: ['Perbaikan rumah', 'Same day', 'Tes arus'], is_recommended: false },
  ],
  plumbing: [
    { name: 'Reza Firmansyah', company: 'AquaFix Plumbing', address: 'Margahayu, Bandung', distance: '1.4 km', eta: '13 menit', response: '< 8 menit', jobs: '301+ job', rating: '4.7', price: 'Mulai Rp 95k', availability: 'Bisa hari ini', tags: ['Pipa bocor', 'Saluran mampet', 'Pompa air'], is_recommended: true },
  ],
};

const partnerApplications = [
  { full_name: 'Rudi Hartono', phone: '+62 812 9000 1001', area: 'Bandung', field: 'Service AC', experience: 'Teknisi AC — 5 tahun pengalaman', description: 'Spesialis cuci AC, isi freon, dan perawatan unit split rumah tangga.', address: 'Bandung', status: 'pending', documents: ['KTP ✓', 'Sertifikat ✓', 'Foto profil ✓'], created_at: '2026-03-13T08:00:00.000Z' },
  { full_name: 'Siti Aminah', phone: '+62 813 9000 1002', area: 'Jakarta', field: 'Cleaning', experience: 'Cleaning Service — 3 tahun pengalaman', description: 'Berpengalaman pada home cleaning reguler dan deep cleaning rumah.', address: 'Jakarta', status: 'pending', documents: ['KTP ✓', 'Foto profil ✓', 'Sertifikat −'], created_at: '2026-03-12T08:00:00.000Z' },
  { full_name: 'Budi Prasetyo', phone: '+62 814 9000 1003', area: 'Surabaya', field: 'Listrik', experience: 'Tukang Listrik — 7 tahun pengalaman', description: 'Fokus pada instalasi ringan, MCB, dan pengecekan keamanan listrik rumah.', address: 'Surabaya', status: 'approved', documents: ['KTP ✓', 'Sertifikat ✓', 'Foto profil ✓'], created_at: '2026-03-14T08:00:00.000Z' },
];

const complaints = [
  { user_name: 'Ahmad Rizki', title: 'Teknisi tidak datang sesuai jadwal', complaint: 'Sudah menunggu lebih dari 2 jam tapi teknisi AC belum datang.', service: 'Service AC', vendor: 'CoolAir', priority: 'Tinggi', status: 'pending', created_at: '2026-03-14T09:30:00.000Z' },
  { user_name: 'Nabila Putri', title: 'Kualitas pembersihan kurang baik', complaint: 'Beberapa area yang diminta tidak dibersihkan dengan benar.', service: 'Cleaning', vendor: 'CleanSpace', priority: 'Sedang', status: 'pending', created_at: '2026-03-12T10:00:00.000Z' },
  { user_name: 'Dina Lestari', title: 'Biaya tidak sesuai', complaint: 'Tagihan akhir berbeda dengan estimasi awal tanpa penjelasan detail.', service: 'Service AC', vendor: 'CoolAir', priority: 'Sedang', status: 'resolved', resolution_note: 'Refund diberikan', created_at: '2026-03-08T10:00:00.000Z' },
];

const notifications = [
  { type: 'order', title: 'Teknisi sedang menuju lokasi', body: 'Rizky Pratama sedang dalam perjalanan ke alamat Anda untuk layanan Cuci AC Standard.', is_read: false, created_at: '2026-03-16T08:30:00.000Z' },
  { type: 'payment', title: 'Pembayaran berhasil diterima', body: 'Pembayaran untuk pesanan Cuci AC Standard telah berhasil diproses.', is_read: true, created_at: '2026-03-15T15:00:00.000Z' },
];

const educationContents = [
  { category: 'Perawatan AC', title: 'Kapan AC perlu dicuci rutin?', body: 'AC rumah idealnya dicuci setiap 3 bulan agar performa dingin stabil dan konsumsi listrik tetap efisien.', icon: 'snowflake', tone: 'brand' },
  { category: 'Cleaning', title: 'Pilih bahan pembersih lebih ramah lingkungan', body: 'Gunakan bahan eco-cleaning untuk area dengan anak kecil atau hewan peliharaan agar lebih aman.', icon: 'leaf', tone: 'eco' },
  { category: 'Listrik', title: 'Ganti lampu ke LED secara bertahap', body: 'Lampu LED lebih hemat energi dan punya umur pakai lebih panjang dibanding lampu konvensional.', icon: 'lightning-bolt', tone: 'amber' },
];

const paymentMethods = [
  { code: 'cash', label: 'Cash (Bayar di Tempat)', description: 'Bayar langsung setelah pekerjaan selesai.' },
  { code: 'transfer', label: 'Transfer Bank', description: 'Transfer ke rekening tujuan setelah pesanan dikonfirmasi.' },
  { code: 'ewallet', label: 'E-Wallet', description: 'Gunakan dompet digital yang tersedia di tahap pembayaran.' },
  { code: 'qris', label: 'QRIS', description: 'Scan QRIS saat pembayaran akhir dilakukan.' },
];

const chatSeed = {
  threads: [
    { title: 'Teknisi CoolAir', label: 'Service AC Rumah - Cuci Standard', description: 'Unit sudah dicek, estimasi pengerjaan cuci besar sekitar 60 menit.', time_label: '09:40', unread_count: 1, pinned: false },
    { title: 'Teknisi AC (Rudi)', label: 'Penting: Konfirmasi Jadwal Teknisi AC', description: 'Halo Nabila, layanan Cuci AC Standard sudah dijadwalkan hari ini jam 10:00.', time_label: '09:00', unread_count: 0, pinned: true },
  ],
  messages: [
    { thread_title: 'Teknisi CoolAir', sender_role: 'provider', body: 'Halo Kak, teknisi dari CoolAir siap datang sesuai jadwal pukul 14.00.', sent_at: '2026-03-16T09:20:00.000Z' },
    { thread_title: 'Teknisi CoolAir', sender_role: 'user', body: 'Sudah sesuai. Tolong hubungi saya ketika tim sudah dekat lokasi ya.', sent_at: '2026-03-16T09:24:00.000Z' },
  ],
};

const orderSeed = {
  user: { full_name: 'Nabila Putri Rahma', email: 'nabila.putri@email.com', phone: '+62 812 3456 7890', role: 'user', status: 'active' },
  admin: { full_name: 'Admin SmartEco', email: 'admin@smarteco.id', phone: '+62 811 0000 0000', role: 'admin', status: 'active' },
  address: { label: 'Rumah', address_line: 'Jl. Dago Atas No. 12, Bandung', city: 'Bandung', province: 'Jawa Barat', postal_code: '40135', is_primary: true },
  diagnosis: { title: 'AC kamar tidak dingin', problem_description: 'AC kamar tidak dingin sejak 2 hari lalu', urgency: 'Sedang', location_text: 'Jl. Dago Atas No. 12, Bandung', scheduled_at: '2026-03-16T14:00:00.000Z', recommendation: 'Cuci AC Standard', estimated_price: 'Rp 90.000 - Rp 105.000', estimated_duration: '60 mnt' },
  order: { code: 'ORD-20260316-001', service_slug: 'cuci-ac-standard', provider_company: 'CoolAir Bandung', provider_name: 'Rizky Pratama', status: 'in_progress', scheduled_at: '2026-03-16T14:00:00.000Z', problem_description: 'AC kamar tidak dingin sejak 2 hari lalu', service_fee: 90000, visit_fee: 15000, material_fee_estimate: 0, total_estimate: 105000, total_final: 105000, payment_method: 'cash' },
  tracking: [
    { status: 'submitted', label: 'Menunggu konfirmasi', description: 'Pesanan sudah dikirim ke penyedia jasa.', happened_at: '2026-03-16T08:40:00.000Z' },
    { status: 'accepted', label: 'Diterima penyedia jasa', description: 'Rizky Pratama menerima pesanan Anda.', happened_at: '2026-03-16T08:45:00.000Z' },
    { status: 'traveling', label: 'Dalam perjalanan', description: 'Penyedia jasa sedang menuju lokasi Anda.', happened_at: '2026-03-16T09:05:00.000Z' },
    { status: 'arrived', label: 'Tiba di lokasi', description: 'Teknisi sudah berada di alamat tujuan.', happened_at: '2026-03-16T09:20:00.000Z' },
    { status: 'in_progress', label: 'Sedang dikerjakan', description: 'Layanan sedang berjalan.', happened_at: '2026-03-16T09:30:00.000Z' },
    { status: 'completed', label: 'Selesai', description: 'Pembayaran tersedia setelah pekerjaan diverifikasi.', happened_at: null },
  ],
  payment: { method: 'cash', amount: 105000, status: 'pending', note: 'Bayar langsung setelah pekerjaan selesai.' },
  review: { overall_rating: 5, timeliness_rating: 5, quality_rating: 5, friendliness_rating: 5, review_text: 'Servis rapi dan teknisi sangat komunikatif.', created_at: '2026-03-16T16:30:00.000Z' },
};

const dashboardStats = {
  total_users: 1247, active_partners: 128, eco_impact_label: 'A+', orders_today: 34,
  revenue_today: 2800000, pending_partner_applications: 3, active_complaints: 2,
  distribution: [
    { label: 'Service AC', color: '#2578f5', value: 38 },
    { label: 'Cleaning', color: '#17b38a', value: 28 },
    { label: 'Jasa Listrik', color: '#f59e0b', value: 18 },
    { label: 'Plumbing', color: '#3b82f6', value: 10 },
    { label: 'Lainnya', color: '#94a3b8', value: 6 },
  ],
  eco_impact: [
    { label: 'Barang diperbaiki', value: '156' },
    { label: 'CO₂ dihemat', value: '89 kg' },
    { label: 'Repair rate', value: '92%' },
  ],
};

module.exports = {
  categories, services, providersByService, partnerApplications,
  complaints, notifications, educationContents, paymentMethods,
  chatSeed, orderSeed, dashboardStats,
};
