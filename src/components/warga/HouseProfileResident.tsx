import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../common/StatusBadge';
import { Home, Users, Phone, Mail } from 'lucide-react';

export const HouseProfileResident: React.FC = () => {
  const { currentUser } = useAuth();
  const { houses, residents } = useData();

  const residentHouse = houses.find(h => h.houseId === currentUser?.houseId);
  const householdMembers = residents.filter(r => r.houseId === currentUser?.houseId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rumah & Anggota Keluarga Saya</h1>
        <p className="text-sm text-slate-500">Informasi detail rumah dan daftar penghuni terdaftar.</p>
      </div>

      {residentHouse ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{residentHouse.addressLabel}</h2>
                <span className="text-xs text-slate-500">Blok {residentHouse.block} — Nomor {residentHouse.houseNumber}</span>
              </div>
            </div>
            <StatusBadge status={residentHouse.occupancyStatus} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Daftar Penghuni Rumah</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {householdMembers.map(m => (
                <div key={m.residentId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{m.fullName}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                      {m.householdRelationship}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl text-center text-slate-400">
          Akun Anda belum ditautkan ke unit rumah manapun. Silakan hubungi Administrator.
        </div>
      )}
    </div>
  );
};
