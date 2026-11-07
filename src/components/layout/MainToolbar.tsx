import React, { useState } from 'react';
import { ToolMode } from '../../types/c4d';

interface MainToolbarProps {
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  axisLocks: { x: boolean; y: boolean; z: boolean };
  onToggleAxis: (axis: 'x' | 'y' | 'z') => void;
  isWorldSpace: boolean;
  onToggleCoordinateSpace: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRevert?: () => void;
  onAddPrimitive: (type: string) => void;
  onTriggerRender: () => void;
  onOpenRenderSettings?: () => void;
  onOpenPictureViewer?: () => void;
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  activeTool,
  onSelectTool,
  axisLocks,
  onToggleAxis,
  isWorldSpace,
  onToggleCoordinateSpace,
  onUndo,
  onRedo,
  onRevert,
  onAddPrimitive,
  onTriggerRender,
  onOpenRenderSettings,
  onOpenPictureViewer,
}) => {
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-[40px] bg-[#3a3a3a] border-b border-[#232323] flex items-center px-1.5 space-x-1 select-none overflow-x-auto text-[#dfdfdf] z-20">
      {/* Group A: Undo, Redo & Revert Project */}
      <div className="flex items-center space-x-0.5 bg-[#313131] p-0.5 rounded-[2px] border border-[#222]">
        <button
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] active:bg-[#282828] border border-t-[#525252] border-b-[#1f1f1f] border-x-[#2f2f2f] rounded-[2px] shadow-sm text-[#ccc] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 14L4 9l5-5"></path>
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path>
          </svg>
        </button>
        <button
          onClick={onRedo}
          title="Redo (Ctrl+Y)"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] active:bg-[#282828] border border-t-[#525252] border-b-[#1f1f1f] border-x-[#2f2f2f] rounded-[2px] shadow-sm text-[#ccc] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 14l5-5-5-5"></path>
            <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path>
          </svg>
        </button>
        {onRevert && (
          <button
            onClick={onRevert}
            title="Revert Project to Default Mining Site Baseline"
            className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] active:bg-[#282828] border border-t-[#525252] border-b-[#1f1f1f] border-x-[#2f2f2f] rounded-[2px] shadow-sm text-[#e88724] font-bold cursor-pointer"
          >
            <span className="text-[13px]">↺</span>
          </button>
        )}
      </div>

      <div className="h-5 w-[1px] bg-[#222]" />

      {/* Group B: Selection & Transform Tools with Dropdowns */}
      <div className="flex items-center space-x-0.5 bg-[#313131] p-0.5 rounded-[2px] border border-[#222]">
        {/* Selection Tool with Dropdown */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => onSelectTool('live_selection')}
              title="Live Selection (9)"
              className={`w-7 h-7 flex items-center justify-center rounded-[2px] border shadow-sm ${
                activeTool === 'live_selection'
                  ? 'bg-[#e88724] text-black border-[#b35e0e]'
                  : 'bg-[#3a3a3a] hover:bg-[#484848] text-[#ccc] border-t-[#525252] border-b-[#1f1f1f] border-x-[#2f2f2f]'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="8" strokeDasharray="3 3"></circle>
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
              </svg>
            </button>
            <button
              onClick={(e) => toggleDropdown('selection', e)}
              className="w-2.5 h-7 bg-[#333] hover:bg-[#444] text-[8px] text-[#aaa] flex items-center justify-center rounded-r-[2px] border-y border-r border-[#222]"
            >
              ▼
            </button>
          </div>

          {openDropdown === 'selection' && (
            <div className="absolute top-[32px] left-0 w-44 bg-[#353535] border border-[#222] shadow-2xl py-1 z-50 text-[11px] rounded-[2px]">
              <button
                onClick={() => {
                  onSelectTool('live_selection');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black flex items-center justify-between"
              >
                <span>Live Selection</span>
                <span className="text-[10px] text-[#888]">9</span>
              </button>
              <button
                onClick={() => {
                  onSelectTool('live_selection');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black flex items-center justify-between"
              >
                <span>Rectangle Selection</span>
                <span className="text-[10px] text-[#888]">0</span>
              </button>
              <button
                onClick={() => {
                  onSelectTool('live_selection');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black flex items-center justify-between"
              >
                <span>Lasso Selection</span>
                <span className="text-[10px] text-[#888]">8</span>
              </button>
            </div>
          )}
        </div>

        {/* Move Tool (E) */}
        <button
          onClick={() => onSelectTool('move')}
          title="Move Tool (E)"
          className={`w-7 h-7 flex items-center justify-center rounded-[2px] border shadow-sm ${
            activeTool === 'move'
              ? 'bg-[#e88724] text-black border-[#b35e0e]'
              : 'bg-[#3a3a3a] hover:bg-[#484848] text-[#ccc] border-t-[#525252] border-b-[#1f1f1f] border-x-[#2f2f2f]'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="5 9 2 12 5 15"></polyline>
            <polyline points="9 5 12 2 15 5"></polyline>
            <polyline points="15 19 12 22 9 19"></polyline>
            <polyline points="19 9 22 12 19 15"></polyline>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="12" y1="2" x2="12" y2="22"></line>
          </svg>
        </button>

        {/* Scale Tool (T) */}
        <button
          onClick={() => onSelectTool('scale')}
          title="Scale Tool (T)"
          className={`w-7 h-7 flex items-center justify-center rounded-[2px] border shadow-sm ${
            activeTool === 'scale'
              ? 'bg-[#e88724] text-black border-[#b35e0e]'
              : 'bg-[#3a3a3a] hover:bg-[#484848] text-[#ccc] border-t-[#525252] border-b-[#1f1f1f] border-x-[#2f2f2f]'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="5" width="14" height="14" rx="1"></rect>
            <line x1="3" y1="3" x2="8" y2="8"></line>
            <line x1="21" y1="21" x2="16" y2="16"></line>
          </svg>
        </button>

        {/* Rotate Tool (R) */}
        <button
          onClick={() => onSelectTool('rotate')}
          title="Rotate Tool (R)"
          className={`w-7 h-7 flex items-center justify-center rounded-[2px] border shadow-sm ${
            activeTool === 'rotate'
              ? 'bg-[#e88724] text-black border-[#b35e0e]'
              : 'bg-[#3a3a3a] hover:bg-[#484848] text-[#ccc] border-t-[#525252] border-b-[#1f1f1f] border-x-[#2f2f2f]'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#222]" />

      {/* Group C: Axis Constraint Locks X, Y, Z & Coordinate Mode */}
      <div className="flex items-center space-x-0.5 bg-[#313131] p-0.5 rounded-[2px] border border-[#222]">
        <button
          onClick={() => onToggleAxis('x')}
          title="Lock/Unlock X Axis (X)"
          className={`w-7 h-7 flex items-center justify-center font-bold text-[12px] rounded-[2px] border cursor-pointer ${
            axisLocks.x
              ? 'bg-[#e88724] text-black border-[#b35e0e]'
              : 'bg-[#383838] text-[#888] border-t-[#4a4a4a] border-b-[#1a1a1a]'
          }`}
        >
          X
        </button>
        <button
          onClick={() => onToggleAxis('y')}
          title="Lock/Unlock Y Axis (Y)"
          className={`w-7 h-7 flex items-center justify-center font-bold text-[12px] rounded-[2px] border cursor-pointer ${
            axisLocks.y
              ? 'bg-[#e88724] text-black border-[#b35e0e]'
              : 'bg-[#383838] text-[#888] border-t-[#4a4a4a] border-b-[#1a1a1a]'
          }`}
        >
          Y
        </button>
        <button
          onClick={() => onToggleAxis('z')}
          title="Lock/Unlock Z Axis (Z)"
          className={`w-7 h-7 flex items-center justify-center font-bold text-[12px] rounded-[2px] border cursor-pointer ${
            axisLocks.z
              ? 'bg-[#e88724] text-black border-[#b35e0e]'
              : 'bg-[#383838] text-[#888] border-t-[#4a4a4a] border-b-[#1a1a1a]'
          }`}
        >
          Z
        </button>
        <button
          onClick={onToggleCoordinateSpace}
          title="Coordinate System: World vs Object (W)"
          className={`w-7 h-7 flex items-center justify-center font-bold text-[12px] rounded-[2px] border cursor-pointer ${
            !isWorldSpace
              ? 'bg-[#e88724] text-black border-[#b35e0e]'
              : 'bg-[#3a3a3a] text-[#ccc] border-t-[#525252] border-b-[#1f1f1f]'
          }`}
        >
          L
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#222]" />

      {/* Group D: Render Controls with Picture Viewer & Render Settings */}
      <div className="flex items-center space-x-0.5 bg-[#313131] p-0.5 rounded-[2px] border border-[#222]">
        <button
          onClick={onTriggerRender}
          title="Render View (Ctrl+R)"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-[2px] text-[#ccc] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="M2 8h20"></path>
            <path d="M6 4l3 4"></path>
            <path d="M14 4l3 4"></path>
          </svg>
        </button>
        <button
          onClick={onOpenPictureViewer || onTriggerRender}
          title="Render to Picture Viewer (Shift+R)"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-[2px] text-[#e88724] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <polygon points="10 9 15 12 10 15 10 9" fill="#e88724"></polygon>
          </svg>
        </button>
        <button
          onClick={onOpenRenderSettings}
          title="Edit Render Settings (Ctrl+B)"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-[2px] text-[#ccc] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#222]" />

      {/* Group E: Primitives, Generators & Scene Objects with Dropdowns */}
      <div className="flex items-center space-x-0.5 bg-[#313131] p-0.5 rounded-[2px] border border-[#222]">
        {/* Primitives Dropdown */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => onAddPrimitive('cube')}
              title="Add Primitive Object"
              className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-l-[2px] text-[#4ea3e8] cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4ea3e8" strokeWidth="2" fill="none" />
                <polygon points="12 2 22 7 12 12 2 7" fill="#4ea3e8" opacity="0.4" />
              </svg>
            </button>
            <button
              onClick={(e) => toggleDropdown('primitives', e)}
              className="w-2.5 h-7 bg-[#333] hover:bg-[#444] text-[8px] text-[#aaa] flex items-center justify-center rounded-r-[2px] border-y border-r border-[#222]"
            >
              ▼
            </button>
          </div>

          {openDropdown === 'primitives' && (
            <div className="absolute top-[32px] left-0 w-48 bg-[#353535] border border-[#222] shadow-2xl py-1 z-50 text-[11px] rounded-[2px]">
              <button
                onClick={() => {
                  onAddPrimitive('cube');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black flex items-center space-x-2"
              >
                <span>▣</span>
                <span>Cube Primitive</span>
              </button>
              <button
                onClick={() => {
                  onAddPrimitive('cylinder');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black flex items-center space-x-2"
              >
                <span>⬭</span>
                <span>Cylinder / Borehole Pipe</span>
              </button>
              <button
                onClick={() => {
                  onAddPrimitive('survey_marker');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black flex items-center space-x-2 text-[#00e5ff]"
              >
                <span>⊕</span>
                <span>Survey Station Marker</span>
              </button>
              <button
                onClick={() => {
                  onAddPrimitive('sphere');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black flex items-center space-x-2"
              >
                <span>◯</span>
                <span>Sphere Primitive</span>
              </button>
            </div>
          )}
        </div>

        {/* Spline Pen Tool with Dropdown */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => onAddPrimitive('spline')}
              title="Spline Pen Tool"
              className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-l-[2px] text-[#e89b4e] cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              </svg>
            </button>
            <button
              onClick={(e) => toggleDropdown('splines', e)}
              className="w-2.5 h-7 bg-[#333] hover:bg-[#444] text-[8px] text-[#aaa] flex items-center justify-center rounded-r-[2px] border-y border-r border-[#222]"
            >
              ▼
            </button>
          </div>

          {openDropdown === 'splines' && (
            <div className="absolute top-[32px] left-0 w-44 bg-[#353535] border border-[#222] shadow-2xl py-1 z-50 text-[11px] rounded-[2px]">
              <button
                onClick={() => {
                  onAddPrimitive('spline');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black"
              >
                Bezier Spline Pen
              </button>
              <button
                onClick={() => {
                  onAddPrimitive('spline');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black"
              >
                Geological Fault Spline
              </button>
            </div>
          )}
        </div>

        {/* Generators / Subdivision */}
        <button
          onClick={() => onAddPrimitive('generator')}
          title="Subdivision Surface / Cavern Generator"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-[2px] text-[#4ee878] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <circle cx="12" cy="12" r="5"></circle>
          </svg>
        </button>

        {/* Deformers Dropdown */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => onAddPrimitive('deformer')}
              title="Bend / Twist Deformer"
              className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-l-[2px] text-[#d64ee8] cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4c0 8 16 8 16 16"></path>
                <path d="M4 12c0 4 8 4 8 8"></path>
              </svg>
            </button>
            <button
              onClick={(e) => toggleDropdown('deformers', e)}
              className="w-2.5 h-7 bg-[#333] hover:bg-[#444] text-[8px] text-[#aaa] flex items-center justify-center rounded-r-[2px] border-y border-r border-[#222]"
            >
              ▼
            </button>
          </div>

          {openDropdown === 'deformers' && (
            <div className="absolute top-[32px] left-0 w-44 bg-[#353535] border border-[#222] shadow-2xl py-1 z-50 text-[11px] rounded-[2px]">
              <button
                onClick={() => {
                  onAddPrimitive('deformer');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black"
              >
                Bend Deformer
              </button>
              <button
                onClick={() => {
                  onAddPrimitive('deformer');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black"
              >
                Subsurface Strata Twist
              </button>
            </div>
          )}
        </div>

        {/* Environment / Floor */}
        <button
          onClick={() => onAddPrimitive('floor')}
          title="Floor / Sky / Survey Grid"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-[2px] text-[#ccc] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="2" y1="18" x2="22" y2="18"></line>
            <line x1="4" y1="14" x2="20" y2="14"></line>
            <line x1="7" y1="10" x2="17" y2="10"></line>
          </svg>
        </button>

        {/* Camera */}
        <button
          onClick={() => onAddPrimitive('camera')}
          title="Camera Object"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-[2px] text-[#4edee8] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>

        {/* Light */}
        <button
          onClick={() => onAddPrimitive('light')}
          title="Lantern Work Light / Point Light"
          className="w-7 h-7 flex items-center justify-center bg-[#3a3a3a] hover:bg-[#484848] border border-t-[#525252] border-b-[#1f1f1f] rounded-[2px] text-[#f4d03f] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
