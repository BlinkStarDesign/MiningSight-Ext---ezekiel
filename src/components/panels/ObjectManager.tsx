import React, { useState, useRef, useEffect } from 'react';
import { C4DSceneObject } from '../../types/c4d';
import { TunnelPresetId } from '../../types/tunnelScene';
import { ChevronDown, Check } from 'lucide-react';

interface ObjectManagerProps {
  objects: C4DSceneObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onToggleVisibility: (id: string, target: 'editor' | 'renderer') => void;
  onToggleExpand: (id: string) => void;
  onDeleteObject: (id: string) => void;
  onAddObject: (type: string) => void;
  currentPresetId?: TunnelPresetId;
  onSelectPreset?: (presetId: TunnelPresetId) => void;
  onSaveProject?: () => void;
  onOpenProject?: () => void;
  onRevertProject?: () => void;
}

export const ObjectManager: React.FC<ObjectManagerProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  onToggleVisibility,
  onToggleExpand,
  onDeleteObject,
  onAddObject,
  currentPresetId = 'rugged_timbered_photo',
  onSelectPreset,
  onSaveProject,
  onOpenProject,
  onRevertProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [openMenu, setOpenMenu] = useState<'File' | 'Edit' | 'View' | 'Objects' | 'Tags' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    if (openMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openMenu]);

  const isModelActive = (objId: string): boolean => {
    if (objId === 'Rugged_Timbered_Mine_Tunnel_Photo') {
      return currentPresetId === 'rugged_timbered_photo' || currentPresetId === 'ai_custom';
    }
    if (objId === 'Mining_Tunnel_Complex') {
      return currentPresetId === 'classic_diorama';
    }
    return false;
  };

  const handleExpandAll = () => {
    objects.forEach((obj) => {
      if (!obj.expanded) onToggleExpand(obj.id);
      if (obj.children) {
        obj.children.forEach((c) => {
          if (!c.expanded) onToggleExpand(c.id);
        });
      }
    });
    setOpenMenu(null);
  };

  const handleCollapseAll = () => {
    objects.forEach((obj) => {
      if (obj.expanded) onToggleExpand(obj.id);
      if (obj.children) {
        obj.children.forEach((c) => {
          if (c.expanded) onToggleExpand(c.id);
        });
      }
    });
    setOpenMenu(null);
  };

  const renderObjectRow = (obj: C4DSceneObject, depth: number = 0) => {
    const isSelected = selectedObjectId === obj.id;
    const hasChildren = obj.children && obj.children.length > 0;
    const isRootModel = depth === 0 && (obj.id === 'Rugged_Timbered_Mine_Tunnel_Photo' || obj.id === 'Mining_Tunnel_Complex');
    const activeIn3D = isModelActive(obj.id);

    return (
      <React.Fragment key={obj.id}>
        <div
          onClick={() => {
            onSelectObject(obj.id);
            if (isRootModel && onSelectPreset) {
              if (obj.id === 'Rugged_Timbered_Mine_Tunnel_Photo') {
                onSelectPreset('rugged_timbered_photo');
              } else if (obj.id === 'Mining_Tunnel_Complex') {
                onSelectPreset('classic_diorama');
              }
            }
          }}
          className={`h-[22px] flex items-center justify-between px-2 cursor-pointer text-[11px] select-none transition-colors border-b border-[#2f2f2f]/40 ${
            isSelected
              ? 'bg-[#3b516b] text-white font-medium'
              : isRootModel && activeIn3D
              ? 'bg-[#333d47] text-[#f0f0f0]'
              : 'hover:bg-[#434343] text-[#cfcfcf]'
          }`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          title={isRootModel ? `Click to select and view ${obj.name} in 3D viewport` : undefined}
        >
          {/* Left: Expand, Icon, Name */}
          <div className="flex items-center space-x-1.5 overflow-hidden flex-1 min-w-0 pr-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(obj.id);
                }}
                className="w-3.5 h-3.5 flex items-center justify-center text-[#888] hover:text-white font-mono text-[9px] cursor-pointer flex-shrink-0"
                title={obj.expanded ? 'Collapse hierarchy' : 'Expand hierarchy'}
              >
                {obj.expanded ? '▼' : '▶'}
              </button>
            ) : (
              <span className="w-3.5 flex-shrink-0" />
            )}

            {/* Custom Icon for Root Models vs Sub-primitives */}
            {isRootModel ? (
              <span className={`w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 ${
                activeIn3D ? 'text-[#e88724]' : 'text-[#888]'
              }`}>
                {obj.id === 'Rugged_Timbered_Mine_Tunnel_Photo' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                  </svg>
                )}
              </span>
            ) : (
              <span className="w-3.5 h-3.5 flex items-center justify-center text-[#4ea3e8] flex-shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                </svg>
              </span>
            )}

            {/* Object Name */}
            <span className="truncate font-sans tracking-tight text-[11px]">
              {obj.name}
            </span>

            {/* Root Model Status Badge */}
            {isRootModel && (
              <span
                className={`ml-1 px-1 py-0.2 text-[8.5px] rounded-[2px] font-mono uppercase tracking-wider flex-shrink-0 ${
                  activeIn3D
                    ? 'bg-[#e88724] text-black font-bold'
                    : 'bg-[#2b2b2b] text-[#888] hover:text-[#ccc] border border-[#444]'
                }`}
              >
                {activeIn3D ? 'Active 3D' : 'Click to View'}
              </span>
            )}
          </div>

          {/* Right: Visibility Dots & Tag Badges */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* C4D Editor & Renderer Visibility Dots (Double-dot indicator) */}
            <div
              className="flex flex-col items-center justify-center space-y-[2px] cursor-pointer p-0.5 hover:bg-[#505050] rounded-[2px]"
              title="Top: Editor Visibility | Bottom: Renderer Visibility"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(obj.id, 'editor');
                if (isRootModel && !activeIn3D && onSelectPreset) {
                  onSelectPreset(obj.id === 'Rugged_Timbered_Mine_Tunnel_Photo' ? 'rugged_timbered_photo' : 'classic_diorama');
                }
              }}
            >
              {/* Top dot: Editor */}
              <span
                className={`w-[5px] h-[5px] rounded-full ${
                  obj.visibleInEditor ? 'bg-[#5cd65c]' : 'bg-[#e05252]'
                }`}
              />
              {/* Bottom dot: Renderer */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(obj.id, 'renderer');
                }}
                className={`w-[5px] h-[5px] rounded-full ${
                  obj.visibleInRenderer ? 'bg-[#5cd65c]' : 'bg-[#e05252]'
                }`}
              />
            </div>

            {/* C4D Tag Icons: Phong Tag & Material Swatches */}
            <div className="flex items-center space-x-1">
              <span
                title="Phong Tag (Angle: 80 deg)"
                className="w-3.5 h-3.5 bg-[#404040] border border-[#2b2b2b] rounded-[1px] flex items-center justify-center text-[8px] text-[#e89b4e] font-bold"
              >
                ∠
              </span>
              <span
                title="Material: Rock Strata"
                className="w-2.5 h-2.5 rounded-full bg-[#5a544e] border border-[#777] inline-block shadow-inner"
              />
              <span
                title="Material: Timber Beams"
                className="w-2.5 h-2.5 rounded-full bg-[#4d3b2c] border border-[#666] inline-block shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Nested Children */}
        {hasChildren &&
          obj.expanded &&
          obj.children!.map((child) => renderObjectRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full h-full bg-[#393939] flex flex-col select-none overflow-hidden border-b border-[#222]">
      {/* Panel Header with Working Dropdowns */}
      <div ref={menuRef} className="h-[24px] bg-[#464646] border-b border-[#282828] flex items-center justify-between px-2 text-[11px] text-[#cfcfcf] relative flex-shrink-0">
        <div className="flex items-center space-x-1">
          {/* Grip dots */}
          <div className="flex space-x-0.5 opacity-60 mr-1.5">
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
          </div>

          {/* 1. File Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'File' ? null : 'File')}
              className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                openMenu === 'File' ? 'bg-[#2b2b2b] text-white font-semibold' : 'hover:text-white'
              }`}
            >
              File
            </button>
            {openMenu === 'File' && (
              <div className="absolute top-full left-0 mt-0.5 w-56 bg-[#2a2a2a] border border-[#444] shadow-2xl py-1 z-50 rounded-[2px] text-[11px]">
                <button
                  onClick={() => {
                    onSaveProject?.();
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white flex items-center justify-between"
                >
                  <span>Save Object Hierarchy (.json)</span>
                  <span className="text-[10px] text-[#888]">Ctrl+S</span>
                </button>
                <button
                  onClick={() => {
                    onOpenProject?.();
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white flex items-center justify-between"
                >
                  <span>Import 3D Asset / Survey...</span>
                  <span className="text-[10px] text-[#888]">Ctrl+O</span>
                </button>
                <div className="border-t border-[#3a3a3a] my-1" />
                <button
                  onClick={() => {
                    onRevertProject?.();
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Revert Object Hierarchy to Baseline
                </button>
              </div>
            )}
          </div>

          {/* 2. Edit Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'Edit' ? null : 'Edit')}
              className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                openMenu === 'Edit' ? 'bg-[#2b2b2b] text-white font-semibold' : 'hover:text-white'
              }`}
            >
              Edit
            </button>
            {openMenu === 'Edit' && (
              <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#2a2a2a] border border-[#444] shadow-2xl py-1 z-50 rounded-[2px] text-[11px]">
                <button
                  onClick={() => {
                    onSelectObject(objects[0]?.id || null);
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white flex items-center justify-between"
                >
                  <span>Select Active Model</span>
                  <span className="text-[10px] text-[#888]">Ctrl+A</span>
                </button>
                <button
                  onClick={() => {
                    onSelectObject(null);
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white flex items-center justify-between"
                >
                  <span>Deselect All</span>
                  <span className="text-[10px] text-[#888]">Ctrl+Shift+A</span>
                </button>
                <div className="border-t border-[#3a3a3a] my-1" />
                <button
                  onClick={() => {
                    if (selectedObjectId) onDeleteObject(selectedObjectId);
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white flex items-center justify-between"
                >
                  <span>Delete Selected Object</span>
                  <span className="text-[10px] text-[#888]">Del</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. View Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'View' ? null : 'View')}
              className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                openMenu === 'View' ? 'bg-[#2b2b2b] text-white font-semibold' : 'hover:text-white'
              }`}
            >
              View
            </button>
            {openMenu === 'View' && (
              <div className="absolute top-full left-0 mt-0.5 w-64 bg-[#2a2a2a] border border-[#444] shadow-2xl py-1 z-50 rounded-[2px] text-[11px]">
                <div className="px-3 py-1 text-[9.5px] uppercase tracking-wider text-[#888] font-bold">
                  Select Active Model to View:
                </div>
                <button
                  onClick={() => {
                    onSelectPreset?.('rugged_timbered_photo');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white flex items-center justify-between"
                >
                  <span>View: Rugged Timbered Drift (Photo Reference)</span>
                  {(currentPresetId === 'rugged_timbered_photo' || currentPresetId === 'ai_custom') && (
                    <Check className="w-3.5 h-3.5 text-[#e88724]" />
                  )}
                </button>
                <button
                  onClick={() => {
                    onSelectPreset?.('classic_diorama');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white flex items-center justify-between"
                >
                  <span>View: Classic Diorama Mining Tunnel</span>
                  {currentPresetId === 'classic_diorama' && (
                    <Check className="w-3.5 h-3.5 text-[#e88724]" />
                  )}
                </button>
                <div className="border-t border-[#3a3a3a] my-1" />
                <button
                  onClick={handleExpandAll}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Expand All Hierarchies
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Collapse All Hierarchies
                </button>
              </div>
            )}
          </div>

          {/* 4. Objects Menu (PRIMARY Active Model Selector) */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'Objects' ? null : 'Objects')}
              className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer font-semibold ${
                openMenu === 'Objects' ? 'bg-[#2b2b2b] text-[#e88724]' : 'text-[#eee] hover:text-white'
              }`}
            >
              Objects
            </button>
            {openMenu === 'Objects' && (
              <div className="absolute top-full left-0 mt-0.5 w-72 bg-[#2a2a2a] border border-[#444] shadow-2xl py-1 z-50 rounded-[2px] text-[11px]">
                <div className="px-3 py-1 text-[9.5px] uppercase tracking-wider text-[#e88724] font-bold">
                  Active 3D Model in Viewport:
                </div>
                <button
                  onClick={() => {
                    onSelectPreset?.('rugged_timbered_photo');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3b516b] text-[#eee] hover:text-white flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">Rugged Timbered Drift (Photo Reference)</div>
                    <div className="text-[9.5px] text-[#888]">4-tier lagging, battered posts, unlined rock adit</div>
                  </div>
                  {(currentPresetId === 'rugged_timbered_photo' || currentPresetId === 'ai_custom') && (
                    <span className="text-[#e88724] font-bold font-mono text-[10px]">ACTIVE</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onSelectPreset?.('classic_diorama');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3b516b] text-[#eee] hover:text-white flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">Classic Diorama Mining Tunnel</div>
                    <div className="text-[9.5px] text-[#888]">Open cutaway cavern, railway tracks, ore cart</div>
                  </div>
                  {currentPresetId === 'classic_diorama' && (
                    <span className="text-[#e88724] font-bold font-mono text-[10px]">ACTIVE</span>
                  )}
                </button>
                <div className="border-t border-[#3a3a3a] my-1" />
                <div className="px-3 py-0.5 text-[9.5px] uppercase tracking-wider text-[#888] font-bold">
                  Add Child Object:
                </div>
                <button
                  onClick={() => {
                    onAddObject('cube');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Add Cube Primitive
                </button>
                <button
                  onClick={() => {
                    onAddObject('cylinder');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Add Cylinder / Borehole Pipe
                </button>
                <button
                  onClick={() => {
                    onAddObject('survey_marker');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Add Survey Station Marker
                </button>
              </div>
            )}
          </div>

          {/* 5. Tags Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'Tags' ? null : 'Tags')}
              className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                openMenu === 'Tags' ? 'bg-[#2b2b2b] text-white font-semibold' : 'hover:text-white'
              }`}
            >
              Tags
            </button>
            {openMenu === 'Tags' && (
              <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#2a2a2a] border border-[#444] shadow-2xl py-1 z-50 rounded-[2px] text-[11px]">
                <button
                  onClick={() => setOpenMenu(null)}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Add Phong Tag (Angle: 80 deg)
                </button>
                <button
                  onClick={() => setOpenMenu(null)}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Add Material Tag
                </button>
                <button
                  onClick={() => setOpenMenu(null)}
                  className="w-full text-left px-3 py-1 hover:bg-[#3b516b] text-[#ddd] hover:text-white"
                >
                  Add Geological Survey Tag
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Utility Icons */}
        <div className="flex items-center space-x-1.5 text-[#a0a0a0]">
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search Objects"
            className="hover:text-white cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button
            onClick={() => onAddObject('cube')}
            title="Add Child Primitive"
            className="hover:text-white text-[13px] font-bold cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Search Input bar if toggled */}
      {showSearch && (
        <div className="p-1 bg-[#2e2e2e] border-b border-[#222]">
          <input
            type="text"
            placeholder="Search scene objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#444] text-[#eee] text-[11px] px-2 py-0.5 rounded-[2px] focus:outline-none focus:border-[#e88724]"
          />
        </div>
      )}

      {/* Hierarchy Tree Area */}
      <div className="flex-1 overflow-y-auto bg-[#363636] py-0.5">
        {objects
          .filter((o) => o.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((obj) => renderObjectRow(obj))}
      </div>

      {/* Side Nav Footer Status Bar */}
      <div className="h-[18px] bg-[#2a2a2a] border-t border-[#222] px-2 flex items-center justify-between text-[9.5px] text-[#888]">
        <span className="truncate">Both 3D models available. Click any object to inspect and view.</span>
        <span className="font-mono text-[#aaa]">{objects.length} Models</span>
      </div>
    </div>
  );
};
