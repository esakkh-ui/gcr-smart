import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatPeriod } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, XCircle, Eye, ShieldCheck, Image as ImageIcon, X } from 'lucide-react';
import { PaymentSubmission } from '../../types';

export const PaymentVerification: React.FC = () => {
  const { paymentSubmissions, houses, verifyPayment, rejectPayment } = useData();
  const { currentUser } = useAuth();
  const [rejectModalSubId, setRejectModalSubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [evidenceModalSub, setEvidenceModalSub] = useState<PaymentSubmission | null>(null);

  const handleVerify = (subId: string) => {
    if (!currentUser) return;
    verifyPayment(subId, currentUser.fullName, currentUser.uid);
    if (evidenceModalSub?.submissionId === subId) {
      setEvidenceModalSub(null);
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalSubId || !currentUser) return;
    rejectPayment(rejectModalSubId, rejectionReason, currentUser.fullName);
    setRejectModalSubId(null);
    setRejectionReason('');
    if (evidenceModalSub?.submissionId === rejectModalSubId) {
      setEvidenceModalSub(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verifikasi Bukti Pembayaran IPL</h1>
        <p className="text-sm text-slate-500">
          Periksa foto bukti transfer warga, verifikasi dana ke kas RT, dan setujui untuk melunasi tagihan warga secara otomatis.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Rumah & Periode</th>
                <th className="px-6 py-3">Nama Warga / Pemohon</th>
                <th className="px-6 py-3">Nominal & Tanggal</th>
                <th className="px-6 py-3">Foto Bukti Transfer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paymentSubmissions.map(sub => {
                const house = houses.find(h => h.houseId === sub.houseId);
                const periodLabel = sub.periods && sub.periods.length > 0
                  ? sub.periods.length === 1
                    ? `Periode ${formatPeriod(sub.periods[0])}`
                    : `${sub.periods.length} Bulan (${sub.periods.map(p => formatPeriod(p)).join(', ')})`
                  : `Periode ${formatPeriod(sub.invoiceId.split('-').slice(1, 3).join('-'))}`;

                return (
                  <tr key={sub.submissionId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {house ? house.addressLabel : sub.houseId}
                      </div>
                      <span className="text-xs text-blue-600 font-medium">{periodLabel}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {sub.bankAccountName || 'Warga'}
                      </div>
                      {sub.notes && (
                        <div className="text-[11px] text-slate-400 italic mt-0.5">"{sub.notes}"</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900 font-mono text-base">
                        {formatRupiah(sub.amount)}
                      </div>
                      <span className="text-xs text-slate-400">Tgl: {sub.transferDate}</span>
                    </td>

                    {/* MUNCULKAN FOTO BUKTI TRANSFER DENGAN THUMBNAIL */}
                    <td className="px-6 py-4">
                      {sub.evidenceUrl ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEvidenceModalSub(sub)}
                            className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:border-blue-400 transition cursor-pointer shrink-0 relative group"
                            title="Klik untuk memperbesar foto bukti transfer"
                          >
                            <img
                              src={sub.evidenceUrl}
                              alt="Bukti Transfer"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEvidenceModalSub(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Periksa Foto</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tidak ada foto</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                      {sub.rejectionReason && (
                        <div className="text-[11px] text-rose-600 mt-1 font-medium">Alasan: {sub.rejectionReason}</div>
                      )}
                      {sub.verifiedAt && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          Oleh {sub.verifiedBy || 'Admin'}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {sub.status === 'SUBMITTED' ? (
                        <>
                          <button
                            onClick={() => handleVerify(sub.submissionId)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verifikasi</span>
                          </button>
                          <button
                            onClick={() => setRejectModalSubId(sub.submissionId)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paymentSubmissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada pengajuan bukti pembayaran dari warga.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Zoom Modal */}
      {evidenceModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Foto Bukti Transfer Warga</h3>
              </div>
              <button
                onClick={() => setEvidenceModalSub(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center max-h-[60vh]">
              <img
                src={evidenceModalSub.evidenceUrl}
                alt="Bukti Transfer"
                className="object-contain max-h-[55vh] w-full"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total Transfer:</span>
                <span className="text-emerald-700 font-mono text-sm">{formatRupiah(evidenceModalSub.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pemohon / Warga:</span>
                <span className="font-semibold text-slate-800">
                  {evidenceModalSub.bankAccountName || 'Warga'} ({houses.find(h => h.houseId === evidenceModalSub.houseId)?.addressLabel || evidenceModalSub.houseId})
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tanggal Transfer:</span>
                <span>{evidenceModalSub.transferDate}</span>
              </div>
              {evidenceModalSub.notes && (
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1">
                  <span>Catatan:</span>
                  <span className="italic">{evidenceModalSub.notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setEvidenceModalSub(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Tutup Pratinjau
              </button>

              {evidenceModalSub.status === 'SUBMITTED' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRejectModalSubId(evidenceModalSub.submissionId);
                      setEvidenceModalSub(null);
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => handleVerify(evidenceModalSub.submissionId)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verifikasi Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Tolak Bukti Pembayaran</h3>
            <p className="text-xs text-slate-500">Berikan alasan penolakan agar warga dapat mengirimkan bukti transfer yang valid.</p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Alasan Penolakan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Bukti buram / dana belum masuk ke mutasi bank / nominal tidak sesuai"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalSubId(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
