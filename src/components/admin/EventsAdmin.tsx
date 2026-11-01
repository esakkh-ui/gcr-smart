import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CommunityEvent } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, Plus, MapPin, Users, Edit2, Trash2 } from 'lucide-react';

export const EventsAdmin: React.FC = () => {
  const { events, eventRegistrations, saveEvent, deleteEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kerja Bakti');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-01 08:00');
  const [location, setLocation] = useState('Fasum Lapangan Utama RT 05');
  const [quota, setQuota] = useState(100);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setTitle('');
    setCategory('Kerja Bakti');
    setDescription('');
    setEventDate('2026-11-01 08:00');
    setLocation('Fasum Lapangan Utama RT 05');
    setQuota(100);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: CommunityEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setCategory(evt.category);
    setDescription(evt.description);
    setEventDate(evt.eventDate);
    setLocation(evt.location);
    setQuota(evt.quota || 100);
    setIsModalOpen(true);
  };

  const handleDelete = (eventId: string) => {
    deleteEvent(eventId);
    setDeletingEventId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    if (editingEvent) {
      saveEvent(
        {
          title,
          category,
          description,
          eventDate,
          location,
          quota: Number(quota),
          status: editingEvent.status,
        },
        editingEvent.eventId
      );
    } else {
      saveEvent({
        title,
        category,
        description,
        eventDate,
        location,
        quota: Number(quota),
        status: 'SCHEDULED',
      });
    }

    setIsModalOpen(false);
    setEditingEvent(null);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kegiatan & Acara Warga</h1>
          <p className="text-sm text-slate-500">Kelola jadwal kegiatan warga, kerja bakti, rapat RT, dan kuota peserta.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kegiatan Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(evt => {
          const registeredCount = eventRegistrations.filter(r => r.eventId === evt.eventId).length;
          return (
            <div key={evt.eventId} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                    {evt.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={evt.status} />
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition cursor-pointer"
                      title="Edit Kegiatan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {deletingEventId === evt.eventId ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(evt.eventId)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold rounded cursor-pointer"
                        >
                          Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEventId(null)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingEventId(evt.eventId)}
                        className="p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Hapus Kegiatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{evt.description}</p>
                
                <div className="space-y-1 pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Waktu: <strong>{evt.eventDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Lokasi: <strong>{evt.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Peserta Terdaftar: <strong>{registeredCount} / {evt.quota || 'Tanpa Batas'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Card Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(evt)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Kegiatan</span>
                </button>
                {deletingEventId === evt.eventId ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(evt.eventId)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingEventId(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletingEventId(evt.eventId)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingEvent ? 'Edit Kegiatan Warga' : 'Buat Kegiatan Warga Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kerja Bakti Massal"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Kategori</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Kuota Peserta</label>
                  <input
                    type="number"
                    required
                    value={quota}
                    onChange={e => setQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Waktu Acara</label>
                  <input
                    type="text"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Lokasi</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deskripsi Kegiatan</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
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
                  {editingEvent ? 'Perbarui Kegiatan' : 'Simpan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
