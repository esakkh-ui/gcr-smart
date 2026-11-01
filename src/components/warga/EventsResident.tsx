import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';

export const EventsResident: React.FC = () => {
  const { currentUser } = useAuth();
  const { events, eventRegistrations, registerForEvent, cancelEventRegistration } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kegiatan Warga & Pendaftaran</h1>
        <p className="text-sm text-slate-500">Lihat jadwal kegiatan RT dan daftarkan diri Anda atau keluarga.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(evt => {
          const registered = eventRegistrations.some(r => r.eventId === evt.eventId && r.userUid === currentUser?.uid);
          const registeredCount = eventRegistrations.filter(r => r.eventId === evt.eventId).length;

          const handleToggleRegister = () => {
            if (!currentUser || !currentUser.houseId) return;
            if (registered) {
              cancelEventRegistration(evt.eventId, currentUser.uid);
            } else {
              const success = registerForEvent(evt.eventId, currentUser.uid, currentUser.houseId, currentUser.fullName);
              if (!success) {
                alert('Maaf, kuota peserta kegiatan ini sudah penuh.');
              }
            }
          };

          return (
            <div key={evt.eventId} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                    {evt.category}
                  </span>
                  <StatusBadge status={evt.status} />
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
                    <span>Peserta: <strong>{registeredCount} / {evt.quota || 'Tanpa Batas'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleToggleRegister}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    registered
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {registered ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Batalkan Keikutsertaan</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Daftar Kegiatan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
