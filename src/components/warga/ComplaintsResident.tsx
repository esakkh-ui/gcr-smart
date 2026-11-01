import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ComplaintCategory } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { compressIdentityImage } from '../../utils/imageCompressor';
import { formatDate } from '../../utils/formatters';
import {
  Plus,
  Camera,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Maximize2,
  X,
} from 'lucide-react';

export const ComplaintsResident: React.FC = () => {
  const { currentUser } = useAuth();
  const { complaints, createComplaint, complaintUpdates } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [category, setCategory] = useState<ComplaintCategory>('Kebersihan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const userComplaints = complaints
    .filter(c => c.userUid === currentUser?.uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const resetForm = () => {
    setCategory('Kebersihan');
    setTitle('');
    setDescription('');
    setPhotoUrl('');
    setPhotoError(null);
    setIsCompressingPhoto(false);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
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
        err instanceof Error ? err.message : 'Gagal memproses foto. Silakan pilih foto lainnya.'
      );
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !currentUser || !currentUser.houseId) return;
    if (isCompressingPhoto) return;

    createComplaint({
      userUid: currentUser.uid,
      houseId: currentUser.houseId,
      category,
      title: title.trim(),
      description: description.trim(),
      imageUrl: photoUrl || undefined,
    });

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pengaduan & Aspirasi Warga
          </h1>
          <p className="text-sm text-slate-500">
            Sampaikan laporan fasilitas umum, kebersihan, keamanan, atau aspirasi Anda beserta foto jika ada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Buat Pengaduan Baru</span>
        </button>
      </div>

      <div className="space-y-4">
        {userComplaints.map(cmp => {
          const updates = complaintUpdates.filter(u => u.complaintId === cmp.complaintId);
          return (
            <div
              key={cmp.complaintId}
              className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-blue-700">{cmp.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{formatDate(cmp.createdAt)}</span>
                </div>
                <StatusBadge status={cmp.status} />
              </div>

              <h3 className="text-base font-bold text-slate-900">{cmp.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {cmp.description}
              </p>

              {cmp.imageUrl && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setZoomedImage({ url: cmp.imageUrl!, title: cmp.title })}
                    className="relative group block w-full sm:w-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer text-left"
                  >
                    <img
                      src={cmp.imageUrl}
                      alt={`Foto pengaduan: ${cmp.title}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-white">Foto Lampiran</span>
                      <span className="text-xs font-semibold text-white flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Perbesar
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {updates.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-700">Tanggapan Pengurus:</div>
                  {updates.map(upd => (
                    <div
                      key={upd.updateId}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{upd.authorName}</span>
                        <span className="text-slate-400 font-normal font-mono tabular-nums">
                          {formatDate(upd.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{upd.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {userComplaints.length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
            <p className="text-sm font-medium text-slate-600">
              Anda belum memiliki pengaduan atau aspirasi yang dikirim.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengaduan Pertama</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Buat Pengaduan Baru */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-900">Buat Pengaduan Baru</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kategori Pengaduan</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-600"
                >
                  <option value="Kebersihan">Kebersihan</option>
                  <option value="Keamanan">Keamanan</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Fasilitas Umum">Fasilitas Umum</option>
                  <option value="Lingkungan">Lingkungan</option>
                  <option value="Aspirasi">Aspirasi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Judul Pengaduan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lampu PJU Blok A Mati"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deskripsi Lengkap</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan detail kendala, lokasi spesifik, atau aspirasi Anda..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Lampiran Foto Kamera / Galeri (Opsional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Lampirkan Foto Bukti / Kondisi (Opsional)
                  </label>
                  <span className="text-[11px] text-slate-400">Kamera / Galeri</span>
                </div>

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
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                      ) : (
                        <Camera className="w-4 h-4 text-blue-600 shrink-0" />
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
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={photoUrl}
                      alt="Pratinjau lampiran pengaduan"
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-emerald-700 truncate">
                        Foto berhasil dilampirkan
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          Ganti
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
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Mengompresi foto agar siap diunggah...</span>
                  </p>
                )}

                {photoError && (
                  <p className="text-xs text-rose-600 font-medium">{photoError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition cursor-pointer whitespace-nowrap"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCompressingPhoto}
                  className="min-h-[44px] px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer whitespace-nowrap"
                >
                  Kirim Pengaduan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Foto Pengaduan */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="w-full max-w-3xl flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white gap-3">
              <span className="text-sm font-bold truncate">{zoomedImage.title}</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer shrink-0"
                aria-label="Tutup Foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={zoomedImage.url}
              alt={zoomedImage.title}
              referrerPolicy="no-referrer"
              className="max-h-[78dvh] w-auto max-w-full rounded-2xl object-contain border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
