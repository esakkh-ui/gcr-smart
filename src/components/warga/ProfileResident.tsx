import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { normalizeHouseId } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  formatEmergencyRelation,
  formatPopulationStatus,
  formatDomicileStatus,
} from '../../utils/formatters';
import {
  Phone,
  Mail,
  Shield,
  KeyRound,
  Lock,
  Save,
  CheckCircle2,
  Home,
  AlertCircle,
  MapPin,
  FileText,
  BellRing,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAComponents';

import { AndroidPushFixModal } from '../common/AndroidPushFixModal';

export const ProfileResident: React.FC = () => {
  const { currentUser, changeUserPassword } = useAuth();
  const { houses, residents } = useData();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);
  const [showAndroidFix, setShowAndroidFix] = useState(false);

  const normalizedUserHouseId = normalizeHouseId(currentUser?.houseId);
  const house = houses.find(h => normalizeHouseId(h.houseId) === normalizedUserHouseId);
  const residentRecord =
    residents.find(r => r.userUid === currentUser?.uid) ||
    residents.find(r => normalizeHouseId(r.houseId) === normalizedUserHouseId);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback({ type: 'ERROR', message: 'Semua bidang password wajib diisi.' });
      return;
    }

    if (newPassword.trim().length < 4) {
      setFeedback({ type: 'ERROR', message: 'Password baru minimal harus 4 karakter.' });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setFeedback({ type: 'ERROR', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    const changePasswordPromise = changeUserPassword(currentPassword, newPassword);
    
    changePasswordPromise.then(res => {
      if (res.success) {
        setFeedback({ type: 'SUCCESS', message: 'Password akun Anda berhasil diperbarui!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'ERROR', message: res.message });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profil & Pengaturan Akun Warga</h1>
        <p className="text-sm text-slate-500">
          Informasi profil keanggotaan dan pengaturan kata sandi (password) Anda di GCR Smart Residence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 h-fit">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#142D4E] text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
              {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'W'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentUser?.fullName}</h2>
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                Warga Terdaftar
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Unit Rumah:</span>
                <span className="font-bold text-slate-900">{house ? house.addressLabel : currentUser?.houseId || '-'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Email Terdaftar:</span>
                <span className="font-medium text-slate-800">{currentUser?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Nomor WhatsApp / HP:</span>
                <span className="font-medium text-slate-800">{currentUser?.phoneNumber || '-'}</span>
              </div>
            </div>

            {residentRecord?.originVillage && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Desa Asal:</span>
                  <span className="font-medium text-slate-800">{residentRecord.originVillage}</span>
                </div>
              </div>
            )}

            {residentRecord?.emergencyContactPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    Kontak Keluarga Terdekat ({formatEmergencyRelation(residentRecord.emergencyContactRelation)}):
                  </span>
                  <span className="font-medium text-slate-800 font-mono tabular-nums">
                    {residentRecord.emergencyContactPhone}
                  </span>
                </div>
              </div>
            )}

            {residentRecord?.populationStatus && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 block font-medium">
                    Status Kependudukan & Domisili:
                  </span>
                  <span className="font-semibold text-slate-800 block text-xs">
                    {formatPopulationStatus(residentRecord.populationStatus)} · Surat Domisili:{' '}
                    {formatDomicileStatus(residentRecord.domicileLetterStatus)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Dokumen KTP: {residentRecord.ktpPhotoUrl ? 'Terlampir' : '-'} · KK:{' '}
                    {residentRecord.kkPhotoUrl ? 'Terlampir' : 'Opsional'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-700 text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Status Akun: Aktif & Terverifikasi
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <PWAInstallButton variant="card" />
              {/android/i.test(navigator.userAgent) && (
                <button
                  onClick={() => setShowAndroidFix(true)}
                  className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold rounded-lg border border-orange-200 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  Punya Masalah Notifikasi di Android?
                </button>
              )}
            </div>

            <AndroidPushFixModal 
              isOpen={showAndroidFix} 
              onClose={() => setShowAndroidFix(false)} 
            />
          </div>
        </div>

        {/* Password Change Settings Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Pengaturan Ganti Password</h2>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'SUCCESS'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password saat ini / Password lama *</label>
                <button
                  type="button"
                  onClick={() => setFeedback({
                    type: 'ERROR',
                    message: 'Lupa password saat ini? Silakan minta Pak RT / Admin untuk melakukan Reset Password ke gcr123 di menu Rumah & Data Warga.'
                  })}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Lupa password saat ini?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password saat ini (default: gcr123)"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Password Baru *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Konfirmasi Password Baru *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Ketik ulang password baru"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Password Baru</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
