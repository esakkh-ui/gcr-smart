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
  Check,
  X,
  Clock,
  CheckCircle2,
  Home,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  MapPin,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';

interface PendingItem {
  uid: string;
  residentId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  houseId?: string;
  householdRelationship?: string;
  occupancyType?: string;
  originVillage?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  populationStatus?: string;
  domicileLetterStatus?: string;
  ktpPhotoUrl?: string;
  kkPhotoUrl?: string;
  disclaimerAccepted?: boolean;
  disclaimerAcceptedAt?: string;
  createdAt: string;
}

export const AccountApprovals: React.FC = () => {
  const { users, approveUser, rejectUser, refreshAuthFromCloud } = useAuth();
  const { houses, residents, updateResident, addResident, refreshDataFromCloud } = useData();
  const [actionMessage, setActionMessage] = useState<{
    type: 'APPROVED' | 'REJECTED';
    text: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<PendingItem | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<{ title: string; src: string } | null>(null);

  const handleRefreshCloud = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshAuthFromCloud(), refreshDataFromCloud()]);
      setActionMessage({
        type: 'APPROVED',
        text: 'Daftar persetujuan warga terbaru berhasil dimuat langsung dari server.',
      });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Merge pending items from both 'users' and 'residents' so no registration from another device is ever missed
  const pendingMap = new Map<string, PendingItem>();

  users
    .filter(u => u.status === 'PENDING' && u.role === 'WARGA')
    .forEach(u => {
      const matchedRes = residents.find(r => r.userUid === u.uid);
      pendingMap.set(u.uid, {
        uid: u.uid,
        residentId: matchedRes?.residentId,
        fullName: matchedRes?.fullName || u.fullName,
        email: matchedRes?.email || u.email,
        phoneNumber: matchedRes?.phoneNumber || u.phoneNumber,
        houseId: normalizeHouseId(u.houseId || matchedRes?.houseId),
        householdRelationship: matchedRes?.householdRelationship,
        occupancyType: matchedRes?.occupancyType,
        originVillage: matchedRes?.originVillage,
        emergencyContactPhone: matchedRes?.emergencyContactPhone,
        emergencyContactRelation: matchedRes?.emergencyContactRelation,
        populationStatus: matchedRes?.populationStatus,
        domicileLetterStatus: matchedRes?.domicileLetterStatus,
        ktpPhotoUrl: matchedRes?.ktpPhotoUrl,
        kkPhotoUrl: matchedRes?.kkPhotoUrl,
        disclaimerAccepted: matchedRes?.disclaimerAccepted,
        disclaimerAcceptedAt: matchedRes?.disclaimerAcceptedAt,
        createdAt: u.createdAt || matchedRes?.createdAt || new Date().toISOString(),
      });
    });

  residents
    .filter(r => r.residentStatus === 'PENDING')
    .forEach(r => {
      const matchedUser = users.find(u => u.uid === r.userUid);
      if (matchedUser && matchedUser.status !== 'PENDING') return;
      if (!pendingMap.has(r.userUid)) {
        pendingMap.set(r.userUid, {
          uid: r.userUid,
          residentId: r.residentId,
          fullName: r.fullName,
          email: r.email,
          phoneNumber: r.phoneNumber,
          houseId: normalizeHouseId(r.houseId),
          householdRelationship: r.householdRelationship,
          occupancyType: r.occupancyType,
          originVillage: r.originVillage,
          emergencyContactPhone: r.emergencyContactPhone,
          emergencyContactRelation: r.emergencyContactRelation,
          populationStatus: r.populationStatus,
          domicileLetterStatus: r.domicileLetterStatus,
          ktpPhotoUrl: r.ktpPhotoUrl,
          kkPhotoUrl: r.kkPhotoUrl,
          disclaimerAccepted: r.disclaimerAccepted,
          disclaimerAcceptedAt: r.disclaimerAcceptedAt,
          createdAt: r.createdAt || new Date().toISOString(),
        });
      }
    });

  const pendingItems = Array.from(pendingMap.values()).sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );

  const handleApprove = (item: PendingItem) => {
    approveUser(item.uid);

    const existingRes =
      (item.residentId ? residents.find(r => r.residentId === item.residentId) : undefined) ||
      residents.find(r => r.userUid === item.uid);

    if (existingRes) {
      updateResident(existingRes.residentId, { residentStatus: 'ACTIVE' });
    } else if (item.houseId) {
      addResident({
        residentId: `res-${Date.now()}`,
        userUid: item.uid,
        houseId: item.houseId,
        fullName: item.fullName,
        phoneNumber: item.phoneNumber,
        email: item.email,
        householdRelationship: (item.householdRelationship as any) || 'KEPALA_KELUARGA',
        occupancyType: (item.occupancyType as any) || 'PEMILIK',
        residentStatus: 'ACTIVE',
        originVillage: item.originVillage,
        emergencyContactPhone: item.emergencyContactPhone,
        emergencyContactRelation: item.emergencyContactRelation as any,
        populationStatus: item.populationStatus as any,
        domicileLetterStatus: item.domicileLetterStatus as any,
        ktpPhotoUrl: item.ktpPhotoUrl,
        kkPhotoUrl: item.kkPhotoUrl,
        disclaimerAccepted: item.disclaimerAccepted,
        disclaimerAcceptedAt: item.disclaimerAcceptedAt,
      });
    }

    const house = houses.find(h => normalizeHouseId(h.houseId) === normalizeHouseId(item.houseId));
    const houseLabel = house
      ? `${house.addressLabel} (User Login: ${house.block}${house.houseNumber})`
      : item.houseId || '';

    setSelectedDetail(null);
    setActionMessage({
      type: 'APPROVED',
      text: `Pendaftaran warga ${item.fullName} ${houseLabel ? `— ${houseLabel}` : ''} telah disetujui dan langsung aktif!`,
    });
    setTimeout(() => setActionMessage(null), 6000);
  };

  const handleReject = (item: PendingItem) => {
    rejectUser(item.uid);

    const existingRes =
      (item.residentId ? residents.find(r => r.residentId === item.residentId) : undefined) ||
      residents.find(r => r.userUid === item.uid);

    if (existingRes) {
      updateResident(existingRes.residentId, { residentStatus: 'REJECTED' });
    }

    setSelectedDetail(null);
    setActionMessage({
      type: 'REJECTED',
      text: `Pendaftaran akun ${item.fullName} telah ditolak.`,
    });
    setTimeout(() => setActionMessage(null), 6000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Persetujuan Akun Warga Baru
          </h1>
          <p className="text-sm text-slate-500">
            Tinjau kelengkapan data kependudukan, dokumen KTP/KK, dan setujui pendaftaran warga secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pendingItems.length > 0 && (
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold tabular-nums">
              {pendingItems.length} Menunggu Persetujuan
            </div>
          )}
          <button
            type="button"
            onClick={handleRefreshCloud}
            disabled={isRefreshing}
            className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Memuat...' : 'Muat Ulang'}</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            actionMessage.type === 'APPROVED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="font-bold opacity-75 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Nama Pendaftar & Asal</th>
                <th className="px-5 py-3">Kontak & Darurat</th>
                <th className="px-5 py-3">Rumah & Kependudukan</th>
                <th className="px-5 py-3">Dokumen (KTP/KK)</th>
                <th className="px-5 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pendingItems.map(item => {
                const house = houses.find(
                  h => normalizeHouseId(h.houseId) === normalizeHouseId(item.houseId)
                );
                const loginCode = house ? `${house.block}${house.houseNumber}` : item.houseId || '-';

                return (
                  <tr key={item.uid} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 space-y-1">
                      <div className="font-bold text-slate-900">{item.fullName}</div>
                      {item.occupancyType && (
                        <div className="text-[11px] text-slate-500">
                          {item.householdRelationship === 'KEPALA_KELUARGA'
                            ? 'Kepala Keluarga'
                            : item.householdRelationship}{' '}
                          · {item.occupancyType}
                        </div>
                      )}
                      {item.originVillage && (
                        <div className="flex items-center gap-1 text-xs text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Asal: {item.originVillage}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400">
                        Daftar:{' '}
                        {new Date(item.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.email}</span>
                      </div>
                      {item.emergencyContactPhone && (
                        <div className="text-[11px] text-emerald-800 pt-0.5">
                          Darurat ({formatEmergencyRelation(item.emergencyContactRelation)}):{' '}
                          <strong className="font-mono tabular-nums">
                            {item.emergencyContactPhone}
                          </strong>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Home className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{house ? house.addressLabel : item.houseId || 'Belum ditentukan'}</span>
                      </div>
                      {house && (
                        <div className="text-xs font-mono text-slate-500">
                          User Login: <strong className="text-slate-800">{loginCode}</strong>
                        </div>
                      )}
                      {item.populationStatus && (
                        <div className="text-xs text-slate-700">
                          Kependudukan: <strong>{formatPopulationStatus(item.populationStatus)}</strong>
                        </div>
                      )}
                      {item.domicileLetterStatus && (
                        <div className="text-xs text-slate-600">
                          Surat Domisili:{' '}
                          <strong>{formatDomicileStatus(item.domicileLetterStatus)}</strong>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={
                            item.ktpPhotoUrl
                              ? 'text-emerald-700 font-semibold'
                              : 'text-slate-400 italic'
                          }
                        >
                          KTP: {item.ktpPhotoUrl ? 'Ada' : 'Belum'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span
                          className={
                            item.kkPhotoUrl
                              ? 'text-emerald-700 font-semibold'
                              : 'text-slate-500'
                          }
                        >
                          KK: {item.kkPhotoUrl ? 'Ada' : 'Opsional'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDetail(item)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail & Foto</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(item)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(item)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pendingItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-300" />
                    <p>Tidak ada pendaftaran akun warga yang menunggu persetujuan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Pendaftaran & Foto KTP / KK */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90dvh] flex flex-col overflow-hidden my-auto">
            <div className="px-5 py-4 bg-[#142D4E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    Detail Pendaftaran Warga — {selectedDetail.fullName}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Verifikasi Kelengkapan Data & Dokumen KTP/KK
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Nama Lengkap:</span>
                  <strong className="text-sm text-slate-900">{selectedDetail.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Unit Rumah:</span>
                  <strong className="text-sm text-slate-900">
                    {houses.find(
                      h => normalizeHouseId(h.houseId) === normalizeHouseId(selectedDetail.houseId)
                    )?.addressLabel || selectedDetail.houseId || '-'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Nomor WhatsApp / HP:</span>
                  <strong className="text-slate-900 font-mono">{selectedDetail.phoneNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Email:</span>
                  <strong className="text-slate-900">{selectedDetail.email}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Desa Asal:</span>
                  <strong className="text-slate-900">{selectedDetail.originVillage || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">
                    No. HP Keluarga Terdekat ({formatEmergencyRelation(selectedDetail.emergencyContactRelation)}):
                  </span>
                  <strong className="text-slate-900 font-mono">
                    {selectedDetail.emergencyContactPhone || '-'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Kependudukan:</span>
                  <strong className="text-blue-900">
                    {formatPopulationStatus(selectedDetail.populationStatus)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Surat Domisili:</span>
                  <strong className="text-slate-900">
                    {formatDomicileStatus(selectedDetail.domicileLetterStatus)}
                  </strong>
                </div>
              </div>

              {selectedDetail.disclaimerAccepted && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      Pernyataan Kebenaran Data & Tata Tertib Paguyuban GCR Telah Disetujui
                    </div>
                    {selectedDetail.disclaimerAcceptedAt && (
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Waktu Persetujuan:{' '}
                        {new Date(selectedDetail.disclaimerAcceptedAt).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Foto KTP & Foto KK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-bold text-slate-800">Foto KTP</div>
                  {selectedDetail.ktpPhotoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={selectedDetail.ktpPhotoUrl}
                        alt="Foto KTP Warga"
                        onClick={() =>
                          setZoomPhoto({
                            title: `Foto KTP — ${selectedDetail.fullName}`,
                            src: selectedDetail.ktpPhotoUrl!,
                          })
                        }
                        className="w-full h-44 object-cover cursor-pointer hover:opacity-90 transition"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setZoomPhoto({
                            title: `Foto KTP — ${selectedDetail.fullName}`,
                            src: selectedDetail.ktpPhotoUrl!,
                          })
                        }
                        className="w-full py-2 bg-white hover:bg-slate-50 text-blue-700 font-semibold border-t border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Perbesar Foto KTP
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      Tidak ada lampiran KTP
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-800">Foto Kartu Keluarga (KK)</div>
                  {selectedDetail.kkPhotoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={selectedDetail.kkPhotoUrl}
                        alt="Foto KK Warga"
                        onClick={() =>
                          setZoomPhoto({
                            title: `Foto KK — ${selectedDetail.fullName}`,
                            src: selectedDetail.kkPhotoUrl!,
                          })
                        }
                        className="w-full h-44 object-cover cursor-pointer hover:opacity-90 transition"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setZoomPhoto({
                            title: `Foto KK — ${selectedDetail.fullName}`,
                            src: selectedDetail.kkPhotoUrl!,
                          })
                        }
                        className="w-full py-2 bg-white hover:bg-slate-50 text-blue-700 font-semibold border-t border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Perbesar Foto KK
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      KK tidak dilampirkan (Opsional)
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReject(selectedDetail)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Tolak Pendaftaran
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedDetail)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Setujui & Aktifkan Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Zoom */}
      {zoomPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomPhoto(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">{zoomPhoto.title}</h4>
              <button
                type="button"
                onClick={() => setZoomPhoto(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[78dvh] overflow-auto">
              <img
                src={zoomPhoto.src}
                alt={zoomPhoto.title}
                className="max-w-full max-h-[72dvh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
