import React, { useState } from 'react';
import {
  Video,
  Camera,
  Eye,
  RefreshCw,
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Plus,
  X,
} from 'lucide-react';
import { CameraKeyframe, CameraTour } from '../../types/cameraTour';

interface CameraTourManagerProps {
  tours: CameraTour[];
  activeTourId: string | null;
  onSelectTour: (tourId: string) => void;
  onAddTour: (name: string, description: string) => void;
  onUpdateTour: (tour: CameraTour) => void;
  onDeleteTour: (tourId: string) => void;
  onAddKeyframeFromCurrent: (name?: string, frame?: number) => void;
  onUpdateKeyframeFromCurrent: (keyframeId: string) => void;
  onDeleteKeyframe: (keyframeId: string) => void;
  onReorderKeyframe: (keyframeId: string, direction: 'up' | 'down') => void;
  onJumpToKeyframe: (keyframe: CameraKeyframe) => void;
  isTourPlaybackEnabled: boolean;
  onToggleTourPlayback: (enabled: boolean) => void;
  currentFrame: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const CameraTourManager: React.FC<CameraTourManagerProps> = ({
  tours,
  activeTourId,
  onSelectTour,
  onAddTour,
  onUpdateTour,
  onDeleteTour,
  onAddKeyframeFromCurrent,
  onUpdateKeyframeFromCurrent,
  onDeleteKeyframe,
  onReorderKeyframe,
  onJumpToKeyframe,
  isTourPlaybackEnabled,
  onToggleTourPlayback,
  currentFrame,
  isPlaying,
  onTogglePlay,
}) => {
  const [showNewTourModal, setShowNewTourModal] = useState(false);
  const [newTourName, setNewTourName] = useState('');
  const [newTourDesc, setNewTourDesc] = useState('');
  const [editingKeyframeId, setEditingKeyframeId] = useState<string | null>(null);
  const [editKeyframeName, setEditKeyframeName] = useState('');
  const [editKeyframeFrame, setEditKeyframeFrame] = useState(0);

  const activeTour = tours.find((t) => t.id === activeTourId) || tours[0];

  const handleCreateTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourName.trim()) return;
    onAddTour(newTourName.trim(), newTourDesc.trim() || 'Custom recorded camera inspection path.');
    setNewTourName('');
    setNewTourDesc('');
    setShowNewTourModal(false);
  };

  const handleStartEditKeyframe = (kf: CameraKeyframe) => {
    setEditingKeyframeId(kf.id);
    setEditKeyframeName(kf.name);
    setEditKeyframeFrame(kf.frame);
  };

  const handleSaveEditKeyframe = () => {
    if (!activeTour || !editingKeyframeId) return;
    const updatedKeyframes = activeTour.keyframes.map((k) =>
      k.id === editingKeyframeId
        ? { ...k, name: editKeyframeName.trim() || k.name, frame: Math.max(0, editKeyframeFrame) }
        : k
    );
    // Keep sorted by frame
    updatedKeyframes.sort((a, b) => a.frame - b.frame);
    onUpdateTour({ ...activeTour, keyframes: updatedKeyframes });
    setEditingKeyframeId(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#2f2f2f] text-[#cfcfcf] text-[11px] select-none font-sans overflow-hidden border-l border-[#222]">
      {/* Header Bar */}
      <div className="h-7 bg-[#383838] border-b border-[#222] px-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <Video className="w-3.5 h-3.5 text-[#e88724] flex-shrink-0" />
          <span className="font-bold text-[#f5f5f5] truncate">Camera Tours & Keyframe Path</span>
        </div>
        <button
          onClick={() => setShowNewTourModal(true)}
          className="px-2 py-0.5 bg-[#404040] hover:bg-[#e88724] hover:text-black text-[#f0f0f0] rounded-[2px] border border-[#555] text-[10px] font-bold cursor-pointer transition-colors flex items-center space-x-1 flex-shrink-0"
          title="Create a new camera animation path"
        >
          <Plus className="w-3 h-3" />
          <span>New Tour</span>
        </button>
      </div>

      {/* Tour Selection and Playback Bar */}
      <div className="p-2 bg-[#333333] border-b border-[#262626] space-y-1.5 flex-shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <label className="text-[10px] text-[#999] font-medium whitespace-nowrap">Active Tour:</label>
          <select
            value={activeTour?.id || ''}
            onChange={(e) => onSelectTour(e.target.value)}
            className="flex-1 min-w-0 bg-[#222] border border-[#444] text-[#f0f0f0] text-[10.5px] rounded-[2px] px-1.5 py-0.5 focus:border-[#e88724] focus:outline-none"
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.keyframes.length} pts)
              </option>
            ))}
          </select>
          {activeTour && !activeTour.isBuiltIn && (
            <button
              onClick={() => {
                if (window.confirm(`Delete camera tour "${activeTour.name}"?`)) {
                  onDeleteTour(activeTour.id);
                }
              }}
              title="Delete this custom tour"
              className="p-1 bg-[#442222] hover:bg-[#aa2222] text-[#ff8888] rounded-[2px] border border-[#662222] text-[10px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Playback & Auto-Follow Toggle */}
        <div className="flex items-center justify-between bg-[#282828] p-1.5 rounded-[2px] border border-[#202020]">
          <div className="flex items-center space-x-1.5 min-w-0">
            <input
              type="checkbox"
              id="enableTourPlayback"
              checked={isTourPlaybackEnabled}
              onChange={(e) => onToggleTourPlayback(e.target.checked)}
              className="accent-[#e88724] cursor-pointer flex-shrink-0"
            />
            <label
              htmlFor="enableTourPlayback"
              className="text-[10.5px] font-medium cursor-pointer text-[#e0e0e0] flex items-center gap-1 truncate"
            >
              <span className="truncate">Follow on Play</span>
              <span className="text-[9px] text-[#e88724] font-mono flex-shrink-0">(F8)</span>
            </label>
          </div>

          <button
            onClick={onTogglePlay}
            className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors flex-shrink-0 ${
              isPlaying
                ? 'bg-[#e88724] text-black shadow-sm'
                : 'bg-[#404040] hover:bg-[#505050] text-[#e88724]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Play (F8)</span>
              </>
            )}
          </button>
        </div>

        {/* Add Keyframe from Current View */}
        <button
          onClick={() => onAddKeyframeFromCurrent()}
          className="w-full py-1 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px] text-[11px] cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm active:translate-y-px transition-colors"
          title="Record current 3D camera position, angle, and target into this animation"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>+ Record Current View as Keyframe (K)</span>
        </button>
      </div>

      {/* Keyframe List Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-[#888] uppercase tracking-wider px-1">
          <span>Path Keyframes ({activeTour?.keyframes.length || 0})</span>
          <span>Frame : 0 - {activeTour?.durationFrames || 90}</span>
        </div>

        {(!activeTour || activeTour.keyframes.length === 0) && (
          <div className="p-4 text-center text-[#888] bg-[#292929] rounded-[2px] border border-[#222] space-y-1">
            <p>No keyframes in this tour yet.</p>
            <p className="text-[10px] text-[#666]">
              Navigate in the 3D model (or walk in Walk Mode) and click &quot;Record Current View&quot; above to capture viewpoints.
            </p>
          </div>
        )}

        {activeTour?.keyframes.map((kf, idx) => {
          const isEditing = editingKeyframeId === kf.id;
          const isAtCurrentFrame = Math.abs(currentFrame - kf.frame) <= 2;

          return (
            <div
              key={kf.id}
              className={`p-1.5 rounded-[2px] border transition-colors ${
                isAtCurrentFrame
                  ? 'bg-[#3a4452] border-[#4ea3e8]'
                  : 'bg-[#363636] hover:bg-[#3d3d3d] border-[#252525]'
              }`}
            >
              {isEditing ? (
                <div className="space-y-1.5 bg-[#252525] p-2 rounded-[2px]">
                  <div className="flex items-center space-x-1.5">
                    <label className="w-12 text-[10px] text-[#999]">Name:</label>
                    <input
                      type="text"
                      value={editKeyframeName}
                      onChange={(e) => setEditKeyframeName(e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border border-[#444] text-white px-1.5 py-0.5 rounded-[2px] text-[10px]"
                    />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <label className="w-12 text-[10px] text-[#999]">Frame:</label>
                    <input
                      type="number"
                      min={0}
                      max={activeTour.durationFrames}
                      value={editKeyframeFrame}
                      onChange={(e) => setEditKeyframeFrame(parseInt(e.target.value, 10) || 0)}
                      className="w-16 bg-[#1a1a1a] border border-[#444] text-white px-1.5 py-0.5 rounded-[2px] text-[10px]"
                    />
                    <button
                      onClick={handleSaveEditKeyframe}
                      className="px-2 py-0.5 bg-[#e88724] text-black font-bold rounded-[2px] text-[10px]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingKeyframeId(null)}
                      className="px-2 py-0.5 bg-[#444] text-[#ccc] rounded-[2px] text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1.5">
                  {/* Left: Index badge, Name, and Frame Tag */}
                  <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                    <span className="w-4 h-4 rounded-full bg-[#242424] text-[#e88724] font-mono font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[#f0f0f0] truncate">{kf.name}</div>
                      <div className="text-[9.5px] text-[#999] font-mono flex items-center space-x-2">
                        <span className="text-[#4ade80]">F: {kf.frame}</span>
                        <span>
                          Pos: ({kf.position.x.toFixed(1)}, {kf.position.y.toFixed(1)}, {kf.position.z.toFixed(1)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Jump, Re-record, Edit, Reorder, Delete */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => onJumpToKeyframe(kf)}
                      title="Jump camera to this recorded viewpoint"
                      className="px-1.5 py-0.5 bg-[#444] hover:bg-[#555] text-white rounded-[2px] text-[10px] cursor-pointer flex items-center space-x-0.5"
                    >
                      <Eye className="w-3 h-3 text-[#4ea3e8]" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onUpdateKeyframeFromCurrent(kf.id)}
                      title="Update this keyframe to match current camera viewpoint"
                      className="px-1.5 py-0.5 bg-[#3a3a3a] hover:bg-[#e88724] hover:text-black text-[#bbb] rounded-[2px] text-[10px] cursor-pointer flex items-center space-x-0.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Set</span>
                    </button>
                    <button
                      onClick={() => handleStartEditKeyframe(kf)}
                      title="Edit keyframe name or frame number"
                      className="p-1 hover:text-[#e88724] text-[#888] cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      disabled={idx === 0}
                      onClick={() => onReorderKeyframe(kf.id, 'up')}
                      title="Move earlier"
                      className={`p-0.5 ${
                        idx === 0 ? 'text-[#555] cursor-not-allowed' : 'text-[#aaa] hover:text-white cursor-pointer'
                      }`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === activeTour.keyframes.length - 1}
                      onClick={() => onReorderKeyframe(kf.id, 'down')}
                      title="Move later"
                      className={`p-0.5 ${
                        idx === activeTour.keyframes.length - 1
                          ? 'text-[#555] cursor-not-allowed'
                          : 'text-[#aaa] hover:text-white cursor-pointer'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteKeyframe(kf.id)}
                      title="Delete keyframe"
                      className="p-1 hover:text-[#f87171] text-[#777] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Tour Modal Dialog */}
      {showNewTourModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTour}
            className="w-full max-w-sm bg-[#333] border border-[#555] rounded-[3px] p-3 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#444] pb-2">
              <span className="font-bold text-[#f5f5f5] text-[12px]">Create New Camera Tour</span>
              <button
                type="button"
                onClick={() => setShowNewTourModal(false)}
                className="text-[#888] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] text-[#bbb]">Tour Title:</label>
              <input
                type="text"
                required
                placeholder="e.g. South Drift Vein Walkthrough"
                value={newTourName}
                onChange={(e) => setNewTourName(e.target.value)}
                className="w-full bg-[#202020] border border-[#444] text-white px-2 py-1 rounded-[2px] text-[11px] focus:border-[#e88724] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] text-[#bbb]">Description / Purpose:</label>
              <textarea
                placeholder="Brief notes on route or geotechnical inspection..."
                value={newTourDesc}
                onChange={(e) => setNewTourDesc(e.target.value)}
                rows={2}
                className="w-full bg-[#202020] border border-[#444] text-white px-2 py-1 rounded-[2px] text-[11px] focus:border-[#e88724] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1 border-t border-[#444]">
              <button
                type="button"
                onClick={() => setShowNewTourModal(false)}
                className="px-2.5 py-1 bg-[#444] hover:bg-[#555] text-[#ccc] rounded-[2px] text-[11px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px] text-[11px]"
              >
                Create Tour
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
