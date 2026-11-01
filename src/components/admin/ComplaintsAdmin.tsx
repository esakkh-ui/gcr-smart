import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../common/StatusBadge';
import { ComplaintStatus } from '../../types';
import { formatDate, formatHouseLabel } from '../../utils/formatters';
import { Home, Image as ImageIcon, Maximize2, X } from 'lucide-react';

export const ComplaintsAdmin: React.FC = () => {
  const { complaints, houses, updateComplaintStatus, addComplaintUpdate } = useData();
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const selectedComplaint = complaints.find(c => c.complaintId === selectedComplaintId);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId || !replyMessage.trim()) return;

    updateComplaintStatus(selectedComplaintId, newStatus);
    addComplaintUpdate({
      complaintId: selectedComplaintId,
      authorName: 'Pengurus RT 05',
      authorRole: 'ADMINISTRATOR',
      message: replyMessage.trim(),
      statusChangedTo: newStatus,
    });

    setSelectedComplaintId(null);
    setReplyMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pengaduan & Aspirasi Warga
        </h1>
        <p className="text-sm text-slate-500">
          Tanggapi laporan, foto bukti kondisi lapangan, kendala infrastruktur, dan aspirasi dari warga.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Kategori & Judul</th>
                <th className="px-6 py-3">Rumah Pelapor</th>
                <th className="px-6 py-3">Tanggal Laporan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {complaints.map(cmp => {
                const house = houses.find(h => h.houseId === cmp.houseId);
                return (
                  <tr key={cmp.complaintId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{cmp.category}</span>
                        {cmp.imageUrl && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                              <ImageIcon className="w-3.5 h-3.5" />
                              Foto Lampiran
                            </span>
                          </>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">{cmp.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">
                        {cmp.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-900 font-medium whitespace-nowrap">
                        <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatHouseLabel(house, cmp.houseId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono tabular-nums whitespace-nowrap">
                      {formatDate(cmp.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={cmp.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedComplaintId(cmp.complaintId);
                            setNewStatus('IN_PROGRESS');
                          }}
                          className="min-h-[38px] px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                        >
                          Balas
                        </button>
                        {cmp.status !== 'RESOLVED' && cmp.status !== 'CLOSED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedComplaintId(cmp.complaintId);
                              setNewStatus('RESOLVED');
                            }}
                            className="min-h-[38px] px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                          >
                            Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                    Belum ada laporan pengaduan dari warga.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4"
          onClick={() => setSelectedComplaintId(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {newStatus === 'RESOLVED' ? 'Selesaikan Pengaduan' : 'Balas Pengaduan'}: {selectedComplaint.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedComplaintId(null)}
                className="min-w-[40px] min-h-[40px] -mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
                <div className="font-semibold text-slate-900">Deskripsi Warga:</div>
                <p className="leading-relaxed whitespace-pre-line">{selectedComplaint.description}</p>

                {selectedComplaint.imageUrl && (
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Foto Lampiran Warga:</span>
                      <button
                        type="button"
                        onClick={() => setZoomedImageUrl(selectedComplaint.imageUrl!)}
                        className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Perbesar</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoomedImageUrl(selectedComplaint.imageUrl!)}
                      className="block w-full rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer"
                    >
                      <img
                        src={selectedComplaint.imageUrl}
                        alt={selectedComplaint.title}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-52 object-cover"
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Status Pengaduan</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full min-h-[42px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-600"
                >
                  <option value="SUBMITTED">Diajukan</option>
                  <option value="IN_PROGRESS">Diproses / Ditindaklanjuti</option>
                  <option value="RESOLVED">Selesai</option>
                  <option value="CLOSED">Ditutup</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {newStatus === 'RESOLVED' ? 'Catatan Penyelesaian' : 'Tanggapan / Catatan Pengurus'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={newStatus === 'RESOLVED' ? "Tuliskan ringkasan penyelesaian..." : "Tulis tanggapan atau progres penanganan..."}
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {newStatus === 'RESOLVED' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Foto Bukti Selesai (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      // Image upload logic
                    }}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaintId(null)}
                  className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
                >
                  Kirim Tanggapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {zoomedImageUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div
            className="w-full max-w-3xl flex flex-col items-end gap-2"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedImageUrl(null)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              aria-label="Tutup Foto"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImageUrl}
              alt="Foto Lampiran Pengaduan"
              referrerPolicy="no-referrer"
              className="max-h-[80dvh] w-auto max-w-full rounded-2xl object-contain border border-white/20 mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
