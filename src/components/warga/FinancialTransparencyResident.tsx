import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatRupiah } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Wallet, ChevronRight } from 'lucide-react';
import { ExpenseDetailModal } from './ExpenseDetailModal';

export const FinancialTransparencyResident: React.FC = () => {
  const { cashTransactions } = useData();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const totalIncome = cashTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseTransactions = cashTransactions.filter(t => t.type === 'EXPENSE');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Transparansi Keuangan RT
        </h1>
        <p className="text-sm text-slate-500">
          Ringkasan kas pemasukan, pengeluaran, dan saldo bersih lingkungan Grand Ciledug Raya.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Pemasukan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Pemasukan</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {formatRupiah(totalIncome)}
          </div>
          <p className="text-xs text-slate-500">Akumulasi iuran & pemasukan kas RT</p>
        </div>

        {/* Total Pengeluaran (Clickable) */}
        <button
          type="button"
          onClick={() => setIsExpenseModalOpen(true)}
          className="text-left bg-white hover:bg-rose-50/40 p-5 rounded-xl border border-slate-200 hover:border-rose-300 shadow-xs space-y-2 transition cursor-pointer group focus-visible:outline-2 focus-visible:outline-rose-500"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold group-hover:text-rose-700 transition-colors">
              Total Pengeluaran
            </span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {formatRupiah(totalExpense)}
          </div>
          <div className="flex items-center justify-between pt-0.5 text-xs font-semibold text-rose-700">
            <span>Klik untuk rincian pengeluaran ({expenseTransactions.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </button>

        {/* Saldo Kas Bersih */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Saldo Kas Bersih</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRupiah(netBalance)}
          </div>
          <p className="text-xs text-slate-500">Dana kas aktif tersedia saat ini</p>
        </div>
      </div>

      <ExpenseDetailModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        transactions={cashTransactions}
      />
    </div>
  );
};
