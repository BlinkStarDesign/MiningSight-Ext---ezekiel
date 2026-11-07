import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { TimelineState } from '../../types/c4d';

interface TimelineProps {
  timeline: TimelineState;
  onScrub: (frame: number) => void;
  onTogglePlay: () => void;
  onStepFrame: (delta: number) => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  keyframeFrames?: number[];
  onRecordKeyframe?: () => void;
  tourName?: string;
  isTourPlaybackEnabled?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  timeline,
  onScrub,
  onTogglePlay,
  onStepFrame,
  onGoToStart,
  onGoToEnd,
  keyframeFrames = [],
  onRecordKeyframe,
  tourName,
  isTourPlaybackEnabled = false,
}) => {
  const { currentFrame, minFrame, previewMaxFrame } = timeline;
  const totalFrames = previewMaxFrame - minFrame;

  // Frame tick markers (every 5 frames numbered, ticks every 1 frame)
  const frameMarks: number[] = [];
  for (let f = minFrame; f <= previewMaxFrame; f += 5) {
    frameMarks.push(f);
  }

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetFrame = Math.round(minFrame + ratio * totalFrames);
    onScrub(targetFrame);
  };

  return (
    <div className="w-full h-[64px] bg-[#363636] border-t border-[#222] border-b border-[#1c1c1c] flex flex-col select-none text-[11px] text-[#cfcfcf]">
      {/* Upper strip: Frame Ruler & Scrubber */}
      <div
        onClick={handleRulerClick}
        className="relative w-full h-[32px] bg-[#2d2d2d] border-b border-[#202020] cursor-pointer overflow-hidden"
      >
        {/* Frame Number Labels & Ticks */}
        <div className="absolute inset-0 flex justify-between px-3 text-[10px] text-[#8e8e8e] font-mono pointer-events-none">
          {frameMarks.map((f) => (
            <div key={f} className="flex flex-col items-center">
              <span className="leading-tight">{f}</span>
              <div className="w-[1px] h-2.5 bg-[#4a4a4a] mt-0.5" />
            </div>
          ))}
        </div>

        {/* Keyframe Diamond Badges along Ruler */}
        {keyframeFrames.map((kfFrame, idx) => {
          const leftPercent = ((kfFrame - minFrame) / totalFrames) * 98 + 1;
          return (
            <div
              key={idx}
              title={`Keyframe Waypoint #${idx + 1} at Frame ${kfFrame}`}
              className="absolute top-2 w-2 h-2 -ml-1 bg-[#e88724] rotate-45 border border-black z-10 pointer-events-none shadow"
              style={{ left: `${leftPercent}%` }}
            />
          );
        })}

        {/* Current Playhead Scrubber */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none transition-all duration-75 z-20"
          style={{
            left: `${((currentFrame - minFrame) / totalFrames) * 98 + 1}%`,
          }}
        >
          {/* Green playhead handle */}
          <div className="w-3.5 h-3.5 -ml-[7px] bg-[#22c55e] border border-[#15803d] rounded-[1px] flex items-center justify-center text-[8px] text-black font-bold shadow-md">
            {currentFrame}
          </div>
          {/* Scrubber vertical line */}
          <div className="w-[2px] -ml-[1px] h-full bg-[#22c55e] opacity-80" />
        </div>
      </div>

      {/* Lower strip: Frame inputs, transport controls, and keying filters */}
      <div className="h-[32px] bg-[#383838] flex items-center justify-between px-2 text-[#ccc]">
        {/* Left: Frame ranges & current frame display */}
        <div className="flex items-center space-x-1.5">
          {/* Current Frame Indicator */}
          <div className="flex items-center space-x-1 bg-[#222] px-1.5 py-0.5 rounded-[2px] border border-[#444]">
            <span className="font-mono text-[#4ade80] font-bold text-[11px]">
              {currentFrame} F
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[#888] text-[10px]">
            <span>{minFrame} F</span>
            <span>▶</span>
            <span>{previewMaxFrame} F</span>
          </div>

          {tourName && isTourPlaybackEnabled && (
            <span className="hidden md:inline-block px-1.5 py-0.5 bg-[#252525] text-[#e88724] border border-[#3a3a3a] rounded-[2px] text-[9.5px] font-mono truncate max-w-[160px]">
              Tour: {tourName}
            </span>
          )}
        </div>

        {/* Center: Transport Playback Controls */}
        <div className="flex items-center space-x-0.5 bg-[#2d2d2d] p-0.5 rounded-[2px] border border-[#202020]">
          {/* Jump to start */}
          <button
            onClick={onGoToStart}
            title="Go to Start Frame (Shift+G)"
            className="w-6 h-5 flex items-center justify-center hover:bg-[#444] rounded-[1px] text-[#bbb] cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Step backward */}
          <button
            onClick={() => onStepFrame(-1)}
            title="Previous Frame (Ctrl+F)"
            className="w-6 h-5 flex items-center justify-center hover:bg-[#444] rounded-[1px] text-[#bbb] cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause Toggle (F8) */}
          <button
            onClick={onTogglePlay}
            title={timeline.isPlaying ? 'Pause Animation (F8 / Space)' : 'Play Animation (F8 / Space)'}
            className={`px-2 h-5 flex items-center justify-center rounded-[1px] font-bold cursor-pointer transition-colors text-[10.5px] space-x-1 ${
              timeline.isPlaying
                ? 'bg-[#e88724] text-black shadow-sm'
                : 'bg-[#404040] hover:bg-[#505050] text-[#e88724]'
            }`}
          >
            {timeline.isPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Play (F8)</span>
              </>
            )}
          </button>

          {/* Step forward */}
          <button
            onClick={() => onStepFrame(1)}
            title="Next Frame (Ctrl+G)"
            className="w-6 h-5 flex items-center justify-center hover:bg-[#444] rounded-[1px] text-[#bbb] cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Jump to end */}
          <button
            onClick={onGoToEnd}
            title="Go to End Frame (Shift+H)"
            className="w-6 h-5 flex items-center justify-center hover:bg-[#444] rounded-[1px] text-[#bbb] cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Record Keyframe (K), Auto-key, and Filters */}
        <div className="flex items-center space-x-1">
          {/* Record Keyframe */}
          <button
            onClick={onRecordKeyframe}
            title="Record Current Viewpoint as Keyframe (K / F9)"
            className="px-2 h-5 bg-[#3a3a3a] hover:bg-[#e88724] hover:text-black text-[#f87171] border border-[#222] rounded-[1px] flex items-center justify-center font-bold text-[10px] cursor-pointer transition-colors space-x-1"
          >
            <span>K</span>
            <span className="hidden sm:inline">Record</span>
          </button>

          {/* Keyframe parameter filters: Position, Scale, Rotation */}
          <div className="flex items-center space-x-0.5 bg-[#2b2b2b] p-0.5 rounded-[1px] border border-[#222]">
            <span
              title="Record Position"
              className="w-4 h-4 rounded-[1px] bg-[#e88724] text-black font-bold text-[9px] flex items-center justify-center cursor-pointer"
            >
              P
            </span>
            <span
              title="Record Scale"
              className="w-4 h-4 rounded-[1px] bg-[#e88724] text-black font-bold text-[9px] flex items-center justify-center cursor-pointer"
            >
              S
            </span>
            <span
              title="Record Rotation"
              className="w-4 h-4 rounded-[1px] bg-[#e88724] text-black font-bold text-[9px] flex items-center justify-center cursor-pointer"
            >
              R
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
