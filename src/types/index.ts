export type UserRole = 'ADMINISTRATOR' | 'WARGA';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type OccupancyStatus = 'TERISI_PEMILIK' | 'TERISI_SEWA' | 'KOSONG';

export type OccupancyType = 'PEMILIK' | 'KELUARGA_PEMILIK' | 'PENYEWA';

export type HouseholdRelationship = 'KEPALA_KELUARGA' | 'PASANGAN' | 'ANAK' | 'KELUARGA_LAIN' | 'PENYEWA';

export type EmergencyContactRelation = 'ORANG_TUA' | 'PASANGAN' | 'ANAK' | 'SAUDARA';

export type PopulationStatus = 'SUDAH_WARGA_LEUWUNGGAJAH' | 'BELUM_PINDAH';

export type DomicileLetterStatus = 'ADA' | 'TIDAK_ADA';

export type InvoiceStatus = 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentSubmissionStatus = 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'REVERSAL';

export type AnnouncementCategory = 
  | 'Informasi Umum'
  | 'Keamanan Lingkungan'
  | 'Kerja Bakti'
  | 'Iuran dan Keuangan'
  | 'Kegiatan Warga'
  | 'Pemberitahuan Penting';

export type ComplaintCategory = 
  | 'Kebersihan'
  | 'Keamanan'
  | 'Infrastruktur'
  | 'Fasilitas Umum'
  | 'Lingkungan'
  | 'Aspirasi'
  | 'Lainnya';

export type ComplaintStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface User {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  houseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface House {
  houseId: string;
  block: string; // A, B, C, D, E, F
  houseNumber: string;
  addressLabel: string;
  occupancyStatus: OccupancyStatus;
  activeIplRateId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  residentId: string;
  userUid: string;
  houseId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  householdRelationship: HouseholdRelationship;
  occupancyType: OccupancyType;
  residentStatus: UserStatus;
  idCardNumber?: string;
  originVillage?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: EmergencyContactRelation;
  populationStatus?: PopulationStatus;
  domicileLetterStatus?: DomicileLetterStatus;
  ktpPhotoUrl?: string;
  kkPhotoUrl?: string;
  disclaimerAccepted?: boolean;
  disclaimerAcceptedAt?: string;
  createdAt: string;
}

export interface IplRate {
  rateId: string;
  amount: number; // e.g. 150000 IDR
  effectiveMonth: string; // YYYY-MM
  description: string;
  createdAt: string;
}

export interface IplInvoice {
  invoiceId: string;
  houseId: string;
  period: string; // YYYY-MM
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSubmission {
  submissionId: string;
  invoiceId: string;
  houseId: string;
  userUid: string;
  amount: number;
  transferDate: string;
  bankAccountName: string;
  bankAccountNumber: string;
  evidenceUrl: string;
  status: PaymentSubmissionStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  periods?: string[];
  destinationBank?: string;
  senderBank?: string;
  notes?: string;
}

export interface CashTransaction {
  transactionId: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  referenceId?: string; // invoiceId or submissionId
  postedBy: string;
  createdAt: string;
}

export interface Announcement {
  announcementId: string;
  title: string;
  category: AnnouncementCategory;
  content: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  imageUrl?: string;
  authorName: string;
  isPinned: boolean;
  publishedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
}

export interface ComplaintUpdate {
  updateId: string;
  complaintId: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  statusChangedTo?: ComplaintStatus;
  createdAt: string;
}

export interface Complaint {
  complaintId: string;
  userUid: string;
  houseId: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  imageUrl?: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CommunityEvent {
  eventId: string;
  title: string;
  category: string;
  description: string;
  eventDate: string; // YYYY-MM-DD HH:mm
  location: string;
  quota?: number;
  imageUrl?: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface EventRegistration {
  registrationId: string;
  eventId: string;
  userUid: string;
  houseId: string;
  fullName: string;
  registeredAt: string;
}

export interface StaffMember {
  name: string;
  phone: string;
}

export interface CommunitySettings {
  communityName: string;
  locationName: string;
  defaultIplAmount: number;
  iplNominalOptions: [number, number, number, number];
  dueDayOfMonth: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  adminContactPhone: string;
  announcementNotice: string;
  adminUsername?: string;
  adminPassword?: string;
  qrisImageUrl?: string;
  tataTertibMarkdown?: string;
  fcmVapidKey?: string;
  staffInfo: {
    ketuaPaguyuban: StaffMember;
    wakilKetua: StaffMember;
    sekretaris: StaffMember;
    bendahara: StaffMember;
    keamanan: StaffMember;
    petugasSampah: StaffMember;
  };
}

export interface AuditLog {
  logId: string;
  userUid: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface PanicAlert {
  alertId: string;
  userUid: string;
  residentName: string;
  houseId: string;
  houseLabel: string;
  phoneNumber?: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED';
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
  imageUrl?: string;
}


export interface Poll {
  pollId: string;
  question: string;
  options: string[];
  status: 'ACTIVE' | 'FINISHED';
  createdAt: string;
  createdBy: string;
}

export interface PollVote {
  voteId: string;
  pollId: string;
  userUid: string;
  optionIndex: number;
  createdAt: string;
}
