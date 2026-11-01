import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { sanitizeIplNominalOptions } from '../../context/DataContext';
import { DEFAULT_IPL_NOMINAL_OPTIONS } from '../../data/initialData';
import { formatRupiah } from '../../utils/formatters';
import { Save, RotateCcw, CheckCircle2, AlertCircle, Wallet, Shield, Image as ImageIcon, Users, FileText } from 'lucide-react';

export const SettingsAdmin: React.FC = () => {
  const { settings, updateSettings } = useData();
  const [communityName, setCommunityName] = useState(settings.communityName);
  const [locationName, setLocationName] = useState(settings.locationName);
  const [iplOptionsInput, setIplOptionsInput] = useState<[string, string, string, string]>(() => {
    const opts = sanitizeIplNominalOptions(settings.iplNominalOptions);
    return [String(opts[0]), String(opts[1]), String(opts[2]), String(opts[3])];
  });
  const [defaultOptionIndex, setDefaultOptionIndex] = useState<number>(() => {
    const opts = sanitizeIplNominalOptions(settings.iplNominalOptions);
    const idx = opts.indexOf(settings.defaultIplAmount);
    return idx >= 0 ? idx : 0;
  });
  const [dueDayOfMonth, setDueDayOfMonth] = useState(settings.dueDayOfMonth);
  const [bankName, setBankName] = useState(settings.bankName);
  const [bankAccountNumber, setBankAccountNumber] = useState(settings.bankAccountNumber);
  const [bankAccountHolder, setBankAccountHolder] = useState(settings.bankAccountHolder);
  const [adminContactPhone, setAdminContactPhone] = useState(settings.adminContactPhone);
  const [adminUsername, setAdminUsername] = useState(settings.adminUsername || 'gcr');
  const [adminPassword, setAdminPassword] = useState(settings.adminPassword || 'gcr123');
  const [qrisImageUrl, setQrisImageUrl] = useState(settings.qrisImageUrl || '');
  const [tataTertibMarkdown, setTataTertibMarkdown] = useState(settings.tataTertibMarkdown || '');
  const [staffInfo, setStaffInfo] = useState(settings.staffInfo);
  const [fcmVapidKey, setFcmVapidKey] = useState(settings.fcmVapidKey || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync form state when settings arrive/update from Cloud Firestore
  useEffect(() => {
    setCommunityName(settings.communityName);
    setLocationName(settings.locationName);
    const opts = sanitizeIplNominalOptions(settings.iplNominalOptions);
    setIplOptionsInput([String(opts[0]), String(opts[1]), String(opts[2]), String(opts[3])]);
    const idx = opts.indexOf(settings.defaultIplAmount);
    setDefaultOptionIndex(idx >= 0 ? idx : 0);
    setDueDayOfMonth(settings.dueDayOfMonth);
    setBankName(settings.bankName);
    setBankAccountNumber(settings.bankAccountNumber);
    setBankAccountHolder(settings.bankAccountHolder);
    setAdminContactPhone(settings.adminContactPhone);
    setAdminUsername(settings.adminUsername || 'gcr');
    setAdminPassword(settings.adminPassword || 'gcr123');
    setQrisImageUrl(settings.qrisImageUrl || '');
    setTataTertibMarkdown(settings.tataTertibMarkdown || '');
    setStaffInfo(settings.staffInfo);
    setFcmVapidKey(settings.fcmVapidKey || '');
  }, [settings]);

  const handleOptionChange = (index: 0 | 1 | 2 | 3, rawValue: string) => {
    const digitsOnly = rawValue.replace(/[^\d]/g, '');
    setIplOptionsInput(prev => {
      const next: [string, string, string, string] = [...prev];
      next[index] = digitsOnly;
      return next;
    });
    if (validationError) setValidationError(null);
  };

  const handleResetDefaultNominals = () => {
    setIplOptionsInput([
      String(DEFAULT_IPL_NOMINAL_OPTIONS[0]),
      String(DEFAULT_IPL_NOMINAL_OPTIONS[1]),
      String(DEFAULT_IPL_NOMINAL_OPTIONS[2]),
      String(DEFAULT_IPL_NOMINAL_OPTIONS[3]),
    ]);
    setDefaultOptionIndex(2); // 50.000
    setValidationError(null);
  };

  const handleStaffChange = (role: string, field: 'name' | 'phone', value: string) => {
    setStaffInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [role]: {
          ...(prev as any)[role],
          [field]: value
        }
      };
    });
  };

  const parsedOptions: [number, number, number, number] = [
    Number(iplOptionsInput[0]) || 0,
    Number(iplOptionsInput[1]) || 0,
    Number(iplOptionsInput[2]) || 0,
    Number(iplOptionsInput[3]) || 0,
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedOptions.some(val => !Number.isFinite(val) || val <= 0)) {
      setValidationError('Keempat pilihan nominal IPL wajib diisi dengan angka lebih dari Rp 0.');
      return;
    }

    const selectedDefaultAmount = parsedOptions[defaultOptionIndex] || parsedOptions[0];

    updateSettings({
      communityName,
      locationName,
      iplNominalOptions: parsedOptions,
      defaultIplAmount: selectedDefaultAmount,
      dueDayOfMonth: Number(dueDayOfMonth) || 10,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      adminContactPhone,
      adminUsername,
      adminPassword,
      qrisImageUrl,
      tataTertibMarkdown,
      staffInfo,
      fcmVapidKey,
    });
    setValidationError(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Lingkungan RT</h1>
        <p className="text-sm text-slate-500">
          Konfigurasi 4 pilihan nominal IPL warga, rekening bank pembayaran, serta kredensial akun Admin RT.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pengaturan & 4 pilihan nominal IPL berhasil disimpan dan tersinkronisasi ke seluruh akun warga!</span>
            </div>
          )}

          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Konfigurasi 4 Pilihan Nominal IPL Section */}
          <div className="bg-slate-50/90 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span>Pengaturan 4 Pilihan Nominal IPL Warga</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Akun warga hanya dapat memilih salah satu dari 4 nominal di bawah ini dan tidak dapat mengubah nilainya.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDefaultNominals}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Standar (15rb – 100rb)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([0, 1, 2, 3] as const).map(idx => {
                const numericVal = parsedOptions[idx];
                return (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Pilihan {idx + 1} Nominal IPL (IDR)
                      </label>
                      <span className="text-xs font-mono tabular-nums font-semibold text-blue-700">
                        {numericVal > 0 ? formatRupiah(numericVal) : 'Rp 0'}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={iplOptionsInput[idx]}
                        onChange={e => handleOptionChange(idx, e.target.value)}
                        placeholder={String(DEFAULT_IPL_NOMINAL_OPTIONS[idx])}
                        className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tampil di warga: <strong className="text-slate-700 font-mono tabular-nums">{numericVal > 0 ? formatRupiah(numericVal) : '-'}</strong> / bulan
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Pilihan Default Saat Buka Form Tagihan / Bayar
                </label>
                <select
                  value={defaultOptionIndex}
                  onChange={e => setDefaultOptionIndex(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {([0, 1, 2, 3] as const).map(idx => (
                    <option key={idx} value={idx}>
                      Pilihan {idx + 1} — {parsedOptions[idx] > 0 ? formatRupiah(parsedOptions[idx]) : 'Rp 0'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Batas Tanggal Jatuh Tempo (Setiap Bulan)</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  required
                  value={dueDayOfMonth}
                  onChange={e => setDueDayOfMonth(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono tabular-nums font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Admin Credentials Settings Section */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
            <h2 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Username & Password Akun Admin</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Username Admin</label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password Admin</label>
                <input
                  type="text"
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-mono font-bold text-blue-700"
                />
              </div>
            </div>
            <p className="text-[11px] text-blue-800">
              Username dan password di atas digunakan untuk Login Pengurus RT. Anda dapat mengubahnya kapan saja.
            </p>
          </div>

          {/* Community & Bank Account Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Perumahan / Komplek</label>
                <input
                  type="text"
                  required
                  value={communityName}
                  onChange={e => setCommunityName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Lokasi / Wilayah</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Bank Tujuan Pembayaran IPL</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nomor Rekening Bank</label>
                <input
                  type="text"
                  required
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={bankAccountHolder}
                  onChange={e => setBankAccountHolder(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nomor Kontak Pengurus RT (WhatsApp)</label>
              <input
                type="text"
                required
                value={adminContactPhone}
                onChange={e => setAdminContactPhone(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Gambar QRIS Pembayaran (URL / Base64)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://... atau data:image/..."
                  value={qrisImageUrl}
                  onChange={e => setQrisImageUrl(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-500">QRIS ini akan ditampilkan kepada warga saat melakukan pembayaran IPL.</p>
                {qrisImageUrl && (
                  <div className="mt-2 p-2 border border-slate-200 rounded-lg bg-white inline-block">
                    <img src={qrisImageUrl} alt="Preview QRIS" className="max-w-[120px] h-auto" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Susunan Pengurus & Kontak Petugas</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {staffInfo && (Object.entries(staffInfo) as [string, { name: string; phone: string }][]).map(([key, info]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Nama"
                        value={info.name}
                        onChange={e => handleStaffChange(key, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
                      />
                      <input
                        type="text"
                        placeholder="No. HP"
                        value={info.phone}
                        onChange={e => handleStaffChange(key, 'phone', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Konfigurasi Notifikasi (FCM VAPID Key)</span>
              </label>
              <input
                type="text"
                placeholder="BPA..."
                value={fcmVapidKey}
                onChange={e => setFcmVapidKey(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-mono text-[11px]"
              />
              <p className="text-[10px] text-slate-500">
                VAPID Key bersifat <strong>GRATIS</strong>. Dapatkan di Firebase Console &gt; Project Settings &gt; Cloud Messaging &gt; Web Configuration.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Isi Tata Tertib (Markdown)</span>
              </label>
              <textarea
                value={tataTertibMarkdown}
                onChange={e => setTataTertibMarkdown(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 font-mono leading-relaxed"
                placeholder="# Tata Tertib..."
              />
              <p className="text-[10px] text-slate-500">Gunakan format Markdown untuk mengatur judul, daftar, dan cetak tebal.</p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
