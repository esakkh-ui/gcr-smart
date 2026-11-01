import React, { useMemo, useState } from 'react';
import { CashTransaction } from '../../types';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { ArrowUpRight, Search, X, FileSpreadsheet } from 'lucide-react';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: CashTransaction[];
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const expenseItems = useMemo(() => {
    return transactions
      .filter(t => t.type === 'EXPENSE')
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [transactions]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(expenseItems.map(item => item.category).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [expenseItems]);

  const filteredExpenses = useMemo(() => {
    return expenseItems.filter(item => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [expenseItems, selectedCategory, searchTerm]);

  const totalAllExpenses = useMemo(
    () => expenseItems.reduce((sum, item) => sum + item.amount, 0),
    [expenseItems]
  );

  const totalFilteredExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                Rincian Pengeluaran Kas RT
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Transparansi penggunaan dana kas lingkungan Grand Ciledug Raya
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Tutup Rincian Pengeluaran"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary & Filter Controls */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-medium text-slate-500">
                Total Akumulasi Pengeluaran Kas RT
              </div>
              <div className="text-xl sm:text-2xl font-bold text-rose-600 font-mono tabular-nums">
                {formatRupiah(totalAllExpenses)}
              </div>
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              {expenseItems.length} catatan pengeluaran
            </div>
          </div>

          {expenseItems.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari kategori atau keterangan pengeluaran..."
                  className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>
              {categories.length > 1 && (
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="min-h-[42px] px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-hidden focus:border-blue-600"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Expense List */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(item => (
              <div
                key={item.transactionId}
                className="px-5 py-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono tabular-nums font-medium text-slate-600">
                      {formatDate(item.date)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800 truncate">{item.category}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 leading-snug">
                    {item.description}
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-sm sm:text-base font-bold text-rose-600 font-mono tabular-nums">
                    -{formatRupiah(item.amount)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 px-6 text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">
                {expenseItems.length === 0
                  ? 'Belum Ada Catatan Pengeluaran'
                  : 'Pengeluaran Tidak Ditemukan'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {expenseItems.length === 0
                  ? 'Saat ini belum ada transaksi pengeluaran yang tercatat pada kas RT.'
                  : 'Coba ubah kata kunci pencarian atau pilih kategori pengeluaran lainnya.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            {filteredExpenses.length !== expenseItems.length ? (
              <span>
                Subtotal filter:{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {formatRupiah(totalFilteredExpenses)}
                </strong>
              </span>
            ) : (
              <span>Menampilkan seluruh pengeluaran kas RT</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
