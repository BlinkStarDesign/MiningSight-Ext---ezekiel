import React from 'react';
import { ToolMode } from '../../types/c4d';

interface LeftToolPaletteProps {
  activeMode: ToolMode;
  onSelectMode: (mode: ToolMode) => void;
  isSnapping: boolean;
  onToggleSnapping: () => void;
}

export const LeftToolPalette: React.FC<LeftToolPaletteProps> = ({
  activeMode,
  onSelectMode,
  isSnapping,
  onToggleSnapping,
}) => {
  return (
    <div className="w-[36px] bg-[#323232] border-r border-[#222] flex flex-col items-center py-1 space-y-1 select-none flex-shrink-0 z-20">
      {/* 1. Model / Object Mode */}
      <button
        onClick={() => onSelectMode('model')}
        title="Model Mode"
        className={`w-7 h-7 flex items-center justify-center rounded-[2px] border ${
          activeMode === 'model'
            ? 'bg-[#e88724] text-black border-[#a8580b]'
            : 'bg-[#3a3a3a] text-[#ddd] border-t-[#505050] border-b-[#202020] hover:bg-[#454545]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      </button>

      {/* 2. Polygon Mode (Orange highlighted face) */}
      <button
        onClick={() => onSelectMode('polygon')}
        title="Polygon Mode"
        className={`w-7 h-7 flex items-center justify-center rounded-[2px] border ${
          activeMode === 'polygon'
            ? 'bg-[#e88724] text-black border-[#a8580b]'
            : 'bg-[#3a3a3a] text-[#ddd] border-t-[#505050] border-b-[#202020] hover:bg-[#454545]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" stroke="#ddd" />
          <polygon points="12 6 18 10 18 14 12 18 6 14 6 10" fill="#e88724" stroke="none" />
        </svg>
      </button>

      {/* 3. Edge Mode */}
      <button
        onClick={() => onSelectMode('edge')}
        title="Edge Mode"
        className={`w-7 h-7 flex items-center justify-center rounded-[2px] border ${
          activeMode === 'edge'
            ? 'bg-[#e88724] text-black border-[#a8580b]'
            : 'bg-[#3a3a3a] text-[#ddd] border-t-[#505050] border-b-[#202020] hover:bg-[#454545]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="1" stroke="#888"></rect>
          <line x1="4" y1="4" x2="20" y2="4" stroke="#e88724" strokeWidth="3"></line>
        </svg>
      </button>

      {/* 4. Point Mode */}
      <button
        onClick={() => onSelectMode('point')}
        title="Point Mode"
        className={`w-7 h-7 flex items-center justify-center rounded-[2px] border ${
          activeMode === 'point'
            ? 'bg-[#e88724] text-black border-[#a8580b]'
            : 'bg-[#3a3a3a] text-[#ddd] border-t-[#505050] border-b-[#202020] hover:bg-[#454545]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="5" width="14" height="14" rx="1" stroke="#888"></rect>
          <circle cx="5" cy="5" r="2.5" fill="#e88724"></circle>
          <circle cx="19" cy="5" r="2.5" fill="#e88724"></circle>
          <circle cx="5" cy="19" r="2.5" fill="#e88724"></circle>
          <circle cx="19" cy="19" r="2.5" fill="#e88724"></circle>
        </svg>
      </button>

      <div className="w-5 h-[1px] bg-[#222] my-1" />

      {/* 5. Texture Mode */}
      <button
        onClick={() => onSelectMode('texture')}
        title="Texture Axis Mode"
        className={`w-7 h-7 flex items-center justify-center rounded-[2px] border ${
          activeMode === 'texture'
            ? 'bg-[#e88724] text-black border-[#a8580b]'
            : 'bg-[#3a3a3a] text-[#ddd] border-t-[#505050] border-b-[#202020] hover:bg-[#454545]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="8" height="8" fill="#e88724"></rect>
          <rect x="13" y="3" width="8" height="8" stroke="#888"></rect>
          <rect x="3" y="13" width="8" height="8" stroke="#888"></rect>
          <rect x="13" y="13" width="8" height="8" fill="#e88724"></rect>
        </svg>
      </button>

      {/* 6. Object Axis Mode (L-shaped coordinate tripod) */}
      <button
        onClick={() => onSelectMode('axis')}
        title="Enable Axis Modification (L)"
        className={`w-7 h-7 flex items-center justify-center rounded-[2px] border ${
          activeMode === 'axis'
            ? 'bg-[#e88724] text-black border-[#a8580b]'
            : 'bg-[#3a3a3a] text-[#ddd] border-t-[#505050] border-b-[#202020] hover:bg-[#454545]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="5" y1="19" x2="19" y2="19" stroke="#e88724"></line>
          <line x1="5" y1="19" x2="5" y2="5" stroke="#e88724"></line>
          <polyline points="3 8 5 5 7 8" stroke="#e88724"></polyline>
          <polyline points="16 17 19 19 16 21" stroke="#e88724"></polyline>
        </svg>
      </button>

      <div className="w-5 h-[1px] bg-[#222] my-1" />

      {/* 7. Snapping Toggle (Magnet with S) */}
      <button
        onClick={onToggleSnapping}
        title="Toggle Snapping (P)"
        className={`w-7 h-7 flex items-center justify-center rounded-[2px] border ${
          isSnapping
            ? 'bg-[#e88724] text-black border-[#a8580b]'
            : 'bg-[#3a3a3a] text-[#ddd] border-t-[#505050] border-b-[#202020] hover:bg-[#454545]'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 3v7a6 6 0 0 0 12 0V3"></path>
            <line x1="4" y1="3" x2="8" y2="3"></line>
            <line x1="16" y1="3" x2="20" y2="3"></line>
          </svg>
          <span className="absolute -bottom-1 -right-1 text-[9px] font-black text-[#e88724]">S</span>
        </div>
      </button>

      {/* 8. Solo / Guide / Lock Mode */}
      <button
        title="Solo Mode / Isolate"
        className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#454545] text-[#e88724] border border-t-[#505050] border-b-[#202020] rounded-[2px]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3" fill="#e88724"></circle>
        </svg>
      </button>
    </div>
  );
};
