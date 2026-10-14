import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownToLine,
  ChevronDown,
  RotateCcw,
  Gift,
  User,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Menu,
} from 'lucide-react';
import { AccountState } from '../types';

import { QuotexEmblem } from './QuotexLogo';

interface HeaderProps {
  account: AccountState;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  onProfileClick: () => void;
  onResetDemoBalance: () => void;
  onSwitchAccountType: (type: 'demo' | 'live') => void;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  onDepositClick,
  onWithdrawClick,
  onProfileClick,
  onResetDemoBalance,
  onSwitchAccountType,
}) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const currentBalance =
    account.type === 'demo' ? account.demoBalance : account.liveBalance;

  return (
    <header className="h-14 bg-[#141923] border-b border-[#232c3d] px-4 flex items-center justify-between z-30 select-none">
      {/* Brand logo & tagline (Matching Screenshot Red Circle 1) */}
      <div className="flex items-center gap-3.5">
        {/* Hamburger Menu icon */}
        <button
          title="Menu"
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1e2536] transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          {/* Official Quotex Emblem Shield with 4 bars */}
          <QuotexEmblem size={26} />
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-white text-base leading-none">
              QUOTEX
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider hidden sm:inline-block uppercase leading-none">
              • WEB TRADING PLATFORM
            </span>
          </div>
        </div>
      </div>

      {/* Promotional bonus banner */}
      <div className="hidden lg:flex items-center gap-2.5 bg-[#142323] border border-[#00b074]/30 rounded-lg px-3 py-1.5 cursor-pointer hover:border-[#00b074]/60 transition-colors"
        onClick={onDepositClick}
      >
        <div className="w-6 h-6 rounded-md bg-[#00b074]/20 flex items-center justify-center text-[#00b074]">
          <Gift className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="text-slate-200 font-medium">Get a </span>
          <span className="text-[#00b074] font-bold">50% bonus</span>
          <span className="text-slate-200 font-medium"> on your deposit!</span>
        </div>
        <div className="bg-[#00b074] text-slate-950 font-extrabold text-[11px] px-2 py-0.5 rounded shadow-sm">
          50%
        </div>
      </div>

      {/* Right controls: Account, Deposit, Withdrawal, Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell (Matching Image 2) */}
        <div className="relative p-1.5 text-slate-400 hover:text-white cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 bg-[#f97316] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            5
          </span>
        </div>

        {/* Account balance selector */}
        <div className="relative">
          <div className="flex items-center bg-[#121620] hover:bg-[#1a202e] border border-[#232938] rounded-lg px-2.5 py-1.5 transition-colors">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2.5 text-left"
            >
              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  {account.type === 'demo' ? (
                    <span className="text-amber-400">Demo account</span>
                  ) : (
                    <span className="text-emerald-400">Live account</span>
                  )}
                </div>
                <div className="text-sm font-bold text-white tabular-nums">
                  ${currentBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
            {account.type === 'demo' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResetDemoBalance();
                }}
                title="Reset Demo balance to $10,000"
                className="ml-2 p-1 text-slate-400 hover:text-amber-400 hover:bg-[#222a3d] rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Account Dropdown Menu */}
          {showAccountMenu && (
            <div className="absolute right-0 top-12 w-64 bg-[#181c27] border border-[#2a3245] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 border-b border-[#232938]">
                Select Account
              </div>

              {/* Demo Account Option */}
              <div
                onClick={() => {
                  onSwitchAccountType('demo');
                  setShowAccountMenu(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer mt-1 transition-colors ${
                  account.type === 'demo'
                    ? 'bg-[#22293b] border border-amber-500/30'
                    : 'hover:bg-[#1f2536]'
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                    Demo Account
                    {account.type === 'demo' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums">
                    ${account.demoBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                {/* Reset demo balance button */}
                <button
                  title="Reset Demo balance to $10,000"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetDemoBalance();
                  }}
                  className="p-1.5 hover:bg-[#2b344a] text-slate-400 hover:text-white rounded-md transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Account Option */}
              <div
                onClick={() => {
                  onSwitchAccountType('live');
                  setShowAccountMenu(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer mt-1 transition-colors ${
                  account.type === 'live'
                    ? 'bg-[#22293b] border border-emerald-500/30'
                    : 'hover:bg-[#1f2536]'
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                    Live Account
                    {account.type === 'live' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums">
                    ${account.liveBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deposit Button (Real Quotex Green) */}
        <button
          onClick={onDepositClick}
          className="flex items-center gap-1.5 bg-[#00b074] hover:bg-[#009b66] text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-md shadow-[#00b074]/25 transition-all active:scale-95 cursor-pointer"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-xs font-black leading-none">
            +
          </div>
          <span className="tracking-wide">Deposit</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-90" />
        </button>

        {/* Withdrawal Button (Real Quotex Steel Pill) */}
        <button
          onClick={onWithdrawClick}
          className="flex items-center gap-1.5 bg-[#1f2638] hover:bg-[#283248] text-white border border-[#2b364e] px-3.5 py-2 rounded-lg font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-slate-300" />
          <span className="tracking-wide">Withdrawal</span>
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onProfileClick}
          title="Profile & Settings"
          className="w-9 h-9 rounded-full bg-[#1e2638] border border-[#2a3650] flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition-colors relative"
        >
          <User className="w-4 h-4" />
          {account.isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00b074] border-2 border-[#181c27] flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
