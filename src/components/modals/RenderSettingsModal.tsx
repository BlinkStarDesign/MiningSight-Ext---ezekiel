import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RenderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAndRender?: () => void;
}

export const RenderSettingsModal: React.FC<RenderSettingsModalProps> = ({
  isOpen,
  onClose,
  onApplyAndRender,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Output');
  const [renderer, setRenderer] = useState<string>('Physical');
  const [width, setWidth] = useState<number>(1366);
  const [height, setHeight] = useState<number>(705);
  const [resolution, setResolution] = useState<number>(300);
  const [frameRange, setFrameRange] = useState<string>('All Frames (0 to 90)');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#292929] border-2 border-[#151515] shadow-2xl rounded-[3px] w-[680px] max-w-[95vw] h-[480px] max-h-[90vh] flex flex-col overflow-hidden text-[#d0d0d0] font-sans text-[11px]">
        {/* Title Bar */}
        <div className="h-[28px] bg-[#202020] border-b border-[#181818] px-3 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e88724]"></span>
            <span className="font-semibold text-[#f0f0f0]">
              Cinema 4D R19.068 - Render Settings [Mining_Site_Tunnel.c4d]
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#c0392b] rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Renderer Selector Top Bar */}
        <div className="h-[32px] bg-[#333333] border-b border-[#222] px-3 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <span className="text-[#888]">Renderer:</span>
            <select
              value={renderer}
              onChange={(e) => setRenderer(e.target.value)}
              className="bg-[#222] text-[#e88724] font-semibold text-[11px] px-2 py-0.5 rounded border border-[#444] focus:outline-none"
            >
              <option value="Physical">Physical (Volumetric Depth of Field + Motion Blur)</option>
              <option value="Standard">Standard (Fast Raytracing)</option>
              <option value="Redshift">Redshift GPU Photorealistic</option>
            </select>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-[170px] bg-[#242424] border-r border-[#1e1e1e] flex flex-col py-1.5 overflow-y-auto select-none">
            {[
              { id: 'Output', label: 'Output', active: true },
              { id: 'Save', label: 'Save', active: false },
              { id: 'Multi-Pass', label: 'Multi-Pass', active: false },
              { id: 'Antialiasing', label: 'Antialiasing', active: false },
              { id: 'Physical', label: 'Physical', active: true },
              { id: 'Ambient Occlusion', label: 'Ambient Occlusion', active: true },
              { id: 'Global Illumination', label: 'Global Illumination', active: true },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center justify-between px-3 py-1.5 text-left text-[11px] ${
                  activeCategory === cat.id
                    ? 'bg-[#e88724] text-black font-semibold'
                    : 'text-[#bbb] hover:bg-[#303030] hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`w-2 h-2 rounded-full ${cat.active ? 'bg-emerald-400' : 'bg-transparent'}`}></span>
              </button>
            ))}
          </div>

          {/* Settings Detail */}
          <div className="flex-1 bg-[#2b2b2b] p-4 overflow-y-auto space-y-4">
            {activeCategory === 'Output' && (
              <div className="space-y-3">
                <div className="text-[12px] font-bold text-white border-b border-[#3a3a3a] pb-1">
                  Output Format & Dimensions
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#888] block mb-1">Width (Pixels)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full bg-[#1e1e1e] border border-[#444] px-2 py-1 text-white text-[11px] rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#888] block mb-1">Height (Pixels)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full bg-[#1e1e1e] border border-[#444] px-2 py-1 text-white text-[11px] rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#888] block mb-1">Resolution (DPI)</label>
                    <input
                      type="number"
                      value={resolution}
                      onChange={(e) => setResolution(Number(e.target.value))}
                      className="w-full bg-[#1e1e1e] border border-[#444] px-2 py-1 text-white text-[11px] rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#888] block mb-1">Frame Range</label>
                    <select
                      value={frameRange}
                      onChange={(e) => setFrameRange(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-[#444] px-2 py-1 text-white text-[11px] rounded"
                    >
                      <option value="Current Frame (0)">Current Frame (0)</option>
                      <option value="All Frames (0 to 90)">All Frames (0 to 90)</option>
                      <option value="Manual Preview (0 to 45)">Manual Preview (0 to 45)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#222] p-2.5 rounded border border-[#333] text-[10px] text-[#aaa] space-y-1">
                  <div className="text-[#e88724] font-semibold">Aspect Ratio: 16:9 Cinema Scope</div>
                  <div>Pixel Aspect: 1.0 (Square) | Frame Rate: 30 FPS</div>
                </div>
              </div>
            )}

            {activeCategory !== 'Output' && (
              <div className="space-y-3">
                <div className="text-[12px] font-bold text-white border-b border-[#3a3a3a] pb-1">
                  {activeCategory} Parameters
                </div>
                <div className="text-[11px] text-[#999] leading-relaxed">
                  Sub-surface photon scattering, ray bounce depth (Diffuse: 4, Specular: 6), and irradiance cache preset configured for underground rock strata and metallic rail tracks.
                </div>
                <div className="p-3 bg-[#202020] rounded border border-[#383838] text-[10px] space-y-1">
                  <div className="text-white font-medium">Sampling Quality: Best (Adaptive 16x)</div>
                  <div className="text-[#777]">Volumetric shadow map resolution: 2048 x 2048</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-[36px] bg-[#222] border-t border-[#1a1a1a] px-3 flex items-center justify-end space-x-2 select-none">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#3a3a3a] hover:bg-[#484848] text-white rounded-[2px]"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onApplyAndRender?.();
            }}
            className="px-4 py-1 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px]"
          >
            Render to Picture Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
