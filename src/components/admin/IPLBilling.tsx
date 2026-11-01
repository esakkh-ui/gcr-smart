import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { sanitizeIplNominalOptions } from '../../context/DataContext';
import { formatRupiah, formatPeriod } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { Plus, Search, Calendar, CreditCard, Settings } from 'lucide-react';

export const IPLBilling: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, houses, generateMonthlyInvoices, settings } = useData();
  const iplOptions = sanitizeIplNominalOptions(settings.iplNominalOptions);
  const [selectedPeriod, setSelectedPeriod] = useState('2026-10');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<0 | 1 | 2 | 3>(() => {
    const idx = iplOptions.indexOf(settings.defaultIplAmount);
    return (idx >= 0 && idx <= 3 ? idx : 0) as 0 | 1 | 2 | 3;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const idx = iplOptions.indexOf(settings.defaultIplAmount);
    if (idx >= 0 && idx <= 3) {
      setSelectedOptionIndex(idx as 0 | 1 | 2 | 3);
    }
  }, [settings.defaultIplAmount, settings.iplNominalOptions]);

  const currentInvoices = invoices.filter(inv => inv.period === selectedPeriod);
  const filteredInvoices = currentInvoices.filter(inv => {
    const house = houses.find(h => h.houseId === inv.houseId);
    return house && house.addressLabel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const generateAmount = iplOptions[selectedOptionIndex] ?? iplOptions[0];
    generateMonthlyInvoices(selectedPeriod, generateAmount);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengelolaan Iuran IPL Bulanan</h1>
          <p className="text-sm text-slate-500">Konfigurasi tarif dan hasilkan tagihan IPL bulanan untuk setiap rumah warga.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Input Iuran Warga</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Tagihan IPL Bulanan</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Pilih Periode:</span>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="2026-10">Oktober 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">Agustus 2026</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan rumah..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900">Tagihan Periode {formatPeriod(selectedPeriod)}</span>
          <span className="text-xs text-slate-500">{filteredInvoices.length} Tagihan Rumah</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Rumah</th>
                <th className="px-6 py-3">Periode</th>
                <th className="px-6 py-3">Nominal IPL</th>
                <th className="px-6 py-3">Jatuh Tempo</th>
                <th className="px-6 py-3">Status Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map(inv => {
                const house = houses.find(h => h.houseId === inv.houseId);
                return (
                  <tr key={inv.invoiceId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {house ? house.addressLabel : inv.houseId}
                    </td>
                    <td className="px-6 py-4">{formatPeriod(inv.period)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatRupiah(inv.amount)}</td>
                    <td className="px-6 py-4">{inv.dueDate}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Belum ada tagihan yang di-generate untuk periode ini. Klik tombol "Generate Tagihan IPL Bulanan".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Generate Tagihan IPL Bulanan</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Periode Tagihan (YYYY-MM)</label>
                <input
                  type="text"
                  required
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Pilih Nominal IPL (4 Pilihan Resmi)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Ubah di Pengaturan</span>
                  </button>
                </div>
                <select
                  value={selectedOptionIndex}
                  onChange={e => setSelectedOptionIndex(Number(e.target.value) as 0 | 1 | 2 | 3)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono tabular-nums font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {iplOptions.map((opt, idx) => (
                    <option key={idx} value={idx}>
                      Pilihan {idx + 1} — {formatRupiah(opt)}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-slate-500">
                Sistem akan membuat tagihan secara otomatis untuk seluruh rumah aktif yang belum memiliki tagihan pada periode tersebut. Perubahan nilai nominal dilakukan di menu Pengaturan.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  Proses Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
