import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatRupiah, formatPeriod } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, History, Eye, Image as ImageIcon, X, CreditCard, Building2 } from 'lucide-react';
import { PaymentSubmission } from '../../types';

export const PaymentHistoryResident: React.FC = () => {
  const { currentUser } = useAuth();
  const { paymentSubmissions } = useData();

  const [previewSubmission, setPreviewSubmission] = useState<PaymentSubmission | null>(null);

  const userSubmissions = paymentSubmissions.filter(s => s.userUid === currentUser?.uid);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat Pembayaran & Bukti Transfer</h1>
        <p className="text-sm text-slate-500">
          Pantau status verifikasi dan arsip foto bukti transfer yang telah Anda ajukan kepada Pengurus RT.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Daftar Pengajuan Transfer</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {userSubmissions.length} Transaksi Diajukan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Periode Tagihan</th>
                <th className="px-6 py-3">Nominal Transfer</th>
                <th className="px-6 py-3">Tanggal & Keterangan</th>
                <th className="px-6 py-3">Foto Bukti Transfer</th>
                <th className="px-6 py-3">Status Verifikasi</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {userSubmissions.map(sub => {
                // If periods is available, display nicely
                const periodLabel = sub.periods && sub.periods.length > 0
                  ? sub.periods.length === 1
                    ? formatPeriod(sub.periods[0])
                    : `${sub.periods.length} Bulan (${sub.periods.map(p => formatPeriod(p)).join(', ')})`
                  : formatPeriod(sub.invoiceId.split('-').slice(1, 3).join('-'));

                return (
                  <tr key={sub.submissionId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{periodLabel}</div>
                      {sub.periods && sub.periods.length > 1 && (
                        <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                          Pembayaran Jamak ({sub.periods.length} Bulan)
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900 font-mono text-base">
                        {formatRupiah(sub.amount)}
                      </div>
                      <span className="text-xs text-slate-400">Kas RT: {sub.destinationBank || 'Rekening Resmi RT'}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">Tgl: {sub.transferDate}</div>
                      {sub.notes && (
                        <div className="text-xs text-slate-500 italic mt-0.5">"{sub.notes}"</div>
                      )}
                    </td>

                    {/* MUNCULKAN FOTO BUKTI TRANSFER */}
                    <td className="px-6 py-4">
                      {sub.evidenceUrl ? (
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPreviewSubmission(sub)}
                            className="relative group rounded-lg overflow-hidden border border-slate-200 shadow-2xs hover:border-blue-400 transition cursor-pointer w-12 h-12 bg-slate-100 shrink-0"
                            title="Klik untuk melihat foto bukti transfer"
                          >
                            <img
                              src={sub.evidenceUrl}
                              alt="Bukti Transfer"
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </button>
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => setPreviewSubmission(sub)}
                              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Foto</span>
                            </button>
                            <span className="text-[10px] text-slate-400 block">Struk Terlampir</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tidak ada foto</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                      {sub.rejectionReason && (
                        <div className="text-[11px] text-rose-600 font-medium mt-1">
                          Alasan Ditolak: {sub.rejectionReason}
                        </div>
                      )}
                      {sub.verifiedAt && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          Diverifikasi: {sub.verifiedAt.split('T')[0]}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewSubmission(sub)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Rincian</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {userSubmissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada riwayat pengajuan bukti pembayaran mandiri via transfer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL-SIZE PHOTO PREVIEW MODAL */}
      {previewSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-2xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Foto Bukti Transfer Warga</h3>
                  <p className="text-xs text-slate-500">ID Pengajuan: {previewSubmission.submissionId}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-[60vh] border border-slate-200">
              <img
                src={previewSubmission.evidenceUrl}
                alt="Foto Bukti Transfer"
                className="object-contain max-h-[55vh] w-full"
              />
            </div>

            {/* Details Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status Verifikasi:</span>
                <StatusBadge status={previewSubmission.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Transfer:</span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">{formatRupiah(previewSubmission.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode Tagihan:</span>
                <span className="font-bold text-blue-700">
                  {previewSubmission.periods && previewSubmission.periods.length > 0
                    ? `${previewSubmission.periods.length} Bulan (${previewSubmission.periods.map(p => formatPeriod(p)).join(', ')})`
                    : formatPeriod(previewSubmission.invoiceId.split('-').slice(1, 3).join('-'))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Transfer:</span>
                <span className="font-medium text-slate-800">{previewSubmission.transferDate}</span>
              </div>
              {previewSubmission.notes && (
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Catatan:</span>
                  <span className="font-medium text-slate-800 italic">{previewSubmission.notes}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPreviewSubmission(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
