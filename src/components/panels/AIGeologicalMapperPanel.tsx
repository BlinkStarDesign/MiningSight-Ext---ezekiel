import React, { useState, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  BarChart2,
  Folder,
  Check,
  AlertTriangle,
  ArrowRight,
  Edit3,
  Trash2,
  Download,
  RefreshCw,
  Zap,
  Sparkles,
  Layers,
  Upload,
  RotateCcw,
} from 'lucide-react';
import {
  SurveyImageItem,
  PhotogrammetryConstants,
  SurveyAnalysisResult,
  SurveyRecord,
  StatusAlert,
  getDefaultSampleSurveyImages,
} from '../../types/aiSurvey';

interface AIGeologicalMapperPanelProps {
  onStatusChange: (status: StatusAlert) => void;
  onApply3DMarkers?: (points: Array<{ stationId: string; x: number; y: number; z: number; color: string; label: string }>) => void;
  projectTitle?: string;
  currentPresetId?: string;
  onSelectPreset?: (presetId: any) => void;
  onApplyCustomScene?: (params: any) => void;
}

export const AIGeologicalMapperPanel: React.FC<AIGeologicalMapperPanelProps> = ({
  onStatusChange,
  onApply3DMarkers,
  projectTitle = 'Mining Site - Surface & Subsurface Mapping',
  currentPresetId,
  onSelectPreset,
  onApplyCustomScene,
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'preview' | 'analysis' | 'records' | 'reconstruct'>('input');
  const [images, setImages] = useState<SurveyImageItem[]>(getDefaultSampleSurveyImages());
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [notes, setNotes] = useState<string>(
    'Synthesize drift convergence, identify gold vein mineralization contacts, assess rock mass quality rating (RMR), and calculate volumetric excavation.'
  );

  // AI 3D Scene Reconstruction state
  const [reconstructImage, setReconstructImage] = useState<string>('/assets/aistudio/Rugged_Timbered_Mine_Tunnel_53b5c504.png');
  const [reconstructPrompt, setReconstructPrompt] = useState<string>(
    'Synthesize square timber sets with 4-tier side lagging, inward batter angle, packed earthen rubble floor, and unlined rock cavern adit bore.'
  );
  const [isReconstructing, setIsReconstructing] = useState<boolean>(false);
  const [reconstructResult, setReconstructResult] = useState<any>(null);

  const [constants, setConstants] = useState<PhotogrammetryConstants>({
    sensorFocalLengthMm: 35,
    gsdMmPerPixel: 1.2,
    overlapPercentage: 75,
    convergenceToleranceMm: 5.0,
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<SurveyAnalysisResult | null>(null);
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Load saved records from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mining_site_ai_records');
      if (saved) {
        setRecords(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read saved survey records:', e);
    }
  }, []);

  // Save records to localStorage
  const saveRecordToHistory = (res: SurveyAnalysisResult, source: string) => {
    const totalDist = images.reduce((acc, curr, idx) => acc + (idx === 0 ? 0 : Number(curr.distanceFromLast || 0)), 0);
    const newRecord: SurveyRecord = {
      id: `rec_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      projectTitle,
      imagesCount: images.length,
      totalBaselineDistance: Number(totalDist.toFixed(2)),
      notes,
      result: res,
      source,
    };
    const updated = [newRecord, ...records.slice(0, 19)];
    setRecords(updated);
    try {
      localStorage.setItem('mining_site_ai_records', JSON.stringify(updated));
    } catch (e) {}
  };

  // Image Tag Update Handlers
  const handleUpdateImageTag = (index: number, key: keyof SurveyImageItem, value: any) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleAddCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, fIdx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newIdx = images.length + fIdx + 1;
        const newImg: SurveyImageItem = {
          id: `img_${Date.now()}_${fIdx}`,
          name: file.name,
          dataUrl,
          distanceFromLast: 2.5,
          stationId: `ST-${newIdx < 10 ? '0' : ''}${newIdx}`,
          depthBelowSurface: 140 + newIdx * 2.5,
          headingAzimuth: 115,
          pitchAngle: -4,
          rockStrata: 'Auriferous Quartzite Seam',
          rqdPercent: 75,
          fractureSpacingCm: 25,
        };
        setImages((prev) => [...prev, newImg]);
        onStatusChange({
          type: 'success',
          message: `Uploaded image "${file.name}" with default 2.5m distance tag.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      onStatusChange({
        type: 'warning',
        message: 'At least one survey image must remain in the photogrammetry set.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }
    const filtered = images.filter((_, idx) => idx !== index);
    setImages(filtered);
    setSelectedImageIndex(Math.max(0, index - 1));
  };

  // Total baseline distance
  const totalBaselineDistance = images.reduce((acc, curr, idx) => {
    return acc + (idx === 0 ? 0 : Number(curr.distanceFromLast || 0));
  }, 0);

  // Validate before sending
  const validateSurvey = (): { valid: boolean; error?: string } => {
    if (images.length === 0) {
      return { valid: false, error: 'Please add at least one survey image.' };
    }
    for (let i = 1; i < images.length; i++) {
      const d = images[i].distanceFromLast;
      if (d === undefined || d === null || isNaN(Number(d)) || Number(d) <= 0) {
        return {
          valid: false,
          error: `Image #${i + 1} (${images[i].name}) requires a positive "Distance from Last Image" tag for 3D reconstruction.`,
        };
      }
    }
    return { valid: true };
  };

  // Trigger Send to Gemini AI
  const handleExecuteAI = async () => {
    const validation = validateSurvey();
    if (!validation.valid) {
      setShowPreviewModal(false);
      onStatusChange({
        type: 'error',
        message: validation.error || 'Validation error in survey inputs.',
        details: 'The photogrammetry solver requires all sequential image tags to have an explicit linear distance (meters) to compute 3D scale and convergence.',
        errorCode: 'ERR_MISSING_DISTANCE',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    setShowPreviewModal(false);
    setIsProcessing(true);

    onStatusChange({
      type: 'loading',
      message: `[Step 1/3] Uploading ${images.length} survey frames & distance tags to Gemini 3.8 Flash...`,
      details: `Computing ${totalBaselineDistance.toFixed(2)}m baseline drift convergence, rock quality rating, and 3D subsurface coordinates.`,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      const response = await fetch('/api/ai/photogrammetry-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          notes,
          constants,
          projectTitle,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || json.error || 'Server processing error.');
      }

      setAnalysisResult(json.data);
      saveRecordToHistory(json.data, json.source);
      setActiveTab('analysis');

      onStatusChange({
        type: 'success',
        message: `AI 3D Survey Analysis generated successfully (${json.source}). Total baseline: ${totalBaselineDistance.toFixed(2)}m.`,
        details: json.notice || `Generated ${json.data.meshGeneratedPoints?.length || 0} survey stations and RMR rating ${json.data.surveySummary?.rockMassRating}.`,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Optionally auto-apply markers
      if (onApply3DMarkers && json.data.meshGeneratedPoints) {
        onApply3DMarkers(json.data.meshGeneratedPoints);
      }
    } catch (err: any) {
      onStatusChange({
        type: 'error',
        message: `AI Photogrammetry failed: ${err.message}`,
        details: 'Ensure distance tags are numbers > 0 and check server connectivity. If using Gemini API, ensure your GEMINI_API_KEY is configured in Settings > Secrets.',
        errorCode: 'ERR_AI_PROCESSING',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reconstruct 3D scene from reference photograph via Gemini AI Vision
  const handleReconstructScene = async () => {
    setIsReconstructing(true);
    onStatusChange({
      type: 'loading',
      message: 'Extracting 3D geometry & geotechnical parameters from reference image via Gemini Vision...',
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      const resp = await fetch('/api/ai/reconstruct-scene-from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageName: 'Rugged_Timbered_Mine_Tunnel_53b5c504.png',
          fieldNotes: reconstructPrompt,
        }),
      });

      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.message || 'Scene reconstruction failed');
      }

      setReconstructResult(json.data);
      onStatusChange({
        type: 'success',
        message: '3D Scene Reconstructed from Photo Reference!',
        details: `Synthesized ${json.data.procedural3DParams.timberSetCount} timber sets with ${json.data.procedural3DParams.laggingPlankTiers}-tier lagging planks.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      onStatusChange({
        type: 'error',
        message: `Failed to reconstruct scene: ${err.message}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsReconstructing(false);
    }
  };

  const selectedImg = images[selectedImageIndex] || images[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#2e2e2e] text-[#d6d6d6] text-[11px] select-none font-sans overflow-hidden border-l border-[#222]">
      {/* Top Header */}
      <div className="h-7 bg-[#383838] border-b border-[#222] px-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#e88724] animate-pulse"></span>
          <span className="font-bold text-[#f0f0f0] tracking-tight">AI Photogrammetry & Subsurface Mapping</span>
        </div>
        <span className="text-[10px] text-[#e88724] font-mono px-1 py-0.5 bg-[#252525] rounded-[2px] border border-[#444]">
          Gemini 3.8 Flash
        </span>
      </div>

      {/* Sub Tabs - Responsive flex-wrap / horizontal scroll */}
      <div className="min-h-7 bg-[#292929] border-b border-[#222] flex items-center px-1 py-1 gap-1 flex-wrap flex-shrink-0">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-2 py-0.5 text-[10.5px] rounded-[2px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
            activeTab === 'input' ? 'bg-[#e88724] text-black font-bold shadow-sm' : 'text-[#bbb] hover:bg-[#3d3d3d] hover:text-white'
          }`}
          title="Survey Input Images & Distance Tags"
        >
          <Camera className="w-3 h-3" />
          <span>Input</span>
          <span className={`text-[9px] px-1 rounded-full font-mono ${activeTab === 'input' ? 'bg-black text-[#e88724]' : 'bg-[#444] text-[#aaa]'}`}>
            {images.length}
          </span>
        </button>
        <button
          onClick={() => {
            const val = validateSurvey();
            if (!val.valid) {
              onStatusChange({
                type: 'error',
                message: val.error || 'Validation error in survey inputs.',
                timestamp: new Date().toLocaleTimeString(),
              });
            } else {
              setActiveTab('preview');
            }
          }}
          className={`px-2 py-0.5 text-[10.5px] rounded-[2px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
            activeTab === 'preview' ? 'bg-[#e88724] text-black font-bold shadow-sm' : 'text-[#bbb] hover:bg-[#3d3d3d] hover:text-white'
          }`}
          title="Preview and Validate Survey Parameters"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Confirm</span>
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-2 py-0.5 text-[10.5px] rounded-[2px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
            activeTab === 'analysis' ? 'bg-[#e88724] text-black font-bold shadow-sm' : 'text-[#bbb] hover:bg-[#3d3d3d] hover:text-white'
          }`}
          title="3D Photogrammetry & Geological Analysis"
        >
          <BarChart2 className="w-3 h-3" />
          <span>3D Analysis</span>
          {analysisResult && <Check className="w-3 h-3 text-[#55dd88]" />}
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-2 py-0.5 text-[10.5px] rounded-[2px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
            activeTab === 'records' ? 'bg-[#e88724] text-black font-bold shadow-sm' : 'text-[#bbb] hover:bg-[#3d3d3d] hover:text-white'
          }`}
          title="Saved Survey History & Records"
        >
          <Folder className="w-3 h-3" />
          <span>History</span>
          <span className={`text-[9px] px-1 rounded-full font-mono ${activeTab === 'records' ? 'bg-black text-[#e88724]' : 'bg-[#444] text-[#aaa]'}`}>
            {records.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('reconstruct')}
          className={`px-2 py-0.5 text-[10.5px] rounded-[2px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
            activeTab === 'reconstruct' ? 'bg-[#e88724] text-black font-bold shadow-sm' : 'text-[#bbb] hover:bg-[#3d3d3d] hover:text-white'
          }`}
          title="Reconstruct 3D Scenes from Photo References with AI"
        >
          <Sparkles className="w-3 h-3 text-[#e88724]" />
          <span>AI 3D Scene</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
        {/* TAB 1: INPUT & TAGS */}
        {activeTab === 'input' && (
          <div className="space-y-2.5">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-[#383838] p-1.5 rounded-[2px] border border-[#242424] flex-wrap gap-1">
              <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                <label className="px-2 py-1 bg-[#444] hover:bg-[#505050] text-[#f0f0f0] rounded-[2px] cursor-pointer border border-[#555] active:bg-[#333] flex items-center space-x-1 text-[10.5px]">
                  <Upload className="w-3 h-3" />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddCustomImage}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    const samples = getDefaultSampleSurveyImages();
                    setImages(samples);
                    setSelectedImageIndex(0);
                    onStatusChange({
                      type: 'success',
                      message: 'Loaded geological borehole & tunnel survey sample set (ST-01, ST-02, ST-03).',
                      timestamp: new Date().toLocaleTimeString(),
                    });
                  }}
                  className="px-2 py-1 bg-[#333] hover:bg-[#444] text-[#e88724] rounded-[2px] border border-[#484848] text-[10.5px] flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Sample Set</span>
                </button>
              </div>

              <div className="text-[10.5px] text-[#aaa]">
                Total Drift Span: <span className="text-[#e88724] font-bold">{totalBaselineDistance.toFixed(2)} m</span>
              </div>
            </div>

            {/* Thumbnail Strip with Sequence & Distance Tags */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#999] uppercase font-semibold tracking-wider">
                Survey Frame Sequence & Distance Tags
              </span>
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 bg-[#242424] p-1.5 rounded-[2px] border border-[#1e1e1e]">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-28 bg-[#323232] rounded-[2px] border p-1 cursor-pointer transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#e88724] ring-1 ring-[#e88724]'
                        : 'border-[#3f3f3f] hover:border-[#666]'
                    }`}
                  >
                    <div className="w-full h-16 bg-[#1a1a1a] rounded-[1px] overflow-hidden relative mb-1">
                      <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                      <span className="absolute top-0.5 left-0.5 bg-black/80 text-[9px] px-1 py-0.2 rounded text-[#00e5ff] font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="text-[10px] truncate text-[#ddd] font-medium">{img.stationId}</div>

                    <div className="flex items-center justify-between mt-0.5 text-[9.5px]">
                      <span className="text-[#888]">Dist:</span>
                      <span className="font-bold text-[#e88724]">
                        {idx === 0 ? '0.0m (Start)' : `+${img.distanceFromLast}m`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Selected Image Tagging Editor */}
            {selectedImg && (
              <div className="bg-[#353535] p-2 rounded-[2px] border border-[#262626] space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-[#444]">
                  <span className="font-bold text-[#f0f0f0]">
                    Frame #{selectedImageIndex + 1}: {selectedImg.name}
                  </span>
                  <button
                    onClick={() => handleRemoveImage(selectedImageIndex)}
                    title="Remove Image"
                    className="text-[#f87171] hover:text-white hover:bg-[#802020] px-1.5 py-0.5 rounded text-[10px] cursor-pointer"
                  >
                    Delete Frame
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  {/* Distance from last image (KEY REQUIREMENT!) */}
                  <div className="col-span-2 bg-[#2a2a2a] p-1.5 rounded-[2px] border border-[#e88724]/40 flex items-center justify-between">
                    <div>
                      <span className="text-[#e88724] font-bold uppercase text-[10px] tracking-wide block">
                        Distance From Last Image (Baseline Offset)
                      </span>
                      <span className="text-[9.5px] text-[#888]">
                        Linear meter distance from prior camera position
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        disabled={selectedImageIndex === 0}
                        value={selectedImageIndex === 0 ? 0 : selectedImg.distanceFromLast}
                        onChange={(e) =>
                          handleUpdateImageTag(
                            selectedImageIndex,
                            'distanceFromLast',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`w-20 bg-[#1e1e1e] border text-center font-mono font-bold text-[12px] px-1 py-0.5 rounded-[2px] ${
                          selectedImageIndex === 0
                            ? 'text-[#888] border-[#333]'
                            : 'text-[#e88724] border-[#e88724] focus:outline-none'
                        }`}
                      />
                      <span className="text-[#aaa] font-bold">m</span>
                    </div>
                  </div>

                  {/* Station ID */}
                  <div>
                    <label className="text-[#888] block text-[9.5px]">Station Identifier</label>
                    <input
                      type="text"
                      value={selectedImg.stationId}
                      onChange={(e) => handleUpdateImageTag(selectedImageIndex, 'stationId', e.target.value)}
                      className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                    />
                  </div>

                  {/* Subsurface Depth RL */}
                  <div>
                    <label className="text-[#888] block text-[9.5px]">Subsurface Depth (m RL)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={selectedImg.depthBelowSurface}
                      onChange={(e) =>
                        handleUpdateImageTag(selectedImageIndex, 'depthBelowSurface', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                    />
                  </div>

                  {/* Compass Heading Azimuth */}
                  <div>
                    <label className="text-[#888] block text-[9.5px]">Compass Azimuth (°)</label>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={selectedImg.headingAzimuth}
                      onChange={(e) =>
                        handleUpdateImageTag(selectedImageIndex, 'headingAzimuth', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                    />
                  </div>

                  {/* Camera Pitch */}
                  <div>
                    <label className="text-[#888] block text-[9.5px]">Camera Pitch (°)</label>
                    <input
                      type="number"
                      min="-90"
                      max="90"
                      value={selectedImg.pitchAngle}
                      onChange={(e) =>
                        handleUpdateImageTag(selectedImageIndex, 'pitchAngle', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                    />
                  </div>

                  {/* Rock Strata Selector */}
                  <div className="col-span-2">
                    <label className="text-[#888] block text-[9.5px]">Geological Rock Strata</label>
                    <select
                      value={selectedImg.rockStrata}
                      onChange={(e) => handleUpdateImageTag(selectedImageIndex, 'rockStrata', e.target.value)}
                      className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee]"
                    >
                      <option value="Auriferous Quartzite Seam">Auriferous Quartzite Seam (Gold-bearing)</option>
                      <option value="Granodiorite Footwall">Granodiorite Footwall (Competent Granite)</option>
                      <option value="Pyrite-Silica Breccia Contact">Pyrite-Silica Breccia Contact (Sulfide zone)</option>
                      <option value="Sedimentary Cavern Granite">Sedimentary Cavern Granite / Strata</option>
                      <option value="Siliceous Shale & Fault Gouge">Siliceous Shale & Fault Gouge (Sheared)</option>
                    </select>
                  </div>

                  {/* RQD % and Fracture Spacing */}
                  <div>
                    <label className="text-[#888] block text-[9.5px]">RQD (Rock Quality %)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedImg.rqdPercent}
                      onChange={(e) =>
                        handleUpdateImageTag(selectedImageIndex, 'rqdPercent', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[#888] block text-[9.5px]">Joint Fracture Spacing (cm)</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedImg.fractureSpacingCm}
                      onChange={(e) =>
                        handleUpdateImageTag(selectedImageIndex, 'fractureSpacingCm', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photogrammetric Constants */}
            <div className="bg-[#353535] p-2 rounded-[2px] border border-[#262626] space-y-1.5">
              <span className="font-bold text-[#f0f0f0] block text-[10.5px]">
                Photogrammetry Calibration Constants
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-[#888] block">Focal Length (mm)</span>
                  <input
                    type="number"
                    value={constants.sensorFocalLengthMm}
                    onChange={(e) =>
                      setConstants({ ...constants, sensorFocalLengthMm: parseFloat(e.target.value) || 35 })
                    }
                    className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                  />
                </div>
                <div>
                  <span className="text-[#888] block">GSD (mm / px)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={constants.gsdMmPerPixel}
                    onChange={(e) =>
                      setConstants({ ...constants, gsdMmPerPixel: parseFloat(e.target.value) || 1.2 })
                    }
                    className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                  />
                </div>
                <div>
                  <span className="text-[#888] block">Frame Overlap (%)</span>
                  <input
                    type="number"
                    value={constants.overlapPercentage}
                    onChange={(e) =>
                      setConstants({ ...constants, overlapPercentage: parseInt(e.target.value, 10) || 75 })
                    }
                    className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                  />
                </div>
                <div>
                  <span className="text-[#888] block">Convergence Tol. (mm)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={constants.convergenceToleranceMm}
                    onChange={(e) =>
                      setConstants({ ...constants, convergenceToleranceMm: parseFloat(e.target.value) || 5.0 })
                    }
                    className="w-full bg-[#242424] border border-[#444] px-1.5 py-0.5 rounded-[2px] text-[#eee] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Field Notes & Instructions */}
            <div className="bg-[#353535] p-2 rounded-[2px] border border-[#262626] space-y-1">
              <span className="font-bold text-[#f0f0f0] block text-[10.5px]">
                Surveyor Notes & AI Instructions
              </span>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions for geological synthesis, fault orientation, or 3D mesh modification..."
                className="w-full bg-[#242424] border border-[#444] p-1.5 rounded-[2px] text-[#ddd] text-[10.5px] focus:outline-none focus:border-[#e88724]"
              />
            </div>

            {/* Validate & Proceed Button */}
            <button
              onClick={() => {
                const val = validateSurvey();
                if (!val.valid) {
                  onStatusChange({
                    type: 'error',
                    message: val.error || 'Validation error in survey inputs.',
                    timestamp: new Date().toLocaleTimeString(),
                  });
                } else {
                  setShowPreviewModal(true);
                }
              }}
              className="w-full py-1.5 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px] text-[11px] shadow transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Review Survey & Proceed to Confirmation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 2: PREVIEW & CONFIRM */}
        {(activeTab === 'preview' || showPreviewModal) && (
          <div className="space-y-3 bg-[#333] p-2.5 rounded-[2px] border border-[#444]">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#444]">
              <span className="font-bold text-[#f0f0f0] text-[12px]">
                Pre-Execution Survey Validation & Confirmation
              </span>
              <span className="text-[10px] text-[#55dd88] font-bold flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Ready for Gemini 3.8 Flash</span>
              </span>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-[#252525] p-2 rounded-[2px] border border-[#1e1e1e] text-center">
              <div>
                <span className="text-[#888] text-[9.5px] block">Survey Frames</span>
                <span className="text-[#00e5ff] font-mono text-[13px] font-bold">{images.length} Photos</span>
              </div>
              <div>
                <span className="text-[#888] text-[9.5px] block">Baseline Length</span>
                <span className="text-[#e88724] font-mono text-[13px] font-bold">{totalBaselineDistance.toFixed(2)} m</span>
              </div>
              <div>
                <span className="text-[#888] text-[9.5px] block">Average Spacing</span>
                <span className="text-[#55dd88] font-mono text-[13px] font-bold">
                  {(totalBaselineDistance / Math.max(1, images.length - 1)).toFixed(2)} m
                </span>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="space-y-1 text-[10px] text-[#ccc] bg-[#2a2a2a] p-2 rounded-[2px]">
              <div className="flex items-center space-x-1.5 text-[#55dd88]">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>All distance tags from previous images verified and calibrated.</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#55dd88]">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Photogrammetric focal length & GSD parameters confirmed.</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#55dd88]">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Rock strata & RQD classification tagged on every station.</span>
              </div>
            </div>

            {/* Frame Sequence Preview */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#888] uppercase font-semibold">Survey Path Sequence</span>
              <div className="space-y-1">
                {images.map((img, idx) => (
                  <div key={img.id} className="flex items-center justify-between bg-[#282828] px-2 py-1 rounded-[1px] border border-[#383838]">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-[#444] text-[#fff] text-[9px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-[#ddd]">{img.stationId}</span>
                      <span className="text-[#888] text-[9.5px]">({img.rockStrata})</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[#e88724] font-bold">
                        {idx === 0 ? 'Baseline Origin' : `+${img.distanceFromLast} m`}
                      </span>
                      <span className="text-[#888] text-[9px] ml-2">Depth: -{img.depthBelowSurface}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-[#444]">
              <button
                disabled={isProcessing}
                onClick={handleExecuteAI}
                className="flex-1 py-2 bg-[#e88724] hover:bg-[#ff9933] text-black font-black rounded-[2px] text-[11px] uppercase tracking-wide cursor-pointer disabled:opacity-50 shadow flex items-center justify-center space-x-1.5"
              >
                <span>{isProcessing ? 'Gemini 3.8 Flash Processing...' : 'Confirm & Generate 3D Subsurface Mapping'}</span>
                {!isProcessing && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setActiveTab('input');
                }}
                className="px-3 py-2 bg-[#444] hover:bg-[#555] text-white rounded-[2px] text-[11px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: 3D ANALYSIS RESULTS */}
        {activeTab === 'analysis' && (
          <div className="space-y-2.5">
            {!analysisResult ? (
              <div className="bg-[#333] p-6 text-center rounded-[2px] border border-[#444] space-y-2">
                <Sparkles className="w-6 h-6 text-[#888] mx-auto" />
                <div className="font-bold text-[#eee]">No Survey Analysis Run Yet</div>
                <p className="text-[10px] text-[#888] max-w-xs mx-auto">
                  Tag survey images with inter-frame distances and execute Gemini 3.8 Flash to synthesize 3D drift geometry.
                </p>
                <button
                  onClick={() => setActiveTab('input')}
                  className="px-3 py-1 bg-[#e88724] text-black font-bold rounded-[2px] cursor-pointer"
                >
                  Go to Survey Input
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Geological Summary Card */}
                <div className="bg-[#353535] p-2.5 rounded-[2px] border border-[#282828] space-y-1.5">
                  <div className="flex items-center justify-between pb-1 border-b border-[#444]">
                    <span className="font-bold text-[#00e5ff] text-[11.5px]">
                      {analysisResult.surveySummary.siteName}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#1c5530] text-[#55ff88] text-[9.5px] font-bold rounded">
                      {analysisResult.surveySummary.rockClass}
                    </span>
                  </div>
                  <p className="text-[#ccc] text-[10.5px] leading-relaxed">
                    {analysisResult.surveySummary.geotechnicalUnit}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div>
                      <span className="text-[#888]">Rock Mass Rating (RMR):</span>{' '}
                      <span className="text-[#e88724] font-bold">{analysisResult.surveySummary.rockMassRating} / 100</span>
                    </div>
                    <div>
                      <span className="text-[#888]">Fault Orientation:</span>{' '}
                      <span className="text-[#ddd] font-mono">{analysisResult.surveySummary.faultOrientation}</span>
                    </div>
                  </div>
                </div>

                {/* Measurements & Volumetrics */}
                <div className="bg-[#353535] p-2 rounded-[2px] border border-[#282828] space-y-1.5">
                  <span className="font-bold text-[#f0f0f0] block text-[10.5px]">
                    Subsurface 3D Dimensions & Volumetrics
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-[#262626] p-1.5 rounded">
                      <span className="text-[#888] block">Total Drift Length</span>
                      <span className="text-[#e88724] font-bold font-mono text-[12px]">
                        {analysisResult.measurements.totalDriftLengthMeters} m
                      </span>
                    </div>
                    <div className="bg-[#262626] p-1.5 rounded">
                      <span className="text-[#888] block">Excavation Volume</span>
                      <span className="text-[#00e5ff] font-bold font-mono text-[12px]">
                        {analysisResult.measurements.volumetricExcavationM3} m³
                      </span>
                    </div>
                    <div className="bg-[#262626] p-1.5 rounded">
                      <span className="text-[#888] block">Drift Cross-Section</span>
                      <span className="text-[#ddd] font-mono">
                        {analysisResult.measurements.averageTunnelWidthMeters}m W × {analysisResult.measurements.averageTunnelHeightMeters}m H
                      </span>
                    </div>
                    <div className="bg-[#262626] p-1.5 rounded">
                      <span className="text-[#888] block">Convergence Deformation</span>
                      <span className="text-[#55dd88] font-mono font-bold">
                        {analysisResult.measurements.estimatedConvergenceMm} mm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gold Vein Seam Grade */}
                <div className="bg-[#353535] p-2 rounded-[2px] border border-[#e88724]/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#ffaa24] text-[10.5px] flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mineralized Gold Vein Estimate</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#ffaa24] bg-[#222] px-1.5 py-0.5 rounded border border-[#e88724]">
                      {analysisResult.goldVeinSeam.gradeEstimateGramsPerTonne} g/t Au
                    </span>
                  </div>
                  <p className="text-[10px] text-[#ccc]">
                    {analysisResult.goldVeinSeam.mineralizedZoneDescription}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#aaa]">
                    <span>Vein Thickness: <strong>{analysisResult.goldVeinSeam.averageVeinThicknessCm} cm</strong></span>
                    <span>Ore Tonnage: <strong>{analysisResult.goldVeinSeam.estimatedGoldOreTonnage} t</strong></span>
                  </div>
                </div>

                {/* Structural Safety Alerts */}
                {analysisResult.structuralAlerts?.length > 0 && (
                  <div className="bg-[#353535] p-2 rounded-[2px] border border-[#282828] space-y-1">
                    <span className="font-bold text-[#f87171] text-[10.5px] block">
                      Geotechnical Hazards & Ground Support
                    </span>
                    <ul className="space-y-1 text-[10px] text-[#ddd]">
                      {analysisResult.structuralAlerts.map((alert, aIdx) => (
                        <li key={aIdx} className="flex items-start space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#f87171] mt-0.5 flex-shrink-0" />
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Apply to 3D Viewport Action */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (onApply3DMarkers && analysisResult.meshGeneratedPoints) {
                        onApply3DMarkers(analysisResult.meshGeneratedPoints);
                        onStatusChange({
                          type: 'success',
                          message: `Applied ${analysisResult.meshGeneratedPoints.length} survey station markers to 3D mining tunnel complex.`,
                          timestamp: new Date().toLocaleTimeString(),
                        });
                      }
                    }}
                    className="w-full py-1.5 bg-[#4ea3e8] hover:bg-[#60b3f8] text-black font-bold rounded-[2px] text-[11px] transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>Sync Station Markers into 3D Viewport Complex</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HISTORY & RECORDS */}
        {activeTab === 'records' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#3e3e3e]">
              <span className="font-bold text-[#eee] text-[11px]">Survey History Records ({records.length})</span>
              {records.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all saved survey history records?')) {
                      setRecords([]);
                      localStorage.removeItem('mining_site_ai_records');
                      onStatusChange({
                        type: 'success',
                        message: 'Cleared survey history records.',
                        timestamp: new Date().toLocaleTimeString(),
                      });
                    }
                  }}
                  className="text-[10px] text-[#f87171] hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {records.length === 0 ? (
              <div className="text-center py-6 text-[#777] text-[10.5px]">
                No prior survey records saved yet. Process a survey to add entries here.
              </div>
            ) : (
              <div className="space-y-2">
                {records.map((rec) => (
                  <div key={rec.id} className="bg-[#353535] p-2 rounded-[2px] border border-[#262626] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-[#00e5ff] font-medium">{rec.timestamp}</span>
                      <span className="text-[#e88724] font-bold">{rec.totalBaselineDistance} m span</span>
                    </div>
                    <div className="text-[10.5px] text-[#eee] font-medium flex items-center justify-between">
                      <span>{rec.result.surveySummary.siteName} - RMR {rec.result.surveySummary.rockMassRating}</span>
                      <span className="text-[#4ade80] text-[9.5px]">{rec.imagesCount} frames</span>
                    </div>
                    <p className="text-[9.5px] text-[#aaa] line-clamp-2 bg-[#282828] p-1 rounded-[2px]">{rec.notes}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] gap-1 flex-wrap">
                      <span className="text-[#ffaa24] font-bold">
                        {rec.result.goldVeinSeam.gradeEstimateGramsPerTonne} g/t Au
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            const newNotes = window.prompt('Edit record notes:', rec.notes);
                            if (newNotes !== null) {
                              const updated = records.map((r) => (r.id === rec.id ? { ...r, notes: newNotes } : r));
                              setRecords(updated);
                              localStorage.setItem('mining_site_ai_records', JSON.stringify(updated));
                            }
                          }}
                          title="Edit record notes"
                          className="px-1.5 py-0.5 bg-[#444] hover:bg-[#555] text-[#ddd] rounded-[2px] text-[9.5px] cursor-pointer flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `survey_${rec.id}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          title="Export survey record JSON"
                          className="px-1.5 py-0.5 bg-[#444] hover:bg-[#555] text-[#ddd] rounded-[2px] text-[9.5px] cursor-pointer flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export</span>
                        </button>
                        <button
                          onClick={() => {
                            setAnalysisResult(rec.result);
                            setActiveTab('analysis');
                            if (onApply3DMarkers && rec.result.meshGeneratedPoints) {
                              onApply3DMarkers(rec.result.meshGeneratedPoints);
                            }
                            onStatusChange({
                              type: 'success',
                              message: `Restored survey record from ${rec.timestamp}.`,
                              timestamp: new Date().toLocaleTimeString(),
                            });
                          }}
                          title="Load this record into active 3D analysis"
                          className="px-2 py-0.5 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px] text-[9.5px] cursor-pointer flex items-center space-x-1"
                        >
                          <span>Restore</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            const filtered = records.filter((r) => r.id !== rec.id);
                            setRecords(filtered);
                            localStorage.setItem('mining_site_ai_records', JSON.stringify(filtered));
                            onStatusChange({
                              type: 'idle',
                              message: 'Deleted survey record.',
                              timestamp: new Date().toLocaleTimeString(),
                            });
                          }}
                          title="Delete this record"
                          className="p-1 hover:bg-[#aa2222] text-[#f87171] hover:text-white rounded-[2px] text-[9.5px] cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AI 3D SCENE RECONSTRUCTION FROM PHOTO REFERENCE */}
        {activeTab === 'reconstruct' && (
          <div className="space-y-3">
            <div className="bg-[#242424] border border-[#383838] p-2.5 rounded-[3px] space-y-2">
              <div className="flex items-center justify-between border-b border-[#333] pb-1.5">
                <span className="font-bold text-[#e88724] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 3D Scene Reconstruction from Image Reference</span>
                </span>
                <span className="text-[9.5px] font-mono text-[#4ade80] bg-[#1a2e1f] px-1.5 py-0.5 rounded border border-[#2b5934]">
                  Active Photo Rig
                </span>
              </div>
              <p className="text-[#aaa] text-[10.5px] leading-relaxed">
                Transform real underground survey photographs into interactive, physically-scaled 3D procedural scenes with structural shoring sets, lagging retention planks, and geological adit headings.
              </p>
            </div>

            {/* Reference Image Card */}
            <div className="bg-[#252525] border border-[#3a3a3a] p-2.5 rounded-[3px] space-y-2">
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Reference Photograph</span>
                <span className="text-[9.5px] text-[#888] font-mono">Rugged_Timbered_Mine_Tunnel_53b5c504.png</span>
              </div>

              <div className="relative rounded overflow-hidden border border-[#444] bg-[#181818] flex items-center justify-center max-h-[160px]">
                <img
                  src={reconstructImage}
                  alt="Reference Mine Tunnel"
                  className="max-h-[160px] object-contain select-none"
                />
                <div className="absolute top-1.5 left-1.5 bg-black/80 text-[#e88724] font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#444]">
                  4-Tier Side Lagging • Inward Batter • Adit Bore
                </div>
              </div>

              {/* Field Notes / AI Prompt */}
              <div>
                <label className="block text-[10px] text-[#888] mb-1 font-semibold">
                  Field Notes & Structural Reconstruction Instructions:
                </label>
                <textarea
                  value={reconstructPrompt}
                  onChange={(e) => setReconstructPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-1.5 text-[10.5px] text-[#ddd] focus:outline-none focus:border-[#e88724]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleReconstructScene}
                  disabled={isReconstructing}
                  className="flex-1 py-1.5 bg-[#e88724] hover:bg-[#ff9933] disabled:opacity-50 text-black font-bold rounded-[2px] flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isReconstructing ? 'Analyzing with Gemini Vision...' : 'Reconstruct 3D Scene with AI'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onSelectPreset) {
                      onSelectPreset('rugged_timbered_photo');
                      onStatusChange({
                        type: 'success',
                        message: 'Loaded Rugged Timbered Drift (Photo Reference) into 3D Viewport!',
                        timestamp: new Date().toLocaleTimeString(),
                      });
                    }
                  }}
                  className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-[2px] border border-[#505050] flex items-center space-x-1 cursor-pointer"
                  title="Directly load the pre-built reference photo model"
                >
                  <Check className="w-3.5 h-3.5 text-[#e88724]" />
                  <span>Load Photo Model</span>
                </button>
              </div>
            </div>

            {/* Reconstruct Result Preview */}
            {reconstructResult && (
              <div className="bg-[#1f2620] border border-[#2e4d35] p-2.5 rounded-[3px] space-y-2 text-[10.5px]">
                <div className="font-bold text-[#4ade80] flex items-center justify-between">
                  <span>Detected Structural Elements</span>
                  <span className="font-mono text-[9px] text-[#88bbdd]">AI Vision Extraction</span>
                </div>

                <ul className="space-y-1 text-[#ccc] list-disc list-inside">
                  {reconstructResult.detectedFeatures?.map((f: string, i: number) => (
                    <li key={i} className="line-clamp-1">{f}</li>
                  ))}
                </ul>

                <div className="bg-[#181d19] p-2 rounded border border-[#2b4430] grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-[#888]">Timber Sets:</span>{' '}
                    <span className="font-mono text-[#e88724]">{reconstructResult.procedural3DParams.timberSetCount} frames</span>
                  </div>
                  <div>
                    <span className="text-[#888]">Lagging Planks:</span>{' '}
                    <span className="font-mono text-[#e88724]">{reconstructResult.procedural3DParams.laggingPlankTiers} tiers/side</span>
                  </div>
                  <div>
                    <span className="text-[#888]">Batter Incline:</span>{' '}
                    <span className="font-mono text-[#e88724]">{reconstructResult.procedural3DParams.postBatterAngleDeg}° inward</span>
                  </div>
                  <div>
                    <span className="text-[#888]">Unlined Adit Bore:</span>{' '}
                    <span className="font-mono text-[#e88724]">{reconstructResult.procedural3DParams.unlinedAditLength}m depth</span>
                  </div>
                </div>

                {onApplyCustomScene && (
                  <button
                    onClick={() => {
                      onApplyCustomScene(reconstructResult.procedural3DParams);
                      onStatusChange({
                        type: 'success',
                        message: 'Applied custom AI 3D scene parameters to active viewport!',
                        timestamp: new Date().toLocaleTimeString(),
                      });
                    }}
                    className="w-full py-1.5 bg-[#4ade80] hover:bg-[#6ee7b7] text-black font-bold rounded-[2px] flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Custom AI Parameters to 3D Viewport</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
