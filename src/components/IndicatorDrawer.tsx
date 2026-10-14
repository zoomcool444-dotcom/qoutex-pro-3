import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Check, Sliders, ChevronLeft } from 'lucide-react';
import { IndicatorConfig, IndicatorType } from '../types';

interface IndicatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeIndicators: IndicatorConfig[];
  onAddIndicator: (type: IndicatorType) => void;
  onUpdateIndicator: (indicator: IndicatorConfig) => void;
  onRemoveIndicator: (id: string) => void;
  onClearAllIndicators: () => void;
}

const COLOR_PALETTE = [
  '#00b074', // Green
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#0070f3', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#94a3b8', // Slate
  '#ffffff', // White
];

export const IndicatorDrawer: React.FC<IndicatorDrawerProps> = ({
  isOpen,
  onClose,
  activeIndicators,
  onAddIndicator,
  onUpdateIndicator,
  onRemoveIndicator,
  onClearAllIndicators,
}) => {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);

  const selectedIndicator = activeIndicators.find((i) => i.id === selectedIndicatorId);

  const trendIndicators: IndicatorType[] = [
    'Alligator',
    'Bollinger Bands',
    'Envelopes',
    'Fractal',
    'Ichimoku Cloud',
    'Keltner channel',
    'Donchian channel',
    'Supertrend',
    'Moving Average',
    'Parabolic SAR',
    'Zig Zag',
  ];

  const oscillators: IndicatorType[] = [
    'RSI',
    'MACD',
    'Schaff Trend Cycle',
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute left-16 top-14 bottom-0 w-80 bg-[#181c27] border-r border-[#232938] z-30 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-[#232938] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedIndicator ? (
            <button
              onClick={() => setSelectedIndicatorId(null)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#202738] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <Sliders className="w-4 h-4 text-slate-300" />
          )}
          <span className="font-bold text-sm text-white">
            {selectedIndicator ? selectedIndicator.type : 'Indicators'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#202738] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Either Settings of Selected Indicator or List of Indicators */}
      {selectedIndicator ? (
        /* Configuration Editor */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Period Control */}
          {selectedIndicator.period !== undefined && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Period
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateIndicator({
                      ...selectedIndicator,
                      period: Math.max(2, (selectedIndicator.period || 14) - 1),
                    })
                  }
                  className="w-8 h-8 rounded-lg bg-[#202738] hover:bg-[#293247] text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={selectedIndicator.period}
                  onChange={(e) =>
                    onUpdateIndicator({
                      ...selectedIndicator,
                      period: parseInt(e.target.value) || 14,
                    })
                  }
                  className="flex-1 bg-[#121620] border border-[#273042] text-center text-sm font-bold text-white rounded-lg py-1.5"
                />
                <button
                  onClick={() =>
                    onUpdateIndicator({
                      ...selectedIndicator,
                      period: (selectedIndicator.period || 14) + 1,
                    })
                  }
                  className="w-8 h-8 rounded-lg bg-[#202738] hover:bg-[#293247] text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Deviation Control */}
          {selectedIndicator.deviation !== undefined && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Deviation
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateIndicator({
                      ...selectedIndicator,
                      deviation: Math.max(0.5, +( (selectedIndicator.deviation || 2) - 0.5).toFixed(1)),
                    })
                  }
                  className="w-8 h-8 rounded-lg bg-[#202738] hover:bg-[#293247] text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={selectedIndicator.deviation}
                  onChange={(e) =>
                    onUpdateIndicator({
                      ...selectedIndicator,
                      deviation: parseFloat(e.target.value) || 2,
                    })
                  }
                  className="flex-1 bg-[#121620] border border-[#273042] text-center text-sm font-bold text-white rounded-lg py-1.5"
                />
                <button
                  onClick={() =>
                    onUpdateIndicator({
                      ...selectedIndicator,
                      deviation: +( (selectedIndicator.deviation || 2) + 0.5).toFixed(1),
                    })
                  }
                  className="w-8 h-8 rounded-lg bg-[#202738] hover:bg-[#293247] text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Primary Line Color Palette */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Line Color
              </label>
              <div
                className="w-4 h-4 rounded-full border border-slate-600"
                style={{ backgroundColor: selectedIndicator.color || '#00b074' }}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PALETTE.map((hex) => (
                <button
                  key={hex}
                  onClick={() =>
                    onUpdateIndicator({
                      ...selectedIndicator,
                      color: hex,
                    })
                  }
                  className={`w-7 h-7 rounded-md transition-all flex items-center justify-center ${
                    selectedIndicator.color === hex
                      ? 'ring-2 ring-white scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {selectedIndicator.color === hex && (
                    <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Line Width */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Line Width: {selectedIndicator.lineWidth || 2}px
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={selectedIndicator.lineWidth || 2}
              onChange={(e) =>
                onUpdateIndicator({
                  ...selectedIndicator,
                  lineWidth: parseInt(e.target.value) || 2,
                })
              }
              className="w-full accent-[#0070f3]"
            />
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-[#232938]">
            <button
              onClick={() => {
                onRemoveIndicator(selectedIndicator.id);
                setSelectedIndicatorId(null);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Indicator</span>
            </button>
          </div>
        </div>
      ) : (
        /* Indicator List Menu */
        <div className="flex-1 overflow-y-auto divide-y divide-[#232938]">
          {/* Active indicators badge list */}
          {activeIndicators.length > 0 && (
            <div className="p-3 bg-[#131722]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Active on Chart ({activeIndicators.length})
                </span>
                <button
                  onClick={onClearAllIndicators}
                  className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                >
                  Delete all
                </button>
              </div>
              <div className="space-y-1.5">
                {activeIndicators.map((ind) => (
                  <div
                    key={ind.id}
                    onClick={() => setSelectedIndicatorId(ind.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#1a2130] hover:bg-[#222a3d] cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ind.color || '#0070f3' }}
                      />
                      <span className="font-semibold text-white">
                        {ind.type}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveIndicator(ind.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trend Indicators Group */}
          <div className="p-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Trend Indicators
            </h3>
            <div className="space-y-1">
              {trendIndicators.map((name) => (
                <button
                  key={name}
                  onClick={() => onAddIndicator(name)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#202738] text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>{name}</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Oscillators Group */}
          <div className="p-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Oscillators
            </h3>
            <div className="space-y-1">
              {oscillators.map((name) => (
                <button
                  key={name}
                  onClick={() => onAddIndicator(name)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#202738] text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>{name}</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
