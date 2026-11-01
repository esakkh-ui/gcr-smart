import {
  House,
  Resident,
  IplRate,
  IplInvoice,
  PaymentSubmission,
  CashTransaction,
  Announcement,
  Complaint,
  CommunityEvent,
  EventRegistration,
  CommunitySettings,
  User,
  AuditLog
} from '../types';

export const DEFAULT_IPL_NOMINAL_OPTIONS: [number, number, number, number] = [
  15000,
  35000,
  50000,
  100000,
];

export const INITIAL_SETTINGS: CommunitySettings = {
  communityName: 'Grand Ciledug Raya',
  locationName: 'Karang Tengah, Kota Tangerang, Banten',
  defaultIplAmount: 50000,
  iplNominalOptions: [15000, 35000, 50000, 100000],
  dueDayOfMonth: 10,
  bankName: 'BCA (Bank Central Asia)',
  bankAccountNumber: '8830192831',
  bankAccountHolder: 'Pengurus RT 05 RW 12 Grand Ciledug Raya',
  adminContactPhone: '+62 812-3456-7890',
  announcementNotice: 'Pembayaran IPL bulan berjalan paling lambat tanggal 10 setiap bulannya.',
  adminUsername: 'gcr',
  adminPassword: 'gcr123',
  qrisImageUrl: '',
  fcmVapidKey: 'BANyxigi14sKqEI_Ys-pFCY85CyKcJhQbjTYvT9RTigbGtYCzUf1VLRzwqp8f5klwYS-WoFOvRlbqpG1ZTfbzpo',
  tataTertibMarkdown: `# TATA TERTIB LINGKUNGAN PAGUYUBAN GRAND CILEDUG RAYA

Demi terciptanya lingkungan perumahan yang aman, nyaman, tertib, dan harmonis, seluruh warga diharapkan untuk mematuhi ketentuan berikut:

## A. KETERTIBAN & ADMINISTRASI
1. **Pelaporan Tamu:** Warga wajib melapor kepada pengurus RT atau petugas keamanan apabila terdapat tamu yang menginap lebih dari 1x24 jam.
2. **Administrasi Kependudukan:** Warga baru (pemilik maupun penyewa) wajib melaporkan diri kepada sekretariat Paguyuban untuk keperluan pendataan administrasi kependudukan.
3. **Pelaporan Kepergian:** Warga yang akan meninggalkan rumah dalam waktu lebih dari 1x24 jam (keluar kota/perjalanan dinas) diwajibkan melapor kepada petugas keamanan atau pengurus RT setempat.

## B. KEUANGAN & PEMELIHARAAN LINGKUNGAN
4. **Pembayaran Iuran:** Warga wajib melakukan pembayaran Iuran Pengelolaan Lingkungan (IPL) secara tepat waktu sesuai dengan nominal dan ketentuan yang ditetapkan oleh Paguyuban.
5. **Kegiatan Sosial (Gotong Royong):** Warga diharapkan berpartisipasi aktif dalam kegiatan kerja bakti/gotong royong yang dijadwalkan oleh Paguyuban demi menjaga keasrian dan kebersihan lingkungan bersama.
6. **Renovasi Bangunan:** Segala bentuk renovasi bangunan yang memerlukan perubahan struktur atau penggunaan area fasilitas umum wajib mengajukan izin tertulis kepada Paguyuban/RT setempat, serta bertanggung jawab penuh atas kebersihan area sekitar setelah pekerjaan selesai.

## C. AKSES, PARKIR, & KEAMANAN
7. **Ketertiban Parkir & Jalan:** Kendaraan wajib diparkir di dalam area rumah masing-masing. Dilarang memarkir kendaraan di badan jalan yang dapat mengganggu akses lalu lintas warga lain atau kendaraan darurat (pemadam/ambulan).
8. **Akses Gerbang:** Gerbang utama ditutup pada pukul 23.00 s.d. 06.00 WIB. Akses masuk/keluar bagi tamu atau warga dengan keperluan mendesak di jam tersebut wajib melakukan konfirmasi kepada petugas keamanan yang bertugas.
9. **Pengawasan Lingkungan:** Seluruh area perumahan dalam pengawasan CCTV selama 24 jam demi keamanan dan keselamatan bersama.

## D. NORMA & SANKSI
10. **Larangan Aktivitas Meresahkan:** Dilarang melakukan segala bentuk aktivitas yang mengganggu ketertiban umum dan melanggar norma sosial, termasuk penyalahgunaan minuman keras, perjudian, tindak asusila, dan perbuatan yang meresahkan masyarakat lainnya.
11. **Penegakan Hukum:** Segala bentuk pelanggaran hukum yang terjadi di lingkungan perumahan akan diserahkan sepenuhnya kepada pihak yang berwajib untuk ditindaklanjuti.

*Hormat Kami,*
**Pengurus Paguyuban Grand Ciledug Raya**`,
  staffInfo: {
    ketuaPaguyuban: { name: 'H. Suhardi, S.T.', phone: '+62 811-9988-7766' },
    wakilKetua: { name: 'Bpk. Ahmad Fauzi', phone: '+62 812-1111-2222' },
    sekretaris: { name: 'Bpk. Budi Santoso', phone: '+62 813-3333-4444' },
    bendahara: { name: 'Ibu Siti Aminah', phone: '+62 814-4444-5555' },
    keamanan: { name: 'Tim Keamanan (Security)', phone: '+62 815-5555-6666' },
    petugasSampah: { name: 'Bpk. Jaka (Kebersihan)', phone: '+62 816-6666-7777' },
  },
};

export const INITIAL_USERS: User[] = [
  {
    uid: 'admin-1',
    email: 'admin@gcr.id',
    fullName: 'Bapak H. Suhardi, S.T. (Ketua RT)',
    phoneNumber: '+62 811-9988-7766',
    role: 'ADMINISTRATOR',
    status: 'ACTIVE',
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: '2025-01-01T08:00:00Z',
  },
  {
    uid: 'warga-1',
    email: 'budi.santoso@gmail.com',
    fullName: 'Budi Santoso',
    phoneNumber: '+62 812-3344-5566',
    role: 'WARGA',
    status: 'ACTIVE',
    houseId: 'house-a-10',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
  {
    uid: 'warga-2',
    email: 'siti.aminah@gmail.com',
    fullName: 'Siti Aminah',
    phoneNumber: '+62 813-2211-9988',
    role: 'WARGA',
    status: 'ACTIVE',
    houseId: 'house-b-15',
    createdAt: '2025-01-12T11:30:00Z',
    updatedAt: '2025-01-12T11:30:00Z',
  },
  {
    uid: 'warga-pending',
    email: 'calon.warga@gmail.com',
    fullName: 'Ahmad Fauzi',
    phoneNumber: '+62 815-7788-9900',
    role: 'WARGA',
    status: 'PENDING',
    houseId: 'house-c-04',
    createdAt: '2026-10-24T09:00:00Z',
    updatedAt: '2026-10-24T09:00:00Z',
  }
];

export const INITIAL_HOUSES: House[] = [
  { houseId: 'house-a-1', block: 'A', houseNumber: '1', addressLabel: 'Blok A No. 1', occupancyStatus: 'TERISI_PEMILIK', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { houseId: 'house-a-10', block: 'A', houseNumber: '10', addressLabel: 'Blok A No. 10', occupancyStatus: 'TERISI_PEMILIK', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { houseId: 'house-b-15', block: 'B', houseNumber: '15', addressLabel: 'Blok B No. 15', occupancyStatus: 'TERISI_PEMILIK', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { houseId: 'house-i-60', block: 'I', houseNumber: '60', addressLabel: 'Blok I No. 60', occupancyStatus: 'KOSONG', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

export const INITIAL_RESIDENTS: Resident[] = [
  {
    residentId: 'res-1',
    userUid: 'warga-1',
    houseId: 'house-a-10',
    fullName: 'Budi Santoso',
    phoneNumber: '+62 812-3344-5566',
    email: 'budi.santoso@gmail.com',
    householdRelationship: 'KEPALA_KELUARGA',
    occupancyType: 'PEMILIK',
    residentStatus: 'ACTIVE',
    idCardNumber: '3275011234560001',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    residentId: 'res-2',
    userUid: 'warga-2',
    houseId: 'house-b-15',
    fullName: 'Siti Aminah',
    phoneNumber: '+62 813-2211-9988',
    email: 'siti.aminah@gmail.com',
    householdRelationship: 'KEPALA_KELUARGA',
    occupancyType: 'PEMILIK',
    residentStatus: 'ACTIVE',
    idCardNumber: '3275019876540002',
    createdAt: '2025-01-12T11:30:00Z',
  },
  {
    residentId: 'res-3',
    userUid: 'warga-pending',
    houseId: 'house-c-04',
    fullName: 'Ahmad Fauzi',
    phoneNumber: '+62 815-7788-9900',
    email: 'calon.warga@gmail.com',
    householdRelationship: 'KEPALA_KELUARGA',
    occupancyType: 'PEMILIK',
    residentStatus: 'PENDING',
    idCardNumber: '3275015544330003',
    createdAt: '2026-10-24T09:00:00Z',
  }
];

export const INITIAL_IPL_RATES: IplRate[] = [
  {
    rateId: 'rate-opt-1',
    amount: 15000,
    effectiveMonth: '2026-01',
    description: 'Pilihan 1 Nominal IPL Warga Grand Ciledug Raya',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    rateId: 'rate-opt-2',
    amount: 35000,
    effectiveMonth: '2026-01',
    description: 'Pilihan 2 Nominal IPL Warga Grand Ciledug Raya',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    rateId: 'rate-opt-3',
    amount: 50000,
    effectiveMonth: '2026-01',
    description: 'Pilihan 3 Nominal IPL Warga Grand Ciledug Raya',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    rateId: 'rate-opt-4',
    amount: 100000,
    effectiveMonth: '2026-01',
    description: 'Pilihan 4 Nominal IPL Warga Grand Ciledug Raya',
    createdAt: '2026-01-01T00:00:00Z',
  }
];

export const INITIAL_INVOICES: IplInvoice[] = [
  {
    invoiceId: 'inv-2026-10-house-a-10',
    houseId: 'house-a-10',
    period: '2026-10',
    amount: 50000,
    dueDate: '2026-10-10',
    status: 'UNPAID',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    invoiceId: 'inv-2026-09-house-a-10',
    houseId: 'house-a-10',
    period: '2026-09',
    amount: 50000,
    dueDate: '2026-09-10',
    status: 'PAID',
    paidAt: '2026-09-04T10:15:00Z',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-04T10:15:00Z',
  },
  {
    invoiceId: 'inv-2026-10-house-b-15',
    houseId: 'house-b-15',
    period: '2026-10',
    amount: 50000,
    dueDate: '2026-10-10',
    status: 'PENDING_VERIFICATION',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-08T16:30:00Z',
  },
  {
    invoiceId: 'inv-2026-10-house-c-04',
    houseId: 'house-c-04',
    period: '2026-10',
    amount: 35000,
    dueDate: '2026-10-10',
    status: 'UNPAID',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    invoiceId: 'inv-2026-10-house-d-8',
    houseId: 'house-d-8',
    period: '2026-10',
    amount: 100000,
    dueDate: '2026-10-10',
    status: 'UNPAID',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  }
];

export const INITIAL_PAYMENT_SUBMISSIONS: PaymentSubmission[] = [
  {
    submissionId: 'sub-002',
    invoiceId: 'inv-2026-10-house-b-15',
    houseId: 'house-b-15',
    userUid: 'warga-2',
    amount: 50000,
    transferDate: '2026-10-08',
    bankAccountName: 'Siti Aminah',
    bankAccountNumber: '9876543210',
    evidenceUrl: '',
    status: 'SUBMITTED',
    createdAt: '2026-10-08T16:30:00Z',
  }
];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    transactionId: 'trx-001',
    date: '2026-10-01',
    type: 'INCOME',
    category: 'Saldo Awal Bulan Oktober 2026',
    amount: 14500000,
    description: 'Saldo kas gabungan per 30 September 2026',
    postedBy: 'admin-1',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    transactionId: 'trx-002',
    date: '2026-09-04',
    type: 'INCOME',
    category: 'Iuran IPL Warga',
    amount: 150000,
    description: 'Pembayaran IPL Blok A No. 10 (Periode September 2026)',
    referenceId: 'inv-2026-09-house-a-10',
    postedBy: 'admin-1',
    createdAt: '2026-09-04T10:15:00Z',
  },
  {
    transactionId: 'trx-003',
    date: '2026-10-03',
    type: 'EXPENSE',
    category: 'Kebersihan & Persampahan',
    amount: 1200000,
    description: 'Honor petugas kebersihan dan pengangkutan sampah mingguan',
    postedBy: 'admin-1',
    createdAt: '2026-10-03T10:00:00Z',
  },
  {
    transactionId: 'trx-004',
    date: '2026-10-06',
    type: 'EXPENSE',
    category: 'Keamanan Lingkungan',
    amount: 2500000,
    description: 'Honor petugas Satpam/Pos Ronda Pos Utama Oktober',
    postedBy: 'admin-1',
    createdAt: '2026-10-06T09:00:00Z',
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    announcementId: 'ann-1',
    title: 'Kerja Bakti Bulanan Pembersihan Saluran Air Menghadapi Musim Hujan',
    category: 'Kerja Bakti',
    content: 'Diberitahukan kepada seluruh warga Grand Ciledug Raya bahwa kegiatan kerja bakti massal akan dilaksanakan pada hari Minggu, 1 November 2026 mulai pukul 07.00 WIB. Diharapkan setiap rumah mengirimkan perwakilan membawa alat kebersihan masing-masing.',
    priority: 'IMPORTANT',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1000',
    authorName: 'Pengurus RT 05',
    isPinned: true,
    publishedAt: '2026-10-22T08:00:00Z',
    status: 'PUBLISHED',
    createdAt: '2026-10-22T08:00:00Z',
  },
  {
    announcementId: 'ann-2',
    title: 'Pemberlakuan Sistem Satu Pintu (One Gate System) Mulai 1 November',
    category: 'Keamanan Lingkungan',
    content: 'Demi meningkatkan keamanan lingkungan perumahan, mulai 1 November 2026 akses gerbang utama Blok B dan C akan diberlakukan sistem satu pintu menggunakan kartu akses warga. Mohon warga yang belum mengambil kartu akses agar menghubungi bagian keamanan.',
    priority: 'URGENT',
    authorName: 'Seksi Keamanan RT',
    isPinned: true,
    publishedAt: '2026-10-20T10:00:00Z',
    status: 'PUBLISHED',
    createdAt: '2026-10-20T10:00:00Z',
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    complaintId: 'cmp-1',
    userUid: 'warga-1',
    houseId: 'house-a1-10',
    category: 'Infrastruktur',
    title: 'Lampu Penerangan Jalan Umum (PJU) Mati di Depan Blok A1',
    description: 'Lampu PJU tepat di tiang depan rumah Blok A1 No. 8 sudah padam selama 3 malam. Mohon perbaikan dari petugas karena jalan cukup gelap.',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-21T18:30:00Z',
    updatedAt: '2026-10-22T09:00:00Z',
  },
  {
    complaintId: 'cmp-2',
    userUid: 'warga-2',
    houseId: 'house-b2-15',
    category: 'Kebersihan',
    title: 'Saluran Air Mampet Akibat Daun Kering di Blok B2',
    description: 'Saluran air di samping taman Blok B2 tersumbat tumpukan daun dan sampah plastik. Khawatir meluap jika hujan deras.',
    status: 'RESOLVED',
    createdAt: '2026-10-15T14:10:00Z',
    updatedAt: '2026-10-18T11:20:00Z',
    resolvedAt: '2026-10-18T11:20:00Z',
  }
];

export const INITIAL_EVENTS: CommunityEvent[] = [
  {
    eventId: 'evt-1',
    title: 'Kerja Bakti Massal & Fogging DBD',
    category: 'Kerja Bakti',
    description: 'Pembersihan saluran air lingkungan dan penyemprotan fogging pencegahan DBD bekerja sama dengan Puskesmas setempat.',
    eventDate: '2026-11-01 07:00',
    location: 'Fasum Lapangan Utama RT 05',
    quota: 100,
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1000',
    status: 'SCHEDULED',
    createdAt: '2026-10-20T00:00:00Z',
  },
  {
    eventId: 'evt-2',
    title: 'Rapat Warga Bulanan & Sosialisasi Keamanan',
    category: 'Rapat Warga',
    description: 'Pertemuan rutin bulanan membahas laporan keuangan kas RT dan evaluasi sistem keamanan lingkungan.',
    eventDate: '2026-11-08 19:30',
    location: 'Balai Warga Grand Ciledug Raya',
    quota: 80,
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000',
    status: 'SCHEDULED',
    createdAt: '2026-10-20T00:00:00Z',
  }
];

export const INITIAL_EVENT_REGISTRATIONS: EventRegistration[] = [
  {
    registrationId: 'reg-1',
    eventId: 'evt-1',
    userUid: 'warga-1',
    houseId: 'house-a1-10',
    fullName: 'Budi Santoso',
    registeredAt: '2026-10-21T10:00:00Z',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    logId: 'log-1',
    userUid: 'admin-1',
    userName: 'Bapak H. Suhardi, S.T.',
    action: 'VERIFIKASI_PEMBAYARAN',
    details: 'Memverifikasi pembayaran IPL periode 2026-10 untuk rumah Blok A1 No. 10 sejumlah Rp 150.000',
    timestamp: '2026-10-05T14:20:00Z',
  }
];
