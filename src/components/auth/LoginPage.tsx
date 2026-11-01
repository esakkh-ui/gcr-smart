import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getCanonicalUnitKey } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  EmergencyContactRelation,
  PopulationStatus,
  DomicileLetterStatus,
  HouseholdRelationship,
  OccupancyType,
} from '../../types';
import { compressIdentityImage } from '../../utils/imageCompressor';
import {
  Lock,
  User as UserIcon,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  X,
  ShieldCheck,
  FileText,
  AlertCircle,
  ArrowLeft,
  Check,
  MapPin,
  Phone,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAComponents';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials, registerUser } = useAuth();
  const { addResident, addHouse, houses, residents, settings } = useData();
  const navigate = useNavigate();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('gcr123');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Registration Mode & Fields
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRelationship, setRegRelationship] = useState<HouseholdRelationship>('KEPALA_KELUARGA');
  const [regOccupancyType, setRegOccupancyType] = useState<OccupancyType>('PEMILIK');
  const [regBlock, setRegBlock] = useState('A');
  const [regHouseNum, setRegHouseNum] = useState('10');

  // New Registration Fields
  const [regOriginVillage, setRegOriginVillage] = useState('');
  const [regEmergencyRelation, setRegEmergencyRelation] =
    useState<EmergencyContactRelation>('ORANG_TUA');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');
  const [regPopulationStatus, setRegPopulationStatus] =
    useState<PopulationStatus>('BELUM_PINDAH');
  const [regDomicileLetter, setRegDomicileLetter] = useState<DomicileLetterStatus>('ADA');
  const [regKtpPhoto, setRegKtpPhoto] = useState('');
  const [regKkPhoto, setRegKkPhoto] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState<'KTP' | 'KK' | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<{
    title: string;
    src: string;
  } | null>(null);

  // Disclaimer & Tata Tertib Modal State
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [agreeDataTruth, setAgreeDataTruth] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);
  const [disclaimerError, setDisclaimerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden file input refs for Camera & Gallery
  const ktpCameraRef = useRef<HTMLInputElement>(null);
  const ktpGalleryRef = useRef<HTMLInputElement>(null);
  const kkCameraRef = useRef<HTMLInputElement>(null);
  const kkGalleryRef = useRef<HTMLInputElement>(null);

  const resetRegistrationForm = () => {
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegRelationship('KEPALA_KELUARGA');
    setRegOccupancyType('PEMILIK');
    setRegBlock('A');
    setRegHouseNum('10');
    setRegOriginVillage('');
    setRegEmergencyRelation('ORANG_TUA');
    setRegEmergencyPhone('');
    setRegPopulationStatus('BELUM_PINDAH');
    setRegDomicileLetter('ADA');
    setRegKtpPhoto('');
    setRegKkPhoto('');
    setAgreeDataTruth(false);
    setAgreeRules(false);
    setDisclaimerError('');
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials(usernameInput, passwordInput);
      if (res.success) {
        if (res.role === 'ADMINISTRATOR') {
          navigate('/admin');
        } else {
          navigate('/warga');
        }
      } else {
        setErrorMsg(res.message || 'Login gagal. Periksa kembali username dan password.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'KTP' | 'KK'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMsg('');
    setUploadingDoc(docType);
    try {
      const compressed = await compressIdentityImage(file);
      if (docType === 'KTP') {
        setRegKtpPhoto(compressed);
      } else {
        setRegKkPhoto(compressed);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : `Gagal memproses foto ${docType}. Silakan coba lagi.`
      );
    } finally {
      setUploadingDoc(null);
    }
  };

  // Step 1: Validate registration form & open Disclaimer + Tata Tertib Modal
  const handleOpenDisclaimerStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !regName.trim() ||
      !regEmail.trim() ||
      !regPhone.trim() ||
      !regHouseNum.trim() ||
      !regOriginVillage.trim() ||
      !regEmergencyPhone.trim()
    ) {
      setErrorMsg(
        'Mohon lengkapi seluruh isian wajib (Nama, Email, No. HP, Rumah, Desa Asal, dan Nomor HP Keluarga Terdekat).'
      );
      return;
    }

    if (!regKtpPhoto) {
      setErrorMsg(
        'Foto KTP wajib dilampirkan. Silakan ambil foto dari Kamera atau pilih dari Galeri.'
      );
      return;
    }

    setDisclaimerError('');
    setShowDisclaimerModal(true);
  };

  const handleSelectAgreeAll = () => {
    const nextState = !(agreeDataTruth && agreeRules);
    setAgreeDataTruth(nextState);
    setAgreeRules(nextState);
    if (nextState) {
      setDisclaimerError('');
    }
  };

  const handleCancelRegistration = () => {
    setShowDisclaimerModal(false);
    resetRegistrationForm();
    setIsRegisterMode(false);
  };

  // Step 2: Final Submit after Disclaimer & Tata Tertib Agreement
  const handleFinalSubmitRegistration = async () => {
    if (!agreeDataTruth || !agreeRules) {
      setDisclaimerError(
        'Mohon centang kedua pernyataan persetujuan atau tekan tombol "Setuju" terlebih dahulu sebelum mengirim pengajuan.'
      );
      return;
    }

    setDisclaimerError('');
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const cleanHouseNum = String(parseInt(regHouseNum.trim(), 10) || regHouseNum.trim());
      const houseId = `house-${regBlock.toLowerCase()}-${cleanHouseNum}`;
      const addressLabel = `Blok ${regBlock}${cleanHouseNum}`;
      const targetUnitKey = getCanonicalUnitKey(`${regBlock}${cleanHouseNum}`);

      const existingHouse = houses.find(
        h => getCanonicalUnitKey(`${h.block}${h.houseNumber}`) === targetUnitKey
      );
      const targetHouseId = existingHouse ? existingHouse.houseId : houseId;

      if (!existingHouse) {
        await addHouse({
          houseId,
          block: regBlock,
          houseNumber: cleanHouseNum,
          addressLabel,
          occupancyStatus: regOccupancyType === 'PENYEWA' ? 'TERISI_SEWA' : 'TERISI_PEMILIK',
        });
      }

      const uid = `warga-${Date.now()}`;
      const acceptedAt = new Date().toISOString();

      await registerUser({
        uid,
        email: regEmail.trim(),
        fullName: regName.trim(),
        phoneNumber: regPhone.trim(),
        role: 'WARGA',
        status: 'PENDING',
        houseId: targetHouseId,
      });

      await addResident({
        residentId: `res-${Date.now()}`,
        userUid: uid,
        houseId: targetHouseId,
        fullName: regName.trim(),
        phoneNumber: regPhone.trim(),
        email: regEmail.trim(),
        householdRelationship: regRelationship,
        occupancyType: regOccupancyType,
        residentStatus: 'PENDING',
        originVillage: regOriginVillage.trim(),
        emergencyContactPhone: regEmergencyPhone.trim(),
        emergencyContactRelation: regEmergencyRelation,
        populationStatus: regPopulationStatus,
        domicileLetterStatus: regDomicileLetter,
        ktpPhotoUrl: regKtpPhoto,
        kkPhotoUrl: regKkPhoto || undefined,
        disclaimerAccepted: true,
        disclaimerAcceptedAt: acceptedAt,
      });

      setShowDisclaimerModal(false);
      navigate('/warga');
    } catch {
      setDisclaimerError(
        'Gagal mengirim pengajuan pendaftaran ke server. Pastikan koneksi internet aktif lalu coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllAgreed = agreeDataTruth && agreeRules;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6">
      <div
        className={`w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-8 space-y-6 transition-all ${
          isRegisterMode ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="text-center space-y-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg overflow-hidden border border-slate-100 p-1">
            <img src="/assets/aistudio/LOGO_GCR_b4e73cb9.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#142D4E]">GCR Smart Residence</h1>
          <p className="text-sm text-slate-500">Grand Ciledug Raya — Portal Warga & Pengurus RT</p>
        </div>

        {!isRegisterMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">User / Kode Blok Rumah</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  placeholder="Contoh: gcr (Admin) atau A10 (Warga)"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password / Kata Sandi</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-2.5 bg-[#142D4E] hover:bg-[#1f4068] disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Memproses...' : 'Masuk (Login)'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setIsRegisterMode(true);
                }}
                className="text-xs text-blue-600 hover:underline font-medium cursor-pointer py-1"
              >
                Belum punya akun? Daftar sebagai Warga baru
              </button>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/support')}
                  className="text-[11px] text-slate-400 hover:text-blue-500 font-medium cursor-pointer"
                >
                  Bantuan Teknis? (Troubleshooting SSH/VPS)
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOpenDisclaimerStep} className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Formulir Pendaftaran Warga Baru</h2>
                <p className="text-xs text-slate-500">
                  Lengkapi identitas, data kependudukan, serta lampiran dokumen warga.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setIsRegisterMode(false);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline shrink-0 cursor-pointer"
              >
                Kembali ke Login
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Bagian 1: Identitas & Kontak Utama */}
            <div className="space-y-3.5">
              <div className="text-xs font-bold text-[#142D4E] border-b border-slate-100 pb-1.5">
                1. Identitas Diri & Unit Hunian
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Nama Lengkap (Sesuai KTP) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Aktif <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    autoComplete="email"
                    placeholder="email@domain.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nomor WhatsApp / HP Pribadi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    placeholder="08xx-xxxx-xxxx"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Blok (A - I) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={regBlock}
                    onChange={e => setRegBlock(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(b => (
                      <option key={b} value={b}>
                        Blok {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    No. Rumah <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    max="60"
                    required
                    placeholder="1 - 60"
                    value={regHouseNum}
                    onChange={e => setRegHouseNum(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Hubungan Keluarga</label>
                  <select
                    value={regRelationship}
                    onChange={e => setRegRelationship(e.target.value as HouseholdRelationship)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                    <option value="PASANGAN">Pasangan</option>
                    <option value="ANAK">Anak</option>
                    <option value="KELUARGA_LAIN">Keluarga Lain</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tipe Hunian</label>
                  <select
                    value={regOccupancyType}
                    onChange={e => setRegOccupancyType(e.target.value as OccupancyType)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="PEMILIK">Pemilik</option>
                    <option value="KELUARGA_PEMILIK">Keluarga Pemilik</option>
                    <option value="PENYEWA">Penyewa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian 2: Desa Asal, Kontak Keluarga Terdekat & Status Kependudukan */}
            <div className="space-y-3.5 pt-2">
              <div className="text-xs font-bold text-[#142D4E] border-b border-slate-100 pb-1.5">
                2. Data Daerah Asal, Kontak Darurat & Kependudukan
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Desa Asal <span className="text-rose-600">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Contoh: Desa Sukamaju, Kec. Cibeber, Kab. Cianjur"
                  value={regOriginVillage}
                  onChange={e => setRegOriginVillage(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Hubungan Keluarga Terdekat <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={regEmergencyRelation}
                    onChange={e =>
                      setRegEmergencyRelation(e.target.value as EmergencyContactRelation)
                    }
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="ORANG_TUA">Orang Tua (Ortu)</option>
                    <option value="PASANGAN">Pasangan</option>
                    <option value="ANAK">Anak</option>
                    <option value="SAUDARA">Saudara</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Nomor HP Keluarga Terdekat (Ortu/Pasangan/Anak/Saudara){' '}
                      <span className="text-rose-600">*</span>
                    </span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    maxLength={60}
                    placeholder="Contoh: 0812-xxxx-xxxx"
                    value={regEmergencyPhone}
                    onChange={e => setRegEmergencyPhone(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Status Kependudukan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Status Kependudukan <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRegPopulationStatus('SUDAH_WARGA_LEUWUNGGAJAH')}
                    className={`min-h-[46px] px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between gap-2 cursor-pointer ${
                      regPopulationStatus === 'SUDAH_WARGA_LEUWUNGGAJAH'
                        ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>a. Sudah Warga Leuwunggajah</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        regPopulationStatus === 'SUDAH_WARGA_LEUWUNGGAJAH'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-400 bg-white'
                      }`}
                    >
                      {regPopulationStatus === 'SUDAH_WARGA_LEUWUNGGAJAH' && (
                        <Check className="w-3 h-3" />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegPopulationStatus('BELUM_PINDAH')}
                    className={`min-h-[46px] px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between gap-2 cursor-pointer ${
                      regPopulationStatus === 'BELUM_PINDAH'
                        ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>b. Belum Pindah Kependudukan</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        regPopulationStatus === 'BELUM_PINDAH'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-400 bg-white'
                      }`}
                    >
                      {regPopulationStatus === 'BELUM_PINDAH' && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                </div>
              </div>

              {/* Surat Domisili */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Surat Domisili <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRegDomicileLetter('ADA')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center justify-between gap-2 cursor-pointer ${
                      regDomicileLetter === 'ADA'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Ada</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        regDomicileLetter === 'ADA'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-400 bg-white'
                      }`}
                    >
                      {regDomicileLetter === 'ADA' && <Check className="w-3 h-3" />}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegDomicileLetter('TIDAK_ADA')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center justify-between gap-2 cursor-pointer ${
                      regDomicileLetter === 'TIDAK_ADA'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Tidak Ada</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        regDomicileLetter === 'TIDAK_ADA'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-slate-400 bg-white'
                      }`}
                    >
                      {regDomicileLetter === 'TIDAK_ADA' && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bagian 3: Upload Foto KTP (Wajib) & Foto KK (Opsional) */}
            <div className="space-y-3.5 pt-2">
              <div className="text-xs font-bold text-[#142D4E] border-b border-slate-100 pb-1.5">
                3. Lampiran Dokumen Identitas (Kamera / Galeri)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Input KTP */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Foto KTP <span className="text-rose-600">* (Wajib)</span>
                    </label>
                    {regKtpPhoto && (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terlampir
                      </span>
                    )}
                  </div>

                  {/* Hidden File Inputs for KTP */}
                  <input
                    ref={ktpCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => handleDocFileChange(e, 'KTP')}
                    className="hidden"
                  />
                  <input
                    ref={ktpGalleryRef}
                    type="file"
                    accept="image/*"
                    onChange={e => handleDocFileChange(e, 'KTP')}
                    className="hidden"
                  />

                  {regKtpPhoto ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white h-32">
                        <img
                          src={regKtpPhoto}
                          alt="Pratinjau KTP"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImageModal({ title: 'Pratinjau Foto KTP', src: regKtpPhoto })
                            }
                            className="px-2 py-1 bg-white/95 hover:bg-white text-slate-900 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> Lihat
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegKtpPhoto('')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Ambil foto KTP langsung melalui kamera HP atau pilih dari galeri perangkat.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={uploadingDoc === 'KTP'}
                      onClick={() => ktpCameraRef.current?.click()}
                      className="min-h-[42px] px-2.5 py-2 bg-white hover:bg-blue-50 text-slate-800 border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{uploadingDoc === 'KTP' ? 'Memproses...' : 'Kamera'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={uploadingDoc === 'KTP'}
                      onClick={() => ktpGalleryRef.current?.click()}
                      className="min-h-[42px] px-2.5 py-2 bg-white hover:bg-blue-50 text-slate-800 border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Galeri</span>
                    </button>
                  </div>
                </div>

                {/* Input KK (Optional) */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Foto Kartu Keluarga / KK{' '}
                      <span className="text-slate-500 font-normal">(Opsional)</span>
                    </label>
                    {regKkPhoto && (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terlampir
                      </span>
                    )}
                  </div>

                  {/* Hidden File Inputs for KK */}
                  <input
                    ref={kkCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => handleDocFileChange(e, 'KK')}
                    className="hidden"
                  />
                  <input
                    ref={kkGalleryRef}
                    type="file"
                    accept="image/*"
                    onChange={e => handleDocFileChange(e, 'KK')}
                    className="hidden"
                  />

                  {regKkPhoto ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white h-32">
                        <img
                          src={regKkPhoto}
                          alt="Pratinjau KK"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImageModal({ title: 'Pratinjau Foto KK', src: regKkPhoto })
                            }
                            className="px-2 py-1 bg-white/95 hover:bg-white text-slate-900 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> Lihat
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegKkPhoto('')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Dapat dilampirkan sekarang melalui kamera/galeri atau menyusul kepada Pengurus RT.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={uploadingDoc === 'KK'}
                      onClick={() => kkCameraRef.current?.click()}
                      className="min-h-[42px] px-2.5 py-2 bg-white hover:bg-blue-50 text-slate-800 border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{uploadingDoc === 'KK' ? 'Memproses...' : 'Kamera'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={uploadingDoc === 'KK'}
                      onClick={() => kkGalleryRef.current?.click()}
                      className="min-h-[42px] px-2.5 py-2 bg-white hover:bg-blue-50 text-slate-800 border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Galeri</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || uploadingDoc !== null}
                className="w-full min-h-[48px] py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Kirim Pendaftaran Warga</span>
              </button>
            </div>
          </form>
        )}

        <PWAInstallButton variant="card" />
      </div>

      {/* MODAL DISCLAIMER & TATA TERTIB PERUMAHAN */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92dvh] my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 bg-[#142D4E] text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold leading-snug">
                    Pernyataan Warga & Tata Tertib Perumahan
                  </h3>
                  <p className="text-[11px] sm:text-xs text-blue-200">
                    Paguyuban Grand Ciledug Raya — Konfirmasi Pengajuan Pendaftaran
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDisclaimerModal(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                title="Kembali ke Formulir"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Tata Tertib Perumahan */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>TATA TERTIB LINGKUNGAN PERUMAHAN GRAND CILEDUG RAYA</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 max-h-56 overflow-y-auto text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {`A. KETERTIBAN & ADMINISTRASI
1. Pelaporan Tamu: Warga wajib melapor kepada pengurus RT atau petugas keamanan apabila terdapat tamu yang menginap lebih dari 1x24 jam.
2. Administrasi Kependudukan: Warga baru (pemilik maupun penyewa) wajib melaporkan diri kepada sekretariat Paguyuban untuk keperluan pendataan administrasi kependudukan.
3. Pelaporan Kepergian: Warga yang akan meninggalkan rumah dalam waktu lebih dari 1x24 jam (keluar kota/perjalanan dinas) diwajibkan melapor kepada petugas keamanan atau pengurus RT setempat.

B. KEUANGAN & PEMELIHARAAN LINGKUNGAN
4. Pembayaran Iuran: Warga wajib melakukan pembayaran Iuran Pengelolaan Lingkungan (IPL) secara tepat waktu sesuai dengan nominal dan ketentuan yang ditetapkan oleh Paguyuban.
5. Kegiatan Sosial (Gotong Royong): Warga diharapkan berpartisipasi aktif dalam kegiatan kerja bakti/gotong royong yang dijadwalkan oleh Paguyuban demi menjaga keasrian dan kebersihan lingkungan bersama.
6. Renovasi Bangunan: Segala bentuk renovasi bangunan yang memerlukan perubahan struktur atau penggunaan area fasilitas umum wajib mengajukan izin tertulis kepada Paguyuban/RT setempat, serta bertanggung jawab penuh atas kebersihan area sekitar setelah pekerjaan selesai.

C. AKSES, PARKIR, & KEAMANAN
7. Ketertiban Parkir & Jalan: Kendaraan wajib diparkir di dalam area rumah masing-masing. Dilarang memarkir kendaraan di badan jalan yang dapat mengganggu akses lalu lintas warga lain atau kendaraan darurat (pemadam/ambulan).
8. Akses Gerbang: Gerbang utama ditutup pada pukul 23.00 s.d. 06.00 WIB. Akses masuk/keluar bagi tamu atau warga dengan keperluan mendesak di jam tersebut wajib melakukan konfirmasi kepada petugas keamanan yang bertugas.
9. Pengawasan Lingkungan: Seluruh area perumahan dalam pengawasan CCTV selama 24 jam demi keamanan dan keselamatan bersama.

D. NORMA & SANKSI
10. Larangan Aktivitas Meresahkan: Dilarang melakukan segala bentuk aktivitas yang mengganggu ketertiban umum dan melanggar norma sosial, termasuk penyalahgunaan minuman keras, perjudian, tindak asusila, dan perbuatan yang meresahkan masyarakat lainnya.
11. Penegakan Hukum: Segala bentuk pelanggaran hukum yang terjadi di lingkungan perumahan akan diserahkan sepenuhnya kepada pihak yang berwajib untuk ditindaklanjuti.`}
                </div>
              </div>

              {/* Pernyataan Disclaimer (Redaksi Resmi yang Diperbaiki) */}
              <div className="space-y-3">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  Pernyataan Kesanggupan & Kebenaran Data Pendaftar:
                </div>

                {/* Pernyataan 1: Kebenaran Data */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed cursor-pointer transition ${
                    agreeDataTruth
                      ? 'bg-emerald-50/70 border-emerald-500 text-slate-900'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeDataTruth}
                    onChange={e => {
                      setAgreeDataTruth(e.target.checked);
                      if (e.target.checked && agreeRules) setDisclaimerError('');
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                  />
                  <span>
                    <strong>Pernyataan Kebenaran Data:</strong> Saya menyatakan dengan sesungguhnya
                    bahwa seluruh data identitas diri, informasi kependudukan, serta dokumen yang
                    saya lampirkan dalam formulir pendaftaran ini adalah <strong>benar, sah, dan
                    sesuai dengan keadaan sebenarnya</strong>, serta saya bersedia bertanggung jawab
                    apabila di kemudian hari ditemukan ketidaksesuaian data.
                  </span>
                </label>

                {/* Pernyataan 2: Kepatuhan Peraturan Paguyuban */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed cursor-pointer transition ${
                    agreeRules
                      ? 'bg-emerald-50/70 border-emerald-500 text-slate-900'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeRules}
                    onChange={e => {
                      setAgreeRules(e.target.checked);
                      if (agreeDataTruth && e.target.checked) setDisclaimerError('');
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                  />
                  <span>
                    <strong>Kepatuhan Peraturan Paguyuban:</strong> Saya telah membaca, memahami,
                    dan menyatakan bersedia <strong>mematuhi seluruh Peraturan serta Tata Tertib yang
                    berlaku di Paguyuban Grand Ciledug Raya</strong> demi keamanan, ketertiban, dan
                    kerukunan lingkungan bersama.
                  </span>
                </label>
              </div>

              {/* Pilihan Cepat: Setuju / Kembali / Batal */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSelectAgreeAll}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                    isAllAgreed
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isAllAgreed ? 'Setuju (Telah Dicentang)' : 'Setuju Semua Pernyataan'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDisclaimerModal(false)}
                    disabled={isSubmitting}
                    className="min-h-[42px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelRegistration}
                    disabled={isSubmitting}
                    className="min-h-[42px] px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>

              {disclaimerError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{disclaimerError}</span>
                </div>
              )}
            </div>

            {/* Sticky Footer Primary Submit CTA */}
            <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={handleFinalSubmitRegistration}
                disabled={isSubmitting}
                className={`w-full min-h-[48px] py-3 px-4 rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                  isAllAgreed
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                }`}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>
                  {isSubmitting
                    ? 'Mengirim Pengajuan ke Pengurus RT...'
                    : 'Kirim Pengajuan Pendaftaran Warga Baru'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Preview Modal for KTP / KK */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">{previewImageModal.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[75dvh] overflow-auto">
              <img
                src={previewImageModal.src}
                alt={previewImageModal.title}
                className="max-w-full max-h-[70dvh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Password Warga</h3>
                <p className="text-xs text-slate-500">GCR Smart Residence</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Sesuai prosedur keamanan lingkungan, apabila Anda lupa kata sandi akun warga, silakan
                ajukan reset password ke <strong>Pengurus RT / Admin</strong>.
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-950">Informasi Reset Password:</div>
                <p className="text-[11px] text-blue-800">
                  Admin dapat mereset password akun Anda kembali ke password bawaan default:{' '}
                  <strong className="font-mono font-bold text-blue-900">gcr123</strong> melalui menu{' '}
                  <em>Rumah & Data Warga</em>.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Kontak Pak RT / Pengurus:</div>
                <div className="text-slate-700 font-semibold">
                  {settings.adminContactPhone || '+62 812-3456-7890'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-5 py-2 bg-[#142D4E] hover:bg-[#1f4068] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
