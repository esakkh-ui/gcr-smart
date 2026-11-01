import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { CashTransaction } from '../../types';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, Download, Edit2, Trash2, CheckCircle2, HelpCircle, CreditCard } from 'lucide-react';

export const FinancialLedger: React.FC = () => {
  const navigate = useNavigate();
  const { cashTransactions, addCashTransaction, updateCashTransaction, deleteCashTransaction } = useData();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'REKAPITULASI' | 'PEMASUKAN' | 'PENGELUARAN'>('REKAPITULASI');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashTransaction | null>(null);

  // Form states
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState('Iuran IPL Warga');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Confirmation Yes/No Modal before saving or deleting
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingTrx, setDeletingTrx] = useState<{ id: string; label: string } | null>(null);

  const totalIncome = cashTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = cashTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleOpenAdd = (defaultType: 'INCOME' | 'EXPENSE' = 'INCOME') => {
    setEditingTransaction(null);
    setType(defaultType);
    setCategory(defaultType === 'INCOME' ? 'Iuran IPL Warga' : 'Kebersihan & Persampahan');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trx: CashTransaction) => {
    setEditingTransaction(trx);
    if (trx.type === 'INCOME' || trx.type === 'EXPENSE') {
      setType(trx.type);
    }
    setCategory(trx.category);
    setAmount(trx.amount.toString());
    setDescription(trx.description);
    setDate(trx.date);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !currentUser) return;
    // Trigger Confirmation Yes/No Modal
    setShowConfirmModal(true);
  };

  const executeSave = () => {
    if (!currentUser) return;

    if (editingTransaction) {
      updateCashTransaction(editingTransaction.transactionId, {
        date,
        type,
        category,
        amount: Number(amount),
        description,
      });
    } else {
      addCashTransaction({
        date,
        type,
        category,
        amount: Number(amount),
        description,
        postedBy: currentUser.fullName,
      });
    }

    setShowConfirmModal(false);
    setIsModalOpen(false);
    setEditingTransaction(null);
    setAmount('');
    setDescription('');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Nominal', 'Keterangan', 'Oleh'];
    const rows = cashTransactions.map(t => [
      t.transactionId,
      t.date,
      t.type,
      t.category,
      t.amount,
      `"${t.description}"`,
      `"${t.postedBy}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GCR_Kas_Keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute running balance for Rekapitulasi (sorted ascending by date)
  const sortedTransactions = [...cashTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBal = 0;
  const rekapWithBalance = sortedTransactions.map(t => {
    if (t.type === 'INCOME') {
      runningBal += t.amount;
    } else {
      runningBal -= t.amount;
    }
    return { ...t, runningBalance: runningBal };
  }).reverse(); // newest first for display

  const incomeTransactions = cashTransactions.filter(t => t.type === 'INCOME');
  const expenseTransactions = cashTransactions.filter(t => t.type === 'EXPENSE');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kas & Keuangan RT</h1>
          <p className="text-sm text-slate-500">Pencatatan transparan pemasukan, pengeluaran, saldo, dan rekapitulasi Grand Ciledug Raya.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Input Iuran Warga</span>
          </button>
          <button
            onClick={() => handleOpenAdd('INCOME')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Lain</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Pemasukan</span>
          <div className="text-2xl font-bold text-emerald-600">{formatRupiah(totalIncome)}</div>
          <p className="text-xs text-slate-400">Akumulasi IPL dan kas masuk</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Pengeluaran</span>
          <div className="text-2xl font-bold text-rose-600">{formatRupiah(totalExpense)}</div>
          <p className="text-xs text-slate-400">Akumulasi operasional & lingkungan</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Saldo Kas Bersih</span>
          <div className="text-2xl font-bold text-indigo-600">{formatRupiah(netBalance)}</div>
          <p className="text-xs text-slate-400">Posisi kas bersih saat ini</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('REKAPITULASI')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'REKAPITULASI'
              ? 'bg-[#142D4E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Rekapitulasi (Beserta Saldo)
        </button>
        <button
          onClick={() => setActiveTab('PEMASUKAN')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'PEMASUKAN'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Pemasukan ({incomeTransactions.length}) — <strong className="ml-1">{formatRupiah(totalIncome)}</strong>
        </button>
        <button
          onClick={() => setActiveTab('PENGELUARAN')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'PENGELUARAN'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Pengeluaran ({expenseTransactions.length}) — <strong className="ml-1">{formatRupiah(totalExpense)}</strong>
        </button>
      </div>

      {/* Tab 1: Rekapitulasi */}
      {activeTab === 'REKAPITULASI' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Rekapitulasi Arus Kas & Saldo Berjalan</h2>
            <span className="text-xs text-slate-500">{cashTransactions.length} total transaksi</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Keterangan</th>
                  <th className="px-6 py-3">Masuk (Debit)</th>
                  <th className="px-6 py-3">Keluar (Kredit)</th>
                  <th className="px-6 py-3">Saldo Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rekapWithBalance.map(trx => (
                  <tr key={trx.transactionId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">{formatDate(trx.date)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{trx.category}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{trx.description}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {trx.type === 'INCOME' ? formatRupiah(trx.amount) : '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-600">
                      {trx.type === 'EXPENSE' ? formatRupiah(trx.amount) : '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{formatRupiah(trx.runningBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Pemasukan */}
      {activeTab === 'PEMASUKAN' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Pemasukan Kas RT</h2>
              <p className="text-xs text-emerald-800">
                Total Pemasukan Saat Ini: <strong className="font-extrabold">{formatRupiah(totalIncome)}</strong> ({incomeTransactions.length} Transaksi)
              </p>
            </div>
            <button
              onClick={() => handleOpenAdd('INCOME')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              + Tambah Pemasukan
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Keterangan</th>
                  <th className="px-6 py-3">Nominal</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {incomeTransactions.map(trx => (
                  <tr key={trx.transactionId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">{formatDate(trx.date)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{trx.category}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{trx.description}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">+{formatRupiah(trx.amount)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(trx)}
                        className="p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTrx({ id: trx.transactionId, label: `${trx.category} (${formatRupiah(trx.amount)})` })}
                        className="p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50/80 font-bold text-slate-900 border-t-2 border-emerald-200">
                <tr>
                  <td colSpan={3} className="px-6 py-3.5 text-right text-emerald-950 font-extrabold uppercase text-xs tracking-wider">
                    Total Seluruh Pemasukan Kas:
                  </td>
                  <td className="px-6 py-3.5 text-emerald-700 text-base font-black">
                    +{formatRupiah(totalIncome)}
                  </td>
                  <td className="px-6 py-3.5 text-xs text-emerald-800 text-right">
                    ({incomeTransactions.length} Transaksi)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-4 bg-emerald-100/60 border-t border-emerald-200 flex items-center justify-between font-bold text-sm">
            <span className="text-emerald-950">Jumlah Total Pemasukan:</span>
            <span className="text-lg font-black text-emerald-700">+{formatRupiah(totalIncome)}</span>
          </div>
        </div>
      )}

      {/* Tab 3: Pengeluaran */}
      {activeTab === 'PENGELUARAN' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Pengeluaran Kas RT</h2>
              <p className="text-xs text-rose-800">
                Total Pengeluaran Saat Ini: <strong className="font-extrabold">{formatRupiah(totalExpense)}</strong> ({expenseTransactions.length} Transaksi)
              </p>
            </div>
            <button
              onClick={() => handleOpenAdd('EXPENSE')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              + Tambah Pengeluaran
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Keterangan</th>
                  <th className="px-6 py-3">Nominal</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expenseTransactions.map(trx => (
                  <tr key={trx.transactionId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">{formatDate(trx.date)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{trx.category}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{trx.description}</td>
                    <td className="px-6 py-4 font-bold text-rose-600">-{formatRupiah(trx.amount)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(trx)}
                        className="p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTrx({ id: trx.transactionId, label: `${trx.category} (${formatRupiah(trx.amount)})` })}
                        className="p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-rose-50/80 font-bold text-slate-900 border-t-2 border-rose-200">
                <tr>
                  <td colSpan={3} className="px-6 py-3.5 text-right text-rose-950 font-extrabold uppercase text-xs tracking-wider">
                    Total Seluruh Pengeluaran Kas:
                  </td>
                  <td className="px-6 py-3.5 text-rose-700 text-base font-black">
                    -{formatRupiah(totalExpense)}
                  </td>
                  <td className="px-6 py-3.5 text-xs text-rose-800 text-right">
                    ({expenseTransactions.length} Transaksi)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-4 bg-rose-100/60 border-t border-rose-200 flex items-center justify-between font-bold text-sm">
            <span className="text-rose-950">Jumlah Total Pengeluaran:</span>
            <span className="text-lg font-black text-rose-700">-{formatRupiah(totalExpense)}</span>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingTransaction ? 'Edit Transaksi Kas' : 'Catat Transaksi Kas Baru'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tipe Transaksi</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kebersihan, Iuran IPL, Perbaikan PJU"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nominal (IDR)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 500000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Keterangan / Keperluan</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Deskripsi transaksi..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm cursor-pointer"
                >
                  Lanjutkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Yes/No Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Pencatatan</h3>
              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin {editingTransaction ? 'memperbarui' : 'mencatat'} transaksi <strong>{type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}</strong> sebesar <strong>{formatRupiah(Number(amount))}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={executeSave}
                className="w-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Transaksi</h3>
              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin menghapus transaksi <strong>{deletingTrx.label}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTrx(null)}
                className="w-1/2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCashTransaction(deletingTrx.id);
                  setDeletingTrx(null);
                }}
                className="w-1/2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
