import React from 'react';
import { useData } from '../../context/DataContext';
import { formatRupiah } from '../../utils/formatters';
import { FileBarChart, Download, ShieldCheck, Printer } from 'lucide-react';

export const ReportsAdmin: React.FC = () => {
  const { houses, residents, invoices, cashTransactions, auditLogs, settings } = useData();

  const totalHouses = houses.length;
  const occupiedHouses = houses.filter(h => h.occupancyStatus !== 'KOSONG').length;
  const totalIncome = cashTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = cashTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Resmi & Transparansi</h1>
          <p className="text-sm text-slate-500">Ringkasan laporan keuangan, rekapitulasi warga, dan audit trail operasional.</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / PDF Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-blue-600" />
            <span>Rekapitulasi Kependudukan & Rumah</span>
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>Total Rumah Terdaftar</span>
              <span className="font-bold text-slate-900">{totalHouses} Rumah</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>Rumah Terisi (Pemilik / Sewa)</span>
              <span className="font-bold text-slate-900">{occupiedHouses} Rumah</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>Rumah Kosong</span>
              <span className="font-bold text-slate-900">{totalHouses - occupiedHouses} Rumah</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Total Warga Aktif</span>
              <span className="font-bold text-slate-900">{residents.length} Jiwa</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Audit Trail & Keamanan Transaksi</span>
          </h3>
          <div className="space-y-3">
            {auditLogs.slice(0, 4).map(log => (
              <div key={log.logId} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{log.userName}</span>
                  <span className="text-slate-400 font-normal">{new Date(log.timestamp).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="text-slate-600">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
