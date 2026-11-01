import React from 'react';
import { useData } from '../../context/DataContext';
import { Megaphone, Pin, Calendar } from 'lucide-react';

export const AnnouncementsResident: React.FC = () => {
  const { announcements } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengumuman & Informasi Resmi</h1>
        <p className="text-sm text-slate-500">Pemberitahuan penting dari Pengurus RT Grand Ciledug Raya.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map(ann => (
          <div key={ann.announcementId} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                  {ann.category}
                </span>
                {ann.isPinned && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                    <Pin className="w-3.5 h-3.5" /> Disematkan
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Oleh: {ann.authorName}</span>
              <span>{new Date(ann.publishedAt).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
