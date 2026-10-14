import React from 'react';
import {
  X,
  Globe,
  Clock,
  Sun,
  Sunset,
  Moon,
  Plus,
  Minus,
  Check,
  Upload,
} from 'lucide-react';
import { PlatformSettingsState } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlatformSettingsState;
  onUpdateSettings: (newSettings: Partial<PlatformSettingsState>) => void;
}

const UP_TREND_COLORS = [
  '#00b074', // Classic Quotex green
  '#10b981', // Emerald
  '#00d2d3', // Cyan
  '#0070f3', // Electric blue
  '#ffffff', // White
];

const DOWN_TREND_COLORS = [
  '#ff4a4a', // Classic Quotex red
  '#ef4444', // Crimson
  '#ff793f', // Orange
  '#8b5cf6', // Violet
  '#334155', // Slate dark
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-16 w-80 bg-[#181c27] border-r border-[#232938] z-40 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 select-none">
      {/* Header */}
      <div className="h-14 border-b border-[#232938] px-4 flex items-center justify-between shrink-0">
        <h2 className="text-base font-bold text-white tracking-wide">Settings</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#202636] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-slate-300">
        {/* Language */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Language
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ language: e.target.value })}
              className="w-full bg-[#121620] border border-[#2a3245] rounded-lg pl-9 pr-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Español">Español</option>
              <option value="Русский">Русский</option>
              <option value="Português">Português</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Urdu">اردو (Urdu)</option>
            </select>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Timezone
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <select
              value={settings.timezone}
              onChange={(e) => onUpdateSettings({ timezone: e.target.value })}
              className="w-full bg-[#121620] border border-[#2a3245] rounded-lg pl-9 pr-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="(UTC-07:00)">(UTC-07:00)</option>
              <option value="(UTC-05:00)">(UTC-05:00) New York</option>
              <option value="(UTC+00:00)">(UTC+00:00) London</option>
              <option value="(UTC+02:00)">(UTC+02:00) Berlin</option>
              <option value="(UTC+05:00)">(UTC+05:00) Pakistan</option>
              <option value="(UTC+05:30)">(UTC+05:30) India</option>
              <option value="(UTC+08:00)">(UTC+08:00) Singapore</option>
            </select>
          </div>
        </div>

        {/* Template Theme */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Template
          </label>
          <div className="space-y-2">
            {/* Light Mode */}
            <div
              onClick={() => onUpdateSettings({ template: 'Light Mode' })}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                settings.template === 'Light Mode'
                  ? 'bg-[#202738] border-blue-500 text-white'
                  : 'bg-[#121620] border-[#252c3d] text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-xs">Light Mode</span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  settings.template === 'Light Mode'
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-600'
                }`}
              >
                {settings.template === 'Light Mode' && <Check className="w-2.5 h-2.5" />}
              </div>
            </div>

            {/* Twilight */}
            <div
              onClick={() => onUpdateSettings({ template: 'Twilight' })}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                settings.template === 'Twilight'
                  ? 'bg-[#202738] border-blue-500 text-white'
                  : 'bg-[#121620] border-[#252c3d] text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sunset className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-xs">Twilight</span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  settings.template === 'Twilight'
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-600'
                }`}
              >
                {settings.template === 'Twilight' && <Check className="w-2.5 h-2.5" />}
              </div>
            </div>

            {/* Full Night */}
            <div
              onClick={() => onUpdateSettings({ template: 'Full Night' })}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                settings.template === 'Full Night'
                  ? 'bg-[#202738] border-blue-500 text-white'
                  : 'bg-[#121620] border-[#252c3d] text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className="font-medium text-xs">Full Night</span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  settings.template === 'Full Night'
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-600'
                }`}
              >
                {settings.template === 'Full Night' && <Check className="w-2.5 h-2.5" />}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="border-t border-[#232938] pt-4">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Platform
          </label>

          {/* Grids Opacity */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300 font-medium">Grids opacity</span>
            <div className="flex items-center bg-[#121620] border border-[#252c3d] rounded-lg">
              <button
                onClick={() =>
                  onUpdateSettings({ gridOpacity: Math.max(0, settings.gridOpacity - 2) })
                }
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#202636] rounded-l-lg transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 text-center font-bold text-white text-xs tabular-nums">
                {settings.gridOpacity}
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({ gridOpacity: Math.min(40, settings.gridOpacity + 2) })
                }
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#202636] rounded-r-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3.5">
            {/* Auto-scrolling */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Auto-scrolling</div>
                <div className="text-[10px] text-slate-400">Automatic graphic scrolling</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoScrolling}
                onChange={(e) => onUpdateSettings({ autoScrolling: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* 1-click trade */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">1-click trade</div>
                <div className="text-[10px] text-slate-400">Open trades without confirmation</div>
              </div>
              <input
                type="checkbox"
                checked={settings.oneClickTrade}
                onChange={(e) => onUpdateSettings({ oneClickTrade: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Performance Mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Performance Mode</div>
                <div className="text-[10px] text-slate-400">
                  Use optimized rendering for chart and candles
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.performanceMode}
                onChange={(e) => onUpdateSettings({ performanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Short order label */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Short order label</div>
                <div className="text-[10px] text-slate-400">Use short order elapsed mode</div>
              </div>
              <input
                type="checkbox"
                checked={settings.shortOrderLabel}
                onChange={(e) => onUpdateSettings({ shortOrderLabel: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Hide trade results */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Hide trade results</div>
                <div className="text-[10px] text-slate-400">
                  Hide trade result modal after expiration
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.hideTradeResults}
                onChange={(e) => onUpdateSettings({ hideTradeResults: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Skip confirmation for signals trades */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Skip confirmation for signals</div>
                <div className="text-[10px] text-slate-400">
                  Place trade without modal window confirmation
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.skipSignalConfirmation}
                onChange={(e) => onUpdateSettings({ skipSignalConfirmation: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Graph Colors */}
        <div className="border-t border-[#232938] pt-4">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Graph Colors
          </label>

          {/* Up Trend Swatches */}
          <div className="mb-3">
            <span className="block text-[11px] text-slate-300 font-medium mb-1.5">Up Trend</span>
            <div className="flex items-center gap-2">
              {UP_TREND_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdateSettings({ upTrendColor: color })}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-transform ${
                    settings.upTrendColor === color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {settings.upTrendColor === color && (
                    <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Down Trend Swatches */}
          <div>
            <span className="block text-[11px] text-slate-300 font-medium mb-1.5">Down Trend</span>
            <div className="flex items-center gap-2">
              {DOWN_TREND_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdateSettings({ downTrendColor: color })}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-transform ${
                    settings.downTrendColor === color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {settings.downTrendColor === color && (
                    <Check className="w-3.5 h-3.5 text-white font-bold" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="border-t border-[#232938] pt-4 pb-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Background
          </label>
          <label className="border border-dashed border-[#2a3245] hover:border-blue-500 rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer bg-[#121620] transition-colors text-slate-400 hover:text-white">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium">Choose file (max size - 2 MB)</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
