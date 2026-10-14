import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  Trash2,
  Check,
  TrendingUp,
  Minus,
  Square,
  Grid,
  Calendar,
  Activity,
  Maximize2,
  Circle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { DrawingToolType, DrawingItem } from '../types';

interface DrawingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: DrawingToolType, color: string, lineWidth: number) => void;
  onClearAllDrawings: () => void;
  drawingCount: number;
}

const DRAWING_TOOLS_LIST: { id: DrawingToolType; label: string }[] = [
  { id: 'Date and Price Range', label: 'Date and Price Range' },
  { id: 'Ray', label: 'Ray' },
  { id: 'Disjoint Channel', label: 'Disjoint Channel' },
  { id: 'Arc', label: 'Arc' },
  { id: 'Gann Box', label: 'Gann Box' },
  { id: 'Flat Top/Bottom', label: 'Flat Top/Bottom' },
  { id: 'Curve', label: 'Curve' },
  { id: 'Extended Line', label: 'Extended Line' },
  { id: 'Triangle', label: 'Triangle' },
  { id: 'Cross Line', label: 'Cross Line' },
  { id: 'Vertical Line', label: 'Vertical Line' },
  { id: 'Rectangle', label: 'Rectangle' },
  { id: 'Fibonacci Fan', label: 'Fibonacci Fan' },
  { id: 'Trend Line', label: 'Trend Line' },
  { id: 'Fibonacci Retracement', label: 'Fibonacci Retracement' },
  { id: 'Pitchfan', label: 'Pitchfan' },
  { id: 'Horizontal Line', label: 'Horizontal Line' },
  { id: 'Trend Angle', label: 'Trend Angle' },
  { id: 'Cyclic Lines', label: 'Cyclic Lines' },
  { id: 'Price Range', label: 'Price Range' },
  { id: 'Parallel Channel', label: 'Parallel Channel' },
];

// Exact 12-color grid matching Quotex video swatch palette
const PALETTE_COLORS = [
  '#f1c40f', // Yellow
  '#2ecc71', // Light green
  '#00b074', // Quotex Green
  '#00d2d3', // Cyan
  '#0070f3', // Quotex Electric Blue
  '#3b5998', // Dark Navy Blue
  '#9b59b6', // Violet/Purple
  '#ff4757', // Pink/Crimson
  '#ff4a4a', // Quotex Red
  '#ff793f', // Orange
  '#ffffff', // White
  '#747d8c', // Grey
];

export const DrawingsDrawer: React.FC<DrawingsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onClearAllDrawings,
  drawingCount,
}) => {
  const [activeSubTool, setActiveSubTool] = useState<DrawingToolType | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#0070f3');
  const [selectedWidth, setSelectedWidth] = useState<number>(2);

  if (!isOpen) return null;

  const handleToolClick = (tool: DrawingToolType) => {
    setActiveSubTool(tool);
    // Automatically place drawing with current color & stroke width
    onSelectTool(tool, selectedColor, selectedWidth);
  };

  const handleColorPick = (color: string) => {
    setSelectedColor(color);
    if (activeSubTool) {
      onSelectTool(activeSubTool, color, selectedWidth);
    }
  };

  const handleWidthChange = (w: number) => {
    setSelectedWidth(w);
    if (activeSubTool) {
      onSelectTool(activeSubTool, selectedColor, w);
    }
  };

  return (
    <div className="fixed inset-y-0 left-16 w-80 bg-[#181c27] border-r border-[#232938] z-40 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 select-none">
      {/* Header */}
      <div className="h-14 border-b border-[#232938] px-4 flex items-center justify-between shrink-0">
        {activeSubTool ? (
          <button
            onClick={() => setActiveSubTool(null)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
            <span>Drawings</span>
          </button>
        ) : (
          <h2 className="text-base font-bold text-white tracking-wide">Drawings</h2>
        )}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#202636] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subview for Selected Tool with 12-color swatch grid */}
      {activeSubTool ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="text-sm font-bold text-white border-b border-[#252c3d] pb-2">
            {activeSubTool}
          </div>

          {/* 12-color grid */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorPick(c)}
                  style={{ backgroundColor: c }}
                  className={`h-8 rounded-md flex items-center justify-center transition-all ${
                    selectedColor === c ? 'ring-2 ring-white scale-105' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {selectedColor === c && (
                    <Check
                      className={`w-4 h-4 ${
                        c === '#ffffff' || c === '#f1c40f' ? 'text-slate-950 font-bold' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Line Width */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Line Width
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  onClick={() => handleWidthChange(w)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                    selectedWidth === w
                      ? 'bg-[#0070f3] text-white border-blue-400'
                      : 'bg-[#121620] text-slate-400 border-[#2a3245] hover:text-white hover:bg-[#1a202d]'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#121620] border border-[#252c3d] rounded-lg p-3 text-xs text-slate-400 leading-relaxed">
            <span className="text-white font-medium block mb-1">Interactive on Chart:</span>
            Click anywhere on the chart canvas to reposition or drag endpoints. A floating action bar with color, clone, lock, and delete controls is also available on top of the chart.
          </div>
        </div>
      ) : (
        /* Tool List */
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#202738]/50">
          {DRAWING_TOOLS_LIST.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left text-xs text-slate-300 hover:text-white hover:bg-[#202636] transition-colors group"
            >
              <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                {tool.label}
              </span>
              <span className="text-slate-600 group-hover:text-slate-400 text-sm">›</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer: Delete all button */}
      <div className="p-3 border-t border-[#232938] shrink-0">
        <button
          onClick={onClearAllDrawings}
          disabled={drawingCount === 0}
          className={`w-full py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
            drawingCount > 0
              ? 'bg-[#ff4a4a] hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
              : 'bg-[#222938] text-slate-500 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete all ({drawingCount})</span>
        </button>
      </div>
    </div>
  );
};
