import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { sanitizeIplNominalOptions } from '../../context/DataContext';
import { formatRupiah, formatPeriod } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { Receipt, Upload, CheckCircle2, CreditCard, X, Building2, Lock } from 'lucide-react';
import { PaymentTransferModal } from './PaymentTransferModal';

export const IPLInvoicesResident: React.FC = () => {
  const { currentUser } = useAuth();
  const { invoices, settings } = useData();
  const iplOptions = sanitizeIplNominalOptions(settings.iplNominalOptions);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const houseInvoices = invoices.filter(inv => inv.houseId === currentUser?.houseId);
  const unpaidCount = houseInvoices.filter(inv => inv.status !== 'PAID').length;

  const handleOpenTransferModal = (period?: string) => {
    setSelectedPeriod(period);
    setIsTransferModalOpen(true);
  };

  const handleTransferSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-emerald-600 text-white p-4 rounded-xl shadow-xl flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {successToast}
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Title and Primary Transfer Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tagihan & Pembayaran IPL</h1>
          <p className="text-sm text-slate-500">
            Daftar tagihan iuran pemeliharaan lingkungan rumah Anda dan sarana pembayaran mandiri.
          </p>
        </div>

        <button
          onClick={() => handleOpenTransferModal()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Bayar Mandiri via Transfer</span>
        </button>
      </div>

      {/* Bank Account & 4 IPL Nominal Options Card */}
      <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Rekening Resmi Pembayaran IPL Grand Ciledug Raya</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>4 Pilihan Nominal Resmi (Diatur Admin)</span>
          </span>
        </div>
        <div className="text-sm font-bold text-slate-900">
          {settings.bankName} — No. Rekening:{' '}
          <span className="text-blue-700 font-mono tabular-nums tracking-wide">{settings.bankAccountNumber}</span> (a.n.{' '}
          {settings.bankAccountHolder})
        </div>
        <div className="pt-1 border-t border-blue-200/70 space-y-1.5">
          <div className="text-xs font-semibold text-slate-700">Daftar Pilihan Nominal IPL per Bulan:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {iplOptions.map((opt, idx) => (
              <div
                key={idx}
                className="bg-white px-3 py-2 rounded-lg border border-blue-200/80 text-xs flex flex-col"
              >
                <span className="text-[11px] text-slate-500">Pilihan {idx + 1}</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">{formatRupiah(opt)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 pt-0.5">
            Gunakan tombol <strong>"Bayar Mandiri via Transfer"</strong> untuk memilih salah satu dari 4 nominal IPL di atas (nilai tidak dapat diubah manual oleh warga).
          </p>
        </div>
      </div>

      {/* Table of Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Daftar Tagihan Rumah Anda</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {unpaidCount > 0 ? (
              <span className="text-amber-700 font-bold">{unpaidCount} Tagihan Belum Lunas</span>
            ) : (
              <span className="text-emerald-700 font-bold">Semua Tagihan Lunas</span>
            )}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Periode</th>
                <th className="px-6 py-3">Nominal Tagihan</th>
                <th className="px-6 py-3">Jatuh Tempo</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {houseInvoices.map(inv => (
                <tr key={inv.invoiceId} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{formatPeriod(inv.period)}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatRupiah(inv.amount)}</td>
                  <td className="px-6 py-4 text-slate-600">{inv.dueDate}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {inv.status === 'UNPAID' ? (
                      <button
                        onClick={() => handleOpenTransferModal(inv.period)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Bayar via Transfer</span>
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        {inv.status === 'PENDING_VERIFICATION' ? '⏳ Menunggu Verifikasi Admin' : '✓ Lunas'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {houseInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada tagihan IPL untuk rumah Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pembayaran Mandiri via Transfer */}
      <PaymentTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialPeriod={selectedPeriod}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
};
