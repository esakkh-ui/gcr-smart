/**
 * Utility formatters for GCR Smart Residence (Bahasa Indonesia & IDR)
 */

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatPeriod(period: string): string {
  // YYYY-MM -> Nama Bulan Tahun
  if (!period || !period.includes('-')) return period;
  const [year, month] = period.split('-');
  const monthNames = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const mIndex = parseInt(month, 10);
  if (mIndex >= 1 && mIndex <= 12) {
    return `${monthNames[mIndex]} ${year}`;
  }
  return period;
}

export function translateStatus(status: string): string {
  const map: Record<string, string> = {
    // User / Resident Status
    'ACTIVE': 'Aktif',
    'PENDING': 'Menunggu Persetujuan',
    'SUSPENDED': 'Ditangguhkan',
    'REJECTED': 'Ditolak',

    // Occupancy Status
    'TERISI_PEMILIK': 'Terisi Pemilik',
    'TERISI_SEWA': 'Terisi Penyewa',
    'KOSONG': 'Kosong',

    // Occupancy Type
    'PEMILIK': 'Pemilik',
    'KELUARGA_PEMILIK': 'Keluarga Pemilik',
    'PENYEWA': 'Penyewa',

    // Household Relationship
    'KEPALA_KELUARGA': 'Kepala Keluarga',
    'PASANGAN': 'Pasangan',
    'ANAK': 'Anak',
    'KELUARGA_LAIN': 'Keluarga Lain',

    // Invoice Status
    'UNPAID': 'Belum Bayar',
    'PENDING_VERIFICATION': 'Menunggu Verifikasi',
    'PAID': 'Lunas',
    'OVERDUE': 'Terlambat',
    'CANCELLED': 'Dibatalkan',

    // Payment Submission
    'SUBMITTED': 'Diajukan',
    'VERIFIED': 'Terverifikasi',

    // Complaint Status
    'IN_PROGRESS': 'Diproses',
    'RESOLVED': 'Selesai',
    'CLOSED': 'Ditutup',

    // Event Status
    'SCHEDULED': 'Dijadwalkan',
    'ONGOING': 'Berlangsung',
    'COMPLETED': 'Selesai',

    // Priority
    'NORMAL': 'Normal',
    'IMPORTANT': 'Penting',
    'URGENT': 'Mendesak',
  };

  return map[status] || status;
}

export function getNextPeriod(period: string): string {
  if (!period || !period.includes('-')) return '2026-11';
  const [yearStr, monthStr] = period.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function generateConsecutivePeriods(startPeriod: string, count: number): string[] {
  const list: string[] = [startPeriod];
  let current = startPeriod;
  for (let i = 1; i < count; i++) {
    current = getNextPeriod(current);
    list.push(current);
  }
  return list;
}

export function formatEmergencyRelation(rel?: string): string {
  const map: Record<string, string> = {
    ORANG_TUA: 'Orang Tua',
    PASANGAN: 'Pasangan',
    ANAK: 'Anak',
    SAUDARA: 'Saudara',
  };
  return (rel && map[rel]) || rel || '-';
}

export function formatPopulationStatus(status?: string): string {
  if (status === 'SUDAH_WARGA_LEUWUNGGAJAH') return 'Sudah Warga Leuwunggajah';
  if (status === 'BELUM_PINDAH') return 'Belum Pindah Kependudukan';
  return '-';
}

export function formatDomicileStatus(status?: string): string {
  if (status === 'ADA') return 'Ada';
  if (status === 'TIDAK_ADA') return 'Tidak Ada';
  return '-';
}

export function formatHouseLabel(
  house?: { block?: string; houseNumber?: string; addressLabel?: string } | null,
  fallbackIdOrLabel?: string
): string {
  if (house?.block && house?.houseNumber) {
    const blk = house.block.trim().toUpperCase();
    const num = house.houseNumber.trim().replace(/^0+(?=\d)/, '');
    return `Blok ${blk}${num}`;
  }

  const raw = (house?.addressLabel || fallbackIdOrLabel || '').trim();
  if (!raw) return '-';

  const houseIdMatch = raw.match(/^house[-_]([a-z0-9]+)[-_](\d+)$/i);
  if (houseIdMatch) {
    const blk = houseIdMatch[1].toUpperCase();
    const num = houseIdMatch[2].replace(/^0+(?=\d)/, '');
    return `Blok ${blk}${num}`;
  }

  const blokMatch = raw.match(/blok\s*([a-z0-9]+)\s*(?:no\.?|nomor)?\s*[-—:]?\s*(\d+)/i);
  if (blokMatch) {
    const blk = blokMatch[1].toUpperCase();
    const num = blokMatch[2].replace(/^0+(?=\d)/, '');
    return `Blok ${blk}${num}`;
  }

  const shortMatch = raw.match(/^([a-z])\s*[-.]?\s*(\d+)$/i);
  if (shortMatch) {
    const blk = shortMatch[1].toUpperCase();
    const num = shortMatch[2].replace(/^0+(?=\d)/, '');
    return `Blok ${blk}${num}`;
  }

  return raw;
}


