import React, { useState } from 'react';
import {
  X,
  User,
  AlertCircle,
  Share2,
  Plus,
  ArrowDownToLine,
  Mail,
  Shield,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { AccountState } from '../types';
import { QuotexAppIcon } from './QuotexLogo';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountState;
  tradeCount: number;
  winCount: number;
  onOpenDeposit?: () => void;
  onOpenWithdrawal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  account,
  tradeCount,
  winCount,
  onOpenDeposit,
  onOpenWithdrawal,
}) => {
  const [activeTab, setActiveTab] = useState<string>('My account');
  const [nickname, setNickname] = useState<string>('#94157548');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [country, setCountry] = useState<string>('Pakistan');
  const [address, setAddress] = useState<string>('');
  const [twoFactor, setTwoFactor] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in select-none overflow-y-auto">
      <div className="bg-[#121620] border border-[#232938] rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Navigation Tabs Header */}
        <div className="bg-[#181c27] border-b border-[#232938] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Logo & Navigation Tabs */}
          <div className="flex items-center gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 mr-2">
              <QuotexAppIcon size={26} />
              <span className="font-extrabold text-white text-sm tracking-wider">QUOTEX</span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              {[
                'Withdrawal',
                'Payments',
                'Trades',
                'My account',
                'Market',
                'Tournaments',
                'Analytics',
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'Withdrawal' && onOpenWithdrawal) onOpenWithdrawal();
                  }}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    activeTab === tab
                      ? 'bg-[#202738] text-white'
                      : 'text-slate-400 hover:text-white hover:bg-[#1a202d]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Right Header Stats & Close */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1 text-white font-medium">
                <span>$ USD</span>
                <button className="text-slate-400 hover:text-white">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="border-l border-[#232938] pl-3">
                <span className="text-[10px] block text-slate-500">Available for withdrawal</span>
                <span className="text-white font-bold tabular-nums">0.00 $</span>
              </div>

              <div className="border-l border-[#232938] pl-3">
                <span className="text-[10px] block text-slate-500">In the account</span>
                <span className="text-white font-bold tabular-nums">
                  {account.type === 'demo'
                    ? `${account.demoBalance.toFixed(2)} $`
                    : `${account.liveBalance.toFixed(2)} $`}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenDeposit}
              className="bg-[#00b074] hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#202636] transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f131c]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Personal Data Form */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-sm font-bold text-white tracking-wide">Personal data:</h3>

              {/* User Avatar & Status Card */}
              <div className="flex items-center gap-4 bg-[#141824] border border-[#232938] p-4 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-[#1e2538] border border-[#2f3952] flex items-center justify-center text-slate-300">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{account.userEmail}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {account.accountId.replace('#', '') || '94157548'}
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold">
                    <span>✕</span>
                    <span>Not verified</span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSave} className="space-y-4">
                {/* Nickname */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-[#141824] border border-[#232938] rounded-lg px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Empty"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#141824] border border-[#232938] rounded-lg px-3 py-2 text-white text-xs font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Empty"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#141824] border border-[#232938] rounded-lg px-3 py-2 text-white text-xs font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Date of birth
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#141824] border border-[#232938] rounded-lg px-3 py-2 text-white text-xs font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Email (with Unverified and Resend) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-red-400 font-bold">Unverified</span>
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 font-bold underline uppercase"
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                  <input
                    type="email"
                    value={account.userEmail}
                    disabled
                    className="w-full bg-[#141824] border border-[#232938] rounded-lg px-3 py-2 text-slate-300 text-xs font-medium opacity-90 cursor-not-allowed"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#141824] border border-[#232938] rounded-lg px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="India">India</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Empty"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#141824] border border-[#232938] rounded-lg px-3 py-2 text-white text-xs font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="bg-[#0070f3] hover:bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  {savedSuccess && (
                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Changes saved successfully!
                    </span>
                  )}
                </div>
              </form>

              {/* Security Section */}
              <div className="border-t border-[#232938] pt-5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Security:</h4>
                <div className="flex items-center justify-between bg-[#141824] border border-[#232938] p-3.5 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-white">Two-step verification</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Receiving codes via Email
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Documents Verification Box */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-sm font-bold text-white tracking-wide">Documents verification:</h3>

              {/* Red Warning Card from Video */}
              <div className="bg-[#2a171b] border border-red-500/40 rounded-xl p-4 text-xs text-red-200 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="leading-relaxed">
                  <span className="font-bold block text-white mb-0.5">Verification Required</span>
                  You need fill Identity Information before verification your account.
                </div>
              </div>

              {/* Verification Steps Card */}
              <div className="bg-[#141824] border border-[#232938] rounded-xl p-5 space-y-4 text-xs">
                <div className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#232938] pb-2">
                  Accepted Documents
                </div>

                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>International Passport</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>National Identity Card (CNIC / Smart Card)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>Driver's License (Front & Back)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled
                    className="w-full bg-[#1e2538] text-slate-500 font-bold py-2.5 rounded-lg text-xs cursor-not-allowed border border-[#2b354e]"
                  >
                    Upload Document (Disabled until profile saved)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
