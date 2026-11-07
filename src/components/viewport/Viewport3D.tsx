import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  RotateCw,
  Footprints,
  Lightbulb,
  Ruler,
  Camera,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Target,
  Sparkles,
  Layers,
  Box,
  Check,
  Crosshair,
  Image as ImageIcon,
  Sliders as SlidersIcon,
} from 'lucide-react';
import { MiningTunnelRig, ShadingDisplayMode } from '../../scene/miningTunnelGenerator';
import { TunnelPresetId, ProceduralTunnelParams } from '../../types/tunnelScene';
import { TUNNEL_PRESETS, createTunnelRigByPreset } from '../../scene/tunnelPresetRegistry';
import { ReferencePhotoModal } from '../modals/ReferencePhotoModal';
import { SceneParametersModal } from '../modals/SceneParametersModal';
import { C4DMaterial, C4DSceneObject, ToolMode, Vector3D } from '../../types/c4d';
import { CameraKeyframe, CameraTour, HotspotInfo } from '../../types/cameraTour';
import { degToRad } from '../../utils/math3d';
import {
  clampTunnelWalkPosition,
  interpolateCameraTour,
  calculateDistanceMeters,
  getDefaultTunnelHotspots,
} from '../../utils/cameraAnimation';

interface Viewport3DProps {
  selectedObject: C4DSceneObject | null;
  onSelectObject: (objId: string | null) => void;
  activeTool: ToolMode;
  activeLeftMode?: ToolMode;
  materials: C4DMaterial[];
  isPlaying: boolean;
  currentFrame: number;
  onUpdateTransform?: (pos: Vector3D, rot: Vector3D, scale: Vector3D) => void;
  activeTour?: CameraTour | null;
  isTourPlaybackEnabled?: boolean;
  onRecordCurrentView?: (camState: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
  }) => void;
  surveyStationMarkers?: Array<{
    stationId: string;
    x: number;
    y: number;
    z: number;
    color: string;
    label: string;
  }>;
  onJumpToSurveyTab?: () => void;
  currentPresetId?: TunnelPresetId;
  onSelectPreset?: (presetId: TunnelPresetId) => void;
  proceduralParams?: ProceduralTunnelParams;
  onUpdateProceduralParams?: (params: ProceduralTunnelParams) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  selectedObject,
  onSelectObject,
  activeTool,
  activeLeftMode,
  materials,
  isPlaying,
  currentFrame,
  onUpdateTransform,
  activeTour,
  isTourPlaybackEnabled = true,
  onRecordCurrentView,
  surveyStationMarkers = [],
  onJumpToSurveyTab,
  currentPresetId = 'rugged_timbered_photo',
  onSelectPreset,
  proceduralParams = TUNNEL_PRESETS.rugged_timbered_photo.defaultParams,
  onUpdateProceduralParams,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const miningTunnelRigRef = useRef<MiningTunnelRig | null>(null);
  const gizmoGroupRef = useRef<THREE.Group | null>(null);
  const flashlightRef = useRef<THREE.SpotLight | null>(null);
  const surveyMarkersGroupRef = useRef<THREE.Group | null>(null);
  const rulerLineRef = useRef<THREE.Line | null>(null);

  // Navigation mode: 'orbit' (C4D orbital viewer) vs 'walk' (First-Person walkable drift inspection)
  const [navMode, setNavMode] = useState<'orbit' | 'walk'>('orbit');

  // Miner's Headlamp / Flashlight state
  const [flashlightOn, setFlashlightOn] = useState<boolean>(true);

  // 3D Measurement Tool state
  const [isRulerActive, setIsRulerActive] = useState<boolean>(false);
  const [rulerPoints, setRulerPoints] = useState<Array<{ x: number; y: number; z: number }>>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Hotspot Inspection state
  const [hotspots] = useState<HotspotInfo[]>(getDefaultTunnelHotspots());
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotInfo | null>(null);

  // Shading mode state
  const [shadingMode, setShadingMode] = useState<ShadingDisplayMode>('gouraud');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [displayMenuOpen, setDisplayMenuOpen] = useState<boolean>(false);
  const [cameraMenuOpen, setCameraMenuOpen] = useState<boolean>(false);
  const [viewMenuOpen, setViewMenuOpen] = useState<boolean>(false);
  const [hotspotMenuOpen, setHotspotMenuOpen] = useState<boolean>(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState<boolean>(false);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);
  const [showParametersModal, setShowParametersModal] = useState<boolean>(false);
  const [showOnscreenWalkControls, setShowOnscreenWalkControls] = useState<boolean>(true);

  // Align camera to exact perspective of reference photo
  const alignCameraToPhotoReference = useCallback(() => {
    setNavMode('walk');
    walkPosRef.current.set(0, 1.85, 17.5);
    walkYawRef.current = Math.PI;
    walkPitchRef.current = -0.04;
    targetRef.current.set(0, 1.85, -25);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.85, 17.5);
      cameraRef.current.lookAt(0, 1.85, -25);
      cameraRef.current.fov = 46;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // Camera navigation coordinates
  // Orbit coordinates:
  const sphericalRef = useRef<THREE.Spherical>(new THREE.Spherical(33, 1.18, 0.44));
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(-0.5, 3.0, 0));

  // Walk mode state (inside the tunnel: position + yaw & pitch)
  const walkPosRef = useRef<THREE.Vector3>(new THREE.Vector3(-0.5, 1.85, 18.0));
  const walkYawRef = useRef<number>(Math.PI); // Facing inward toward -Z
  const walkPitchRef = useRef<number>(-0.05);
  const isWalkingRef = useRef<{ w: boolean; s: boolean; a: boolean; d: boolean; shift: boolean }>({
    w: false,
    s: false,
    a: false,
    d: false,
    shift: false,
  });

  // Dragging state
  const isDraggingRef = useRef<boolean>(false);
  const dragModeRef = useRef<'orbit' | 'pan' | 'zoom' | 'look' | 'none'>('none');
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Expose current camera state for recording keyframes
  const captureCurrentCameraState = useCallback(() => {
    if (!cameraRef.current) return null;
    const cam = cameraRef.current;
    let tgt = targetRef.current.clone();

    if (navMode === 'walk') {
      const dir = new THREE.Vector3(
        -Math.sin(walkYawRef.current) * Math.cos(walkPitchRef.current),
        Math.sin(walkPitchRef.current),
        -Math.cos(walkYawRef.current) * Math.cos(walkPitchRef.current)
      );
      tgt = walkPosRef.current.clone().addScaledVector(dir, 10);
    }

    return {
      position: { x: Number(cam.position.x.toFixed(2)), y: Number(cam.position.y.toFixed(2)), z: Number(cam.position.z.toFixed(2)) },
      target: { x: Number(tgt.x.toFixed(2)), y: Number(tgt.y.toFixed(2)), z: Number(tgt.z.toFixed(2)) },
      fov: cam.fov,
    };
  }, [navMode]);

  const handleRecordViewClick = () => {
    const state = captureCurrentCameraState();
    if (state && onRecordCurrentView) {
      onRecordCurrentView(state);
    }
  };

  // Jump camera to keyframe
  const jumpCameraToKeyframe = useCallback((kf: CameraKeyframe) => {
    if (!cameraRef.current) return;
    targetRef.current.set(kf.target.x, kf.target.y, kf.target.z);
    walkPosRef.current.set(kf.position.x, kf.position.y, kf.position.z);

    const posVec = new THREE.Vector3(kf.position.x, kf.position.y, kf.position.z);
    const dir = new THREE.Vector3().subVectors(targetRef.current, posVec);
    sphericalRef.current.setFromVector3(dir.negate());

    if (kf.fov && cameraRef.current) {
      cameraRef.current.fov = kf.fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // Sync left palette modes with 3D wireframe / point display
  useEffect(() => {
    if (!activeLeftMode) return;
    if (activeLeftMode === 'polygon') setShadingMode('gouraud_lines');
    else if (activeLeftMode === 'edge') setShadingMode('wireframe');
    else if (activeLeftMode === 'point') setShadingMode('points');
    else if (activeLeftMode === 'model') setShadingMode('gouraud');
  }, [activeLeftMode]);

  // Sync materials with Three.js meshes
  useEffect(() => {
    if (!miningTunnelRigRef.current) return;
    const { rock, timber, iron, gold } = miningTunnelRigRef.current.materials;

    const rockMat = materials.find((m) => m.name.toLowerCase().includes('rock') || m.id === 'mat_rock');
    if (rockMat) {
      rock.color.setStyle(rockMat.color);
      rock.roughness = rockMat.roughness;
      rock.metalness = rockMat.metalness;
      rock.needsUpdate = true;
    }

    const timberMat = materials.find((m) => m.name.toLowerCase().includes('timber') || m.id === 'mat_timber');
    if (timberMat) {
      timber.color.setStyle(timberMat.color);
      timber.roughness = timberMat.roughness;
      timber.metalness = timberMat.metalness;
      timber.needsUpdate = true;
    }

    const ironMat = materials.find((m) => m.name.toLowerCase().includes('iron') || m.id === 'mat_iron');
    if (ironMat) {
      iron.color.setStyle(ironMat.color);
      iron.roughness = ironMat.roughness;
      iron.metalness = ironMat.metalness;
      iron.needsUpdate = true;
    }

    const goldMat = materials.find((m) => m.name.toLowerCase().includes('lantern') || m.name.toLowerCase().includes('gold') || m.id === 'mat_gold');
    if (goldMat) {
      gold.color.setStyle(goldMat.color);
      gold.roughness = goldMat.roughness;
      gold.metalness = goldMat.metalness;
      gold.needsUpdate = true;
    }
  }, [materials]);

  // Sync selected object transformation to 3D scene
  useEffect(() => {
    if (!miningTunnelRigRef.current || !selectedObject) return;
    const tunnel = miningTunnelRigRef.current.root;

    tunnel.position.set(selectedObject.position.x * 0.01, selectedObject.position.y * 0.01, selectedObject.position.z * 0.01);
    tunnel.rotation.set(
      degToRad(selectedObject.rotation.x),
      degToRad(selectedObject.rotation.y),
      degToRad(selectedObject.rotation.z)
    );
    tunnel.scale.set(selectedObject.scale.x, selectedObject.scale.y, selectedObject.scale.z);
    tunnel.visible = selectedObject.visibleInEditor;

    if (gizmoGroupRef.current) {
      gizmoGroupRef.current.position.copy(tunnel.position);
      gizmoGroupRef.current.visible = selectedObject.visibleInEditor && (activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale');
    }
  }, [selectedObject, activeTool]);

  // Update Survey Markers in 3D Scene
  useEffect(() => {
    if (!sceneRef.current) return;
    if (surveyMarkersGroupRef.current) {
      sceneRef.current.remove(surveyMarkersGroupRef.current);
    }

    const group = new THREE.Group();
    group.name = 'Survey_Station_Markers_3D';
    surveyMarkersGroupRef.current = group;

    surveyStationMarkers.forEach((m) => {
      // Station pin tripod / sphere
      const sphereGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: m.color || '#00e5ff',
        emissive: m.color || '#00e5ff',
        emissiveIntensity: 0.6,
        roughness: 0.3,
      });
      const pin = new THREE.Mesh(sphereGeo, sphereMat);
      pin.position.set(m.x, m.y, m.z);
      pin.name = `Marker_${m.stationId}`;

      // Beacon vertical laser line from floor to station point
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(m.x, 0.1, m.z),
        new THREE.Vector3(m.x, m.y, m.z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: m.color || '#00e5ff', transparent: true, opacity: 0.85 });
      const line = new THREE.Line(lineGeo, lineMat);

      group.add(pin);
      group.add(line);
    });

    sceneRef.current.add(group);
  }, [surveyStationMarkers]);

  // WebGL Scene Initialization
  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    if (!mount || !canvas) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x555555);

    if (!isSoftwareGl) {
      try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        pmremGenerator.dispose();
      } catch (e) {}
    }

    // Camera
    const camera = new THREE.PerspectiveCamera(44, mount.clientWidth / mount.clientHeight, 0.4, 2000);
    cameraRef.current = camera;

    // Miner's Headlamp / Flashlight
    const flashlight = new THREE.SpotLight(0xfff0dd, 5.0, 45, Math.PI / 4, 0.4, 1.2);
    flashlight.position.set(0, 0, 0);
    flashlight.target = new THREE.Object3D();
    scene.add(flashlight.target);
    camera.add(flashlight);
    scene.add(camera);
    flashlightRef.current = flashlight;

    // Grid Helper
    const gridHelper = new THREE.GridHelper(160, 80, 0x3d3d3d, 0x4f4f4f);
    gridHelper.position.y = -6.0;
    scene.add(gridHelper);

    // Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.0);
    keyLight.position.set(25, 45, 30);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd0e0ff, 1.2);
    fillLight.position.set(-35, 25, -25);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xe8e8e8, 0x303030, 0.7);
    scene.add(hemiLight);

    // Procedural Mining Tunnel
    const miningTunnelRig = createTunnelRigByPreset(currentPresetId, proceduralParams);
    miningTunnelRigRef.current = miningTunnelRig;
    scene.add(miningTunnelRig.root);
    miningTunnelRig.setDisplayMode(shadingMode);

    // Gizmo handles
    const gizmoGroup = new THREE.Group();
    gizmoGroupRef.current = gizmoGroup;
    gizmoGroup.position.copy(miningTunnelRig.root.position);
    gizmoGroup.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 4, 0xee3333, 0.8, 0.4));
    gizmoGroup.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 4, 0x33cc33, 0.8, 0.4));
    gizmoGroup.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 4, 0x3366ee, 0.8, 0.4));
    scene.add(gizmoGroup);

    // Ruler 3D laser line
    const rulerGeo = new THREE.BufferGeometry();
    const rulerMat = new THREE.LineBasicMaterial({ color: 0xff0055, linewidth: 3, depthTest: false });
    const rulerLine = new THREE.Line(rulerGeo, rulerMat);
    rulerLine.visible = false;
    scene.add(rulerLine);
    rulerLineRef.current = rulerLine;

    // Resize handling
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    // Render & Animation Loop
    let animationFrameId = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const time = now / 1000;

      // 1. Animate procedural tunnel & rolling cart
      if (miningTunnelRigRef.current) {
        miningTunnelRigRef.current.animate(time, isPlaying, currentFrame);
      }

      // 2. Camera Positioning
      if (isTourPlaybackEnabled && activeTour && activeTour.keyframes.length > 0 && (isPlaying || currentFrame > 0)) {
        // TOUR PATH ANIMATION (Follows user's recorded tour path automatically!)
        const tourCam = interpolateCameraTour(activeTour.keyframes, currentFrame, activeTour.durationFrames);
        camera.position.set(tourCam.position.x, tourCam.position.y, tourCam.position.z);
        camera.lookAt(tourCam.target.x, tourCam.target.y, tourCam.target.z);
        if (tourCam.fov && camera.fov !== tourCam.fov) {
          camera.fov = tourCam.fov;
          camera.updateProjectionMatrix();
        }
      } else if (navMode === 'walk') {
        // WALK MODE (First-Person Walkthrough inside Tunnel Drift)
        const speed = isWalkingRef.current.shift ? 7.5 : 3.2;
        const forward = new THREE.Vector3(-Math.sin(walkYawRef.current), 0, -Math.cos(walkYawRef.current)).normalize();
        const right = new THREE.Vector3(Math.cos(walkYawRef.current), 0, -Math.sin(walkYawRef.current)).normalize();

        const moveVec = new THREE.Vector3();
        if (isWalkingRef.current.w) moveVec.add(forward);
        if (isWalkingRef.current.s) moveVec.sub(forward);
        if (isWalkingRef.current.d) moveVec.add(right);
        if (isWalkingRef.current.a) moveVec.sub(right);

        if (moveVec.lengthSq() > 0) {
          moveVec.normalize().multiplyScalar(speed * delta);
          walkPosRef.current.add(moveVec);
        }

        // Clamp walk bounds
        const clamped = clampTunnelWalkPosition(walkPosRef.current);
        walkPosRef.current.set(clamped.x, clamped.y, clamped.z);

        // Apply head-bob when moving
        const bob = moveVec.lengthSq() > 0 ? Math.sin(time * 10) * 0.04 : 0;
        camera.position.set(walkPosRef.current.x, walkPosRef.current.y + bob, walkPosRef.current.z);

        const lookTarget = new THREE.Vector3(
          camera.position.x - Math.sin(walkYawRef.current) * Math.cos(walkPitchRef.current) * 10,
          camera.position.y + Math.sin(walkPitchRef.current) * 10,
          camera.position.z - Math.cos(walkYawRef.current) * Math.cos(walkPitchRef.current) * 10
        );
        camera.lookAt(lookTarget);
      } else {
        // ORBIT MODE (Classic C4D Orbit & Pan)
        camera.position.setFromSpherical(sphericalRef.current).add(targetRef.current);
        camera.lookAt(targetRef.current);
      }

      // Flashlight target update
      if (flashlightRef.current) {
        flashlightRef.current.visible = flashlightOn;
        if (flashlightOn) {
          const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
          flashlightRef.current.target.position.copy(camera.position).addScaledVector(forwardDir, 20);
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [isPlaying, currentFrame, navMode, flashlightOn, isTourPlaybackEnabled, activeTour]);

  // Update wireframe / shading mode
  useEffect(() => {
    if (!miningTunnelRigRef.current) return;
    miningTunnelRigRef.current.setDisplayMode(shadingMode);
  }, [shadingMode]);

  // Keyboard navigation for Walk Mode (WASD + Space/Shift, F flashlight, V mode toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'v' || e.key === 'V') {
        setNavMode((prev) => (prev === 'orbit' ? 'walk' : 'orbit'));
      } else if (e.key === 'f' || e.key === 'F') {
        setFlashlightOn((prev) => !prev);
      } else if (e.key === 'k' || e.key === 'K') {
        handleRecordViewClick();
      }

      if (navMode === 'walk') {
        if (e.code === 'KeyW' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') isWalkingRef.current.w = true;
        if (e.code === 'KeyS' || e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') isWalkingRef.current.s = true;
        if (e.code === 'KeyA' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') isWalkingRef.current.a = true;
        if (e.code === 'KeyD' || e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') isWalkingRef.current.d = true;
        if (e.shiftKey) isWalkingRef.current.shift = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') isWalkingRef.current.w = false;
      if (e.code === 'KeyS' || e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') isWalkingRef.current.s = false;
      if (e.code === 'KeyA' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') isWalkingRef.current.a = false;
      if (e.code === 'KeyD' || e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') isWalkingRef.current.d = false;
      if (!e.shiftKey) isWalkingRef.current.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [navMode, handleRecordViewClick]);
 
  // Dynamically Rebuild Rig when preset or proceduralParams changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (miningTunnelRigRef.current) {
      scene.remove(miningTunnelRigRef.current.root);
    }

    const newRig = createTunnelRigByPreset(currentPresetId, proceduralParams);
    miningTunnelRigRef.current = newRig;
    scene.add(newRig.root);
    newRig.setDisplayMode(shadingMode);

    if (gizmoGroupRef.current) {
      gizmoGroupRef.current.position.copy(newRig.root.position);
    }
  }, [currentPresetId, proceduralParams]);

  // Sync Shading Mode with Rig
  useEffect(() => {
    if (miningTunnelRigRef.current) {
      miningTunnelRigRef.current.setDisplayMode(shadingMode);
    }
  }, [shadingMode]);

  // Pointer Interactions: Orbit, Pan, Zoom, Look, Raycast
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (isRulerActive && cameraRef.current && sceneRef.current && miningTunnelRigRef.current) {
      // 3D Laser Ruler Measurement
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
      const hits = raycaster.intersectObjects(miningTunnelRigRef.current.root.children, true);
      if (hits.length > 0) {
        const pt = hits[0].point;
        if (rulerPoints.length === 0 || rulerPoints.length >= 2) {
          setRulerPoints([pt]);
          setMeasuredDistance(null);
          if (rulerLineRef.current) rulerLineRef.current.visible = false;
        } else if (rulerPoints.length === 1) {
          const newPts = [rulerPoints[0], pt];
          setRulerPoints(newPts);
          const dist = calculateDistanceMeters(newPts[0], newPts[1]);
          setMeasuredDistance(dist);
          if (rulerLineRef.current) {
            rulerLineRef.current.geometry.setFromPoints([
              new THREE.Vector3(newPts[0].x, newPts[0].y, newPts[0].z),
              new THREE.Vector3(newPts[1].x, newPts[1].y, newPts[1].z),
            ]);
            rulerLineRef.current.visible = true;
          }
        }
      }
      return;
    }

    if (navMode === 'walk') {
      dragModeRef.current = 'look';
    } else {
      if (e.button === 2 || (e.button === 0 && e.altKey) || e.button === 1) {
        dragModeRef.current = 'pan';
      } else {
        dragModeRef.current = 'orbit';

        // Raycasting for object selection
        if (cameraRef.current && miningTunnelRigRef.current) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
          const intersects = raycaster.intersectObjects(miningTunnelRigRef.current.root.children, true);
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            if (hit.name.includes('Cart') || hit.parent?.name.includes('Cart')) {
              onSelectObject('Mine_Cart_Ore');
            } else {
              onSelectObject('Mining_Tunnel_Complex');
            }
          }
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !cameraRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (navMode === 'walk' || dragModeRef.current === 'look') {
      walkYawRef.current -= dx * 0.005;
      walkPitchRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, walkPitchRef.current - dy * 0.005));
    } else if (dragModeRef.current === 'orbit') {
      sphericalRef.current.theta -= dx * 0.007;
      sphericalRef.current.phi = Math.max(0.05, Math.min(Math.PI - 0.05, sphericalRef.current.phi - dy * 0.007));
    } else if (dragModeRef.current === 'pan') {
      const panFactor = sphericalRef.current.radius * 0.0018;
      const cam = cameraRef.current;
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 1);
      targetRef.current.addScaledVector(right, -dx * panFactor);
      targetRef.current.addScaledVector(up, dy * panFactor);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    dragModeRef.current = 'none';
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (navMode === 'walk') {
      // Step forward or backward with mouse wheel in walk mode
      const forward = new THREE.Vector3(-Math.sin(walkYawRef.current), 0, -Math.cos(walkYawRef.current));
      walkPosRef.current.addScaledVector(forward, -Math.sign(e.deltaY) * 1.5);
      const clamped = clampTunnelWalkPosition(walkPosRef.current);
      walkPosRef.current.set(clamped.x, clamped.y, clamped.z);
    } else {
      sphericalRef.current.radius = Math.max(6, Math.min(220, sphericalRef.current.radius + e.deltaY * 0.05));
    }
  };

  const handleCaptureScreenshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `MiningSight_3D_${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full select-none overflow-hidden bg-[#555555]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block outline-none ${
          isRulerActive ? 'cursor-cell' : navMode === 'walk' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Top Viewport Navigation and Mode Bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-[#383838]/95 border-b border-[#252525] flex items-center justify-between px-2 text-[11px] text-[#cfcfcf] z-10 backdrop-blur-sm overflow-x-auto scrollbar-none">
        {/* Left Controls: Preset Selector, Menus, Orbit vs Walk, Flashlight, Ruler, Hotspots */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-max">
          {/* SCENE PRESET SELECTOR (Classic Diorama vs Rugged Timbered Photo vs AI Custom) */}
          <div className="relative">
            <button
              onClick={() => {
                setPresetMenuOpen(!presetMenuOpen);
                setViewMenuOpen(false);
                setDisplayMenuOpen(false);
                setCameraMenuOpen(false);
                setHotspotMenuOpen(false);
              }}
              className="bg-[#272727] hover:bg-[#404040] text-[#e88724] font-semibold px-2 py-0.5 rounded-[2px] border border-[#484848] flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
              title="Switch 3D procedural scene architecture"
            >
              <Layers className="w-3 h-3 text-[#e88724]" />
              <span>
                Scene: {TUNNEL_PRESETS[currentPresetId]?.name.split(' ')[0]} ▾
              </span>
            </button>
            {presetMenuOpen && (
              <div className="absolute top-7 left-0 w-64 bg-[#2b2b2b] border border-[#181818] shadow-2xl py-1.5 z-40 text-[11px] text-[#e0e0e0] rounded-[2px]">
                <div className="px-3 py-1 text-[9px] text-[#888] font-bold uppercase tracking-wider border-b border-[#3d3d3d] mb-1">
                  Available 3D Tunnel Scenes
                </div>
                {Object.values(TUNNEL_PRESETS).map((preset) => {
                  const isSelected = currentPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (onSelectPreset) onSelectPreset(preset.id);
                        setPresetMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-[#e88724] hover:text-black cursor-pointer transition-colors flex items-start justify-between ${
                        isSelected ? 'bg-[#38332a] text-[#e88724] font-bold' : ''
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{preset.name}</div>
                        <div className={`text-[9.5px] line-clamp-1 ${isSelected ? 'text-[#e88724]/80' : 'text-[#888]'}`}>
                          {preset.subtitle}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#e88724] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Photo Reference Comparison Button */}
          <button
            onClick={() => setShowReferenceModal(true)}
            className="hover:text-white hover:bg-[#484848] px-1.5 py-0.5 rounded-[2px] cursor-pointer flex items-center space-x-1 text-[#88bbdd] border border-transparent hover:border-[#555]"
            title="Inspect original photo reference and 3D structural mapping"
          >
            <ImageIcon className="w-3 h-3" />
            <span>Photo Ref</span>
          </button>

          {/* Quick Scene Parameters Sliders Button */}
          <button
            onClick={() => setShowParametersModal(true)}
            className="hover:text-white hover:bg-[#484848] px-1.5 py-0.5 rounded-[2px] cursor-pointer flex items-center space-x-1 text-[#e0cf85] border border-transparent hover:border-[#555]"
            title="Tune procedural timber sets, lagging tiers, and rock strata"
          >
            <SlidersIcon className="w-3 h-3 text-[#e88724]" />
            <span>Tune 3D</span>
          </button>

          <span className="text-[#555]">|</span>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setViewMenuOpen(!viewMenuOpen);
                setCameraMenuOpen(false);
                setDisplayMenuOpen(false);
                setHotspotMenuOpen(false);
                setPresetMenuOpen(false);
              }}
              className="hover:text-white hover:bg-[#505050] px-1.5 py-0.5 rounded-[2px] cursor-pointer"
            >
              View ▾
            </button>
            {viewMenuOpen && (
              <div className="absolute top-7 left-0 w-48 bg-[#303030] border border-[#202020] shadow-xl py-1 z-30 text-[11px] text-[#e0e0e0] rounded-[2px]">
                <button
                  onClick={() => {
                    alignCameraToPhotoReference();
                    setViewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black cursor-pointer text-[#88bbdd] font-semibold"
                >
                  Photo Reference Viewpoint
                </button>
                <button
                  onClick={() => {
                    sphericalRef.current.set(33, 1.18, 0.44);
                    targetRef.current.set(-0.5, 3.0, 0);
                    setViewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black cursor-pointer"
                >
                  Default Diorama Frame
                </button>
                <button
                  onClick={() => {
                    walkPosRef.current.set(-0.5, 1.85, 18.0);
                    walkYawRef.current = Math.PI;
                    walkPitchRef.current = -0.05;
                    setNavMode('walk');
                    setViewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black cursor-pointer"
                >
                  Enter Walk Mode (Tunnel Entrance)
                </button>
                <button
                  onClick={() => {
                    setShowGrid(!showGrid);
                    setViewMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black cursor-pointer flex items-center space-x-1"
                >
                  {showGrid && <Check className="w-3 h-3 text-[#e88724]" />}
                  <span>{showGrid ? 'Hide Floor Grid' : 'Show Floor Grid'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Shading Display Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setDisplayMenuOpen(!displayMenuOpen);
                setViewMenuOpen(false);
                setCameraMenuOpen(false);
                setHotspotMenuOpen(false);
              }}
              className="hover:text-white hover:bg-[#505050] px-1.5 py-0.5 rounded-[2px] cursor-pointer"
            >
              Display ▾
            </button>
            {displayMenuOpen && (
              <div className="absolute top-7 left-0 w-48 bg-[#303030] border border-[#202020] shadow-xl py-1 z-30 text-[11px] text-[#e0e0e0] rounded-[2px]">
                <button
                  onClick={() => {
                    setShadingMode('gouraud');
                    setDisplayMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black cursor-pointer flex items-center justify-between"
                >
                  <span>Textured Shading</span>
                  {shadingMode === 'gouraud' && <Check className="w-3 h-3 text-[#e88724]" />}
                </button>
                <button
                  onClick={() => {
                    setShadingMode('gouraud_lines');
                    setDisplayMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black cursor-pointer flex items-center justify-between"
                >
                  <span>Shading with Lines</span>
                  {shadingMode === 'gouraud_lines' && <Check className="w-3 h-3 text-[#e88724]" />}
                </button>
                <button
                  onClick={() => {
                    setShadingMode('wireframe');
                    setDisplayMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black cursor-pointer flex items-center justify-between"
                >
                  <span>Wireframe Mesh</span>
                  {shadingMode === 'wireframe' && <Check className="w-3 h-3 text-[#e88724]" />}
                </button>
                <button
                  onClick={() => {
                    setShadingMode('points');
                    setDisplayMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#e88724] hover:text-black cursor-pointer flex items-center justify-between"
                >
                  <span>Point Cloud Vertices</span>
                  {shadingMode === 'points' && <Check className="w-3 h-3 text-[#e88724]" />}
                </button>
              </div>
            )}
          </div>

          {/* HOTSPOTS DROPDOWN (Replacing the 5 bottom floating buttons) */}
          <div className="relative">
            <button
              onClick={() => {
                setHotspotMenuOpen(!hotspotMenuOpen);
                setViewMenuOpen(false);
                setDisplayMenuOpen(false);
                setCameraMenuOpen(false);
              }}
              className="hover:text-white hover:bg-[#505050] px-1.5 py-0.5 rounded-[2px] cursor-pointer flex items-center space-x-1"
              title="Inspect geological and structural tunnel hotspots"
            >
              <Target className="w-3 h-3 text-[#e88724]" />
              <span>Hotspots ▾</span>
            </button>
            {hotspotMenuOpen && (
              <div className="absolute top-7 left-0 w-60 bg-[#303030] border border-[#202020] shadow-xl py-1 z-30 text-[11px] text-[#e0e0e0] rounded-[2px]">
                <div className="px-3 py-1 text-[9.5px] text-[#888] font-bold uppercase tracking-wider border-b border-[#3d3d3d] mb-1">
                  Geological & Structural Hotspots
                </div>
                {hotspots.map((h) => {
                  const CategoryIcon = h.category === 'geology' ? Sparkles : h.category === 'support' ? Layers : Box;
                  return (
                    <button
                      key={h.id}
                      onClick={() => {
                        setSelectedHotspot(h);
                        targetRef.current.set(h.position.x, h.position.y, h.position.z);
                        walkPosRef.current.set(h.position.x + 3.0, h.position.y + 0.5, h.position.z + 4.0);
                        sphericalRef.current.set(12, Math.PI / 3, Math.PI / 4);
                        setHotspotMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#e88724] hover:text-black cursor-pointer flex items-center space-x-2 transition-colors"
                    >
                      <CategoryIcon className="w-3.5 h-3.5 text-[#e88724] flex-shrink-0" />
                      <span className="truncate">{h.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-3.5 w-[1px] bg-[#555] mx-0.5" />

          {/* CAMERA NAVIGATION MODE TOGGLE (Orbit vs Walkable Tunnel) */}
          <div className="flex items-center bg-[#242424] p-0.5 rounded-[2px] border border-[#444]">
            <button
              onClick={() => setNavMode('orbit')}
              className={`px-2 py-0.5 text-[10px] rounded-[1px] font-bold cursor-pointer transition-colors flex items-center space-x-1 ${
                navMode === 'orbit' ? 'bg-[#3b516b] text-white shadow-sm' : 'text-[#888] hover:text-white'
              }`}
              title="C4D Orbit/Pan Camera Mode"
            >
              <RotateCw className="w-3 h-3" />
              <span>Orbit</span>
            </button>
            <button
              onClick={() => {
                setNavMode('walk');
                walkPosRef.current.set(-0.5, 1.85, 16.0);
              }}
              className={`px-2 py-0.5 text-[10px] rounded-[1px] font-bold cursor-pointer transition-colors flex items-center space-x-1 ${
                navMode === 'walk' ? 'bg-[#e88724] text-black shadow-sm' : 'text-[#888] hover:text-white'
              }`}
              title="First-Person Walkable Drift Tour (WASD + Mouse Look)"
            >
              <Footprints className="w-3 h-3" />
              <span>Walk Mode</span>
            </button>
          </div>

          {/* Miner's Headlamp Toggle (F) */}
          <button
            onClick={() => setFlashlightOn(!flashlightOn)}
            className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold border transition-colors flex items-center space-x-1 cursor-pointer ${
              flashlightOn
                ? 'bg-[#ffe082] text-black border-[#ffd54f]'
                : 'bg-[#2b2b2b] text-[#888] border-[#444] hover:text-white'
            }`}
            title="Toggle Miner's Headlamp Flashlight (Hotkey: F)"
          >
            <Lightbulb className="w-3 h-3" />
            <span className="hidden sm:inline">{flashlightOn ? 'Lamp ON' : 'Lamp'}</span>
          </button>

          {/* 3D Laser Measurement Ruler */}
          <button
            onClick={() => {
              setIsRulerActive(!isRulerActive);
              setRulerPoints([]);
              setMeasuredDistance(null);
              if (rulerLineRef.current) rulerLineRef.current.visible = false;
            }}
            className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold border transition-colors flex items-center space-x-1 cursor-pointer ${
              isRulerActive
                ? 'bg-[#ff0055] text-white border-[#ff3377]'
                : 'bg-[#2b2b2b] text-[#888] border-[#444] hover:text-white'
            }`}
            title="3D Laser Distance Ruler (Click two points on tunnel walls)"
          >
            <Ruler className="w-3 h-3" />
            <span className="hidden sm:inline">Ruler</span>
          </button>
        </div>

        {/* Right Controls: Record Keyframe, Screenshot, Fullscreen */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-max ml-1">
          {/* Quick Record Keyframe Button */}
          <button
            onClick={handleRecordViewClick}
            className="px-2 py-0.5 bg-[#e88724] hover:bg-[#ff9933] text-black font-bold rounded-[2px] text-[10px] cursor-pointer transition-colors flex items-center space-x-1 shadow-sm"
            title="Record current camera position and angle into active animation path (Hotkey: K)"
          >
            <Camera className="w-3 h-3" />
            <span>+ Keyframe (K)</span>
          </button>

          {/* Screenshot PNG */}
          <button
            onClick={handleCaptureScreenshot}
            className="w-6 h-5 bg-[#2e2e2e] hover:bg-[#444] text-[#ddd] rounded-[2px] flex items-center justify-center cursor-pointer border border-[#444]"
            title="Save Viewport Snapshot PNG"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mode Status Banner / Reticle */}
      {navMode === 'walk' && (
        <div className="absolute top-9 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center">
          <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-[3px] border border-[#444] text-center flex items-center space-x-2">
            <Footprints className="w-3.5 h-3.5 text-[#e88724]" />
            <span className="text-[#e88724] font-bold text-[11px]">Walk Mode Active</span>
            <span className="text-[#bbb] text-[10px] hidden sm:inline">
              • WASD or Arrows to walk • Drag to look • Shift sprint • F lamp
            </span>
          </div>
          {/* Subtle crosshair reticle */}
          <div className="mt-28 w-3 h-3 border border-white/40 rounded-full flex items-center justify-center pointer-events-none">
            <div className="w-1 h-1 bg-[#e88724] rounded-full" />
          </div>
        </div>
      )}

      {/* Onscreen Walk Controls D-Pad (Touch & Mouse Click Friendly) */}
      {navMode === 'walk' && showOnscreenWalkControls && (
        <div className="absolute bottom-3 right-3 z-20 bg-black/60 backdrop-blur-md p-2 rounded-[4px] border border-[#444] flex flex-col items-center space-y-1">
          <span className="text-[9px] text-[#888] font-mono">WALK D-PAD</span>
          <button
            onPointerDown={() => (isWalkingRef.current.w = true)}
            onPointerUp={() => (isWalkingRef.current.w = false)}
            className="w-8 h-8 bg-[#333] hover:bg-[#e88724] hover:text-black text-white font-bold rounded flex items-center justify-center active:bg-[#e88724]"
            title="Walk Forward"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex space-x-1">
            <button
              onPointerDown={() => (isWalkingRef.current.a = true)}
              onPointerUp={() => (isWalkingRef.current.a = false)}
              className="w-8 h-8 bg-[#333] hover:bg-[#e88724] hover:text-black text-white font-bold rounded flex items-center justify-center active:bg-[#e88724]"
              title="Strafe Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onPointerDown={() => (isWalkingRef.current.s = true)}
              onPointerUp={() => (isWalkingRef.current.s = false)}
              className="w-8 h-8 bg-[#333] hover:bg-[#e88724] hover:text-black text-white font-bold rounded flex items-center justify-center active:bg-[#e88724]"
              title="Walk Backward"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onPointerDown={() => (isWalkingRef.current.d = true)}
              onPointerUp={() => (isWalkingRef.current.d = false)}
              className="w-8 h-8 bg-[#333] hover:bg-[#e88724] hover:text-black text-white font-bold rounded flex items-center justify-center active:bg-[#e88724]"
              title="Strafe Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => (isWalkingRef.current.shift = !isWalkingRef.current.shift)}
            className={`w-full py-0.5 text-[9px] font-bold rounded border ${
              isWalkingRef.current.shift ? 'bg-[#e88724] text-black border-[#e88724]' : 'bg-[#222] text-[#888] border-[#444]'
            }`}
          >
            Sprint {isWalkingRef.current.shift ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* 3D Ruler Measurement HUD Callout */}
      {isRulerActive && (
        <div className="absolute top-9 left-3 z-20 bg-black/80 backdrop-blur-md p-2 rounded-[3px] border border-[#ff0055] text-[11px] text-[#f0f0f0] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#ff3377] font-bold">
            <Ruler className="w-3.5 h-3.5" />
            <span>3D Laser Measurement</span>
          </div>
          <p className="text-[10px] text-[#aaa]">
            {rulerPoints.length === 0 && 'Click first point on tunnel surface.'}
            {rulerPoints.length === 1 && 'Point 1 set. Click second point to measure distance.'}
            {rulerPoints.length === 2 && measuredDistance !== null && (
              <span className="text-[#00e5ff] font-mono text-[13px] font-bold">
                Distance: {measuredDistance.toFixed(2)} m ({(measuredDistance * 100).toFixed(0)} cm)
              </span>
            )}
          </p>
        </div>
      )}

      {/* Hotspot Geotechnical Inspection Card */}
      {selectedHotspot && (
        <div className="absolute top-12 right-3 z-30 w-72 bg-[#2b2b2b]/95 border border-[#555] rounded-[3px] p-2.5 shadow-2xl text-[11px] text-[#ddd] space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[#444] pb-1.5">
            <div className="flex items-center space-x-1.5">
              {selectedHotspot.category === 'geology' ? (
                <Sparkles className="w-3.5 h-3.5 text-[#e88724]" />
              ) : selectedHotspot.category === 'support' ? (
                <Layers className="w-3.5 h-3.5 text-[#cca060]" />
              ) : (
                <Box className="w-3.5 h-3.5 text-[#60a5fa]" />
              )}
              <span className="font-bold text-[#f5f5f5] text-[11.5px]">{selectedHotspot.name}</span>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-[#888] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-[#bbb] leading-relaxed">{selectedHotspot.description}</p>
          <div className="space-y-1 bg-[#202020] p-1.5 rounded-[2px]">
            {selectedHotspot.details.map((d, idx) => (
              <div key={idx} className="flex justify-between text-[10px] gap-2">
                <span className="text-[#888] flex-shrink-0">{d.label}:</span>
                <span className="font-mono text-[#4ade80] font-medium text-right">{d.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                targetRef.current.set(selectedHotspot.position.x, selectedHotspot.position.y, selectedHotspot.position.z);
                walkPosRef.current.set(selectedHotspot.position.x + 3.0, selectedHotspot.position.y + 0.5, selectedHotspot.position.z + 4.0);
                sphericalRef.current.set(12, Math.PI / 3, Math.PI / 4);
              }}
              className="px-2 py-0.5 bg-[#3a3a3a] hover:bg-[#e88724] hover:text-black text-white rounded-[2px] text-[10px] cursor-pointer font-bold flex items-center space-x-1"
            >
              <Crosshair className="w-3 h-3" />
              <span>Focus View</span>
            </button>
            <button
              onClick={() => {
                if (onRecordCurrentView) {
                  onRecordCurrentView({
                    position: {
                      x: selectedHotspot.position.x + 3.0,
                      y: selectedHotspot.position.y + 0.5,
                      z: selectedHotspot.position.z + 4.0,
                    },
                    target: { ...selectedHotspot.position },
                    fov: 42,
                  });
                }
              }}
              className="px-2 py-0.5 bg-[#e88724] hover:bg-[#ff9933] text-black rounded-[2px] text-[10px] font-bold cursor-pointer"
            >
              + Add to Tour
            </button>
          </div>
        </div>
      )}

      {/* Top Left Projection Name */}
      <div className="absolute top-9 left-3 text-[11px] text-[#d0d0d0] font-sans tracking-wide pointer-events-none drop-shadow">
        {navMode === 'walk' ? 'Perspective (First-Person Walkthrough)' : 'Perspective (Orbit)'}
      </div>

      {/* Bottom Left 3D Coordinate Axis Indicator */}
      <div className="absolute bottom-3 left-3 pointer-events-none flex flex-col items-center">
        <svg width="44" height="44" viewBox="0 0 50 50">
          <circle cx="16" cy="34" r="2" fill="#fff" opacity="0.8" />
          <line x1="16" y1="34" x2="16" y2="12" stroke="#4ade80" strokeWidth="2" />
          <text x="13" y="10" fill="#4ade80" fontSize="10" fontWeight="bold">Y</text>
          <line x1="16" y1="34" x2="36" y2="40" stroke="#f87171" strokeWidth="2" />
          <text x="38" y="44" fill="#f87171" fontSize="10" fontWeight="bold">X</text>
          <line x1="16" y1="34" x2="30" y2="22" stroke="#60a5fa" strokeWidth="2" />
          <text x="32" y="20" fill="#60a5fa" fontSize="10" fontWeight="bold">Z</text>
        </svg>
      </div>

      {/* Bottom Right Grid Spacing Indicator */}
      <div className="absolute bottom-2.5 right-24 text-[11px] text-[#c0c0c0] font-sans tracking-wide pointer-events-none">
        Grid : 100 cm (1 m)
      </div>

      {/* Reference Photo Comparison Modal */}
      <ReferencePhotoModal
        isOpen={showReferenceModal}
        onClose={() => setShowReferenceModal(false)}
        onApplyPreset={() => {
          if (onSelectPreset) onSelectPreset('rugged_timbered_photo');
        }}
        onAlignCameraToPhoto={alignCameraToPhotoReference}
        onOpenSceneOptions={() => setShowParametersModal(true)}
        currentParams={proceduralParams}
      />

      {/* Procedural Scene Sliders Modal */}
      <SceneParametersModal
        isOpen={showParametersModal}
        onClose={() => setShowParametersModal(false)}
        params={proceduralParams}
        onApplyParams={(newP) => {
          if (onUpdateProceduralParams) onUpdateProceduralParams(newP);
        }}
      />
    </div>
  );
};
