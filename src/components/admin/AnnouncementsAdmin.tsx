import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Announcement, AnnouncementCategory } from '../../types';
import { Megaphone, Plus, Trash2, Pin, Calendar } from 'lucide-react';

export const AnnouncementsAdmin: React.FC = () => {
  const { announcements, saveAnnouncement, deleteAnnouncement } = useData();
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('Informasi Umum');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !currentUser) return;

    saveAnnouncement({
      title,
      category,
      content,
      priority,
      isPinned,
      authorName: currentUser.fullName,
      publishedAt: new Date().toISOString(),
      status: 'PUBLISHED',
    });

    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setIsPinned(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengumuman & Informasi Warga</h1>
          <p className="text-sm text-slate-500">Publikasikan pengumuman resmi RT untuk seluruh warga Grand Ciledug Raya.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map(ann => (
          <div key={ann.announcementId} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                  {ann.category}
                </span>
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                      <Pin className="w-3.5 h-3.5" /> Disematkan
                    </span>
                  )}
                  <button
                    onClick={() => deleteAnnouncement(ann.announcementId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Oleh: {ann.authorName}</span>
              <span>{new Date(ann.publishedAt).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Buat Pengumuman Baru</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Judul pengumuman..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as AnnouncementCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Informasi Umum">Informasi Umum</option>
                    <option value="Keamanan Lingkungan">Keamanan Lingkungan</option>
                    <option value="Kerja Bakti">Kerja Bakti</option>
                    <option value="Iuran dan Keuangan">Iuran dan Keuangan</option>
                    <option value="Kegiatan Warga">Kegiatan Warga</option>
                    <option value="Pemberitahuan Penting">Pemberitahuan Penting</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Prioritas</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as 'NORMAL' | 'IMPORTANT' | 'URGENT')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Penting</option>
                    <option value="URGENT">Mendesak</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Isi Pengumuman</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tulis isi pengumuman lengkap..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="pinCheck" className="text-xs font-medium text-slate-700">
                  Sematkan (Pin) di bagian atas beranda warga
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
