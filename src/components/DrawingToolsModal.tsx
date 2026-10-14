import React from 'react';
import { X, PenTool, Minus, TrendingUp, Grid, Square, MoreVertical, Trash2 } from 'lucide-react';
import { DrawingToolType } from '../types';

interface DrawingToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: DrawingToolType | null) => void;
  activeTool: DrawingToolType | null;
  drawingCount?: number;
  onClearAllDrawings?: () => void;
}

export const DrawingToolsModal: React.FC<DrawingToolsModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  activeTool,
  drawingCount = 0,
  onClearAllDrawings,
}) => {
  if (!isOpen) return null;

  const tools: { id: DrawingToolType; name: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'Horizontal Line', name: 'Horizontal Line', icon: Minus, desc: 'Support & resistance price levels' },
    { id: 'Trend Line', name: 'Trend Line', icon: TrendingUp, desc: 'Diagonal price direction with 2 points' },
    { id: 'Ray', name: 'Ray Line', icon: Minus, desc: 'Infinite directional line into the future' },
    { id: 'Vertical Line', name: 'Vertical Line', icon: MoreVertical, desc: 'Time milestone and cycle marker' },
    { id: 'Rectangle', name: 'Rectangle Zone', icon: Square, desc: 'Support/resistance supply & demand box' },
    { id: 'Fibonacci Retracement', name: 'Fibonacci Retracement', icon: Grid, desc: 'Key ratio pullbacks (61.8%, 50%, 38.2%)' },
  ];

  return (
    <div className="absolute left-16 top-14 w-80 bg-[#181c27] border border-[#232938] p-3.5 z-40 shadow-2xl rounded-2xl select-none animate-in slide-in-from-left duration-200">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#232938]">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <PenTool className="w-4 h-4 text-[#0070f3]" />
          <span>QUOTEX PRO Drawings</span>
          {drawingCount > 0 && (
            <span className="bg-[#0070f3] text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              {drawingCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {drawingCount > 0 && onClearAllDrawings && (
            <button
              onClick={onClearAllDrawings}
              title="Delete all drawings"
              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 text-[11px] font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#202738]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
        {tools.map((t) => {
          const Icon = t.icon;
          const isSelected = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                onSelectTool(isSelected ? null : t.id);
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-colors ${
                isSelected
                  ? 'bg-[#0070f3] text-white shadow-md shadow-blue-500/20'
                  : 'hover:bg-[#202738] text-slate-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-white/20' : 'bg-[#121620] border border-[#232a3a]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#0070f3]'}`} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold leading-tight">{t.name}</div>
                <div className={`text-[10px] leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {t.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
