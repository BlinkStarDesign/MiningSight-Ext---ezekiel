import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check, Sparkles, Layers, Box } from 'lucide-react';
import { ProceduralTunnelParams } from '../../types/tunnelScene';
import { TUNNEL_PRESETS } from '../../scene/tunnelPresetRegistry';

interface SceneParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: ProceduralTunnelParams;
  onApplyParams: (newParams: ProceduralTunnelParams) => void;
}

export const SceneParametersModal: React.FC<SceneParametersModalProps> = ({
  isOpen,
  onClose,
  params,
  onApplyParams,
}) => {
  const [localParams, setLocalParams] = useState<ProceduralTunnelParams>({ ...params });

  if (!isOpen) return null;

  const handleChange = <K extends keyof ProceduralTunnelParams>(key: K, value: ProceduralTunnelParams[K]) => {
    setLocalParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetToPhoto = () => {
    setLocalParams({ ...TUNNEL_PRESETS.rugged_timbered_photo.defaultParams });
  };

  const handleApply = () => {
    onApplyParams(localParams);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3">
      <div className="bg-[#242424] border-2 border-[#181818] shadow-2xl rounded-[3px] w-[640px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden text-[#d0d0d0] font-sans text-[11px]">
        {/* Title Bar */}
        <div className="h-[30px] bg-[#1c1c1c] border-b border-[#141414] px-3 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-[#e88724]" />
            <span className="font-semibold text-white">
              Procedural 3D Tunnel Parameters (Interactive Scene Tuning)
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#c0392b] rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sliders Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Section: Timber Framing */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] p-3 rounded space-y-3">
            <div className="font-bold text-[#e88724] flex items-center space-x-1.5 border-b border-[#2d2d2d] pb-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Timber Support Sets (Square Set System)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[10.5px] text-[#aaa] mb-1">
                  <span>Timber Sets Count:</span>
                  <span className="font-mono text-[#e88724]">{localParams.timberSetCount} frames</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={localParams.timberSetCount}
                  onChange={(e) => handleChange('timberSetCount', parseInt(e.target.value, 10))}
                  className="w-full accent-[#e88724] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10.5px] text-[#aaa] mb-1">
                  <span>Frame Spacing:</span>
                  <span className="font-mono text-[#e88724]">{localParams.timberSpacing.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="7.5"
                  step="0.2"
                  value={localParams.timberSpacing}
                  onChange={(e) => handleChange('timberSpacing', parseFloat(e.target.value))}
                  className="w-full accent-[#e88724] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10.5px] text-[#aaa] mb-1">
                  <span>Post Inward Batter Angle:</span>
                  <span className="font-mono text-[#e88724]">{localParams.postBatterAngleDeg.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={localParams.postBatterAngleDeg}
                  onChange={(e) => handleChange('postBatterAngleDeg', parseFloat(e.target.value))}
                  className="w-full accent-[#e88724] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10.5px] text-[#aaa] mb-1">
                  <span>Side Lagging Planks Tiers:</span>
                  <span className="font-mono text-[#e88724]">{localParams.laggingPlankTiers} tiers</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={localParams.laggingPlankTiers}
                  onChange={(e) => handleChange('laggingPlankTiers', parseInt(e.target.value, 10))}
                  className="w-full accent-[#e88724] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-1">
              <label className="flex items-center space-x-2 text-[10.5px] text-[#ccc] cursor-pointer">
                <input
                  type="checkbox"
                  checked={localParams.includeRoofLagging}
                  onChange={(e) => handleChange('includeRoofLagging', e.target.checked)}
                  className="accent-[#e88724]"
                />
                <span>Roof Lagging Planks</span>
              </label>

              <label className="flex items-center space-x-2 text-[10.5px] text-[#ccc] cursor-pointer">
                <input
                  type="checkbox"
                  checked={localParams.includeTopStringers}
                  onChange={(e) => handleChange('includeTopStringers', e.target.checked)}
                  className="accent-[#e88724]"
                />
                <span>Top Longitudinal Stringers</span>
              </label>
            </div>
          </div>

          {/* Section: Cavern & Heading */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] p-3 rounded space-y-3">
            <div className="font-bold text-[#e88724] flex items-center space-x-1.5 border-b border-[#2d2d2d] pb-1.5">
              <Box className="w-3.5 h-3.5" />
              <span>Cavern Bore & Unlined Adit Heading</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[10.5px] text-[#aaa] mb-1">
                  <span>Unlined Adit Bore Length:</span>
                  <span className="font-mono text-[#e88724]">{localParams.unlinedAditLength.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="28"
                  step="1"
                  value={localParams.unlinedAditLength}
                  onChange={(e) => handleChange('unlinedAditLength', parseFloat(e.target.value))}
                  className="w-full accent-[#e88724] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10.5px] text-[#aaa] mb-1">
                  <span>Rock Strata Palette:</span>
                  <span className="font-mono text-[#e88724]">{localParams.rockColorPalette}</span>
                </div>
                <select
                  value={localParams.rockColorPalette}
                  onChange={(e) => handleChange('rockColorPalette', e.target.value as any)}
                  className="w-full bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-[11px] text-[#eee]"
                >
                  <option value="ochre_quartzite">Ochre Quartzite (Photo Reference)</option>
                  <option value="cavern_granite">Cavern Granite (Dark Grey)</option>
                  <option value="ironstone_red">Ironstone Hematite (Rusty Red)</option>
                  <option value="pyrite_gold">Auriferous Pyrite (Golden Flecks)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Floor & Infrastructure */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] p-3 rounded space-y-3">
            <div className="font-bold text-[#e88724] flex items-center space-x-1.5 border-b border-[#2d2d2d] pb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Floor & Mining Infrastructure</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[10.5px] text-[#aaa] mb-1">
                  <span>Drift Floor Rubble Count:</span>
                  <span className="font-mono text-[#e88724]">{localParams.rubbleCount} stones</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={localParams.rubbleCount}
                  onChange={(e) => handleChange('rubbleCount', parseInt(e.target.value, 10))}
                  className="w-full accent-[#e88724] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10.5px] text-[#aaa] mb-1">
                  <span>Survey Headlamp Intensity:</span>
                  <span className="font-mono text-[#e88724]">{localParams.headlampIntensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.5"
                  value={localParams.headlampIntensity}
                  onChange={(e) => handleChange('headlampIntensity', parseFloat(e.target.value))}
                  className="w-full accent-[#e88724] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6 pt-1">
              <label className="flex items-center space-x-2 text-[10.5px] text-[#ccc] cursor-pointer">
                <input
                  type="checkbox"
                  checked={localParams.includeRailwayTracks}
                  onChange={(e) => handleChange('includeRailwayTracks', e.target.checked)}
                  className="accent-[#e88724]"
                />
                <span>Include Railway Tracks</span>
              </label>

              <label className="flex items-center space-x-2 text-[10.5px] text-[#ccc] cursor-pointer">
                <input
                  type="checkbox"
                  checked={localParams.includeOreCart}
                  onChange={(e) => handleChange('includeOreCart', e.target.checked)}
                  className="accent-[#e88724]"
                />
                <span>Include Rolling Ore Cart</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-[44px] bg-[#1c1c1c] border-t border-[#181818] px-3 flex items-center justify-between">
          <button
            onClick={handleResetToPhoto}
            className="px-2.5 py-1 bg-[#2e2e2e] hover:bg-[#3e3e3e] text-[#ccc] rounded-[2px] border border-[#3e3e3e] flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#e88724]" />
            <span>Reset to Photo Reference</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#2e2e2e] hover:bg-[#3e3e3e] text-[#aaa] hover:text-white rounded-[2px] border border-[#3e3e3e] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px] flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to 3D Viewport</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
