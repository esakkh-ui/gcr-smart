import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Clock, ShieldAlert, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';

export const PendingApprovalPage: React.FC = () => {
  const { currentUser, logout, refreshAuthFromCloud } = useAuth();
  const { refreshDataFromCloud } = useData();
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const autoSyncedUidRef = useRef<string | null>(null);

  // Automatically ensure pending registration is pushed to Cloud Firestore once on mount
  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid || autoSyncedUidRef.current === uid) return;
    autoSyncedUidRef.current = uid;

    let active = true;
    const autoSync = async () => {
      try {
        await refreshAuthFromCloud();
        if (active) {
          await refreshDataFromCloud();
        }
      } catch {
        // ignore background sync warning
      }
    };
    autoSync();
    return () => {
      active = false;
    };
  }, [currentUser?.uid, refreshAuthFromCloud, refreshDataFromCloud]);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      await refreshAuthFromCloud();
      await refreshDataFromCloud();
      setSyncNotice('Data pendaftaran telah disinkronkan ke server Pengurus RT.');
      setTimeout(() => setSyncNotice(null), 5000);
    } catch {
      setSyncNotice('Gagal menyinkronkan data. Periksa koneksi internet Anda.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Menunggu Persetujuan Pengurus</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Halo <strong>{currentUser?.fullName}</strong>, akun dan pendaftaran rumah Anda sedang diverifikasi oleh Pengurus RT Grand Ciledug Raya. Halaman ini akan terbuka otomatis begitu Pengurus menyetujui pendaftaran Anda.
          </p>
        </div>

        {syncNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing}
            className="w-full sm:w-auto px-4 py-2 bg-[#142D4E] hover:bg-[#1f4068] disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Menyinkronkan...' : 'Cek Status & Sinkronkan'}</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const AccessDeniedPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Akses Ditolak / Ditangguhkan</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Akun Anda telah ditolak atau ditangguhkan oleh Administrator. Silakan hubungi pengurus RT Grand Ciledug Raya untuk informasi lebih lanjut.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition inline-flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
