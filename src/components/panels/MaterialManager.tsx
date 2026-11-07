import React, { useState } from 'react';
import { X } from 'lucide-react';
import { C4DMaterial } from '../../types/c4d';

interface MaterialManagerProps {
  materials: C4DMaterial[];
  selectedMaterialId: string | null;
  onSelectMaterial: (id: string | null) => void;
  onUpdateMaterial: (mat: C4DMaterial) => void;
  onCreateMaterial: () => void;
}

export const MaterialManager: React.FC<MaterialManagerProps> = ({
  materials,
  selectedMaterialId,
  onSelectMaterial,
  onUpdateMaterial,
  onCreateMaterial,
}) => {
  const [editingMat, setEditingMat] = useState<C4DMaterial | null>(null);

  return (
    <div className="w-full h-full bg-[#393939] flex flex-col select-none overflow-hidden border-r border-[#222]">
      {/* Panel Header */}
      <div className="h-[22px] bg-[#464646] border-b border-[#282828] flex items-center justify-between px-2 text-[11px] text-[#cfcfcf]">
        <div className="flex items-center space-x-2.5">
          {/* Grip dots */}
          <div className="flex space-x-0.5 opacity-60">
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
            <span className="w-1 h-1 bg-[#888] rounded-full inline-block"></span>
          </div>

          <button
            onClick={onCreateMaterial}
            className="hover:text-white hover:bg-[#555] px-1 rounded-[1px]"
          >
            Create
          </button>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">Function</span>
          <span className="hover:text-white cursor-pointer">Texture</span>
        </div>
      </div>

      {/* Materials Thumbnails Grid */}
      <div className="flex-1 bg-[#2e2e2e] p-2 flex items-start space-x-2.5 overflow-x-auto">
        {materials.map((mat) => {
          const isSelected = selectedMaterialId === mat.id;
          return (
            <div
              key={mat.id}
              onClick={() => onSelectMaterial(mat.id)}
              onDoubleClick={() => setEditingMat(mat)}
              className={`flex flex-col items-center p-1 rounded-[2px] cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[#4a4a4a] ring-1 ring-[#e88724]'
                  : 'hover:bg-[#383838]'
              }`}
            >
              {/* Spherical Material Preview Slot (Beveled 3D look) */}
              <div
                className="w-12 h-12 rounded-full border border-[#555] shadow-inner relative overflow-hidden flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${mat.color} 45%, #0d0e10 100%)`,
                  boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.25), inset -2px -2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {/* Specular sheen overlay */}
                <div className="absolute top-1 left-2 w-4 h-2 rounded-full bg-white opacity-40 blur-[1px] transform -rotate-12 pointer-events-none" />
              </div>

              {/* Material Name Label */}
              <span className="text-[10.5px] text-[#ddd] mt-1 font-sans truncate max-w-[56px] text-center">
                {mat.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Material Editor Modal if double clicked */}
      {editingMat && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#383838] border border-[#222] shadow-2xl rounded-[2px] w-80 text-[11px] text-[#eee] overflow-hidden">
            <div className="bg-[#484848] px-3 py-1.5 flex items-center justify-between border-b border-[#2b2b2b]">
              <span className="font-bold">Material Editor: {editingMat.name}</span>
              <button
                onClick={() => setEditingMat(null)}
                className="text-[#999] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-[#aaa] mb-1">Color / Diffuse</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editingMat.color}
                    onChange={(e) =>
                      setEditingMat({ ...editingMat, color: e.target.value })
                    }
                    className="w-8 h-8 rounded border border-[#555] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={editingMat.color}
                    onChange={(e) =>
                      setEditingMat({ ...editingMat, color: e.target.value })
                    }
                    className="flex-1 bg-[#222] border border-[#555] px-2 py-1 text-white rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#aaa] mb-1">
                  <span>Roughness</span>
                  <span>{Math.round(editingMat.roughness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={editingMat.roughness}
                  onChange={(e) =>
                    setEditingMat({
                      ...editingMat,
                      roughness: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#e88724]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#aaa] mb-1">
                  <span>Metalness</span>
                  <span>{Math.round(editingMat.metalness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={editingMat.metalness}
                  onChange={(e) =>
                    setEditingMat({
                      ...editingMat,
                      metalness: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#e88724]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#303030]">
                <button
                  onClick={() => setEditingMat(null)}
                  className="px-3 py-1 bg-[#444] hover:bg-[#555] rounded text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateMaterial(editingMat);
                    setEditingMat(null);
                  }}
                  className="px-3 py-1 bg-[#e88724] text-black font-semibold rounded hover:bg-[#ff9933]"
                >
                  Apply Material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
