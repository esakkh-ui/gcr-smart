import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText } from 'lucide-react';

const TATA_TERTIB = `# TATA TERTIB LINGKUNGAN PAGUYUBAN GRAND CILEDUG RAYA

Demi terciptanya lingkungan perumahan yang aman, nyaman, tertib, dan harmonis, seluruh warga diharapkan untuk mematuhi ketentuan berikut:

## A. KETERTIBAN & ADMINISTRASI
1. **Pelaporan Tamu:** Warga wajib melapor kepada pengurus RT atau petugas keamanan apabila terdapat tamu yang menginap lebih dari 1x24 jam.
2. **Administrasi Kependudukan:** Warga baru (pemilik maupun penyewa) wajib melaporkan diri kepada sekretariat Paguyuban untuk keperluan pendataan administrasi kependudukan.
3. **Pelaporan Kepergian:** Warga yang akan meninggalkan rumah dalam waktu lebih dari 1x24 jam (keluar kota/perjalanan dinas) diwajibkan melapor kepada petugas keamanan atau pengurus RT setempat.

## B. KEUANGAN & PEMELIHARAAN LINGKUNGAN
4. **Pembayaran Iuran:** Warga wajib melakukan pembayaran Iuran Pengelolaan Lingkungan (IPL) secara tepat waktu sesuai dengan nominal dan ketentuan yang ditetapkan oleh Paguyuban.
5. **Kegiatan Sosial (Gotong Royong):** Warga diharapkan berpartisipasi aktif dalam kegiatan kerja bakti/gotong royong yang dijadwalkan oleh Paguyuban demi menjaga keasrian dan kebersihan lingkungan bersama.
6. **Renovasi Bangunan:** Segala bentuk renovasi bangunan yang memerlukan perubahan struktur atau penggunaan area fasilitas umum wajib mengajukan izin tertulis kepada Paguyuban/RT setempat, serta bertanggung jawab penuh atas kebersihan area sekitar setelah pekerjaan selesai.

## C. AKSES, PARKIR, & KEAMANAN
7. **Ketertiban Parkir & Jalan:** Kendaraan wajib diparkir di dalam area rumah masing-masing. Dilarang memarkir kendaraan di badan jalan yang dapat mengganggu akses lalu lintas warga lain atau kendaraan darurat (pemadam/ambulan).
8. **Akses Gerbang:** Gerbang utama ditutup pada pukul 23.00 s.d. 06.00 WIB. Akses masuk/keluar bagi tamu atau warga dengan keperluan mendesak di jam tersebut wajib melakukan konfirmasi kepada petugas keamanan yang bertugas.
9. **Pengawasan Lingkungan:** Seluruh area perumahan dalam pengawasan CCTV selama 24 jam demi keamanan dan keselamatan bersama.

## D. NORMA & SANKSI
10. **Larangan Aktivitas Meresahkan:** Dilarang melakukan segala bentuk aktivitas yang mengganggu ketertiban umum dan melanggar norma sosial, termasuk penyalahgunaan minuman keras, perjudian, tindak asusila, dan perbuatan yang meresahkan masyarakat lainnya.
11. **Penegakan Hukum:** Segala bentuk pelanggaran hukum yang terjadi di lingkungan perumahan akan diserahkan sepenuhnya kepada pihak yang berwajib untuk ditindaklanjuti.

*Hormat Kami,*
**Pengurus Paguyuban Grand Ciledug Raya**`;

import { useData } from '../../context/DataContext';

export const TataTertibPage: React.FC = () => {
  const { settings } = useData();
  
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
        <FileText className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-bold text-slate-900">Tata Tertib Perumahan</h1>
      </div>
      <div className="prose prose-slate max-w-none text-sm text-slate-600">
        <ReactMarkdown>{settings.tataTertibMarkdown || ''}</ReactMarkdown>
      </div>
    </div>
  );
};
