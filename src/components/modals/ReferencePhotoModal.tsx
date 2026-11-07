import React, { useState } from 'react';
import { X, Eye, Sparkles, Check, Sliders, Info, ExternalLink, ArrowRight } from 'lucide-react';
import { ProceduralTunnelParams } from '../../types/tunnelScene';

interface ReferencePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: () => void;
  onAlignCameraToPhoto?: () => void;
  onOpenSceneOptions?: () => void;
  currentParams?: ProceduralTunnelParams;
}

export const ReferencePhotoModal: React.FC<ReferencePhotoModalProps> = ({
  isOpen,
  onClose,
  onApplyPreset,
  onAlignCameraToPhoto,
  onOpenSceneOptions,
  currentParams,
}) => {
  const [activeCallout, setActiveCallout] = useState<number | null>(null);

  if (!isOpen) return null;

  const callouts = [
    {
      id: 1,
      title: 'Inward-Battered Square Timber Posts',
      x: '15%',
      y: '48%',
      description: 'Heavy rough-sawn square timber posts (0.38m × 0.38m) set at a 5.5° inward incline (batter angle) to withstand lateral compressive ground pressure.',
      paramTag: 'postBatterAngleDeg: 5.5°, timberWidth: 0.38m',
    },
    {
      id: 2,
      title: '4-Tier Horizontal Side Lagging Planks',
      x: '78%',
      y: '46%',
      description: 'Exactly 4 horizontal retention boards running between consecutive posts along both drift walls, shielding miners from fractured wall rock while leaving ventilation gaps.',
      paramTag: 'laggingPlankTiers: 4, laggingGap: 0.14m',
    },
    {
      id: 3,
      title: 'Top Cap Beams & Longitudinal Stringers',
      x: '52%',
      y: '18%',
      description: 'Horizontal collar timbers resting across the post heads, reinforced by longitudinal stringer beams running along ceiling corners to tie the frames together.',
      paramTag: 'includeTopStringers: true, spanWidth: 4.6m',
    },
    {
      id: 4,
      title: 'Earthen Floor with Loose Rubble Debris',
      x: '50%',
      y: '88%',
      description: 'Packed sandy dirt drift footpath with natural gentle hollows, scattered chiseled quartzite rock fragments, and mineral pebbles from excavation.',
      paramTag: 'floorType: "packed_earth", rubbleCount: 38',
    },
    {
      id: 5,
      title: 'Unlined Raw Rock Adit Heading Bore',
      x: '46%',
      y: '44%',
      description: 'At the end of the timbered square sets, the shoring terminates into a natural, curved unlined rock cavern heading that recedes into deep atmospheric darkness.',
      paramTag: 'unlinedAditLength: 16.0m, aditBoreRadius: 2.3m',
    },
    {
      id: 6,
      title: 'Directional Headlamp & Deep Shadow Falloff',
      x: '28%',
      y: '72%',
      description: 'Warm tungsten/miner lamp illumination casting authentic high-contrast shadows across the timber fibers and receding into a dark tunnel vanishing point.',
      paramTag: 'headlampIntensity: 3.5, fogDensity: 0.012',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
      <div className="bg-[#242424] border-2 border-[#181818] shadow-2xl rounded-[3px] w-[1020px] max-w-[96vw] h-[720px] max-h-[92vh] flex flex-col overflow-hidden text-[#d5d5d5] font-sans text-[11px]">
        {/* Title Bar */}
        <div className="h-[30px] bg-[#1c1c1c] border-b border-[#141414] px-3 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e88724]"></span>
            <span className="font-semibold text-[#f5f5f5]">
              AI Survey Reference Image Analysis — [Rugged_Timbered_Mine_Tunnel_53b5c504.png]
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-[#999] hover:text-white hover:bg-[#c0392b] rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Header */}
        <div className="h-[38px] bg-[#2d2d2d] border-b border-[#1f1f1f] px-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-[#888]">Source File:</span>
            <span className="text-[#e88724] font-mono bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#3a3a3a]">
              /assets/aistudio/Rugged_Timbered_Mine_Tunnel_53b5c504.png
            </span>
            <span className="text-[#666]">|</span>
            <span className="text-[#aaa]">Status: 3D Procedural Rig Synthesized & Active</span>
          </div>

          <div className="flex items-center space-x-2">
            {onAlignCameraToPhoto && (
              <button
                onClick={() => {
                  onAlignCameraToPhoto();
                  onClose();
                }}
                className="px-2.5 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-[2px] border border-[#505050] flex items-center space-x-1 cursor-pointer transition-colors"
                title="Align the 3D viewport camera to the exact perspective of this photograph"
              >
                <Eye className="w-3.5 h-3.5 text-[#e88724]" />
                <span>Align View to Photo Angle</span>
              </button>
            )}

            <button
              onClick={() => {
                onApplyPreset();
                onClose();
              }}
              className="px-3 py-1 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px] flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Load This 3D Model in Viewport</span>
            </button>
          </div>
        </div>

        {/* Main Content Area (Image with Interactive Annotation Pins on Left, Structural Specs on Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Annotated Reference Photo */}
          <div className="flex-1 bg-[#151515] p-3 flex flex-col items-center justify-center relative overflow-hidden border-r border-[#222]">
            <div className="relative max-h-full max-w-full rounded border border-[#333] shadow-2xl overflow-hidden group">
              <img
                src="/assets/aistudio/Rugged_Timbered_Mine_Tunnel_53b5c504.png"
                alt="Rugged Timbered Mine Tunnel Reference"
                className="max-h-[580px] object-contain select-none block"
              />

              {/* Interactive Callout Markers */}
              {callouts.map((c) => {
                const isActive = activeCallout === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCallout(isActive ? null : c.id)}
                    style={{ left: c.x, top: c.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] cursor-pointer transition-transform shadow-lg ${
                      isActive
                        ? 'bg-[#e88724] text-black scale-125 ring-2 ring-white z-20'
                        : 'bg-black/75 text-[#e88724] border border-[#e88724] hover:scale-110 hover:bg-[#e88724] hover:text-black z-10'
                    }`}
                  >
                    {c.id}
                  </button>
                );
              })}

              {/* Floating Active Callout Info Box */}
              {activeCallout && (
                <div className="absolute bottom-3 left-3 right-3 bg-black/90 backdrop-blur-md border border-[#e88724] p-2.5 rounded text-[11px] shadow-xl z-30 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-[#e88724] flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#e88724] text-black flex items-center justify-center text-[9px] font-bold">
                        {activeCallout}
                      </span>
                      <span>{callouts.find((c) => c.id === activeCallout)?.title}</span>
                    </div>
                    <p className="text-[#ccc] text-[10.5px] mt-1">
                      {callouts.find((c) => c.id === activeCallout)?.description}
                    </p>
                    <div className="mt-1 font-mono text-[9.5px] text-[#88bbdd]">
                      Parameter Mapping: {callouts.find((c) => c.id === activeCallout)?.paramTag}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCallout(null)}
                    className="text-[#888] hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-[10px] text-[#777] mt-2 select-none">
              Click numbered markers (1–6) to inspect structural components mapped into 3D procedural geometry.
            </div>
          </div>

          {/* Right: Structural Breakdown & AI Parameters */}
          <div className="w-[380px] bg-[#222] p-3.5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-3">
                <span className="font-bold text-white text-[12px] flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#e88724]" />
                  <span>Procedural Geometry Mapping</span>
                </span>
                <span className="text-[9.5px] font-mono bg-[#181818] px-2 py-0.5 rounded text-[#e88724] border border-[#333]">
                  1:1 Three.js Rig
                </span>
              </div>

              <p className="text-[#aaa] text-[11px] leading-relaxed mb-3">
                This 3D scene is procedurally synthesized from the visual structure of the photograph:
              </p>

              {/* Checklist */}
              <div className="space-y-2 mb-4">
                {callouts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveCallout(c.id)}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      activeCallout === c.id
                        ? 'bg-[#2a2620] border-[#e88724] text-white'
                        : 'bg-[#1e1e1e] border-[#2b2b2b] text-[#bbb] hover:border-[#444]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-[#333] text-[#e88724] font-bold text-[9px] flex items-center justify-center shrink-0">
                        {c.id}
                      </span>
                      <span className="font-semibold text-[11px]">{c.title}</span>
                    </div>
                    <div className="text-[9.5px] font-mono text-[#778899] mt-1 pl-6">
                      {c.paramTag}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Architecture Note */}
              <div className="bg-[#181d22] border border-[#2b3a4a] p-2.5 rounded text-[10.5px] text-[#9ab] space-y-1">
                <div className="font-bold text-[#88bbdd] flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>AI Extensibility Architecture</span>
                </div>
                <p>
                  Any underground photograph or survey image uploaded into MiningSight can be analyzed by Gemini Vision via <code className="text-[#e88724]">/api/ai/reconstruct-scene-from-image</code> to produce this same interactive 3D model with custom sets, lagging, and strata.
                </p>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-[#333] flex items-center justify-between">
              {onOpenSceneOptions && (
                <button
                  onClick={() => {
                    onOpenSceneOptions();
                    onClose();
                  }}
                  className="px-2.5 py-1.5 bg-[#333] hover:bg-[#444] text-[#ddd] rounded-[2px] border border-[#444] flex items-center space-x-1 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#e88724]" />
                  <span>Tune 3D Sliders</span>
                </button>
              )}

              <button
                onClick={() => {
                  onApplyPreset();
                  if (onAlignCameraToPhoto) onAlignCameraToPhoto();
                  onClose();
                }}
                className="px-4 py-1.5 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px] flex items-center space-x-1 cursor-pointer shadow-md"
              >
                <span>Load & Walk in 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
