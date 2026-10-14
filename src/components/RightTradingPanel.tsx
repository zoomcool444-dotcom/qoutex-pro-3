import React, { useState } from 'react';
import {
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Clock,
  Timer,
  Package,
  ChevronDown,
} from 'lucide-react';
import { Asset, ActiveTrade, TradeDirection } from '../types';
import { AssetIcon } from './AssetIcon';

interface RightTradingPanelProps {
  asset: Asset;
  activeTrades: ActiveTrade[];
  tradeHistory: ActiveTrade[];
  onPlaceTrade: (direction: TradeDirection, amount: number, durationSeconds: number) => void;
  onSellEarly: (tradeId: string) => void;
  userBalance: number;
}

export const RightTradingPanel: React.FC<RightTradingPanelProps> = ({
  asset,
  activeTrades,
  tradeHistory,
  onPlaceTrade,
  onSellEarly,
  userBalance,
}) => {
  const [durationSeconds, setDurationSeconds] = useState<number>(60); // 1 min (60s) default as in Quotex
  const [amount, setAmount] = useState<number>(19); // 19 $ standard trade as shown in Image 2
  const [isPendingTradeOpen, setIsPendingTradeOpen] = useState<boolean>(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);
  const [isAmountPickerOpen, setIsAmountPickerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Automatically show active trades tab when a trade is placed
  React.useEffect(() => {
    if (activeTrades.length > 0) {
      setActiveTab('active');
    }
  }, [activeTrades.length]);

  const payoutPercent = durationSeconds <= 60 ? asset.payout1m : asset.payout5m;
  const profitAmount = +(amount * (payoutPercent / 100)).toFixed(2);
  const totalReturn = +(amount + profitAmount).toFixed(2);

  const handleIncreaseAmount = () => setAmount((prev) => prev + 5);
  const handleDecreaseAmount = () => setAmount((prev) => Math.max(1, prev - 5));

  // Step duration by seconds: if < 60s step by 5s; if >= 60s step by 15s
  const handleIncreaseTime = () => {
    setDurationSeconds((prev) => {
      if (prev < 60) return Math.min(60, prev + 5);
      return Math.min(3600, prev + 15);
    });
  };

  const handleDecreaseTime = () => {
    setDurationSeconds((prev) => {
      if (prev <= 5) return 5;
      if (prev <= 60) return Math.max(5, prev - 5);
      return Math.max(5, prev - 15);
    });
  };

  const formatTimeDisplay = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-[240px] bg-[#181c27] border-l border-[#232938] flex flex-col justify-between p-2.5 select-none z-20 shrink-0 relative">
      <div className="space-y-2.5">
        {/* Top Asset & Payout Header + Pending Trade row (Matching Screenshot) */}
        <div>
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-1.5 truncate">
              {/* Asset Flag / Coin Roundel */}
              <AssetIcon symbol={asset.symbol} category={asset.category} size={20} />
              <span className="font-bold text-white text-xs truncate tracking-tight">
                {asset.name}
              </span>
            </div>
            <span className="text-xs font-extrabold text-white ml-1 shrink-0">
              {payoutPercent}%
            </span>
          </div>

          {/* Pending Trade Toggle Switch (Matching Screenshot) */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setIsPendingTradeOpen(!isPendingTradeOpen)}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Timer className="w-3 h-3 text-blue-400" />
              <span className="tracking-wider">PENDING TRADE</span>
            </button>

            {/* Toggle Switch */}
            <button
              onClick={() => setIsPendingTradeOpen(!isPendingTradeOpen)}
              className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                isPendingTradeOpen ? 'bg-[#0070f3]' : 'bg-[#293245]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  isPendingTradeOpen ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Time Box (Matching Screenshot style) */}
        <div className="relative">
          <div className="text-[11px] text-slate-400 font-medium mb-1">
            Time
          </div>

          <div className="bg-[#121620] border border-[#232938] hover:border-[#2f3b52] rounded-xl flex items-center justify-between px-2 py-1 transition-colors">
            <button
              onClick={handleDecreaseTime}
              title="Decrease time"
              className="w-6.5 h-6.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2638] flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <div
              onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
              className="text-sm font-extrabold text-white font-mono tracking-wider cursor-pointer"
            >
              {formatTimeDisplay(durationSeconds)}
            </div>

            <button
              onClick={handleIncreaseTime}
              title="Increase time"
              className="w-6.5 h-6.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2638] flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Switch Time Text Link (Matching Screenshot) */}
          <button
            type="button"
            onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
            className="w-full text-center text-[9px] text-[#0070f3] hover:text-[#38bdf8] font-black tracking-wider uppercase mt-1 cursor-pointer transition-colors"
          >
            SWITCH TIME
          </button>

          {/* Dropdown Popover for Time Switcher */}
          {isTimePickerOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 p-2 bg-[#161b26] border border-[#2d3748] rounded-xl shadow-2xl z-50">
              <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Select Duration</span>
                <button
                  type="button"
                  onClick={() => setIsTimePickerOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: '5 sec', sec: 5 },
                  { label: '10 sec', sec: 10 },
                  { label: '15 sec', sec: 15 },
                  { label: '30 sec', sec: 30 },
                  { label: '1 min', sec: 60 },
                  { label: '2 min', sec: 120 },
                  { label: '3 min', sec: 180 },
                  { label: '5 min', sec: 300 },
                  { label: '15 min', sec: 900 },
                ].map((item) => (
                  <button
                    key={item.sec}
                    type="button"
                    onClick={() => {
                      setDurationSeconds(item.sec);
                      setIsTimePickerOpen(false);
                    }}
                    className={`py-1 px-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      durationSeconds === item.sec
                        ? 'bg-[#0070f3] text-white'
                        : 'bg-[#1e2536] text-slate-300 hover:bg-[#283248] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Investment Box (Styled identically to Screenshot: "19 $") */}
        <div className="relative">
          <div className="text-[11px] text-slate-400 font-medium mb-1">
            Investment
          </div>

          <div className="bg-[#121620] border border-[#232938] hover:border-[#2f3b52] rounded-xl flex items-center justify-between px-2 py-1 transition-colors">
            <button
              onClick={handleDecreaseAmount}
              title="Decrease investment"
              className="w-6.5 h-6.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2638] flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <div
              onClick={() => setIsAmountPickerOpen(!isAmountPickerOpen)}
              className="text-sm font-extrabold text-white font-mono tracking-wide cursor-pointer"
            >
              {amount} $
            </div>

            <button
              onClick={handleIncreaseAmount}
              title="Increase investment"
              className="w-6.5 h-6.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2638] flex items-center justify-center font-bold text-sm transition-colors active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Switch Link (Matching Screenshot) */}
          <button
            type="button"
            onClick={() => setIsAmountPickerOpen(!isAmountPickerOpen)}
            className="w-full text-center text-[9px] text-[#0070f3] hover:text-[#38bdf8] font-black tracking-wider uppercase mt-1 cursor-pointer transition-colors"
          >
            SWITCH
          </button>

          {/* Amount Quick Picker Popover */}
          {isAmountPickerOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 p-2 bg-[#161b26] border border-[#2d3748] rounded-xl shadow-2xl z-50">
              <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Select Amount</span>
                <button
                  type="button"
                  onClick={() => setIsAmountPickerOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 5, 10, 19, 50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setIsAmountPickerOpen(false);
                    }}
                    className={`py-1 px-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      amount === preset
                        ? 'bg-[#0070f3] text-white'
                        : 'bg-[#1e2536] text-slate-300 hover:bg-[#283248] hover:text-white'
                    }`}
                  >
                    {preset} $
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payout with dotted leader line (Matching Screenshot: "Payout .................... 34.39 $") */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <span className="text-slate-400 font-medium">Payout</span>
          <div className="flex-1 border-b border-dotted border-slate-600/70 mx-2 mb-1" />
          <span className="font-extrabold text-white font-mono tracking-tight">
            {totalReturn.toFixed(2)} $
          </span>
        </div>

        {/* Action Buttons: Buy and Sell with right circular arrow icon (Matching Screenshot) */}
        <div className="space-y-1.5 pt-1">
          {/* BUY Button (Green) */}
          <button
            onClick={() => {
              onPlaceTrade('call', amount, durationSeconds);
              setActiveTab('active');
            }}
            disabled={userBalance < amount}
            className="w-full h-10 px-3.5 rounded-xl bg-[#00b074] hover:bg-[#009b66] text-white flex items-center justify-between shadow-md shadow-[#00b074]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="text-sm font-extrabold tracking-wide">Buy</span>
            <div className="w-5.5 h-5.5 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>

          {/* SELL Button (Red) */}
          <button
            onClick={() => {
              onPlaceTrade('put', amount, durationSeconds);
              setActiveTab('active');
            }}
            disabled={userBalance < amount}
            className="w-full h-10 px-3.5 rounded-xl bg-[#ff4757] hover:bg-[#e03d4c] text-white flex items-center justify-between shadow-md shadow-[#ff4757]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="text-sm font-extrabold tracking-wide">Sell</span>
            <div className="w-5.5 h-5.5 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Trades Section (Matching Image 2) */}
      <div className="border-t border-[#232938] pt-2.5 mt-3 flex-1 flex flex-col min-h-[150px]">
        {/* Trades Tabs: "Trades 0" and Clock icon tab */}
        <div className="flex items-center gap-3 border-b border-[#232938] pb-1.5 mb-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'active' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Trades</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTrades.length > 0
                  ? 'bg-[#0070f3] text-white shadow-xs animate-pulse'
                  : 'text-slate-400'
              }`}
            >
              {activeTrades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            title="Trade History"
            className={`text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'history' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="text-slate-400 text-xs font-extrabold">
              {tradeHistory.length}
            </span>
          </button>
        </div>

        {/* Trades Content: Dynamic live trades and history (Fixed!) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 text-xs">
          {activeTab === 'active' ? (
            activeTrades.length === 0 ? (
              /* Quotex Empty State when no active trades */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-2">
                <div className="w-10 h-10 rounded-xl bg-[#161d2a] border border-[#222c3e] flex items-center justify-center text-slate-400 mb-2">
                  <Package className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[190px]">
                  You don't have open trades yet. Click <span className="text-[#00b074] font-bold">Buy</span> or <span className="text-[#ff4757] font-bold">Sell</span> to place a trade.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 py-1 border-b border-[#232c3f] mb-1.5 uppercase tracking-wider">
                  <span>ACTIVE TRADES</span>
                  <span className="w-4 h-4 rounded-full bg-[#0070f3] text-white flex items-center justify-center text-[9px] font-black">
                    {activeTrades.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {activeTrades.map((trade) => {
                    const isCall = trade.direction === 'call';
                    const totalDur = trade.durationSeconds || 60;
                    const progressPct = Math.max(0, Math.min(100, (trade.remainingSeconds / totalDur) * 100));

                    return (
                      <div
                        key={trade.id}
                        className="p-2.5 rounded-xl bg-[#131722] hover:bg-[#181d2a] border border-[#232c3f] space-y-1.5 relative overflow-hidden transition-colors"
                      >
                        {/* Live countdown progress bar */}
                        <div
                          className="absolute bottom-0 left-0 h-0.5 bg-amber-400 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />

                        {/* Line 1: Chevron, Asset Icon, Asset Name, Countdown */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <AssetIcon symbol={trade.assetSymbol || trade.assetName} size={18} />
                            <span className="font-bold text-white text-xs truncate">
                              {trade.assetName}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '3s' }} />
                            {trade.remainingSeconds}s
                          </span>
                        </div>

                        {/* Line 2: Direction, Amount, Potential Return */}
                        <div className="flex items-center justify-between pl-5 text-[11px] font-bold font-mono">
                          <span className={isCall ? 'text-[#00b074]' : 'text-[#ff4757]'}>
                            {isCall ? '▲ Buy' : '▼ Sell'} {trade.amount} $
                          </span>
                          <span className="text-[#00b074]">
                            +{(trade.amount + trade.potentialProfit).toFixed(2)} $
                          </span>
                        </div>

                        {/* Line 3: Entry Price & Early Cashout button */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#1e2536] pl-5 text-[10px] text-slate-400">
                          <span className="font-mono">Entry: {trade.entryPrice.toFixed(4)}</span>
                          <button
                            onClick={() => onSellEarly(trade.id)}
                            className="text-[9px] bg-[#1f2638] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 px-2 py-0.5 rounded transition-colors font-bold cursor-pointer"
                          >
                            Sell early
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : tradeHistory.length === 0 ? (
            /* Empty History State */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-2">
              <div className="w-10 h-10 rounded-xl bg-[#161d2a] border border-[#222c3e] flex items-center justify-center text-slate-400 mb-2">
                <Clock className="w-5 h-5 stroke-[1.5]" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[190px]">
                No trade history yet. Completed trades will appear here.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 py-1 border-b border-[#232c3f] mb-1.5 uppercase tracking-wider">
                <span>TRADE HISTORY</span>
                <span className="w-4 h-4 rounded-full bg-[#202738] text-slate-300 flex items-center justify-center text-[9px] font-black">
                  {tradeHistory.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {tradeHistory.map((trade) => {
                  const isWon = trade.status === 'won';
                  const isCall = trade.direction === 'call';
                  return (
                    <div
                      key={trade.id}
                      className="p-2 rounded-xl bg-[#131722] border border-[#232c3f] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                          <AssetIcon symbol={trade.assetSymbol || trade.assetName} size={16} />
                          <span className="font-bold text-slate-200 text-xs truncate">
                            {trade.assetName}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                            isWon ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {trade.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pl-4 text-[11px] font-bold font-mono">
                        <span className={isCall ? 'text-[#00b074]' : 'text-[#ff4757]'}>
                          {isCall ? '▲' : '▼'} {trade.amount} $
                        </span>
                        <span className={isWon ? 'text-[#00b074]' : 'text-[#ff4757]'}>
                          {isWon ? `+${(trade.amount + (trade.finalProfit || 0)).toFixed(2)} $` : `-${trade.amount} $`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
