import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Check, Trash2, BarChart3, X } from 'lucide-react';

export const PollsAdmin: React.FC = () => {
  const { polls, createPoll, finishPoll, deletePoll } = useData();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (idx: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const newOptions = [...options];
    newOptions[idx] = val;
    setOptions(newOptions);
  };

  const handleCreatePoll = () => {
    if (!question || options.some(o => !o)) return;
    createPoll({ question, options, createdBy: 'Admin' });
    setQuestion('');
    setOptions(['', '']);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Kelola Polling Warga</h2>
        <BarChart3 className="text-slate-400" size={24} />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Pertanyaan Polling</label>
          <input 
            placeholder="Contoh: Setujukah Anda dengan perbaikan taman depan?" 
            value={question} 
            onChange={e => setQuestion(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Opsi Jawaban</label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input 
                placeholder={`Opsi ${i + 1}`} 
                value={opt} 
                onChange={e => handleOptionChange(i, e.target.value)}
                className="flex-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {options.length > 2 && (
                <button 
                  onClick={() => handleRemoveOption(i)}
                  className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={handleAddOption} 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Plus size={16} /> Tambah Opsi
          </button>
          <button 
            onClick={handleCreatePoll} 
            disabled={!question || options.some(o => !o)}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Buat Polling
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Daftar Polling</h3>
        {(!polls || polls.length === 0) ? (
          <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
            Belum ada polling yang dibuat.
          </div>
        ) : (
          polls.map(poll => (
            <div key={poll.pollId} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{poll.question}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      poll.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {poll.status === 'ACTIVE' ? 'AKTIF' : 'SELESAI'}
                    </span>
                    <span className="text-xs text-slate-400">Dibuat pada {new Date(poll.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => deletePoll(poll.pollId)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Hapus Polling"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {poll.options.map((opt, i) => (
                  <div key={i} className="text-sm text-slate-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    {opt}
                  </div>
                ))}
              </div>

              {poll.status === 'ACTIVE' && (
                <button 
                  onClick={() => finishPoll(poll.pollId)} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Check size={16} /> Selesaikan Polling
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

