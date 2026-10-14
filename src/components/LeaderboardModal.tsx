import React from 'react';
import { X, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOP_TRADERS = [
  { rank: 1, name: 'Alexander_Pro', flag: '🇬🇧', turnover: '$148,290', profit: '+$84,120' },
  { rank: 2, name: 'Trader_Dragon', flag: '🇸🇬', turnover: '$112,400', profit: '+$67,450' },
  { rank: 3, name: 'Marco_Rossi', flag: '🇮🇹', turnover: '$98,750', profit: '+$52,300' },
  { rank: 4, name: 'Fatima_K', flag: '🇦🇪', turnover: '$84,100', profit: '+$41,890' },
  { rank: 5, name: 'Kenji_S', flag: '🇯🇵', turnover: '$76,500', profit: '+$38,200' },
  { rank: 6, name: 'Zoom_Pro (You)', flag: '🇵🇰', turnover: '$42,100', profit: '+$21,490', isUser: true },
  { rank: 7, name: 'Lucas_Silva', flag: '🇧🇷', turnover: '$38,900', profit: '+$19,200' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
      <div className="bg-[#181c27] border border-[#273042] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#232938] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Daily Top Traders</h2>
              <span className="text-xs text-slate-400">Live 24h leaderboard ranking</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#222a3b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-[#232a3a]">
          {TOP_TRADERS.map((t) => (
            <div
              key={t.rank}
              className={`pt-2 flex items-center justify-between text-xs p-2 rounded-xl ${
                t.isUser ? 'bg-[#0070f3]/15 border border-[#0070f3]/40' : 'hover:bg-[#1a2130]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] ${
                    t.rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : t.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : t.rank === 3
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#222a3a] text-slate-300'
                  }`}
                >
                  {t.rank}
                </span>
                <span className="text-base">{t.flag}</span>
                <span className={`font-bold ${t.isUser ? 'text-[#00b074]' : 'text-white'}`}>
                  {t.name}
                </span>
              </div>

              <div className="text-right font-mono">
                <div className="font-bold text-[#00b074]">{t.profit}</div>
                <div className="text-[10px] text-slate-400">Vol: {t.turnover}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
