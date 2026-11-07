import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface PictureViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFrame?: number;
}

export const PictureViewerModal: React.FC<PictureViewerModalProps> = ({
  isOpen,
  onClose,
  currentFrame = 0,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [channelMode, setChannelMode] = useState<'RGB' | 'Red' | 'Green' | 'Blue' | 'Alpha'>('RGB');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#292929] border-2 border-[#151515] shadow-2xl rounded-[3px] w-[920px] max-w-[95vw] h-[640px] max-h-[90vh] flex flex-col overflow-hidden text-[#d0d0d0] font-sans text-[11px]">
        {/* Title Bar */}
        <div className="h-[28px] bg-[#202020] border-b border-[#181818] px-3 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e88724]"></span>
            <span className="font-semibold text-[#f0f0f0]">
              Cinema 4D R19.068 - Picture Viewer [Mining_Site_Tunnel.c4d - Frame {String(currentFrame).padStart(4, '0')}]
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#c0392b] rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toolbar Bar */}
        <div className="h-[32px] bg-[#333333] border-b border-[#222] px-2 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 border-r border-[#444] pr-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                className="px-2 py-0.5 bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#ddd] border border-[#2b2b2b] rounded-[2px]"
              >
                -
              </button>
              <span className="w-12 text-center text-[10.5px] font-mono text-[#e88724]">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(400, z + 25))}
                className="px-2 py-0.5 bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#ddd] border border-[#2b2b2b] rounded-[2px]"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-0.5 bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#ddd] border border-[#2b2b2b] rounded-[2px] text-[10px]"
              >
                1:1
              </button>
            </div>

            {/* Channels */}
            <div className="flex items-center space-x-1">
              <span className="text-[#888] text-[10px]">Channel:</span>
              {(['RGB', 'Red', 'Green', 'Blue', 'Alpha'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelMode(ch)}
                  className={`px-2 py-0.5 rounded-[2px] text-[10px] ${
                    channelMode === ch
                      ? 'bg-[#e88724] text-black font-bold'
                      : 'bg-[#3a3a3a] text-[#aaa] hover:text-white'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-[#999]">
            <span>Filter: Default</span>
            <span>•</span>
            <span>Color Profile: sRGB IEC61966-2.1</span>
          </div>
        </div>

        {/* Viewport Render Canvas Area */}
        <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-4 overflow-auto relative">
          <div
            className="relative bg-[#252525] border border-[#444] shadow-2xl transition-transform"
            style={{
              width: `${(683 * zoomLevel) / 100}px`,
              height: `${(352 * zoomLevel) / 100}px`,
            }}
          >
            {/* Visual simulation of the photorealistic rendering */}
            <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#181c20] via-[#242b30] to-[#121416] flex flex-col items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_40%,rgba(255,170,50,0.35)_0%,rgba(0,0,0,0.85)_80%)]"></div>
              
              {/* Architectural tunnel arch silhouettes */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-2 p-6">
                <div className="w-16 h-16 rounded-full border-2 border-[#e88724]/70 flex items-center justify-center bg-black/40 shadow-inner">
                  <Sparkles className="w-6 h-6 text-[#e88724]" />
                </div>
                <div className="text-[14px] font-bold text-white tracking-wide">
                  MINING SITE: DRIFT ADIT #04 SUB-SURFACE EXTRACTION
                </div>
                <div className="text-[11px] text-[#ffc579] font-mono">
                  Physical Render Passed | 1366 x 705 | Antialiasing Best | AO + GI Enabled
                </div>
                <div className="text-[10px] text-[#888] max-w-md">
                  Volumetric rock strata, structural timber arch set, dual 30lb rail tracks, and automated haulage ore cart rendered with spectral photon tracing.
                </div>
              </div>

              {/* Watermark overlay */}
              <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[#e88724]/80 bg-black/60 px-2 py-0.5 rounded">
                Cinema 4D R19.068 Physical Render | Frame: {currentFrame}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-[24px] bg-[#242424] border-t border-[#1a1a1a] px-3 flex items-center justify-between text-[10px] text-[#888] select-none">
          <div className="flex items-center space-x-3">
            <span>Size: 1366 x 705 (1:1)</span>
            <span>•</span>
            <span>32 Bit / Channel</span>
            <span>•</span>
            <span className="text-[#4ade80]">Render Time: 00:00:02.84</span>
          </div>
          <div>
            <span>RAM: 142.8 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
