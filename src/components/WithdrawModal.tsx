import React, { useState } from 'react';
import { X, ArrowDownToLine, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

import { QuotexAppIcon } from './QuotexLogo';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawSuccess: (amount: number) => void;
  availableBalance: number;
  accountType: 'demo' | 'live';
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onWithdrawSuccess,
  availableBalance,
  accountType,
}) => {
  const [method, setMethod] = useState('usdt-trc20');
  const [address, setAddress] = useState('TRX9q4MkdZ8...kK42P');
  const [amount, setAmount] = useState<number>(Math.min(50, Math.floor(availableBalance)));
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWithdraw = () => {
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (amount > availableBalance) {
      setError('Insufficient available balance');
      return;
    }
    if (!address.trim()) {
      setError('Please provide a valid destination address');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onWithdrawSuccess(amount);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
      <div className="bg-[#181c27] border border-[#273042] rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#232938] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QuotexAppIcon size={30} />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-white">
                  QUOTEX PRO Withdrawal Cashier
                </h2>
                <span className="text-[10px] bg-[#0070f3]/20 text-[#0070f3] font-black px-1.5 py-0.2 rounded">
                  FAST PAYOUT
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Withdraw from {accountType === 'demo' ? 'Demo Account' : 'Live Real Account'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#222a3b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Balance Card */}
          <div className="p-3.5 bg-[#121620] border border-[#232a3a] rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Available for Withdrawal</span>
            <span className="text-lg font-extrabold text-white font-mono">
              ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'usdt-trc20', name: 'USDT (TRC-20)' },
                { id: 'binance-pay', name: 'Binance Pay' },
                { id: 'bank-card', name: 'Bank Card' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    method === m.id
                      ? 'bg-[#1e2638] border-[#0070f3] text-white shadow-md'
                      : 'bg-[#121620] border-[#222938] text-slate-400 hover:text-white'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Address Input */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Wallet Address / Account
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter receiving address..."
              className="w-full bg-[#121620] border border-[#242b3b] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0070f3]"
            />
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Withdrawal Amount ($)
              </label>
              <button
                onClick={() => setAmount(Math.floor(availableBalance))}
                className="text-[11px] font-bold text-[#0070f3] hover:underline"
              >
                Max Amount
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="10"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121620] border border-[#242b3b] rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#0070f3]"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#00b074]" />
            <span>Identity verified · Security protocols active</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232938] bg-[#141822]">
          <button
            onClick={handleWithdraw}
            disabled={isProcessing || availableBalance <= 0}
            className="w-full py-3 rounded-xl bg-[#0070f3] hover:bg-[#005ecb] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? 'Processing Request...' : `Confirm Withdrawal of $${amount}`}
          </button>
        </div>
      </div>
    </div>
  );
};
