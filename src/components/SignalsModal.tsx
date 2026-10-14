import React from 'react';
import { X, Zap, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Asset } from '../types';

interface SignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignal: (assetId: string, direction: 'call' | 'put', durationSeconds: number) => void;
  currentAssetId: string;
}

const SIGNALS_LIST = [
  {
    id: 'sig-1',
    assetId: 'ripple-otc',
    name: 'Ripple (OTC)',
    direction: 'call' as const,
    accuracy: 94,
    timeframe: '1 min',
    seconds: 60,
    payout: 92,
  },
  {
    id: 'sig-2',
    assetId: 'cosmos-otc',
    name: 'Cosmos (OTC)',
    direction: 'put' as const,
    accuracy: 91,
    timeframe: '1 min',
    seconds: 60,
    payout: 72,
  },
  {
    id: 'sig-3',
    assetId: 'gold-otc',
    name: 'Gold (OTC)',
    direction: 'call' as const,
    accuracy: 89,
    timeframe: '5 min',
    seconds: 300,
    payout: 92,
  },
  {
    id: 'sig-4',
    assetId: 'eur-cad-otc',
    name: 'EUR/CAD (OTC)',
    direction: 'call' as const,
    accuracy: 95,
    timeframe: '1 min',
    seconds: 60,
    payout: 95,
  },
  {
    id: 'sig-5',
    assetId: 'solana-otc',
    name: 'Solana (OTC)',
    direction: 'put' as const,
    accuracy: 88,
    timeframe: '1 min',
    seconds: 60,
    payout: 73,
  },
];

export const SignalsModal: React.FC<SignalsModalProps> = ({
  isOpen,
  onClose,
  onApplySignal,
  currentAssetId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
      <div className="bg-[#181c27] border border-[#273042] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#232938] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Live Trading Signals</h2>
              <span className="text-xs text-slate-400">Algorithmic high-probability signals</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#222a3b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signals List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {SIGNALS_LIST.map((sig) => {
            const isCall = sig.direction === 'call';
            return (
              <div
                key={sig.id}
                className="p-3 rounded-xl bg-[#121620] border border-[#232a3a] flex items-center justify-between gap-3 hover:border-[#2e3b52] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{sig.name}</span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                        isCall
                          ? 'bg-[#00b074]/15 text-[#00b074]'
                          : 'bg-[#ff4757]/15 text-[#ff4757]'
                      }`}
                    >
                      {isCall ? (
                        <>
                          <TrendingUp className="w-3 h-3" /> CALL
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3" /> PUT
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                    <span>Expiry: {sig.timeframe}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-bold">{sig.accuracy}% Accuracy</span>
                    <span>·</span>
                    <span className="text-amber-400">Payout: {sig.payout}%</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onApplySignal(sig.assetId, sig.direction, sig.seconds);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0070f3] hover:bg-[#005ecb] text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 transition-transform active:scale-95"
                >
                  <span>Trade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
