import React, { useState } from 'react';
import { C4DSceneObject, Vector3D } from '../../types/c4d';
import { parseC4DInput } from '../../utils/math3d';

interface AttributeManagerProps {
  selectedObject: C4DSceneObject | null;
  onUpdateTransform: (pos: Vector3D, rot: Vector3D, scale: Vector3D) => void;
  onUpdateProperty: (key: string, val: any) => void;
}

export const AttributeManager: React.FC<AttributeManagerProps> = ({
  selectedObject,
  onUpdateTransform,
  onUpdateProperty,
}) => {
  const [activeTab, setActiveTab] = useState<'Basic' | 'Coord' | 'Object' | 'Phong'>('Coord');

  if (!selectedObject) {
    return (
      <div className="w-full h-full bg-[#393939] flex flex-col select-none text-[11px] text-[#888]">
        <div className="h-[22px] bg-[#464646] border-b border-[#282828] flex items-center px-2 text-[#cfcfcf]">
          <span className="font-medium">Attribute Manager</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          No object selected. Click an object in the Viewport or Object Manager.
        </div>
      </div>
    );
  }

  const handlePosChange = (axis: 'x' | 'y' | 'z', strVal: string) => {
    const num = parseC4DInput(strVal);
    const newPos = { ...selectedObject.position, [axis]: num };
    onUpdateTransform(newPos, selectedObject.rotation, selectedObject.scale);
  };

  const handleRotChange = (axis: 'x' | 'y' | 'z', strVal: string) => {
    const num = parseC4DInput(strVal);
    const newRot = { ...selectedObject.rotation, [axis]: num };
    onUpdateTransform(selectedObject.position, newRot, selectedObject.scale);
  };

  const handleScaleChange = (axis: 'x' | 'y' | 'z', strVal: string) => {
    const num = Math.max(0.01, parseC4DInput(strVal));
    const newScale = { ...selectedObject.scale, [axis]: num };
    onUpdateTransform(selectedObject.position, selectedObject.rotation, newScale);
  };

  return (
    <div className="w-full h-full bg-[#393939] flex flex-col select-none overflow-hidden text-[11px] text-[#cfcfcf]">
      {/* Panel Header */}
      <div className="h-[22px] bg-[#464646] border-b border-[#282828] flex items-center justify-between px-2">
        <div className="flex items-center space-x-2.5">
          {/* Grip dots */}
          <div className="flex space-x-0.5 opacity-60">
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
          </div>

          <span className="hover:text-white cursor-pointer">Mode</span>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">User Data</span>
        </div>

        {/* Header utility icons */}
        <div className="flex items-center space-x-1.5 text-[#a0a0a0]">
          <button title="Lock Attributes" className="hover:text-white">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Object Title & Tabs */}
      <div className="bg-[#333] border-b border-[#262626] px-2 py-1 flex items-center justify-between">
        <span className="font-semibold text-white tracking-tight truncate max-w-[200px]">
          {selectedObject.name} [Object]
        </span>
      </div>

      {/* Property Tabs */}
      <div className="flex items-center bg-[#2c2c2c] border-b border-[#202020] px-1 text-[11px]">
        {(['Basic', 'Coord', 'Object', 'Phong'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 font-medium transition-colors border-t-2 ${
              activeTab === tab
                ? 'bg-[#393939] text-[#e88724] border-[#e88724]'
                : 'text-[#999] hover:text-white border-transparent'
            }`}
          >
            {tab === 'Coord' ? 'Coord.' : tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-[#383838]">
        {activeTab === 'Coord' && (
          <div className="space-y-3">
            {/* Position Controls */}
            <div className="bg-[#303030] p-2 rounded-[2px] border border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-[#999] mb-1.5 flex items-center justify-between">
                <span>Position</span>
                <span className="text-[9px] text-[#777]">cm</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">P.X</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.position.x} cm`}
                    key={`px-${selectedObject.position.x}`}
                    onBlur={(e) => handlePosChange('x', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePosChange('x', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">P.Y</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.position.y} cm`}
                    key={`py-${selectedObject.position.y}`}
                    onBlur={(e) => handlePosChange('y', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePosChange('y', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">P.Z</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.position.z} cm`}
                    key={`pz-${selectedObject.position.z}`}
                    onBlur={(e) => handlePosChange('z', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePosChange('z', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
              </div>
            </div>

            {/* Scale Controls */}
            <div className="bg-[#303030] p-2 rounded-[2px] border border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-[#999] mb-1.5">Scale</div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">S.X</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.scale.x}`}
                    key={`sx-${selectedObject.scale.x}`}
                    onBlur={(e) => handleScaleChange('x', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScaleChange('x', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">S.Y</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.scale.y}`}
                    key={`sy-${selectedObject.scale.y}`}
                    onBlur={(e) => handleScaleChange('y', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScaleChange('y', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">S.Z</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.scale.z}`}
                    key={`sz-${selectedObject.scale.z}`}
                    onBlur={(e) => handleScaleChange('z', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScaleChange('z', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
              </div>
            </div>

            {/* Rotation Controls (H, P, B) */}
            <div className="bg-[#303030] p-2 rounded-[2px] border border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-[#999] mb-1.5 flex items-center justify-between">
                <span>Rotation (HPB)</span>
                <span className="text-[9px] text-[#777]">deg (°)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">R.H</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.rotation.y} °`}
                    key={`rh-${selectedObject.rotation.y}`}
                    onBlur={(e) => handleRotChange('y', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRotChange('y', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">R.P</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.rotation.x} °`}
                    key={`rp-${selectedObject.rotation.x}`}
                    onBlur={(e) => handleRotChange('x', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRotChange('x', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#888] block mb-0.5">R.B</label>
                  <input
                    type="text"
                    defaultValue={`${selectedObject.rotation.z} °`}
                    key={`rb-${selectedObject.rotation.z}`}
                    onBlur={(e) => handleRotChange('z', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRotChange('z', (e.target as HTMLInputElement).value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] px-1.5 py-0.5 text-[#ddd] text-[11px] rounded-[1px] focus:outline-none focus:border-[#e88724]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Basic' && (
          <div className="space-y-2 bg-[#303030] p-2.5 rounded-[2px] border border-[#262626]">
            <div>
              <label className="block text-[10px] text-[#999] mb-1">Name</label>
              <input
                type="text"
                defaultValue={selectedObject.name}
                onBlur={(e) => onUpdateProperty('name', e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#444] px-2 py-1 text-[#eee] text-[11px] rounded-[1px]"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#999]">Enabled</span>
              <input
                type="checkbox"
                defaultChecked={selectedObject.visibleInEditor}
                onChange={(e) => onUpdateProperty('visibleInEditor', e.target.checked)}
                className="cursor-pointer accent-[#e88724]"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#999]">Visible in Renderer</span>
              <input
                type="checkbox"
                defaultChecked={selectedObject.visibleInRenderer}
                onChange={(e) => onUpdateProperty('visibleInRenderer', e.target.checked)}
                className="cursor-pointer accent-[#e88724]"
              />
            </div>
          </div>
        )}

        {activeTab === 'Object' && (
          <div className="space-y-2.5 bg-[#303030] p-2.5 rounded-[2px] border border-[#262626]">
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Structure</span>
              <span className="text-white font-medium">Subterranean Mine Adit</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Tunnel Length</span>
              <span className="text-[#ddd]">54.0 m (177 ft)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Arch Profile</span>
              <span className="text-[#ddd]">11.0 m Horseshoe Cavern</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Mesh Tessellation</span>
              <span className="text-[#ddd]">48 × 28 (1,344 Quads)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Timber Support</span>
              <span className="text-[#ddd]">9 Post-and-Lintel Sets</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Rail Gauge</span>
              <span className="text-[#ddd]">2.4 m Steel Track</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Rolling Stock</span>
              <span className="text-[#ddd]">Ore Cart (Payload: Gold/Pyrite)</span>
            </div>
          </div>
        )}

        {activeTab === 'Phong' && (
          <div className="space-y-2 bg-[#303030] p-2.5 rounded-[2px] border border-[#262626]">
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Phong Angle</span>
              <span className="text-white font-medium">80.0 °</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#aaa]">Use Edge Breaks</span>
              <input type="checkbox" defaultChecked className="accent-[#e88724]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
