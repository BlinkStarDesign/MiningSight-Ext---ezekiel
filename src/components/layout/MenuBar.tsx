import React, { useState } from 'react';
import { Video } from 'lucide-react';

interface MenuBarProps {
  currentLayout: string;
  onSelectLayout: (layout: string) => void;
  onNewObject?: (type: string) => void;
  onResetView?: () => void;
  onSaveProject?: () => void;
  onOpenProject?: () => void;
  onRevertProject?: () => void;
  onOpenAISurvey?: () => void;
  onOpenTours?: () => void;
  onTriggerRender?: () => void;
  currentPresetId?: string;
  onSelectPreset?: (presetId: any) => void;
  onOpenPhotoRef?: () => void;
  onOpenSceneOptions?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  currentLayout,
  onSelectLayout,
  onNewObject,
  onResetView,
  onSaveProject,
  onOpenProject,
  onRevertProject,
  onOpenAISurvey,
  onOpenTours,
  onTriggerRender,
  currentPresetId = 'rugged_timbered_photo',
  onSelectPreset,
  onOpenPhotoRef,
  onOpenSceneOptions,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const isPhotoActive = currentPresetId === 'rugged_timbered_photo' || currentPresetId === 'ai_custom';
  const isClassicActive = currentPresetId === 'classic_diorama';

  const menuItems: {
    name: string;
    items: {
      label: string;
      shortcut?: string;
      action?: () => void;
      isActive?: boolean;
      divider?: boolean;
    }[];
  }[] = [
    {
      name: 'File',
      items: [
        { label: 'New Project (Mining Site Baseline)', shortcut: 'Ctrl+N', action: onRevertProject },
        { label: 'Open Project from Machine (.json / .c4d.json)...', shortcut: 'Ctrl+O', action: onOpenProject },
        { divider: true, label: '' },
        {
          label: 'Load from Server: Rugged Timbered Drift (Photo Reference)',
          action: () => onSelectPreset?.('rugged_timbered_photo'),
          isActive: isPhotoActive,
        },
        {
          label: 'Load from Server: Classic Diorama Mining Tunnel',
          action: () => onSelectPreset?.('classic_diorama'),
          isActive: isClassicActive,
        },
        { divider: true, label: '' },
        { label: 'Save Project to Machine (.c4d.json)', shortcut: 'Ctrl+S', action: onSaveProject },
        { label: 'Save Project Copy As...', shortcut: 'Ctrl+Shift+S', action: onSaveProject },
        { label: 'Export 3D Coordinates & Mesh (.json)', action: onSaveProject },
        { label: 'Import Survey Images (AI Photogrammetry)...', action: onOpenAISurvey },
        { divider: true, label: '' },
        { label: 'Revert to Baseline Project', action: onRevertProject },
      ],
    },
    {
      name: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z' },
        { label: 'Redo', shortcut: 'Ctrl+Y' },
        { divider: true, label: '' },
        { label: 'Select All Objects', shortcut: 'Ctrl+A' },
        { label: 'Deselect All', shortcut: 'Ctrl+Shift+A' },
        { label: 'Revert All Transformations', action: onRevertProject },
        { divider: true, label: '' },
        { label: 'Project Settings: Mining Site Survey', shortcut: 'Ctrl+D' },
        { label: 'Photogrammetry Calibration...', shortcut: 'Ctrl+E', action: onOpenAISurvey },
      ],
    },
    {
      name: 'Scene',
      items: [
        {
          label: 'Active Model: Rugged Timbered Drift (Photo Reference)',
          action: () => onSelectPreset?.('rugged_timbered_photo'),
          isActive: isPhotoActive,
        },
        {
          label: 'Active Model: Classic Diorama Mining Tunnel',
          action: () => onSelectPreset?.('classic_diorama'),
          isActive: isClassicActive,
        },
        { divider: true, label: '' },
        {
          label: 'Compare 3D Model with Reference Photo...',
          action: onOpenPhotoRef,
        },
        {
          label: 'Tune 3D Procedural Parameters...',
          action: onOpenSceneOptions,
        },
        { divider: true, label: '' },
        { label: 'Reset Camera View to Origin', action: onResetView },
      ],
    },
    {
      name: 'Create',
      items: [
        { label: 'Survey Station Marker', action: () => onNewObject?.('survey_marker') },
        { label: 'Primitive: Cube', action: () => onNewObject?.('cube') },
        { label: 'Primitive: Cylinder / Borehole Pipe', action: () => onNewObject?.('cylinder') },
        { label: 'Spline: Geological Fault Pen', action: () => onNewObject?.('spline') },
        { label: 'Subdivision Surface: Cavern Arch', action: () => onNewObject?.('generator') },
        { label: 'Camera: Survey Perspective', action: () => onNewObject?.('camera') },
        { label: 'Light: Industrial Lantern', action: () => onNewObject?.('light') },
      ],
    },
    {
      name: 'Select',
      items: [
        { label: 'Live Selection', shortcut: '9' },
        { label: 'Rectangle Selection', shortcut: '0' },
        { label: 'Lasso Selection', shortcut: '8' },
        { divider: true, label: '' },
        { label: 'Select Active Model Root' },
        { label: 'Select Child Primitives' },
      ],
    },
    {
      name: 'Tools',
      items: [
        { label: 'Move Tool', shortcut: 'E' },
        { label: 'Scale Tool', shortcut: 'T' },
        { label: 'Rotate Tool', shortcut: 'R' },
        { divider: true, label: '' },
        { label: 'Coordinate System (World/Object)', shortcut: 'W' },
        { label: 'Record Viewpoint Keyframe', shortcut: 'K' },
        { label: '3D Laser Measurement Ruler', shortcut: 'M' },
        { label: 'First-Person Walk Mode', shortcut: 'V' },
      ],
    },
    {
      name: 'AI Survey',
      items: [
        { label: 'Open Photogrammetry & Subsurface Mapping', action: onOpenAISurvey },
        { label: 'Tag Inter-Frame Distances (Meters)', action: onOpenAISurvey },
        { label: 'Run Gemini 3.8 Flash Geotechnical Solver', action: onOpenAISurvey },
        { label: 'Generate 3D Scene from Reference Photo', action: onOpenAISurvey },
      ],
    },
    {
      name: 'Render',
      items: [
        { label: 'Render View', shortcut: 'Ctrl+R', action: onTriggerRender },
        { label: 'Render to Picture Viewer', shortcut: 'Shift+R', action: onTriggerRender },
        { label: 'Edit Render Settings...', shortcut: 'Ctrl+B' },
      ],
    },
    {
      name: 'Window',
      items: [
        { label: 'Objects Manager (Hierarchy)', action: onResetView },
        { label: 'Attribute Manager', action: onResetView },
        { label: 'Material Manager', action: onResetView },
        { label: 'Coordinate Manager', action: onResetView },
        { divider: true, label: '' },
        { label: 'Camera Tours & Keyframe Path Manager', shortcut: 'F8', action: onOpenTours },
        { label: 'AI Geological Mapper Panel', action: onOpenAISurvey },
        { label: 'Timeline Workspace Bar', action: onResetView },
        { divider: true, label: '' },
        { label: 'Reset Layout to Default', action: onResetView },
      ],
    },
    {
      name: 'Help',
      items: [
        { label: 'Mining Site Visualisation Guide', shortcut: 'Ctrl+F1' },
        { label: 'Photogrammetry Tagging Reference', action: onOpenAISurvey },
        { label: 'About Mining Site 3D Workstation' },
      ],
    },
  ];

  return (
    <div className="relative w-full h-[22px] bg-[#323232] border-b border-[#1e1e1e] flex items-center justify-between px-1.5 text-[11px] text-[#cfcfcf] select-none font-sans z-30">
      {/* Horizontal Menu Items */}
      <div className="flex items-center space-x-0.5 overflow-x-hidden whitespace-nowrap">
        {menuItems.map((menu) => (
          <div key={menu.name} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menu.name ? null : menu.name)}
              onMouseEnter={() => {
                if (activeMenu !== null) setActiveMenu(menu.name);
              }}
              className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                activeMenu === menu.name
                  ? 'bg-[#e88724] text-black font-bold'
                  : menu.name === 'AI Survey'
                  ? 'text-[#e88724] font-semibold hover:bg-[#464646]'
                  : 'hover:bg-[#464646] hover:text-white'
              }`}
            >
              {menu.name}
            </button>

            {/* Dropdown Menu */}
            {activeMenu === menu.name && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setActiveMenu(null)}
                />
                <div className="absolute top-[21px] left-0 min-w-[270px] bg-[#2e2e2e] border border-[#444] shadow-2xl py-1 z-50 rounded-[1px] text-[#e0e0e0]">
                  {menu.items.map((item, idx) => {
                    if (item.divider) {
                      return <div key={idx} className="border-t border-[#3e3e3e] my-1" />;
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          item.action?.();
                          setActiveMenu(null);
                        }}
                        className={`w-full text-left px-3 py-1 flex items-center justify-between hover:bg-[#e88724] hover:text-black group text-[11px] cursor-pointer ${
                          item.isActive ? 'bg-[#3b516b] text-white font-medium' : ''
                        }`}
                      >
                        <span className="flex items-center space-x-1.5">
                          {item.isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e88724] inline-block" />
                          )}
                          <span>{item.label}</span>
                        </span>
                        {item.shortcut && (
                          <span className="text-[10px] text-[#888] group-hover:text-black ml-4">
                            {item.shortcut}
                          </span>
                        )}
                        {item.isActive && (
                          <span className="text-[9px] font-mono text-[#e88724] group-hover:text-black ml-2 font-bold">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Center Project Title Branding */}
      <div className="hidden xl:flex items-center space-x-2 text-[10.5px] text-[#aaa] flex-shrink min-w-0 mx-2 overflow-hidden">
        <span className="font-bold text-[#e88724] flex-shrink-0">Mining Site</span>
        <span>-</span>
        <span className="truncate text-[#ddd]">Surface & Subsurface Visualisation and Mapping</span>
      </div>

      {/* Right side: Layout Selector and Utility Buttons */}
      <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
        <div className="flex items-center space-x-1">
          <span className="text-[#a0a0a0] text-[11px]">Layout:</span>
          <select
            value={currentLayout}
            onChange={(e) => onSelectLayout(e.target.value)}
            className="bg-[#262626] border border-[#484848] text-[#e8e8e8] text-[11px] px-1 py-0.5 rounded-[2px] cursor-pointer focus:outline-none focus:border-[#e88724]"
          >
            <option value="Startup">Startup</option>
            <option value="Mining Survey & AI Mapping">Mining Survey & AI Mapping</option>
            <option value="Modeling">Modeling</option>
            <option value="Sculpting">Sculpting</option>
            <option value="Animation">Animation</option>
            <option value="Render">Render</option>
          </select>
        </div>

        {/* Camera Tours Quick Button */}
        <button
          onClick={onOpenTours}
          title="Open Camera Tours & Keyframe Path Animation"
          className="px-1.5 py-0.5 bg-[#3a4452] hover:bg-[#4ea3e8] hover:text-black text-white font-bold text-[10px] rounded-[2px] cursor-pointer border border-[#556677] flex items-center space-x-1"
        >
          <Video className="w-3 h-3 text-[#e88724]" />
          <span>Tours</span>
        </button>

        {/* AI Quick Button */}
        <button
          onClick={onOpenAISurvey}
          title="Open AI Photogrammetry Panel"
          className="px-1.5 py-0.5 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold text-[10px] rounded-[2px] cursor-pointer"
        >
          AI Survey
        </button>

        {/* Lock layout icon */}
        <button title="Lock Workspace" className="text-[#999] hover:text-white p-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
