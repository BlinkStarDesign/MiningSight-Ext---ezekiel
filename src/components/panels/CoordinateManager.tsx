import React, { useEffect, useState } from 'react';
import { C4DSceneObject, CoordinateState, Vector3D } from '../../types/c4d';
import { parseC4DInput } from '../../utils/math3d';

interface CoordinateManagerProps {
  selectedObject: C4DSceneObject | null;
  onApplyCoordinates: (pos: Vector3D, rot: Vector3D, scale: Vector3D) => void;
}

export const CoordinateManager: React.FC<CoordinateManagerProps> = ({
  selectedObject,
  onApplyCoordinates,
}) => {
  const [coordState, setCoordState] = useState<CoordinateState>({
    system: 'world',
    transformType: 'scale',
    pos: { x: 0, y: 0, z: 0 },
    size: { x: 1, y: 1, z: 1 },
    rot: { x: 0, y: 0, z: 0 },
  });

  // Sync with selected object
  useEffect(() => {
    if (selectedObject) {
      setCoordState((prev) => ({
        ...prev,
        pos: { ...selectedObject.position },
        size: { ...selectedObject.scale },
        rot: { ...selectedObject.rotation },
      }));
    }
  }, [selectedObject]);

  const handleApply = () => {
    onApplyCoordinates(coordState.pos, coordState.rot, coordState.size);
  };

  return (
    <div className="w-full h-full bg-[#393939] flex flex-col select-none overflow-hidden text-[11px] text-[#cfcfcf]">
      {/* Header */}
      <div className="h-[22px] bg-[#464646] border-b border-[#282828] flex items-center justify-between px-2">
        <div className="flex items-center space-x-2.5">
          {/* Grip dots */}
          <div className="flex space-x-0.5 opacity-60">
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
          </div>
          <span className="text-[#888]">--</span>
          <span className="text-[#888]">--</span>
          <span className="text-[#888]">--</span>
        </div>
      </div>

      {/* Coordinate Matrix Table */}
      <div className="flex-1 bg-[#323232] p-2 flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-2">
          {/* Column 1: Position */}
          <div className="space-y-1">
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">X</span>
              <input
                type="text"
                value={`${coordState.pos.x} cm`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    pos: { ...coordState.pos, x: parseC4DInput(e.target.value) },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">Y</span>
              <input
                type="text"
                value={`${coordState.pos.y} cm`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    pos: { ...coordState.pos, y: parseC4DInput(e.target.value) },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">Z</span>
              <input
                type="text"
                value={`${coordState.pos.z} cm`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    pos: { ...coordState.pos, z: parseC4DInput(e.target.value) },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
          </div>

          {/* Column 2: Size / Scale */}
          <div className="space-y-1">
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">X</span>
              <input
                type="text"
                value={`${coordState.size.x}`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    size: {
                      ...coordState.size,
                      x: Math.max(0.01, parseC4DInput(e.target.value)),
                    },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">Y</span>
              <input
                type="text"
                value={`${coordState.size.y}`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    size: {
                      ...coordState.size,
                      y: Math.max(0.01, parseC4DInput(e.target.value)),
                    },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">Z</span>
              <input
                type="text"
                value={`${coordState.size.z}`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    size: {
                      ...coordState.size,
                      z: Math.max(0.01, parseC4DInput(e.target.value)),
                    },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
          </div>

          {/* Column 3: Rotation (HPB) */}
          <div className="space-y-1">
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">X</span>
              <input
                type="text"
                value={`${coordState.rot.x} °`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    rot: { ...coordState.rot, x: parseC4DInput(e.target.value) },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">Y</span>
              <input
                type="text"
                value={`${coordState.rot.y} °`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    rot: { ...coordState.rot, y: parseC4DInput(e.target.value) },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-[#252525] border border-[#444] px-1.5 py-0.5 rounded-[1px]">
              <span className="text-[10px] text-[#888] w-4">Z</span>
              <input
                type="text"
                value={`${coordState.rot.z} °`}
                onChange={(e) =>
                  setCoordState({
                    ...coordState,
                    rot: { ...coordState.rot, z: parseC4DInput(e.target.value) },
                  })
                }
                className="w-full bg-transparent text-[#eee] text-[10.5px] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom controls: System selector, Mode selector, and Apply Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-[11px]">
          <div className="flex items-center space-x-2">
            <select
              value={coordState.system}
              onChange={(e) =>
                setCoordState({
                  ...coordState,
                  system: e.target.value as 'world' | 'object',
                })
              }
              className="bg-[#242424] border border-[#484848] text-[#ddd] px-1.5 py-0.5 rounded-[1px] focus:outline-none cursor-pointer"
            >
              <option value="world">World</option>
              <option value="object">Object</option>
            </select>

            <select
              value={coordState.transformType}
              onChange={(e) =>
                setCoordState({
                  ...coordState,
                  transformType: e.target.value as 'scale' | 'size',
                })
              }
              className="bg-[#242424] border border-[#484848] text-[#ddd] px-1.5 py-0.5 rounded-[1px] focus:outline-none cursor-pointer"
            >
              <option value="scale">Scale</option>
              <option value="size">Size</option>
            </select>
          </div>

          <button
            onClick={handleApply}
            className="px-3 py-0.5 bg-[#444] hover:bg-[#525252] active:bg-[#333] border border-[#555] rounded-[2px] text-white font-medium shadow-sm transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
