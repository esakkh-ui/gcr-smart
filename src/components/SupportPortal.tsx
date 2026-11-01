import React from 'react';
import { 
  Terminal, 
  Key, 
  Server, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const SupportPortal: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Hero Section */}
      <header className="bg-[#142D4E] text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/20">
              <Server size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase letter-spacing-wider">GCR Cloud Support</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Pusat Bantuan & Troubleshooting VPS</h2>
          <p className="text-slate-300 text-xl max-w-2xl leading-relaxed">
            Solusi cepat untuk kendala teknis VPS, deployment, dan konfigurasi SSH GCR Cloud.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto -mt-10 relative z-20 px-6">
        {/* Urgent Alert for common issue */}
        <div className="bg-amber-50 border-l-8 border-amber-500 p-8 rounded-r-2xl mb-12 shadow-xl shadow-amber-900/5">
          <div className="flex gap-6 items-start">
            <div className="bg-amber-500/10 p-3 rounded-full">
              <ShieldAlert className="text-amber-600" size={32} />
            </div>
            <div>
              <h3 className="text-amber-900 font-bold text-xl mb-2">Masalah Koneksi SSH: "Permission denied (publickey)"</h3>
              <p className="text-amber-800 text-lg leading-relaxed">
                Pesan ini muncul karena koneksi SSH menggunakan autentikasi kunci publik (public key), namun kunci privat yang sesuai tidak ditemukan atau tidak diizinkan di komputer Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Troubleshooting */}
        <section className="space-y-10">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <HelpCircle className="text-blue-600" size={28} />
            <h3 className="text-2xl font-extrabold tracking-tight">Langkah-Langkah Perbaikan</h3>
          </div>

          <div className="grid gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex gap-6">
                <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">01</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-3">Periksa Kredensial SSH</h4>
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    Pastikan Anda menggunakan <strong>username</strong> dan <strong>port SSH</strong> yang benar. VPS GCR menggunakan port non-standar, bukan port default 22.
                  </p>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={20} />
                    <span className="text-slate-700 font-medium italic">Kredensial dapat dilihat di menu <strong>Layanan &gt; pilih VPS &gt; tab Kredensial</strong>.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex gap-6">
                <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">02</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-3">Verifikasi Kunci Privat (.pem / .ppk)</h4>
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    Pastikan kunci privat yang sesuai dengan kunci publik di server sudah benar dan tersimpan di folder <code>~/.ssh/</code> komputer Anda.
                  </p>
                  <div className="bg-[#1e1e1e] text-slate-300 p-6 rounded-2xl font-mono text-sm shadow-inner">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                      <span className="text-slate-500 flex items-center gap-2"><Key size={14} /> Linux / macOS Permissions</span>
                      <Terminal size={16} className="text-slate-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-emerald-500"># Berikan izin akses terbatas pada kunci privat</p>
                      <p className="text-blue-400">chmod 600 <span className="text-slate-300">/path/ke/kunci_anda.pem</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex gap-6">
                <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">03</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-3">Reboot VPS (Jika Diperlukan)</h4>
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    Kadang masalah koneksi bisa teratasi dengan me-reboot VPS dari panel member untuk menyegarkan service SSH.
                  </p>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    Buka Panel Member <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex gap-6">
                <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">04</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-3">Gunakan Konsol VNC</h4>
                  <p className="text-slate-600 mb-2 leading-relaxed">
                    Jika akses SSH tetap terputus, gunakan <strong>Konsol VNC</strong> di panel member untuk memeriksa konfigurasi SSH atau mereset password root.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-slate-500 text-sm italic">
                    <ShieldAlert size={14} />
                    Catatan: Hati-hati saat mengubah konfigurasi via VNC.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex gap-6">
                <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">05</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-3">Fix Axios: Network Error</h4>
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    Jika muncul error <strong>Network Error</strong> saat sync data, itu karena aplikasi mencoba menghubungi domain luar yang tidak aktif. Kami telah memperbarui aplikasi untuk menggunakan backend internal.
                  </p>
                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-start gap-4">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} />
                    <span className="text-emerald-700 font-medium italic text-sm">Update: File <code>src/api/client.ts</code> sekarang menggunakan <code>/api</code> agar terhubung ke server lokal Anda.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deployment Section */}
        <section className="mt-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 md:p-12 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <RefreshCw size={180} className="animate-spin-slow" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-6">Panduan Deployment Aplikasi</h3>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed max-w-2xl">
              Setelah berhasil terhubung via SSH, gunakan perintah di bawah ini untuk mengunggah bundle aplikasi ke folder target di VPS Anda.
            </p>
            
            <div className="bg-blue-900/40 backdrop-blur-md p-6 rounded-2xl font-mono text-sm border border-white/10 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="text-blue-300">Command (Local Terminal)</span>
                <span className="bg-blue-400/20 text-blue-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">PowerShell / Bash</span>
              </div>
              <p className="text-blue-200 break-all">
                scp -P <span className="text-white font-bold">[PORT]</span> dist.tar.gz root@<span className="text-white font-bold">103.119.237.114</span>:/var/www/gcr-app/
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-100 bg-white/10 px-4 py-3 rounded-xl border border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Update source path: <code>dist.tar.gz</code></span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 bg-white/10 px-4 py-3 rounded-xl border border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Target: <code>/var/www/gcr-app/</code></span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 bg-white/10 px-4 py-3 rounded-xl border border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Run Backend: <code>npm run start</code></span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 bg-white/10 px-4 py-3 rounded-xl border border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Port: <code>3000</code></span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact/Support Footer */}
        <footer className="mt-32 border-t border-slate-200 pt-12 text-center">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-4">Butuh bantuan lebih lanjut?</p>
          <div className="flex flex-col items-center gap-2">
            <a href="mailto:esak.kh@gmail.com" className="text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors">
              esak.kh@gmail.com
            </a>
            <p className="text-slate-500">GCR Cloud Services - Support Tier 1 (24/7)</p>
          </div>
          <p className="mt-12 text-slate-300 text-xs tracking-wider">
            © 2026 PT Grand Ciledug Raya Tekno. S&K Berlaku.
          </p>
        </footer>
      </main>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SupportPortal;
