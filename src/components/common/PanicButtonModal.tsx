import React, { useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { compressIdentityImage } from '../../utils/imageCompressor';
import { formatHouseLabel } from '../../utils/formatters';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  Flame,
  Stethoscope,
  Shield,
  BellRing,
  Camera,
  Image as ImageIcon,
  Trash2,
  Loader2,
} from 'lucide-react';

interface PanicButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PanicButtonModal: React.FC<PanicButtonModalProps> = ({ isOpen, onClose }) => {
  const { triggerPanicAlert, houses } = useData();
  const { currentUser } = useAuth();

  const [emergencyCategory, setEmergencyCategory] = useState<string>('Perampokan / Maling di Rumah');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const residentHouse = houses.find(h => h.houseId === currentUser?.houseId);
  const houseLabel = formatHouseLabel(residentHouse, currentUser?.houseId || 'Blok Warga');

  const presetCategories = [
    { label: 'Perampokan / Maling', value: 'Perampokan / Maling di Rumah', icon: ShieldAlert },
    { label: 'Bahaya Kebakaran', value: 'Bahaya Kebakaran', icon: Flame },
    { label: 'Darurat Medis', value: 'Kebutuhan Medis / Pertolongan Pertama', icon: Stethoscope },
    { label: 'Keamanan Umum', value: 'Gangguan Keamanan & Ketertiban', icon: Shield },
  ];

  const resetFormAndClose = () => {
    setCustomNotes('');
    setPhotoUrl('');
    setPhotoError(null);
    setIsCompressingPhoto(false);
    setIsSubmitting(false);
    onClose();
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoError(null);
    setIsCompressingPhoto(true);
    try {
      const compressed = await compressIdentityImage(file, 350000);
      setPhotoUrl(compressed);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : 'Gagal memproses foto. Silakan coba foto lainnya.'
      );
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleSubmitPanic = () => {
    if (isCompressingPhoto) return;
    setIsSubmitting(true);
    const fullNotes = customNotes.trim()
      ? `${emergencyCategory} - ${customNotes.trim()}`
      : emergencyCategory;

    triggerPanicAlert({
      userUid: currentUser?.uid || 'warga-unknown',
      residentName: currentUser?.fullName || 'Warga GCR',
      houseId: currentUser?.houseId || 'house-a-10',
      houseLabel,
      phoneNumber: currentUser?.phoneNumber,
      notes: fullNotes,
      imageUrl: photoUrl || undefined,
    });

    resetFormAndClose();
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-rose-200 my-auto max-h-[92dvh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight truncate">
                Tombol Panik Darurat (SOS)
              </h3>
              <p className="text-[11px] sm:text-xs text-rose-100 font-medium truncate">
                Pemicu Alarm Peringatan Warga & Pengurus RT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetFormAndClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
            aria-label="Tutup Modal SOS"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Warning Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed font-medium">
              <strong className="block text-amber-950 font-bold mb-0.5">Perhatian Penting:</strong>
              Menekan tombol kirim sinyal akan <strong>membunyikan sirine alarm darurat</strong> di seluruh perangkat warga & pengurus RT secara serentak.
            </div>
          </div>

          {/* House Reporter Summary */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium">Lokasi Rumah Pelapor</span>
            <span className="font-bold text-slate-900 text-right">
              {houseLabel} · {currentUser?.fullName}
            </span>
          </div>

          {/* Emergency Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Pilih Jenis Keadaan Darurat
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presetCategories.map(cat => {
                const Icon = cat.icon;
                const isSelected = emergencyCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setEmergencyCategory(cat.value)}
                    className={`min-h-[44px] px-3 py-2.5 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-500'}`}
                    />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Custom Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Catatan Singkat Situasi (Opsional)
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder="Contoh: Terlihat orang mencurigakan di depan pagar rumah..."
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
            />
          </div>

          {/* Optional Photo Attachment from Camera / Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Lampirkan Foto Kejadian (Opsional)
              </label>
              <span className="text-[11px] text-slate-400">Kamera / Galeri</span>
            </div>

            {/* Hidden File Inputs for iOS & Android Camera vs Gallery */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoFileChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handlePhotoFileChange}
              className="hidden"
            />

            {!photoUrl ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isCompressingPhoto}
                  onClick={() => cameraInputRef.current?.click()}
                  className="min-h-[44px] px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 border-dashed rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                >
                  {isCompressingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600 shrink-0" />
                  ) : (
                    <Camera className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">Ambil Kamera</span>
                </button>
                <button
                  type="button"
                  disabled={isCompressingPhoto}
                  onClick={() => galleryInputRef.current?.click()}
                  className="min-h-[44px] px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 border-dashed rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                >
                  {isCompressingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">Pilih Galeri</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={photoUrl}
                  alt="Lampiran kondisi darurat SOS"
                  referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover"
                />
                <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-emerald-700 truncate">
                    Foto siap dilampirkan ke sinyal SOS
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    >
                      Foto Ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isCompressingPhoto && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                <span>Mengoptimalkan ukuran foto agar terkirim cepat...</span>
              </p>
            )}

            {photoError && (
              <p className="text-xs text-rose-600 font-medium">{photoError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row-reverse items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting || isCompressingPhoto}
              onClick={handleSubmitPanic}
              className="w-full sm:w-2/3 min-h-[48px] py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-2 cursor-pointer border border-rose-500 whitespace-nowrap"
            >
              <BellRing className="w-4 h-4 shrink-0" />
              <span>Kirim Sinyal Panik Sekarang</span>
            </button>
            <button
              type="button"
              onClick={resetFormAndClose}
              className="w-full sm:w-1/3 min-h-[48px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
