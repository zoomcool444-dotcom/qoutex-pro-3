import React, { useState } from 'react';
import {
  CandlestickChart,
  Headphones,
  MoreHorizontal,
  PenTool,
  Sliders,
  Settings,
  User,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Wallet,
  ArrowDownToLine,
  History,
  TrendingUp,
  Info,
  LogOut,
  Trophy,
  MessageSquare,
  HelpCircle,
  PanelRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'trade' | 'drawings' | 'indicators' | 'settings' | 'account' | 'support';
  onSelectTab: (tab: 'trade' | 'drawings' | 'indicators' | 'settings' | 'account' | 'support') => void;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  indicatorCount: number;
  drawingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenDeposit,
  onOpenWithdrawal,
  soundEnabled,
  onToggleSound,
  indicatorCount,
  drawingCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <aside className="w-16 bg-[#141923] border-r border-[#232c3d] flex flex-col justify-between py-2.5 items-center select-none z-30 shrink-0 relative">
      {/* Primary Navigation */}
      <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
        {/* Trade Tab (Default Blue active square) */}
        <button
          onClick={() => onSelectTab('trade')}
          title="Trade"
          className={`w-12 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeTab === 'trade'
              ? 'bg-[#0070f3] text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-[#1d2536]'
          }`}
        >
          <CandlestickChart className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Trade</span>
        </button>

        {/* Support */}
        <button
          onClick={() => onSelectTab('support')}
          title="Support"
          className={`w-12 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeTab === 'support'
              ? 'bg-[#0070f3] text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-[#1d2536]'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">Support</span>
        </button>

        {/* Account Profile Tab */}
        <button
          onClick={() => onSelectTab('account')}
          title="My Account"
          className={`w-12 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeTab === 'account'
              ? 'bg-[#0070f3] text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-[#1d2536]'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">Account</span>
        </button>

        {/* Tournaments Tab (With Badge 3 as in Screenshot) */}
        <button
          onClick={() => {}}
          title="Tournaments"
          className="w-12 h-11 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-white hover:bg-[#1d2536] transition-all cursor-pointer relative"
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[7px] font-black uppercase tracking-tight mt-0.5 leading-none">Tournaments</span>
          <span className="absolute top-1 right-1 bg-[#0070f3] text-[8px] text-white font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
            3
          </span>
        </button>

        {/* More (...) with flyout menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More Options"
            className={`w-12 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              showMoreMenu
                ? 'bg-[#1d2536] text-white'
                : 'text-slate-400 hover:text-white hover:bg-[#1d2536]'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">More</span>
          </button>

          {showMoreMenu && (
            <div className="absolute left-14 top-0 w-48 bg-[#181c27] border border-[#2a3245] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-300">
              <button
                onClick={() => {
                  onOpenDeposit();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#202738] hover:text-white transition-colors cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Deposit</span>
              </button>
              <button
                onClick={() => {
                  onOpenWithdrawal();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#202738] hover:text-white transition-colors cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4 text-cyan-400" />
                <span>Withdrawal</span>
              </button>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#202738] hover:text-white transition-colors cursor-pointer"
              >
                <History className="w-4 h-4 text-slate-400" />
                <span>Transactions</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('drawings');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#202738] hover:text-white transition-colors cursor-pointer"
              >
                <PenTool className="w-4 h-4 text-blue-400" />
                <span>Drawing tools</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('indicators');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#202738] hover:text-white transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Indicators</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('settings');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#202738] hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Platform settings</span>
              </button>
              <div className="border-t border-[#232938] my-1" />
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#202738] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Utilities Area (Matching Red Circles 4, 5, 6) */}
      <div className="flex flex-col items-center gap-2 w-full px-1.5">
        {/* Red Circle 4: 2x2 Grid of 4 Control Icons (Fullscreen, Panel, Settings, Sound) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#10141e] border border-[#222a3d] rounded-xl w-12">
          {/* 1. Fullscreen expand/collapse */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1c2436] rounded transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>

          {/* 2. Panel toggle */}
          <button
            onClick={() => onSelectTab('drawings')}
            title="Drawings / Layout"
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1c2436] rounded transition-colors cursor-pointer"
          >
            <PanelRight className="w-3 h-3" />
          </button>

          {/* 3. Settings gear cog */}
          <button
            onClick={() => onSelectTab('settings')}
            title="Settings"
            className={`w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#0070f3] text-white'
                : 'text-slate-400 hover:text-white hover:bg-[#1c2436]'
            }`}
          >
            <Settings className="w-3 h-3" />
          </button>

          {/* 4. Sound toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute' : 'Unmute'}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1c2436] rounded transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <VolumeX className="w-3 h-3 text-slate-500" />
            )}
          </button>
        </div>

        {/* Red Circle 5: JOIN US Button with chat icon (Matching Screenshot) */}
        <button
          onClick={() => {}}
          title="Join Us"
          className="w-12 h-11 rounded-xl bg-[#131924] hover:bg-[#1a2232] border border-[#232c3f] flex flex-col items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer group shadow-xs"
        >
          <MessageSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-200 mt-0.5 leading-none font-mono">
            JOIN US
          </span>
        </button>

        {/* Red Circle 6: Help Button (Vibrant Green with Question Mark, Matching Screenshot) */}
        <button
          onClick={() => onSelectTab('support')}
          title="Help & Support"
          className="w-12 h-11 rounded-xl bg-[#00b074] hover:bg-[#009e68] text-white flex flex-col items-center justify-center shadow-md shadow-[#00b074]/30 transition-all active:scale-95 cursor-pointer"
        >
          <HelpCircle className="w-4.5 h-4.5 stroke-[2.4]" />
          <span className="text-[9px] font-extrabold mt-0.5 leading-none tracking-tight">Help</span>
        </button>
      </div>
    </aside>
  );
};
