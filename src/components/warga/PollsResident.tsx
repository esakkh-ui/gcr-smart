import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { BarChart3 } from 'lucide-react';

export const PollsResident: React.FC = () => {
  const { polls, pollVotes, voteInPoll } = useData();
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Polling Warga</h2>
        <BarChart3 className="text-slate-400" size={24} />
      </div>

      <div className="space-y-4">
        {(!polls || polls.length === 0) ? (
          <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
            Saat ini tidak ada polling yang berlangsung.
          </div>
        ) : (
          polls.map(poll => {
            const votesForThisPoll = pollVotes?.filter(v => v.pollId === poll.pollId) || [];
            const totalVotes = votesForThisPoll.length;
            const userVote = votesForThisPoll.find(v => v.userUid === currentUser?.uid);
            const userHasVoted = !!userVote;

            return (
              <div key={poll.pollId} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{poll.question}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    poll.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {poll.status === 'ACTIVE' ? 'AKTIF' : 'SELESAI'}
                  </span>
                </div>

                {poll.status === 'ACTIVE' && !userHasVoted ? (
                  <div className="space-y-2 mt-4">
                    {poll.options?.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => voteInPoll(poll.pollId, i, currentUser!.uid)} 
                        className="block w-full text-left p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-slate-700 font-medium"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {poll.options?.map((opt, i) => {
                      const count = votesForThisPoll.filter(v => v.optionIndex === i).length;
                      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const isUserChoice = userVote?.optionIndex === i;

                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={`font-medium ${isUserChoice ? 'text-blue-600' : 'text-slate-700'}`}>
                              {opt} {isUserChoice && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-1">Pilihan Anda</span>}
                            </span>
                            <span className="text-slate-500 font-mono">{percentage}% ({count})</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isUserChoice ? 'bg-blue-500' : 'bg-slate-400'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-400">Total: {totalVotes} Suara</span>
                      {poll.status === 'FINISHED' && (
                        <span className="text-xs font-bold text-slate-500">POLLING SELESAI</span>
                      )}
                      {poll.status === 'ACTIVE' && userHasVoted && (
                        <span className="text-xs font-bold text-blue-600">SUDAH MEMILIH</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

