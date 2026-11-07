/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { C4DMaterial, C4DSceneObject, TimelineState, ToolMode, Vector3D } from './types/c4d';
import { StatusAlert } from './types/aiSurvey';
import { MenuBar } from './components/layout/MenuBar';
import { MainToolbar } from './components/layout/MainToolbar';
import { LeftToolPalette } from './components/layout/LeftToolPalette';
import { Viewport3D } from './components/viewport/Viewport3D';
import { ObjectManager } from './components/panels/ObjectManager';
import { AttributeManager } from './components/panels/AttributeManager';
import { Timeline } from './components/panels/Timeline';
import { MaterialManager } from './components/panels/MaterialManager';
import { CoordinateManager } from './components/panels/CoordinateManager';
import { AIGeologicalMapperPanel } from './components/panels/AIGeologicalMapperPanel';
import { CameraTourManager } from './components/panels/CameraTourManager';
import { StatusBar } from './components/layout/StatusBar';
import { DockLayout, UpperTabType } from './components/layout/DockLayout';
import { PictureViewerModal } from './components/modals/PictureViewerModal';
import { RenderSettingsModal } from './components/modals/RenderSettingsModal';
import { calculateCartZ, stepFrame } from './utils/math3d';
import { CameraKeyframe, CameraTour } from './types/cameraTour';
import { getDefaultCameraTours } from './utils/cameraAnimation';
import { TunnelPresetId, ProceduralTunnelParams } from './types/tunnelScene';
import { TUNNEL_PRESETS, getCombinedSceneObjects, getAllCombinedMaterials } from './scene/tunnelPresetRegistry';

// Baseline Mining Tunnel Objects
const getBaselineObjects = (): C4DSceneObject[] => [
  {
    id: 'Mining_Tunnel_Complex',
    name: 'Mining_Tunnel_Complex',
    type: 'group',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 4, y: -60, z: 2 },
    scale: { x: 1, y: 1, z: 1 },
    visibleInEditor: true,
    visibleInRenderer: true,
    locked: false,
    expanded: true,
    materialIds: ['mat_rock', 'mat_timber', 'mat_iron', 'mat_gold'],
    children: [
      {
        id: 'Rock_Tunnel_Mesh',
        name: 'Rock_Tunnel_Mesh',
        type: 'group',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visibleInEditor: true,
        visibleInRenderer: true,
        locked: false,
        expanded: false,
        materialIds: ['mat_rock'],
      },
      {
        id: 'Timber_Support_Arches',
        name: 'Timber_Support_Arches',
        type: 'group',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visibleInEditor: true,
        visibleInRenderer: true,
        locked: false,
        expanded: false,
        materialIds: ['mat_timber'],
      },
      {
        id: 'Railway_Tracks',
        name: 'Railway_Tracks',
        type: 'group',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visibleInEditor: true,
        visibleInRenderer: true,
        locked: false,
        expanded: false,
        materialIds: ['mat_iron', 'mat_timber'],
      },
      {
        id: 'Mine_Cart_Ore',
        name: 'Mine_Cart_Ore',
        type: 'group',
        position: { x: 0, y: 0, z: 400 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visibleInEditor: true,
        visibleInRenderer: true,
        locked: false,
        expanded: false,
        materialIds: ['mat_iron', 'mat_gold'],
      },
      {
        id: 'Hanging_Work_Lights',
        name: 'Hanging_Work_Lights',
        type: 'group',
        position: { x: 0, y: 620, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visibleInEditor: true,
        visibleInRenderer: true,
        locked: false,
        expanded: false,
        materialIds: ['mat_gold'],
      },
      {
        id: 'Ventilation_Duct',
        name: 'Ventilation_Duct',
        type: 'cylinder',
        position: { x: -380, y: 580, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visibleInEditor: true,
        visibleInRenderer: true,
        locked: false,
        expanded: false,
        materialIds: ['mat_iron'],
      },
    ],
  },
];

// Baseline Materials
const getBaselineMaterials = (): C4DMaterial[] => [
  {
    id: 'mat_rock',
    name: 'Rock_Strata',
    color: '#5a544e',
    roughness: 0.88,
    metalness: 0.12,
    specular: 0.3,
  },
  {
    id: 'mat_timber',
    name: 'Timber_Beams',
    color: '#4d3b2c',
    roughness: 0.75,
    metalness: 0.05,
    specular: 0.4,
  },
  {
    id: 'mat_iron',
    name: 'Rusted_Iron',
    color: '#3d3f44',
    roughness: 0.55,
    metalness: 0.72,
    specular: 0.7,
  },
  {
    id: 'mat_gold',
    name: 'Lantern_Gold',
    color: '#ffaa22',
    roughness: 0.25,
    metalness: 0.65,
    specular: 0.9,
  },
];

export default function App() {
  const [layout, setLayout] = useState<string>('Startup');
  const [activeUpperTab, setActiveUpperTab] = useState<UpperTabType>('Objects');
  const [activeTool, setActiveTool] = useState<ToolMode>('move');
  const [activeLeftMode, setActiveLeftMode] = useState<ToolMode>('model');
  const [isSnapping, setIsSnapping] = useState<boolean>(false);
  const [isWorldSpace, setIsWorldSpace] = useState<boolean>(true);
  const [axisLocks, setAxisLocks] = useState({ x: true, y: true, z: true });

  // Camera Tours & Animation Paths State ("load animation set / follow path automatically / save & edit & delete")
  const [tours, setTours] = useState<CameraTour[]>(() => {
    try {
      const saved = localStorage.getItem('mining_site_camera_tours');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return getDefaultCameraTours();
  });
  const [activeTourId, setActiveTourId] = useState<string>(() => {
    return getDefaultCameraTours()[0].id;
  });
  const [isTourPlaybackEnabled, setIsTourPlaybackEnabled] = useState<boolean>(true);

  // Survey Station 3D markers from photogrammetry AI
  const [surveyStationMarkers, setSurveyStationMarkers] = useState<Array<{
    stationId: string;
    x: number;
    y: number;
    z: number;
    color: string;
    label: string;
  }>>([]);

  // Save tours to localStorage
  const saveTours = useCallback((newTours: CameraTour[]) => {
    setTours(newTours);
    try {
      localStorage.setItem('mining_site_camera_tours', JSON.stringify(newTours));
    } catch (e) {}
  }, []);

  const activeTour = tours.find((t) => t.id === activeTourId) || tours[0];

  // Attention-grabbing Status Bar state
  const [statusAlert, setStatusAlert] = useState<StatusAlert>({
    type: 'idle',
    message: 'move elements. Hold down SHIFT to quantize movement / add to the selection in point mode, CTRL to remove.',
  });

  // Modal dialogs
  const [showPictureViewer, setShowPictureViewer] = useState<boolean>(false);
  const [showRenderSettings, setShowRenderSettings] = useState<boolean>(false);

  // Hidden File input for opening saved .c4d.json projects
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Scene Preset ('classic_diorama' | 'rugged_timbered_photo' | 'ai_custom')
  const [currentPresetId, setCurrentPresetId] = useState<TunnelPresetId>('rugged_timbered_photo');
  const [proceduralParams, setProceduralParams] = useState<ProceduralTunnelParams>(
    TUNNEL_PRESETS.rugged_timbered_photo.defaultParams
  );

  // Materials for Mining Tunnel - combined so all materials are accessible in Material Manager
  const [materials, setMaterials] = useState<C4DMaterial[]>(getAllCombinedMaterials());
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>('mat_photo_rock');

  // Scene Hierarchy Objects for Mining Tunnel - BOTH models always listed in side nav panel
  const [objects, setObjects] = useState<C4DSceneObject[]>(getCombinedSceneObjects('rugged_timbered_photo'));
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('Rugged_Timbered_Mine_Tunnel_Photo');

  // Preset switching handler
  const handleSelectPreset = useCallback((presetId: TunnelPresetId, customParams?: ProceduralTunnelParams) => {
    setCurrentPresetId(presetId);
    const preset = TUNNEL_PRESETS[presetId];
    if (customParams) {
      setProceduralParams(customParams);
    } else {
      setProceduralParams(preset.defaultParams);
    }
    // Keep BOTH models in hierarchy while marking the active model visible with green dots
    setObjects(getCombinedSceneObjects(presetId));
    setMaterials(getAllCombinedMaterials());
    const rootId = presetId === 'classic_diorama' ? 'Mining_Tunnel_Complex' : 'Rugged_Timbered_Mine_Tunnel_Photo';
    setSelectedObjectId(rootId);

    setStatusAlert({
      type: 'success',
      message: `Active 3D Scene switched to "${preset.name}".`,
      details: preset.description,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, []);

  const handleUpdateProceduralParams = useCallback((newParams: ProceduralTunnelParams) => {
    setProceduralParams(newParams);
    setCurrentPresetId('ai_custom');
    setStatusAlert({
      type: 'success',
      message: `Updated 3D Procedural Tunnel Parameters (${newParams.timberSetCount} timber sets, ${newParams.laggingPlankTiers} lagging tiers).`,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, []);

  // Undo / Redo history stack
  const [historyStack, setHistoryStack] = useState<C4DSceneObject[][]>([]);
  const [redoStack, setRedoStack] = useState<C4DSceneObject[][]>([]);

  // Timeline State
  const [timeline, setTimeline] = useState<TimelineState>({
    currentFrame: 0,
    minFrame: 0,
    previewMaxFrame: 90,
    projectMaxFrame: 90,
    isPlaying: false,
    fps: 30,
    loop: true,
  });

  // Animation Playback Loop
  useEffect(() => {
    if (!timeline.isPlaying) return;
    const interval = setInterval(() => {
      setTimeline((prev) => ({
        ...prev,
        currentFrame: stepFrame(
          prev.currentFrame,
          prev.minFrame,
          prev.previewMaxFrame,
          1,
          prev.loop
        ),
      }));
    }, 1000 / timeline.fps);
    return () => clearInterval(interval);
  }, [timeline.isPlaying, timeline.fps]);

  // Synchronize Mine_Cart_Ore scene tree coordinates with timeline scrubbing
  useEffect(() => {
    const currentZCm = Math.round(calculateCartZ(timeline.currentFrame, 90, 16.0, -16.0) * 100);
    setObjects((prev) =>
      prev.map((root) => {
        if (!root.children) return root;
        return {
          ...root,
          children: root.children.map((c) =>
            c.id === 'Mine_Cart_Ore' ? { ...c, position: { ...c.position, z: currentZCm } } : c
          ),
        };
      })
    );
  }, [timeline.currentFrame]);

  // Handle Layout switching (e.g. "Mining Survey & AI Mapping")
  const handleSelectLayout = (newLayout: string) => {
    setLayout(newLayout);
    if (newLayout.toLowerCase().includes('mining') || newLayout.toLowerCase().includes('survey') || newLayout.toLowerCase().includes('ai')) {
      setActiveUpperTab('AI Survey');
      setStatusAlert({
        type: 'idle',
        message: 'Switched workspace to Mining Survey & AI Mapping photogrammetry workstation.',
      });
    } else {
      setActiveUpperTab('Objects');
      setStatusAlert({
        type: 'idle',
        message: `Layout switched to ${newLayout}.`,
      });
    }
  };

  // Tour Management Handlers
  const handleAddTour = (name: string, description: string) => {
    const newTour: CameraTour = {
      id: `tour_${Date.now()}`,
      name,
      description,
      durationFrames: 90,
      loop: true,
      createdAt: new Date().toLocaleDateString(),
      keyframes: [],
    };
    saveTours([...tours, newTour]);
    setActiveTourId(newTour.id);
    setStatusAlert({
      type: 'success',
      message: `Created new camera animation tour "${name}".`,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleUpdateTour = (updatedTour: CameraTour) => {
    const next = tours.map((t) => (t.id === updatedTour.id ? updatedTour : t));
    saveTours(next);
  };

  const handleDeleteTour = (tourId: string) => {
    const next = tours.filter((t) => t.id !== tourId);
    saveTours(next);
    if (activeTourId === tourId && next.length > 0) {
      setActiveTourId(next[0].id);
    }
    setStatusAlert({
      type: 'idle',
      message: 'Deleted camera tour.',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleAddKeyframeFromCurrent = (camState?: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
  }, name?: string, frame?: number) => {
    if (!activeTour) return;
    const targetFrame = frame !== undefined ? frame : timeline.currentFrame;
    const defaultPos = camState?.position || { x: 14, y: 8, z: 18 };
    const defaultTgt = camState?.target || { x: -0.5, y: 2.0, z: 0 };
    const newKf: CameraKeyframe = {
      id: `kf_${Date.now()}`,
      name: name || `Waypoint @ ${targetFrame}F`,
      frame: targetFrame,
      position: defaultPos,
      target: defaultTgt,
      fov: camState?.fov || 42,
    };
    const nextKfs = [...activeTour.keyframes, newKf].sort((a, b) => a.frame - b.frame);
    handleUpdateTour({ ...activeTour, keyframes: nextKfs });
    setStatusAlert({
      type: 'success',
      message: `Recorded viewpoint into "${activeTour.name}" at Frame ${targetFrame}.`,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleUpdateKeyframeFromCurrent = (keyframeId: string, camState?: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
  }) => {
    if (!activeTour) return;
    const pos = camState?.position || { x: 14, y: 8, z: 18 };
    const tgt = camState?.target || { x: -0.5, y: 2.0, z: 0 };
    const nextKfs = activeTour.keyframes.map((k) =>
      k.id === keyframeId ? { ...k, position: pos, target: tgt, fov: camState?.fov || k.fov } : k
    );
    handleUpdateTour({ ...activeTour, keyframes: nextKfs });
    setStatusAlert({
      type: 'success',
      message: `Updated keyframe waypoint with current view.`,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleDeleteKeyframe = (keyframeId: string) => {
    if (!activeTour) return;
    const nextKfs = activeTour.keyframes.filter((k) => k.id !== keyframeId);
    handleUpdateTour({ ...activeTour, keyframes: nextKfs });
    setStatusAlert({
      type: 'idle',
      message: 'Deleted keyframe waypoint.',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleReorderKeyframe = (keyframeId: string, direction: 'up' | 'down') => {
    if (!activeTour) return;
    const idx = activeTour.keyframes.findIndex((k) => k.id === keyframeId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activeTour.keyframes.length) return;
    const nextKfs = [...activeTour.keyframes];
    const temp = nextKfs[idx];
    nextKfs[idx] = nextKfs[targetIdx];
    nextKfs[targetIdx] = temp;
    const tempFrame = nextKfs[idx].frame;
    nextKfs[idx].frame = nextKfs[targetIdx].frame;
    nextKfs[targetIdx].frame = tempFrame;
    handleUpdateTour({ ...activeTour, keyframes: nextKfs });
  };

  // Keyboard Shortcuts (Standard Cinema 4D keys + F8 Play/Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.key === 'F8' || e.code === 'F8') {
        e.preventDefault();
        setTimeline((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      } else if (e.key === 'k' || e.key === 'K') {
        handleAddKeyframeFromCurrent();
      } else if (e.key === 'e' || e.key === 'E') {
        setActiveTool('move');
        setStatusAlert({
          type: 'idle',
          message: 'Move tool activated. Drag gizmo or click in viewport to reposition.',
        });
      } else if (e.key === 't' || e.key === 'T') {
        setActiveTool('scale');
        setStatusAlert({ type: 'idle', message: 'Scale tool activated.' });
      } else if (e.key === 'r' || e.key === 'R') {
        setActiveTool('rotate');
        setStatusAlert({ type: 'idle', message: 'Rotate tool activated.' });
      } else if (e.key === '9') {
        setActiveTool('live_selection');
        setStatusAlert({ type: 'idle', message: 'Live Selection activated.' });
      } else if (e.key === 'w' || e.key === 'W') {
        setIsWorldSpace((prev) => !prev);
      } else if (e.key === 'x' || e.key === 'X') {
        setAxisLocks((prev) => ({ ...prev, x: !prev.x }));
      } else if (e.key === 'y' || e.key === 'Y') {
        setAxisLocks((prev) => ({ ...prev, y: !prev.y }));
      } else if (e.key === 'z' || e.key === 'Z') {
        setAxisLocks((prev) => ({ ...prev, z: !prev.z }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Record undo state before modification
  const pushUndoState = () => {
    setHistoryStack((prev) => [...prev.slice(-20), JSON.parse(JSON.stringify(objects))]);
    setRedoStack([]);
  };

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (historyStack.length === 0) {
      setStatusAlert({
        type: 'idle',
        message: 'Nothing left to undo.',
      });
      return;
    }
    const previous = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(objects))]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setObjects(previous);
    setStatusAlert({
      type: 'idle',
      message: 'Undo executed.',
    });
  }, [historyStack, objects]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) {
      setStatusAlert({
        type: 'idle',
        message: 'Nothing left to redo.',
      });
      return;
    }
    const next = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(objects))]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setObjects(next);
    setStatusAlert({
      type: 'idle',
      message: 'Redo executed.',
    });
  }, [redoStack, objects]);

  // Revert Project Baseline (Working Revert Arrow ↺)
  const handleRevertProject = useCallback(() => {
    pushUndoState();
    setObjects(getCombinedSceneObjects('rugged_timbered_photo'));
    setMaterials(getAllCombinedMaterials());
    setCurrentPresetId('rugged_timbered_photo');
    setSelectedObjectId('Rugged_Timbered_Mine_Tunnel_Photo');
    setSelectedMaterialId('mat_photo_rock');
    setTimeline((prev) => ({ ...prev, currentFrame: 0, isPlaying: false }));
    setStatusAlert({
      type: 'success',
      message: 'Mining Site project reverted to default surface & subsurface baseline.',
      details: 'Restored both 3D models: Rugged Timbered Drift (Photo Reference) and Classic Diorama Tunnel.',
    });
  }, [objects]);

  // Object Selection Handler with Auto-Scene Activation
  const handleSelectObject = useCallback((id: string | null) => {
    setSelectedObjectId(id);
    if (!id) return;

    const classicIds = [
      'Mining_Tunnel_Complex',
      'Rock_Tunnel_Mesh',
      'Timber_Support_Arches',
      'Railway_Tracks',
      'Mine_Cart_Ore',
      'Hanging_Work_Lights',
      'Ventilation_Duct'
    ];

    const photoIds = [
      'Rugged_Timbered_Mine_Tunnel_Photo',
      'Photo_Timber_Square_Sets',
      'Timber_Posts_Battered',
      'Timber_Lintel_Caps',
      'Longitudinal_Ceiling_Stringers',
      'Four_Tier_Side_Lagging_Planks',
      'Overhead_Roof_Lagging',
      'Unlined_Adit_Cavern_Heading',
      'Packed_Dirt_Floor_Rubble',
      'Workstation_Lantern_Brackets'
    ];

    if (classicIds.includes(id) && currentPresetId !== 'classic_diorama') {
      handleSelectPreset('classic_diorama');
      setStatusAlert({
        type: 'success',
        message: '3D Viewport switched to Classic Diorama Mining Tunnel.',
        details: 'Selected object: ' + id,
      });
    } else if (photoIds.includes(id) && currentPresetId === 'classic_diorama') {
      handleSelectPreset('rugged_timbered_photo');
      setStatusAlert({
        type: 'success',
        message: '3D Viewport switched to Rugged Timbered Drift (Photo Reference).',
        details: 'Selected object: ' + id,
      });
    }
  }, [currentPresetId, handleSelectPreset]);

  // Update object transform
  const handleUpdateTransform = useCallback(
    (pos: Vector3D, rot: Vector3D, scale: Vector3D) => {
      if (!selectedObjectId) return;
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id === selectedObjectId) {
            return { ...obj, position: pos, rotation: rot, scale };
          }
          if (obj.children) {
            return {
              ...obj,
              children: obj.children.map((c) =>
                c.id === selectedObjectId ? { ...c, position: pos, rotation: rot, scale } : c
              ),
            };
          }
          return obj;
        })
      );
    },
    [selectedObjectId]
  );

  // Update object properties (e.g. name, visibility)
  const handleUpdateProperty = (key: string, val: any) => {
    if (!selectedObjectId) return;
    pushUndoState();
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id === selectedObjectId) {
          return { ...obj, [key]: val };
        }
        if (obj.children) {
          return {
            ...obj,
            children: obj.children.map((c) =>
              c.id === selectedObjectId ? { ...c, [key]: val } : c
            ),
          };
        }
        return obj;
      })
    );
  };

  // Toggle editor / renderer visibility
  const handleToggleVisibility = (id: string, target: 'editor' | 'renderer') => {
    // If user clicked editor visibility on a root tunnel, switch active preset if currently inactive
    if (id === 'Mining_Tunnel_Complex' && target === 'editor') {
      if (currentPresetId !== 'classic_diorama') {
        handleSelectPreset('classic_diorama');
        return;
      }
    } else if (id === 'Rugged_Timbered_Mine_Tunnel_Photo' && target === 'editor') {
      if (currentPresetId === 'classic_diorama') {
        handleSelectPreset('rugged_timbered_photo');
        return;
      }
    }

    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id === id) {
          return target === 'editor'
            ? { ...obj, visibleInEditor: !obj.visibleInEditor }
            : { ...obj, visibleInRenderer: !obj.visibleInRenderer };
        }
        if (obj.children) {
          return {
            ...obj,
            children: obj.children.map((c) => {
              if (c.id === id) {
                return target === 'editor'
                  ? { ...c, visibleInEditor: !c.visibleInEditor }
                  : { ...c, visibleInRenderer: !c.visibleInRenderer };
              }
              if (c.children) {
                return {
                  ...c,
                  children: c.children.map((sub) =>
                    sub.id === id
                      ? target === 'editor'
                        ? { ...sub, visibleInEditor: !sub.visibleInEditor }
                        : { ...sub, visibleInRenderer: !sub.visibleInRenderer }
                      : sub
                  ),
                };
              }
              return c;
            }),
          };
        }
        return obj;
      })
    );
  };

  // Toggle hierarchy expansion
  const handleToggleExpand = (id: string) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id === id) return { ...obj, expanded: !obj.expanded };
        if (obj.children) {
          return {
            ...obj,
            children: obj.children.map((c) => {
              if (c.id === id) return { ...c, expanded: !c.expanded };
              if (c.children) {
                return {
                  ...c,
                  children: c.children.map((sub) =>
                    sub.id === id ? { ...sub, expanded: !sub.expanded } : sub
                  ),
                };
              }
              return c;
            }),
          };
        }
        return obj;
      })
    );
  };

  // Add new primitive object
  const handleAddObject = (type: string) => {
    pushUndoState();
    const newId = `${type}_${Date.now().toString().slice(-4)}`;
    const formattedName =
      type === 'survey_marker'
        ? 'Survey_Station_Marker'
        : `${type.charAt(0).toUpperCase() + type.slice(1)}`;

    const newObj: C4DSceneObject = {
      id: newId,
      name: formattedName,
      type: type as any,
      position: { x: 0, y: type === 'survey_marker' ? 100 : 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visibleInEditor: true,
      visibleInRenderer: true,
      locked: false,
      expanded: false,
      materialIds: [type === 'survey_marker' ? 'mat_gold' : 'mat_iron'],
    };
    setObjects((prev) => [...prev, newObj]);
    setSelectedObjectId(newId);
    setStatusAlert({
      type: 'success',
      message: `Created new ${newObj.name} object in Mining Site scene.`,
    });
  };

  // Delete object
  const handleDeleteObject = (id: string) => {
    pushUndoState();
    setObjects((prev) => prev.filter((o) => o.id !== id));
    if (selectedObjectId === id) setSelectedObjectId(null);
    setStatusAlert({
      type: 'idle',
      message: `Deleted object ${id}.`,
    });
  };

  // Create new material
  const handleCreateMaterial = () => {
    const newMat: C4DMaterial = {
      id: `mat_${Date.now()}`,
      name: `Mat.${materials.length + 1}`,
      color: '#4e545c',
      roughness: 0.5,
      metalness: 0.1,
      specular: 0.5,
    };
    setMaterials((prev) => [...prev, newMat]);
    setSelectedMaterialId(newMat.id);
  };

  // Apply 3D Survey Markers generated by AI Photogrammetry
  const handleApply3DMarkers = useCallback(
    (points: Array<{ stationId: string; x: number; y: number; z: number; color: string; label: string }>) => {
      pushUndoState();
      const newStationChildren: C4DSceneObject[] = points.map((p) => ({
        id: `Station_${p.stationId}`,
        name: `Station_${p.stationId} (${p.label})`,
        type: 'survey_marker' as any,
        position: { x: Math.round(p.x * 100), y: Math.round(p.y * 100), z: Math.round(p.z * 100) },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visibleInEditor: true,
        visibleInRenderer: true,
        locked: false,
        expanded: false,
        materialIds: ['mat_gold'],
      }));

      const surveyGroup: C4DSceneObject = {
        id: `AI_Survey_Set_${Date.now().toString().slice(-4)}`,
        name: `AI_Survey_Stations (${points.length} Pts)`,
        type: 'group',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visibleInEditor: true,
        visibleInRenderer: true,
        locked: false,
        expanded: true,
        materialIds: ['mat_gold'],
        children: newStationChildren,
      };

      setObjects((prev) => [surveyGroup, ...prev]);
      setSelectedObjectId(surveyGroup.id);
      setSurveyStationMarkers(points);
      setStatusAlert({
        type: 'success',
        message: `Synthesized ${points.length} 3D Survey Station markers into scene hierarchy and 3D viewport.`,
        details: 'Station spatial nodes mapped with sequential distance tags and drift coordinates.',
      });
    },
    [objects]
  );

  // Save Project (.c4d.json export)
  const handleSaveProject = () => {
    const projectData = {
      projectName: 'Mining Site',
      version: 'R19.068',
      timestamp: new Date().toISOString(),
      objects,
      materials,
      timeline,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mining_Site_Project_${new Date().toISOString().slice(0, 10)}.c4d.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusAlert({
      type: 'success',
      message: 'Project successfully exported as Mining_Site.c4d.json',
      details: 'All surface and subsurface hierarchies, materials, and keyframes saved.',
    });
  };

  // Open Project (.c4d.json import)
  const handleOpenProjectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.objects && Array.isArray(parsed.objects)) {
          pushUndoState();
          setObjects(parsed.objects);
          if (parsed.materials) setMaterials(parsed.materials);
          if (parsed.timeline) setTimeline(parsed.timeline);
          setStatusAlert({
            type: 'success',
            message: `Loaded Mining Site project "${file.name}".`,
            details: `Successfully restored ${parsed.objects.length} top-level nodes and scene data.`,
          });
        } else {
          setStatusAlert({
            type: 'error',
            errorCode: 'ERR_INVALID_FILE',
            message: 'Invalid Project File Format',
            details: 'The selected JSON file does not contain a valid Cinema 4D scene hierarchy array.',
          });
        }
      } catch (err: any) {
        setStatusAlert({
          type: 'error',
          errorCode: 'ERR_PARSE_FAILED',
          message: 'Failed to read project file',
          details: err.message || 'JSON parse syntax error.',
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Selected Object lookup (recursive through all child levels)
  const findObjectById = (list: C4DSceneObject[], targetId: string | null): C4DSceneObject | null => {
    if (!targetId) return null;
    for (const item of list) {
      if (item.id === targetId) return item;
      if (item.children) {
        const found = findObjectById(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedObject = findObjectById(objects, selectedObjectId);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#292929] text-[#e0e0e0] font-sans">
      {/* Hidden File Input for Opening Saved Projects */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.c4d.json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 1. Main Top Menu Bar */}
      <MenuBar
        currentLayout={layout}
        onSelectLayout={handleSelectLayout}
        onNewObject={handleAddObject}
        onResetView={() =>
          setStatusAlert({ type: 'idle', message: 'Layout reset to Startup default.' })
        }
        onSaveProject={handleSaveProject}
        onOpenProject={handleOpenProjectClick}
        onRevertProject={handleRevertProject}
        onOpenAISurvey={() => {
          setActiveUpperTab('AI Survey');
          setStatusAlert({
            type: 'idle',
            message: 'Opened AI Photogrammetry Survey & Geological Mapping panel.',
          });
        }}
        onOpenTours={() => {
          setActiveUpperTab('Camera Tours');
          setStatusAlert({
            type: 'idle',
            message: 'Opened Camera Tours & Keyframe Path Animation panel.',
          });
        }}
        onTriggerRender={() => setShowPictureViewer(true)}
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
      />

      {/* 2. Main Horizontal Toolbar */}
      <MainToolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        axisLocks={axisLocks}
        onToggleAxis={(axis) => setAxisLocks((prev) => ({ ...prev, [axis]: !prev[axis] }))}
        isWorldSpace={isWorldSpace}
        onToggleCoordinateSpace={() => setIsWorldSpace((prev) => !prev)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onRevert={handleRevertProject}
        onAddPrimitive={handleAddObject}
        onTriggerRender={() => setShowPictureViewer(true)}
        onOpenRenderSettings={() => setShowRenderSettings(true)}
        onOpenPictureViewer={() => setShowPictureViewer(true)}
      />

      {/* 3. Docking Layout: Central Viewport, Object Manager / Camera Tours / AI Survey, Attribute Manager, Timeline, Materials, Coordinates */}
      <DockLayout
        activeUpperTab={activeUpperTab}
        onUpperTabChange={setActiveUpperTab}
        tourKeyframeCount={activeTour?.keyframes.length || 0}
        cameraTourPanel={
          <CameraTourManager
            tours={tours}
            activeTourId={activeTourId}
            onSelectTour={setActiveTourId}
            onAddTour={handleAddTour}
            onUpdateTour={handleUpdateTour}
            onDeleteTour={handleDeleteTour}
            onAddKeyframeFromCurrent={(name, frame) => handleAddKeyframeFromCurrent(undefined, name, frame)}
            onUpdateKeyframeFromCurrent={(kfId) => handleUpdateKeyframeFromCurrent(kfId)}
            onDeleteKeyframe={handleDeleteKeyframe}
            onReorderKeyframe={handleReorderKeyframe}
            onJumpToKeyframe={(kf) => {
              setTimeline((prev) => ({ ...prev, currentFrame: kf.frame }));
            }}
            isTourPlaybackEnabled={isTourPlaybackEnabled}
            onToggleTourPlayback={setIsTourPlaybackEnabled}
            currentFrame={timeline.currentFrame}
            isPlaying={timeline.isPlaying}
            onTogglePlay={() => setTimeline((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
          />
        }
        aiSurveyPanel={
          <AIGeologicalMapperPanel
            projectTitle="Mining Site - Surface & Subsurface Mapping"
            onStatusChange={setStatusAlert}
            onApply3DMarkers={handleApply3DMarkers}
            currentPresetId={currentPresetId}
            onSelectPreset={handleSelectPreset}
            onApplyCustomScene={(p) => handleSelectPreset('ai_custom', p)}
          />
        }
        leftPalette={
          <LeftToolPalette
            activeMode={activeLeftMode}
            onSelectMode={setActiveLeftMode}
            isSnapping={isSnapping}
            onToggleSnapping={() => setIsSnapping((prev) => !prev)}
          />
        }
        viewport={
          <Viewport3D
            selectedObject={selectedObject}
            onSelectObject={setSelectedObjectId}
            activeTool={activeTool}
            activeLeftMode={activeLeftMode}
            materials={materials}
            isPlaying={timeline.isPlaying}
            currentFrame={timeline.currentFrame}
            onUpdateTransform={handleUpdateTransform}
            activeTour={activeTour}
            isTourPlaybackEnabled={isTourPlaybackEnabled}
            onRecordCurrentView={(cam) => handleAddKeyframeFromCurrent(cam)}
            surveyStationMarkers={surveyStationMarkers}
            onJumpToSurveyTab={() => setActiveUpperTab('AI Survey')}
            currentPresetId={currentPresetId}
            onSelectPreset={handleSelectPreset}
            proceduralParams={proceduralParams}
            onUpdateProceduralParams={handleUpdateProceduralParams}
          />
        }
        timeline={
          <Timeline
            timeline={timeline}
            onScrub={(frame) => setTimeline((prev) => ({ ...prev, currentFrame: frame }))}
            onTogglePlay={() => setTimeline((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
            onStepFrame={(delta) =>
              setTimeline((prev) => ({
                ...prev,
                currentFrame: stepFrame(
                  prev.currentFrame,
                  prev.minFrame,
                  prev.previewMaxFrame,
                  delta,
                  prev.loop
                ),
              }))
            }
            onGoToStart={() => setTimeline((prev) => ({ ...prev, currentFrame: prev.minFrame }))}
            onGoToEnd={() =>
              setTimeline((prev) => ({ ...prev, currentFrame: prev.previewMaxFrame }))
            }
            keyframeFrames={activeTour?.keyframes.map((k) => k.frame) || []}
            onRecordKeyframe={() => handleAddKeyframeFromCurrent()}
            tourName={activeTour?.name}
            isTourPlaybackEnabled={isTourPlaybackEnabled}
          />
        }
        materialManager={
          <MaterialManager
            materials={materials}
            selectedMaterialId={selectedMaterialId}
            onSelectMaterial={setSelectedMaterialId}
            onUpdateMaterial={(updated) =>
              setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
            }
            onCreateMaterial={handleCreateMaterial}
          />
        }
        coordinateManager={
          <CoordinateManager
            selectedObject={selectedObject}
            onApplyCoordinates={handleUpdateTransform}
          />
        }
        objectManager={
          <ObjectManager
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelectObject={handleSelectObject}
            onToggleVisibility={handleToggleVisibility}
            onToggleExpand={handleToggleExpand}
            onDeleteObject={handleDeleteObject}
            onAddObject={handleAddObject}
            currentPresetId={currentPresetId}
            onSelectPreset={handleSelectPreset}
            onSaveProject={handleSaveProject}
            onOpenProject={handleOpenProjectClick}
            onRevertProject={handleRevertProject}
          />
        }
        attributeManager={
          <AttributeManager
            selectedObject={selectedObject}
            onUpdateTransform={handleUpdateTransform}
            onUpdateProperty={handleUpdateProperty}
          />
        }
      />

      {/* 4. Attention-Grabbing Bottom Status Bar */}
      <StatusBar
        status={statusAlert}
        projectName="Mining Site"
        onRevert={handleRevertProject}
        onClearError={() =>
          setStatusAlert({
            type: 'idle',
            message: 'Ready. All systems operational.',
          })
        }
      />

      {/* 5. Picture Viewer Modal */}
      <PictureViewerModal
        isOpen={showPictureViewer}
        onClose={() => setShowPictureViewer(false)}
        currentFrame={timeline.currentFrame}
      />

      {/* 6. Render Settings Modal */}
      <RenderSettingsModal
        isOpen={showRenderSettings}
        onClose={() => setShowRenderSettings(false)}
        onApplyAndRender={() => setShowPictureViewer(true)}
      />
    </div>
  );
}
