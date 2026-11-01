import React from 'react';
import { X, Settings, ShieldCheck, Zap, BellRing } from 'lucide-react';

interface AndroidPushFixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidPushFixModal: React.FC<AndroidPushFixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="px-5 py-4 bg-orange-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold">Tips Notifikasi Android</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-900 text-xs leading-relaxed">
            Agar notifikasi (terutama sinyal SOS) tetap muncul saat aplikasi ditutup, pengguna HP 
            <strong> Xiaomi, Oppo, Vivo, & Realme</strong> perlu melakukan langkah berikut:
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-bold text-sm">1</div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Izinkan "Mulai Otomatis" (Auto-start)</p>
                <p className="text-xs text-slate-500">
                  Buka Info Aplikasi GCR &rarr; Aktifkan saklar <strong>Mulai Otomatis / Auto-start</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-bold text-sm">2</div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Matikan Penghemat Baterai</p>
                <p className="text-xs text-slate-500">
                  Pilih menu <strong>Penghemat Baterai</strong> &rarr; Pilih <strong>Tidak Ada Pembatasan</strong> (No Restrictions).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-bold text-sm">3</div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Kunci Aplikasi di Recent Apps</p>
                <p className="text-xs text-slate-500">
                  Buka daftar aplikasi terakhir &rarr; Tekan lama aplikasi GCR &rarr; Klik ikon <strong>Gembok/Kunci</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
