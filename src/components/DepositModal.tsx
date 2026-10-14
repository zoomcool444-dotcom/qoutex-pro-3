import React, { useState } from 'react';
import { X, Gift, ShieldCheck, Check, ArrowRight, Wallet, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

import { QuotexAppIcon } from './QuotexLogo';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number, bonus: number) => void;
  accountType: 'demo' | 'live';
}

const PAYMENT_METHODS = [
  { id: 'binance-pay', name: 'Binance Pay', category: 'crypto', min: 10, icon: '🟡' },
  { id: 'usdt-trc20', name: 'Tether (USDT TRC-20)', category: 'crypto', min: 10, icon: '🟢' },
  { id: 'bitcoin', name: 'Bitcoin (BTC)', category: 'crypto', min: 20, icon: '₿' },
  { id: 'ethereum', name: 'Ethereum (ETH)', category: 'crypto', min: 20, icon: 'Ξ' },
  { id: 'card', name: 'Visa / Mastercard', category: 'fiat', min: 15, icon: '💳' },
  { id: 'perfect-money', name: 'Perfect Money', category: 'e-wallet', min: 10, icon: '🅿️' },
];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
  accountType,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('binance-pay');
  const [amount, setAmount] = useState<number>(100);
  const [useBonus, setUseBonus] = useState<boolean>(true);
  const [promoCode, setPromoCode] = useState<string>('WELCOME50');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const bonusAmount = useBonus ? +(amount * 0.5).toFixed(2) : 0;
  const totalCredited = +(amount + bonusAmount).toFixed(2);

  const handleDeposit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onDepositSuccess(amount, bonusAmount);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
      <div className="bg-[#181c27] border border-[#273042] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#232938] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QuotexAppIcon size={30} />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-white">
                  QUOTEX PRO Cashier
                </h2>
                <span className="text-[10px] bg-[#00b074]/20 text-[#00b074] font-black px-1.5 py-0.2 rounded">
                  0% FEE
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Deposit to {accountType === 'demo' ? 'Demo Account' : 'Live Real Account'}
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

        <div className="p-5 overflow-y-auto space-y-5">
          {/* 50% Bonus Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00b074]/20 to-[#0070f3]/20 border border-[#00b074]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#00b074] text-slate-950 flex items-center justify-center font-black">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">50% Welcome Bonus Activated</div>
                <div className="text-[11px] text-slate-300">
                  Promo code: <span className="font-mono font-bold text-[#00b074]">{promoCode}</span>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useBonus}
                onChange={(e) => setUseBonus(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#263145] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00b074]"></div>
            </label>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PAYMENT_METHODS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedMethod === m.id
                      ? 'bg-[#1e2638] border-[#0070f3] shadow-md shadow-blue-500/10'
                      : 'bg-[#121620] border-[#242c3d] hover:border-slate-600'
                  }`}
                >
                  <div className="text-xl mb-1">{m.icon}</div>
                  <div className="text-xs font-bold text-white truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Min: ${m.min}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Deposit Amount ($)
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2.5">
              {[50, 100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    amount === preset
                      ? 'bg-[#0070f3] text-white shadow-md'
                      : 'bg-[#1a2130] hover:bg-[#222a3d] text-slate-300'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="10"
                value={amount}
                onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value) || 10))}
                className="w-full bg-[#121620] border border-[#263145] rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#0070f3]"
              />
            </div>
          </div>

          {/* Calculation summary */}
          <div className="p-3 bg-[#121620] rounded-xl border border-[#232a3a] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Deposit Amount</span>
              <span className="font-bold text-white">${amount.toFixed(2)}</span>
            </div>
            {useBonus && (
              <div className="flex items-center justify-between text-[#00b074]">
                <span>50% Bonus</span>
                <span className="font-bold">+${bonusAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-[#232938] text-sm font-extrabold text-white">
              <span>Total Credited</span>
              <span className="text-[#00b074] font-mono">${totalCredited}</span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-[#232938] bg-[#141822]">
          <button
            onClick={handleDeposit}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-[#00b074] hover:bg-[#009b66] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00b074]/25 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isProcessing ? (
              <span>Processing Deposit...</span>
            ) : (
              <>
                <span>Deposit ${totalCredited}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
