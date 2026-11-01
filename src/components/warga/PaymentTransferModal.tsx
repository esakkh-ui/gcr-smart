import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { sanitizeIplNominalOptions } from '../../context/DataContext';
import { formatRupiah, formatPeriod, getNextPeriod, generateConsecutivePeriods } from '../../utils/formatters';
import {
  Building2,
  CreditCard,
  Calendar,
  Plus,
  Trash2,
  Lock,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Copy,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

interface PaymentTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPeriod?: string;
  onSuccess?: (message: string) => void;
}

export const PaymentTransferModal: React.FC<PaymentTransferModalProps> = ({
  isOpen,
  onClose,
  initialPeriod,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { houses, invoices, settings, submitPayment } = useData();

  const residentHouse = houses.find(h => h.houseId === currentUser?.houseId);
  const houseLabel = residentHouse ? residentHouse.addressLabel : (currentUser?.houseId || 'Rumah Anda');

  // 4 IPL Nominal Options strictly from Admin Settings (Warga can ONLY choose, never edit)
  const iplOptions = sanitizeIplNominalOptions(settings.iplNominalOptions);

  const determineInitialStartPeriod = (): string => {
    if (initialPeriod) return initialPeriod;
    if (currentUser?.houseId) {
      const unpaid = invoices
        .filter(inv => inv.houseId === currentUser.houseId && inv.status !== 'PAID')
        .sort((a, b) => a.period.localeCompare(b.period));
      if (unpaid.length > 0) {
        return unpaid[0].period;
      }
    }
    return '2026-10';
  };

  const determineInitialOptionIndex = (targetPeriod: string): 0 | 1 | 2 | 3 => {
    if (currentUser?.houseId) {
      const matchingInv = invoices.find(
        inv => inv.houseId === currentUser.houseId && inv.period === targetPeriod
      );
      if (matchingInv) {
        const invOptIdx = iplOptions.indexOf(matchingInv.amount);
        if (invOptIdx >= 0 && invOptIdx <= 3) {
          return invOptIdx as 0 | 1 | 2 | 3;
        }
      }
    }
    const defaultIdx = iplOptions.indexOf(settings.defaultIplAmount);
    return (defaultIdx >= 0 && defaultIdx <= 3 ? defaultIdx : 0) as 0 | 1 | 2 | 3;
  };

  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(() => [determineInitialStartPeriod()]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<0 | 1 | 2 | 3>(() =>
    determineInitialOptionIndex(determineInitialStartPeriod())
  );
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewZoom, setShowPreviewZoom] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const start = determineInitialStartPeriod();
      setSelectedPeriods([start]);
      setSelectedOptionIndex(determineInitialOptionIndex(start));
      setUploadError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialPeriod]);

  if (!isOpen) return null;

  // Monthly IPL rate comes exclusively from the selected option index (read-only values from Admin Settings)
  const selectedMonthlyRate = iplOptions[selectedOptionIndex] ?? iplOptions[0];
  const totalAmount = selectedPeriods.length * selectedMonthlyRate;

  const handleMonthsCountChange = (count: number) => {
    const start = selectedPeriods[0] || determineInitialStartPeriod();
    setSelectedPeriods(generateConsecutivePeriods(start, count));
  };

  const handleAddMonth = () => {
    const last = selectedPeriods[selectedPeriods.length - 1] || determineInitialStartPeriod();
    const next = getNextPeriod(last);
    setSelectedPeriods(prev => [...prev, next]);
  };

  const handleRemoveMonth = (indexToRemove: number) => {
    if (selectedPeriods.length <= 1) return;
    setSelectedPeriods(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImageFile =
      file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name);
    if (!isImageFile) {
      setUploadError('Mohon unggah file berupa foto/gambar (JPG, PNG, JPEG, HEIC).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 15MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1000;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          setEvidenceUrl(compressed);
        } else {
          setEvidenceUrl(reader.result as string);
        }
      };
      img.onerror = () => {
        setEvidenceUrl(reader.result as string);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCopyBankAccount = () => {
    if (!settings.bankAccountNumber) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(settings.bankAccountNumber).catch(() => {});
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = settings.bankAccountNumber;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {}
      document.body.removeChild(textarea);
    }
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl) {
      setUploadError('Wajib melampirkan foto bukti transfer.');
      return;
    }
    setShowConfirmModal(true);
  };

  const executePaymentSubmission = () => {
    if (!currentUser || !currentUser.houseId || selectedPeriods.length === 0) return;

    const primaryInvoiceId = `inv-${selectedPeriods[0]}-${currentUser.houseId}`;

    submitPayment({
      invoiceId: primaryInvoiceId,
      houseId: currentUser.houseId,
      userUid: currentUser.uid,
      amount: totalAmount,
      transferDate,
      bankAccountName: currentUser?.fullName || 'Warga',
      bankAccountNumber: '-',
      evidenceUrl,
      periods: selectedPeriods,
      senderBank: 'Transfer Bank',
      destinationBank: `${settings.bankName} (${settings.bankAccountNumber})`,
      notes: notes || undefined,
    });

    setShowConfirmModal(false);
    setEvidenceUrl('');
    setNotes('');
    onClose();

    if (onSuccess) {
      const periodSummary =
        selectedPeriods.length === 1
          ? `Periode ${formatPeriod(selectedPeriods[0])}`
          : `${selectedPeriods.length} Bulan (${selectedPeriods.map(p => formatPeriod(p)).join(', ')})`;
      onSuccess(
        `Bukti transfer pembayaran IPL ${periodSummary} sebesar ${formatRupiah(totalAmount)} berhasil dikirimkan! Menunggu verifikasi pengurus RT.`
      );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-3 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200">
          {/* Header */}
          <div className="bg-[#142D4E] text-white p-5 flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-blue-200 text-xs font-semibold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pembayaran Mandiri Warga</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">Bayar Iuran IPL via Transfer</h2>
              <p className="text-xs text-blue-200">
                Rumah: <strong className="text-white">{houseLabel}</strong> · Penghuni: {currentUser?.fullName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82dvh] overflow-y-auto">
            {/* Rekening Resmi RT Card */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Rekening Resmi Kas RT Grand Ciledug Raya</span>
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">Tujuan Transfer</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-lg border border-blue-200/80">
                <div>
                  <div className="text-xs text-slate-500">Bank Tujuan & Nomor Rekening:</div>
                  <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums tracking-wide flex flex-wrap items-center gap-2">
                    <span>{settings.bankName}</span>
                    <span className="text-blue-700">{settings.bankAccountNumber}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium pt-0.5">
                    a.n. <strong className="text-slate-800">{settings.bankAccountHolder}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBankAccount}
                  className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition border border-blue-200 cursor-pointer shrink-0"
                >
                  {copiedBank ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin No. Rek</span>
                    </>
                  )}
                </button>
              </div>

              {settings.qrisImageUrl && (
                <div className="bg-white p-3 rounded-lg border border-blue-200 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Atau Scan QRIS Pembayaran:</span>
                  <div className="p-1 border border-slate-200 rounded-lg bg-white">
                    <img 
                      src={settings.qrisImageUrl} 
                      alt="QRIS Pembayaran" 
                      className="w-40 h-40 object-contain cursor-zoom-in"
                      onClick={() => {
                        // reusing showPreviewZoom but for QRIS
                        // Actually, I'll just keep it simple or use a dedicated state if needed.
                        // For now just show it.
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 italic">Klik/Simpan gambar QRIS untuk bayar via Dompet Digital/Bank</span>
                </div>
              )}
            </div>

            {/* 1. PILIH NOMINAL IPL (4 PILIHAN RESMI DARI ADMIN - TIDAK BISA DIUBAH WARGA) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  Pilih Nominal IPL per Bulan (4 Pilihan Resmi)
                </label>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Hanya Pilih · Diatur Admin</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {iplOptions.map((optionAmount, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedOptionIndex(idx as 0 | 1 | 2 | 3)}
                      className={`min-h-[56px] p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className={`text-[11px] font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          Pilihan {idx + 1}
                        </div>
                        <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums truncate">
                          {formatRupiah(optionAmount)}
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500">
                Nilai nominal IPL ditetapkan oleh Pengurus RT di menu Pengaturan dan tidak dapat diketik manual.
              </p>
            </div>

            {/* 2. Drop Down Berapa Bulan x Nilai Iuran Terpilih */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Durasi Iuran (Berapa Bulan)</label>
              <select
                value={selectedPeriods.length}
                onChange={e => handleMonthsCountChange(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value={1}>1 Bulan — (1 x {formatRupiah(selectedMonthlyRate)})</option>
                <option value={2}>2 Bulan — (2 x {formatRupiah(selectedMonthlyRate)})</option>
                <option value={3}>3 Bulan (Triwulan) — (3 x {formatRupiah(selectedMonthlyRate)})</option>
                <option value={4}>4 Bulan — (4 x {formatRupiah(selectedMonthlyRate)})</option>
                <option value={5}>5 Bulan — (5 x {formatRupiah(selectedMonthlyRate)})</option>
                <option value={6}>6 Bulan (Semesteran) — (6 x {formatRupiah(selectedMonthlyRate)})</option>
                <option value={12}>12 Bulan (1 Tahun) — (12 x {formatRupiah(selectedMonthlyRate)})</option>
                {![1, 2, 3, 4, 5, 6, 12].includes(selectedPeriods.length) && (
                  <option value={selectedPeriods.length}>
                    {selectedPeriods.length} Bulan — ({selectedPeriods.length} x {formatRupiah(selectedMonthlyRate)})
                  </option>
                )}
              </select>
            </div>

            {/* 3. Tambah Iuran Bulan x Nilai Iuran (List of Months) */}
            <div className="space-y-2 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Rincian Bulan Iuran ({selectedPeriods.length} Bulan):
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddMonth}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-blue-200 hover:border-blue-400 rounded-lg transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bulan</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedPeriods.map((period, idx) => (
                  <div
                    key={`${period}-${idx}`}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono tabular-nums font-bold">{idx + 1}.</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">Iuran Bulan {formatPeriod(period)}</span>
                        <span className="text-[11px] text-slate-500 font-mono">({period})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums font-semibold text-slate-700">
                        1 x {formatRupiah(selectedMonthlyRate)}
                      </span>
                      {selectedPeriods.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMonth(idx)}
                          title="Hapus bulan ini"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Jumlah Total Card (Read-Only) */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-900">Jumlah Total Pembayaran</span>
                <div className="text-xs text-emerald-700">
                  Kalkulasi: <strong className="font-bold">{selectedPeriods.length} Bulan</strong> x{' '}
                  <strong className="font-mono tabular-nums">{formatRupiah(selectedMonthlyRate)}</strong>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium text-emerald-700">Total Transfer</div>
                <div className="text-xl font-extrabold text-emerald-950 font-mono tabular-nums">
                  {formatRupiah(totalAmount)}
                </div>
              </div>
            </div>

            {/* Tanggal Transfer & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tanggal Transfer</label>
                <input
                  type="date"
                  required
                  value={transferDate}
                  onChange={e => setTransferDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Transfer m-Banking"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* FOTO BUKTI TRANSFER */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Foto Bukti Transfer (Wajib)</span>
                </label>
                <span className="text-[11px] text-slate-500">JPG, PNG, HEIC (Maks. 15MB)</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!evidenceUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl p-5 text-center cursor-pointer transition group"
                >
                  <div className="w-11 h-11 mx-auto mb-2 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">Pilih / Unggah Foto Bukti Transfer</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Ambil foto dari kamera atau pilih dari galeri HP/Laptop Anda
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Foto Bukti</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Foto Bukti Transfer Terpasang</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPreviewZoom(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Perbesar Foto</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => setShowPreviewZoom(true)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0 cursor-pointer group relative"
                    >
                      <img
                        src={evidenceUrl}
                        alt="Bukti Transfer"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 flex-1">
                      <div className="font-bold text-slate-800">Foto Bukti Transfer Siap Dikirim</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Foto struk/tangkapan layar transfer ini akan diverifikasi oleh Pengurus RT.
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-blue-700 hover:text-blue-800 font-semibold cursor-pointer underline"
                        >
                          Ganti Foto...
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEvidenceUrl('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Kirim Bukti Pembayaran</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL KONFIRMASI YA / TIDAK SEBELUM PENCATATAN */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-blue-900 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Pembayaran Mandiri</h3>
                <p className="text-xs text-slate-500">Periksa kembali rincian sebelum mengirim bukti transfer</p>
              </div>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Rumah & Warga:</span>
                <span className="font-bold text-slate-900">{houseLabel} ({currentUser?.fullName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi & Periode:</span>
                <span className="font-bold text-blue-700 text-right">
                  {selectedPeriods.length} Bulan ({selectedPeriods.map(p => formatPeriod(p)).join(', ')})
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Pilihan Nominal IPL:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  Pilihan {selectedOptionIndex + 1} ({formatRupiah(selectedMonthlyRate)} / bln)
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Jumlah Transfer:</span>
                <span className="text-emerald-700 font-mono tabular-nums text-base">{formatRupiah(totalAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Tanggal Transfer:</span>
                <span className="font-medium text-slate-800">{transferDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tujuan Kas RT:</span>
                <span className="font-medium text-slate-800">{settings.bankName} ({settings.bankAccountNumber})</span>
              </div>
            </div>

            {evidenceUrl && (
              <div className="flex items-center gap-3 p-2.5 bg-blue-50/60 rounded-xl border border-blue-200">
                <img
                  src={evidenceUrl}
                  alt="Bukti Struk"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover rounded-lg border border-blue-200 shrink-0"
                />
                <div className="text-xs text-blue-900">
                  <div className="font-bold">Foto Bukti Transfer Dilampirkan</div>
                  <div className="text-[11px] text-blue-700">Tercatat tanggal transfer: {transferDate}</div>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 text-center">
              Apakah Anda yakin ingin mengirimkan konfirmasi pembayaran ini ke Pengurus RT?
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="min-h-[44px] w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Tidak, Periksa Lagi
              </button>
              <button
                type="button"
                onClick={executePaymentSubmission}
                className="min-h-[44px] w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
              >
                Ya, Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SIZE PHOTO ZOOM PREVIEW MODAL */}
      {showPreviewZoom && evidenceUrl && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Pratinjau Foto Bukti Transfer</h3>
              </div>
              <button
                onClick={() => setShowPreviewZoom(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[65vh] border border-slate-200">
              <img
                src={evidenceUrl}
                alt="Bukti Transfer Full"
                referrerPolicy="no-referrer"
                className="object-contain max-h-[60vh] w-full"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Warga: <strong>{currentUser?.fullName}</strong> ({houseLabel})
              </span>
              <button
                onClick={() => setShowPreviewZoom(false)}
                className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
