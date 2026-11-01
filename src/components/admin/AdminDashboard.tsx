import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { sanitizeIplNominalOptions } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatPeriod } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  Home,
  Users,
  Wallet,
  Receipt,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  CreditCard,
  HelpCircle,
  X,
  Check,
  Plus,
  Trash2,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { houses, residents, invoices, cashTransactions, complaints, paymentSubmissions, recordDirectPayment, settings } = useData();
  const { currentUser } = useAuth();

  // 4 IPL nominal options from Admin Settings
  const iplOptions = sanitizeIplNominalOptions(settings?.iplNominalOptions);

  // State for Input Iuran Warga Modal
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('ALL');
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<0 | 1 | 2 | 3>(() => {
    const idx = iplOptions.indexOf(settings?.defaultIplAmount || 50000);
    return (idx >= 0 && idx <= 3 ? idx : 0) as 0 | 1 | 2 | 3;
  });
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['2026-10']);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai (Cash ke Pengurus)' | 'Transfer ke Rekening RT'>('Tunai (Cash ke Pengurus)');
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedMonthlyRate = iplOptions[selectedOptionIndex] ?? iplOptions[0];
  const totalAmount = selectedPeriods.length * selectedMonthlyRate;

  // Period utilities
  const getNextPeriod = (p: string): string => {
    const [yearStr, monthStr] = p.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  const generateConsecutivePeriods = (startPeriod: string, count: number): string[] => {
    const list: string[] = [startPeriod];
    let current = startPeriod;
    for (let i = 1; i < count; i++) {
      current = getNextPeriod(current);
      list.push(current);
    }
    return list;
  };

  const determineStartPeriod = (targetHouseId: string): string => {
    // Check if there are unpaid invoices, start from the earliest
    const unpaid = invoices
      .filter(inv => inv.houseId === targetHouseId && inv.status !== 'PAID')
      .sort((a, b) => a.period.localeCompare(b.period));

    if (unpaid.length > 0) {
      return unpaid[0].period;
    }

    // If all are paid or none exists, start from current month or next after latest
    const houseInvs = invoices
      .filter(inv => inv.houseId === targetHouseId)
      .sort((a, b) => b.period.localeCompare(a.period));

    if (houseInvs.length > 0) {
      return getNextPeriod(houseInvs[0].period);
    }

    return '2026-10';
  };

  const availableBlocks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const modalHouses = selectedBlockFilter === 'ALL'
    ? houses
    : houses.filter(h => h.block === selectedBlockFilter);

  // Metrics calculation
  const totalHouses = houses.length;
  const occupiedHouses = houses.filter(h => h.occupancyStatus !== 'KOSONG').length;
  const activeResidents = residents.filter(r => r.residentStatus === 'ACTIVE').length;
  const pendingApprovalsCount = residents.filter(r => r.residentStatus === 'PENDING').length;

  const currentMonth = '2026-10';
  const currentMonthInvoices = invoices.filter(inv => inv.period === currentMonth);
  const paidInvoicesCount = currentMonthInvoices.filter(inv => inv.status === 'PAID').length;

  // Cash balance calculation
  const totalIncome = cashTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = cashTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const currentCashBalance = totalIncome - totalExpense;

  const openComplaintsCount = complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'IN_PROGRESS').length;
  const pendingPaymentsCount = paymentSubmissions.filter(s => s.status === 'SUBMITTED').length;

  const handleOpenInputIuran = (presetBlock?: string) => {
    const initialBlock = presetBlock || 'ALL';
    setSelectedBlockFilter(initialBlock);

    const candidateHouses = initialBlock === 'ALL' ? houses : houses.filter(h => h.block === initialBlock);
    const unpaidHouse = candidateHouses.find(h => invoices.some(inv => inv.houseId === h.houseId && inv.status !== 'PAID')) || candidateHouses[0];
    const initialHouseId = unpaidHouse ? unpaidHouse.houseId : (candidateHouses[0]?.houseId || houses[0]?.houseId || '');
    setSelectedHouseId(initialHouseId);

    const start = determineStartPeriod(initialHouseId);
    setSelectedPeriods([start]);
    const matchingInv = invoices.find(inv => inv.houseId === initialHouseId && inv.period === start);
    if (matchingInv) {
      const optIdx = iplOptions.indexOf(matchingInv.amount);
      if (optIdx >= 0 && optIdx <= 3) {
        setSelectedOptionIndex(optIdx as 0 | 1 | 2 | 3);
      }
    } else {
      const defIdx = iplOptions.indexOf(settings?.defaultIplAmount || iplOptions[0]);
      setSelectedOptionIndex((defIdx >= 0 && defIdx <= 3 ? defIdx : 0) as 0 | 1 | 2 | 3);
    }

    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Tunai (Cash ke Pengurus)');
    setNotes('');
    setIsInputModalOpen(true);
  };

  const handleBlockFilterChange = (block: string) => {
    setSelectedBlockFilter(block);
    const filtered = block === 'ALL' ? houses : houses.filter(h => h.block === block);
    if (filtered.length > 0) {
      const unpaid = filtered.find(h => invoices.some(inv => inv.houseId === h.houseId && inv.status !== 'PAID')) || filtered[0];
      handleHouseChange(unpaid.houseId);
    }
  };

  const handleHouseChange = (newHouseId: string) => {
    setSelectedHouseId(newHouseId);
    const start = determineStartPeriod(newHouseId);
    const count = selectedPeriods.length > 0 ? selectedPeriods.length : 1;
    setSelectedPeriods(generateConsecutivePeriods(start, count));
    const matchingInv = invoices.find(inv => inv.houseId === newHouseId && inv.period === start);
    if (matchingInv) {
      const optIdx = iplOptions.indexOf(matchingInv.amount);
      if (optIdx >= 0 && optIdx <= 3) {
        setSelectedOptionIndex(optIdx as 0 | 1 | 2 | 3);
      }
    }
  };

  const handleMonthsCountChange = (count: number) => {
    const start = selectedPeriods[0] || determineStartPeriod(selectedHouseId);
    setSelectedPeriods(generateConsecutivePeriods(start, count));
  };

  const handleAddMonth = () => {
    const last = selectedPeriods[selectedPeriods.length - 1] || determineStartPeriod(selectedHouseId);
    const next = getNextPeriod(last);
    setSelectedPeriods(prev => [...prev, next]);
  };

  const handleRemoveMonth = (indexToRemove: number) => {
    if (selectedPeriods.length <= 1) return;
    setSelectedPeriods(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouseId || selectedPeriods.length === 0) return;
    setShowConfirmModal(true);
  };

  const executeDirectPayment = () => {
    if (!currentUser || !selectedHouseId) return;

    recordDirectPayment({
      houseId: selectedHouseId,
      amount: totalAmount,
      periods: selectedPeriods,
      paymentDate,
      paymentMethod,
      notes,
      adminName: currentUser.fullName,
      adminUid: currentUser.uid,
    });

    const houseObj = houses.find(h => h.houseId === selectedHouseId);
    const houseLabel = houseObj ? houseObj.addressLabel : selectedHouseId;

    setShowConfirmModal(false);
    setIsInputModalOpen(false);

    setSuccessToast(
      `Iuran untuk ${houseLabel} sebanyak ${selectedPeriods.length} bulan (${formatRupiah(totalAmount)}) berhasil dicatat! Kas RT bertambah dan tagihan warga otomatis LUNAS.`
    );
    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);
  };

  // Selected house details
  const selectedHouse = houses.find(h => h.houseId === selectedHouseId);
  const selectedResident = residents.find(r => r.houseId === selectedHouseId && r.residentStatus === 'ACTIVE');
  const selectedHouseInvoices = invoices.filter(inv => inv.houseId === selectedHouseId);
  const selectedUnpaidInvoice = selectedHouseInvoices.find(inv => inv.status !== 'PAID');

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

      {/* Welcome Banner */}
      <div className="bg-[#142D4E] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-inner shrink-0 hidden sm:flex items-center justify-center overflow-hidden border border-white/20">
            <img src="/assets/aistudio/LOGO_GCR_b4e73cb9.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">Dashboard Pengurus RT</span>
            <h1 className="text-2xl font-bold tracking-tight">Grand Ciledug Raya</h1>
            <p className="text-sm text-slate-300">
              Sistem Manajemen Warga, Keuangan IPL, dan Administrasi Lingkungan Terpadu.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs text-sm">
            <Calendar className="w-4 h-4 text-blue-300" />
            <span>Periode: <strong>Oktober 2026</strong></span>
          </div>
          {/* Primary Action Button: Input Iuran Warga */}
          <button
            onClick={() => handleOpenInputIuran('ALL')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-sm font-bold shadow-md transition shrink-0 cursor-pointer border border-emerald-400"
          >
            <CreditCard className="w-4 h-4" />
            <span>Input Iuran Warga</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Rumah & Huni</span>
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{occupiedHouses} / {totalHouses}</div>
          <p className="text-xs text-slate-500">Rumah terisi dari total terdaftar</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Warga Aktif</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{activeResidents}</div>
          <p className="text-xs text-slate-500">
            {pendingApprovalsCount > 0 ? (
              <span className="text-amber-600 font-medium">{pendingApprovalsCount} akun menunggu persetujuan</span>
            ) : (
              'Semua akun terverifikasi'
            )}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kas Saldo RT</span>
            <Wallet className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{formatRupiah(currentCashBalance)}</div>
          <p className="text-xs text-slate-500">Total kas bersih per hari ini</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Penerimaan IPL Okt</span>
            <Receipt className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{paidInvoicesCount} / {currentMonthInvoices.length} Rumah</div>
          <p className="text-xs text-slate-500">
            {pendingPaymentsCount > 0 ? (
              <span className="text-blue-600 font-medium">{pendingPaymentsCount} bukti bayar perlu verifikasi</span>
            ) : (
              'Lunas / Terverifikasi'
            )}
          </p>
        </div>
      </div>

      {/* Quick Actions / Alerts Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-base font-bold text-slate-900">Aksi & Perhatian Cepat</h2>
          <span className="text-xs text-slate-500">
            Pembayaran langsung dari warga akan otomatis tercatat di kas dan melunasi invoice.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Notifikasi Verifikasi Pembayaran */}
          <button
            type="button"
            onClick={() => navigate('/admin/verifications')}
            className="w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100/90 rounded-xl border border-amber-200 hover:border-amber-300 text-xs transition group cursor-pointer text-left"
            title="Klik untuk buka Verifikasi Pembayaran"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="font-bold text-amber-950 block">Verifikasi Pembayaran</span>
                <span className="text-[11px] text-amber-700">Bukti transfer iuran warga</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-bold text-amber-800 tabular-nums text-xs">
                {pendingPaymentsCount} menunggu
              </span>
              <ArrowUpRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
          </button>

          {/* Notifikasi Persetujuan Akun Warga */}
          <button
            type="button"
            onClick={() => navigate('/admin/approvals')}
            className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100/90 rounded-xl border border-blue-200 hover:border-blue-300 text-xs transition group cursor-pointer text-left"
            title="Klik untuk buka Persetujuan Akun Warga"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="font-bold text-blue-950 block">Persetujuan Akun Warga</span>
                <span className="text-[11px] text-blue-700">Registrasi akun baru</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-bold text-blue-800 tabular-nums text-xs">
                {pendingApprovalsCount} akun
              </span>
              <ArrowUpRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
          </button>

          {/* Notifikasi Pengaduan Warga Aktif */}
          <button
            type="button"
            onClick={() => navigate('/admin/complaints')}
            className="w-full flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100/90 rounded-xl border border-rose-200 hover:border-rose-300 text-xs transition group cursor-pointer text-left"
            title="Klik untuk buka Pengaduan Warga"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <span className="font-bold text-rose-950 block">Pengaduan Warga Aktif</span>
                <span className="text-[11px] text-rose-700">Laporan keluhan lingkungan</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-bold text-rose-800 tabular-nums text-xs">
                {openComplaintsCount} laporan
              </span>
              <ArrowUpRight className="w-4 h-4 text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity / Payment Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Pengajuan Bukti Pembayaran Terbaru</h2>
          <span className="text-xs text-slate-500">{paymentSubmissions.length} total pengajuan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Periode / Rumah</th>
                <th className="px-6 py-3">Nama Warga</th>
                <th className="px-6 py-3">Nominal</th>
                <th className="px-6 py-3">Foto Bukti Transfer</th>
                <th className="px-6 py-3">Tanggal Transfer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paymentSubmissions.slice(0, 5).map(sub => {
                const house = houses.find(h => h.houseId === sub.houseId);
                const periodLabel = sub.periods && sub.periods.length > 0
                  ? sub.periods.length === 1
                    ? formatPeriod(sub.periods[0])
                    : `${sub.periods.length} Bulan (${sub.periods.join(', ')})`
                  : formatPeriod(sub.invoiceId.split('-')[1] + '-' + sub.invoiceId.split('-')[2]) || 'Oktober 2026';

                return (
                  <tr key={sub.submissionId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <span>{periodLabel}</span> <br />
                      <span className="text-xs text-slate-500 font-normal">{house ? house.addressLabel : sub.houseId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {sub.bankAccountName || 'Warga'}
                      </div>
                      {sub.notes && <div className="text-xs text-slate-400 italic">"{sub.notes}"</div>}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono">{formatRupiah(sub.amount)}</td>
                    <td className="px-6 py-4">
                      {sub.evidenceUrl ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={sub.evidenceUrl}
                            alt="Bukti"
                            className="w-10 h-10 object-cover rounded-md border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => navigate('/admin/verifications')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            Lihat Foto
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tanpa foto</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{sub.transferDate}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate('/admin/verifications')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition cursor-pointer"
                      >
                        Verifikasi
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paymentSubmissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Belum ada pengajuan pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Iuran Warga */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 my-auto max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Input Iuran Warga (Langsung)</span>
              </div>
              <button
                onClick={() => setIsInputModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Dual Selection: Blok and Nomor Rumah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Pilih Blok (A - I)</label>
                  <select
                    value={selectedBlockFilter}
                    onChange={e => handleBlockFilterChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="ALL">Semua Blok (A - I)</option>
                    {availableBlocks.map(b => (
                      <option key={b} value={b}>Blok {b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Pilih Nomor Rumah & Warga</label>
                  <select
                    value={selectedHouseId}
                    onChange={e => handleHouseChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-600"
                  >
                    {modalHouses.map(h => {
                      const resident = residents.find(r => r.houseId === h.houseId && r.residentStatus === 'ACTIVE');
                      const hasUnpaid = invoices.some(inv => inv.houseId === h.houseId && inv.status !== 'PAID');
                      return (
                        <option key={h.houseId} value={h.houseId}>
                          {h.addressLabel} {resident ? `— ${resident.fullName}` : '— (Kosong)'} {hasUnpaid ? '⚠️ [Belum Bayar]' : '✓ [Lunas]'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Status Box for Selected House */}
              {selectedHouse && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Penghuni / Warga:</span>
                    <span className="font-bold text-slate-900">
                      {selectedResident ? selectedResident.fullName : 'Belum Ada Akun Terkait'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">Status Tagihan Terkini:</span>
                    <div>
                      {selectedUnpaidInvoice ? (
                        <span className="font-semibold text-amber-700">
                          {formatPeriod(selectedUnpaidInvoice.period)}: {formatRupiah(selectedUnpaidInvoice.amount)} ({selectedUnpaidInvoice.status})
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700">
                          Semua Tagihan Lunas (Akan dicatat untuk Oktober 2026)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 1. Pilih dari 4 Pilihan Nominal IPL & 2. Durasi Bulan */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Pilih Nominal IPL per Bulan (4 Pilihan)</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsInputModalOpen(false);
                        navigate('/admin/settings');
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Ubah di Pengaturan</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {iplOptions.map((opt, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedOptionIndex(idx as 0 | 1 | 2 | 3)}
                          className={`min-h-[48px] px-3 py-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div>
                            <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                              Pilihan {idx + 1}
                            </div>
                            <div className="text-sm font-bold font-mono tabular-nums">{formatRupiah(opt)}</div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Drop Down Berapa Bulan x Nilai Iuran */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Durasi Iuran (Berapa Bulan)</label>
                  <select
                    value={selectedPeriods.length}
                    onChange={e => handleMonthsCountChange(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value={1}>1 Bulan — (1 x {formatRupiah(selectedMonthlyRate)})</option>
                    <option value={2}>2 Bulan — (2 x {formatRupiah(selectedMonthlyRate)})</option>
                    <option value={3}>3 Bulan (Triwulan) — (3 x {formatRupiah(selectedMonthlyRate)})</option>
                    <option value={4}>4 Bulan — (4 x {formatRupiah(selectedMonthlyRate)})</option>
                    <option value={5}>5 Bulan — (5 x {formatRupiah(selectedMonthlyRate)})</option>
                    <option value={6}>6 Bulan (Semesteran) — (6 x {formatRupiah(selectedMonthlyRate)})</option>
                    <option value={12}>12 Bulan (1 Tahun) — (12 x {formatRupiah(selectedMonthlyRate)})</option>
                    {![1, 2, 3, 4, 5, 6, 12].includes(selectedPeriods.length) && (
                      <option value={selectedPeriods.length}>
                        {selectedPeriods.length} Bulan (Kustom) — ({selectedPeriods.length} x {formatRupiah(selectedMonthlyRate)})
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {/* 3. Tambah Iuran Bulan x Nilai Iuran (List of Months) */}
              <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">
                      Rincian Bulan Iuran ({selectedPeriods.length} Bulan):
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMonth}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-200 hover:border-blue-400 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Iuran Bulan</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedPeriods.map((period, idx) => (
                    <div
                      key={`${period}-${idx}`}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-50 text-blue-700 font-bold rounded-full flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">
                            Iuran Bulan {formatPeriod(period)}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ({period})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono tabular-nums font-semibold text-slate-700">
                          1 x {formatRupiah(selectedMonthlyRate)}
                        </span>
                        {selectedPeriods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMonth(idx)}
                            title="Hapus bulan ini"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Jumlah Total Card */}
              <div className="p-3.5 bg-emerald-50/90 border border-emerald-300 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-emerald-900">
                    Jumlah Total Pembayaran
                  </span>
                  <div className="text-xs text-emerald-700">
                    Kalkulasi: <strong className="font-bold">{selectedPeriods.length} Bulan</strong> x{' '}
                    <strong className="font-mono tabular-nums">{formatRupiah(selectedMonthlyRate)}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">Jumlah</div>
                  <div className="text-xl font-extrabold text-emerald-950 font-mono tabular-nums">
                    {formatRupiah(totalAmount)}
                  </div>
                </div>
              </div>

              {/* Payment Date & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tanggal Pembayaran</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Tunai (Cash ke Pengurus)">Tunai (Cash ke Pengurus RT)</option>
                    <option value="Transfer ke Rekening RT">Transfer ke Rekening Kas RT</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Dititipkan melalui pos satpam / bayar langsung di balai warga"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-800 leading-relaxed">
                Pencatatan ini akan <strong>otomatis menambah kas masuk</strong> sebesar <strong>{formatRupiah(totalAmount)}</strong> dan mengubah seluruh tagihan {selectedPeriods.length} bulan yang dipilih menjadi <strong>LUNAS</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInputModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lanjutkan Pembayaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Yes/No Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Input Iuran</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin mencatat pembayaran iuran untuk{' '}
                <strong>{selectedHouse?.addressLabel}</strong> sebanyak{' '}
                <strong>{selectedPeriods.length} Bulan</strong> ({selectedPeriods.map(formatPeriod).join(', ')}) dengan total:
              </p>
              <div className="py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-xs text-emerald-700 block">Jumlah yang Dicatat ke Kas:</span>
                <span className="text-xl font-extrabold text-emerald-800 font-mono tabular-nums">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pemasukan kas akan tercatat dan seluruh tagihan bulan terkait pada akun warga otomatis berstatus Lunas.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Tidak / Batal
              </button>
              <button
                type="button"
                onClick={executeDirectPayment}
                className="w-1/2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition cursor-pointer"
              >
                Ya, Catat & Lunaskan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
