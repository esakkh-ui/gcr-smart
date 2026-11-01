import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { sanitizeIplNominalOptions } from '../../context/DataContext';
import { formatRupiah, formatPeriod, formatHouseLabel } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  Home,
  Receipt,
  Megaphone,
  MessageSquareWarning,
  CheckCircle2,
  CreditCard,
  X,
  BellRing,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentTransferModal } from './PaymentTransferModal';
import { PanicButtonModal } from '../common/PanicButtonModal';
import { ExpenseDetailModal } from './ExpenseDetailModal';

export const ResidentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { houses, invoices, announcements, complaints, cashTransactions, settings } = useData();
  const iplOptions = sanitizeIplNominalOptions(settings.iplNominalOptions);
  const navigate = useNavigate();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const residentHouse = houses.find(h => h.houseId === currentUser?.houseId);
  const displayHouseLabel = residentHouse
    ? formatHouseLabel(residentHouse)
    : 'Belum Ditentukan';
  const houseInvoices = invoices.filter(inv => inv.houseId === currentUser?.houseId);
  const unpaidInvoices = houseInvoices.filter(inv => inv.status !== 'PAID');
  const hasUnpaid = unpaidInvoices.length > 0;
  const currentInvoice = houseInvoices.find(inv => inv.period === '2026-10') || houseInvoices[0];
  const recentAnnouncements = announcements.slice(0, 2);
  const userComplaints = complaints.filter(c => c.userUid === currentUser?.uid);

  // Kas Lingkungan RT Summary
  const totalIncome = cashTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseTransactions = cashTransactions.filter(t => t.type === 'EXPENSE');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleOpenTransferModal = () => {
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
          <div className="flex-1 text-sm font-medium leading-relaxed">{successToast}</div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-[#142D4E] to-[#2563EB] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-inner shrink-0 hidden sm:flex items-center justify-center overflow-hidden border border-white/20">
            <img src="/assets/aistudio/LOGO_GCR_b4e73cb9.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Portal Warga Grand Ciledug Raya
            </span>
            <h1 className="text-2xl font-bold tracking-tight">
              Selamat Datang, {currentUser?.fullName}!
            </h1>
            <p className="text-sm text-slate-200">
              Rumah Terkait: <strong className="text-white">{displayHouseLabel}</strong>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {residentHouse && (
            <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs flex items-center gap-2.5">
              <Home className="w-5 h-5 text-blue-300" />
              <div>
                <div className="text-[10px] text-blue-200 uppercase font-bold">Status Huni</div>
                <div className="text-xs font-bold text-white">
                  {residentHouse.occupancyStatus === 'TERISI_PEMILIK'
                    ? 'Pemilik Tetap'
                    : 'Penyewa'}
                </div>
              </div>
            </div>
          )}
          {/* Emergency Panic Trigger Button */}
          <button
            type="button"
            onClick={() => setIsPanicModalOpen(true)}
            className="min-h-[44px] px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer border border-rose-400 whitespace-nowrap"
            title="Sinyal Panik Darurat ke Seluruh Warga"
          >
            <BellRing className="w-4 h-4 shrink-0" />
            <span>Panik Darurat (SOS)</span>
          </button>
          {/* Primary Action Button: Bayar Mandiri via Transfer */}
          <button
            type="button"
            onClick={handleOpenTransferModal}
            className="min-h-[44px] px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer border border-emerald-400 whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Bayar Mandiri via Transfer</span>
          </button>
        </div>
      </div>

      {/* Notification banner for unpaid bill */}
      {hasUnpaid && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <Receipt className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-amber-900">
                Pemberitahuan Tagihan Iuran IPL Warga
              </h3>
              <p className="text-xs text-amber-700">
                Ada {unpaidInvoices.length} tagihan IPL untuk rumah Anda ({displayHouseLabel}) yang belum diselesaikan (Total{' '}
                <span className="font-mono tabular-nums font-semibold">
                  {formatRupiah(unpaidInvoices.reduce((s, i) => s + i.amount, 0))}
                </span>
                ). Silakan lakukan pembayaran mandiri via transfer atau tunai ke Pengurus RT.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenTransferModal}
            className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span>Bayar Transfer Sekarang</span>
          </button>
        </div>
      )}

      {/* IPL Bill Summary Card */}
      <div
        className={`p-6 rounded-xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
          !hasUnpaid ? 'bg-emerald-50/60 border-emerald-300' : 'bg-white border-slate-200'
        }`}
      >
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">
            Tagihan IPL Bulan Ini ({formatPeriod(currentInvoice?.period || '2026-10')})
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {currentInvoice
              ? formatRupiah(currentInvoice.amount)
              : formatRupiah(settings.defaultIplAmount || iplOptions[0])}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Status Pembayaran:</span>
            {currentInvoice ? (
              <StatusBadge status={hasUnpaid ? currentInvoice.status : 'PAID'} />
            ) : (
              <span className="text-xs font-medium text-emerald-600">Lunas</span>
            )}
          </div>
          {!hasUnpaid && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Iuran telah lunas. Terima kasih atas partisipasi Anda!</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenTransferModal}
            className="min-h-[44px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Bayar Mandiri via Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(hasUnpaid ? '/warga/invoices' : '/warga/history')}
            className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Receipt className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{hasUnpaid ? 'Rincian Tagihan' : 'Riwayat Pembayaran'}</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Kas Lingkungan RT (Pengeluaran Bisa Diklik) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span>Ringkasan Kas Lingkungan RT</span>
          </h2>
          <button
            type="button"
            onClick={() => navigate('/warga/finance')}
            className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer whitespace-nowrap"
          >
            Lihat Halaman Kas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pemasukan */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Pemasukan</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {formatRupiah(totalIncome)}
            </div>
            <p className="text-xs text-slate-500">Total kas masuk lingkungan</p>
          </div>

          {/* Pengeluaran (Clickable!) */}
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="text-left bg-white hover:bg-rose-50/40 p-5 rounded-xl border border-slate-200 hover:border-rose-300 shadow-xs space-y-1.5 transition cursor-pointer group focus-visible:outline-2 focus-visible:outline-rose-500"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold group-hover:text-rose-700 transition-colors">
                Pengeluaran Kas RT
              </span>
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-600 font-mono tabular-nums">
              {formatRupiah(totalExpense)}
            </div>
            <div className="flex items-center justify-between pt-0.5 text-xs font-semibold text-rose-700">
              <span>Klik untuk rincian pengeluaran ({expenseTransactions.length})</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </button>

          {/* Saldo Kas Bersih */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Saldo Kas Bersih</span>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatRupiah(netBalance)}
            </div>
            <p className="text-xs text-slate-500">Saldo aktif kas RT saat ini</p>
          </div>
        </div>
      </div>

      {/* Susunan Pengurus & Kontak Petugas */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Susunan Pengurus & Kontak Petugas</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {settings.staffInfo && Object.entries(settings.staffInfo).map(([key, info], idx) => (
            <div key={key || `staff-${idx}`} className="p-3 bg-slate-50 rounded-xl space-y-1 text-center">
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-xs font-bold text-slate-900 leading-tight">{(info as any).name}</div>
              <a 
                href={`https://wa.me/${(info as any).phone.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-slate-500 hover:text-blue-600 hover:underline"
              >
                {(info as any).phone}
              </a>
            </div>
          ))}
          {!settings.staffInfo && (
            <div className="col-span-full py-4 text-center text-slate-400 text-sm italic">
              Memuat data pengurus...
            </div>
          )}
        </div>
      </div>

      {/* Grid Quick Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Announcements Preview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              <span>Pengumuman RT Terbaru</span>
            </h2>
            <button
              type="button"
              onClick={() => navigate('/warga/announcements')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer whitespace-nowrap"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {recentAnnouncements.map((ann, idx) => (
              <div 
                key={ann.announcementId || `ann-item-${(ann as any).id || idx}-${ann.title}`} 
                className="p-3 bg-slate-50 rounded-xl space-y-1"
              >
                <div className="text-[11px] font-semibold text-blue-700">{ann.category}</div>
                <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-amber-600" />
              <span>Pengaduan Saya</span>
            </h2>
            <button
              type="button"
              onClick={() => navigate('/warga/complaints')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer whitespace-nowrap"
            >
              Buat Pengaduan
            </button>
          </div>
          <div className="space-y-3">
            {userComplaints.map((cmp, idx) => (
              <div
                key={cmp.complaintId || `cmp-item-${(cmp as any).id || idx}-${cmp.title}`}
                className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{cmp.title}</div>
                  <div className="text-xs text-slate-500">{cmp.category}</div>
                </div>
                <StatusBadge status={cmp.status} />
              </div>
            ))}
            {userComplaints.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Anda belum pernah mengajukan pengaduan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Pembayaran Mandiri via Transfer */}
      <PaymentTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleTransferSuccess}
      />

      {/* Modal Tombol Panik Darurat */}
      <PanicButtonModal
        isOpen={isPanicModalOpen}
        onClose={() => setIsPanicModalOpen(false)}
      />

      {/* Modal Rincian Pengeluaran Kas RT */}
      <ExpenseDetailModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        transactions={cashTransactions}
      />
    </div>
  );
};
