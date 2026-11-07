import { CameraKeyframe, CameraTour, HotspotInfo } from '../types/cameraTour';

/**
 * Calculates Euclidean distance between two 3D points in meters.
 * In this 3D diorama, 1 Three.js unit = 1 meter (100 cm).
 */
export function calculateDistanceMeters(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Clamps first-person camera position to stay within the physical drift cavern boundary.
 * Floor level is around y = 1.7m (eye level), drift width is +/- 3.2m, length +/- 24m.
 */
export function clampTunnelWalkPosition(pos: { x: number; y: number; z: number }): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: Math.max(-4.2, Math.min(2.4, pos.x)),
    y: Math.max(1.2, Math.min(4.8, pos.y)),
    z: Math.max(-23.0, Math.min(23.0, pos.z)),
  };
}

/**
 * Smooth cubic Hermite interpolation (smoothstep)
 */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Linear vector interpolation
 */
function lerpVector(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  t: number
): { x: number; y: number; z: number } {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/**
 * Interpolates camera position and lookAt target along a sequence of keyframes
 * for any given frame index.
 */
export function interpolateCameraTour(
  keyframes: CameraKeyframe[],
  currentFrame: number,
  durationFrames: number = 90
): {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
} {
  if (!keyframes || keyframes.length === 0) {
    return {
      position: { x: 18, y: 14, z: 24 },
      target: { x: -0.5, y: 3.0, z: 0 },
      fov: 42,
    };
  }

  if (keyframes.length === 1) {
    const k = keyframes[0];
    return {
      position: { ...k.position },
      target: { ...k.target },
      fov: k.fov || 42,
    };
  }

  // Ensure keyframes are sorted by frame
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  // If currentFrame is before or at the first keyframe
  if (currentFrame <= sorted[0].frame) {
    return {
      position: { ...sorted[0].position },
      target: { ...sorted[0].target },
      fov: sorted[0].fov || 42,
    };
  }

  // If currentFrame is at or after the last keyframe
  const last = sorted[sorted.length - 1];
  if (currentFrame >= last.frame) {
    return {
      position: { ...last.position },
      target: { ...last.target },
      fov: last.fov || 42,
    };
  }

  // Find surrounding keyframe segment
  let prevIdx = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (currentFrame >= sorted[i].frame && currentFrame <= sorted[i + 1].frame) {
      prevIdx = i;
      break;
    }
  }

  const k1 = sorted[prevIdx];
  const k2 = sorted[prevIdx + 1];

  const span = Math.max(1, k2.frame - k1.frame);
  const rawT = (currentFrame - k1.frame) / span;
  const t = smoothstep(Math.max(0, Math.min(1, rawT)));

  const pos = lerpVector(k1.position, k2.position, t);
  const tgt = lerpVector(k1.target, k2.target, t);
  const fov = (k1.fov || 42) + ((k2.fov || 42) - (k1.fov || 42)) * t;

  return {
    position: pos,
    target: tgt,
    fov,
  };
}

/**
 * Pre-loaded production camera tours ready for instant playback.
 */
export function getDefaultCameraTours(): CameraTour[] {
  return [
    {
      id: 'tour_drift_flight',
      name: '1. Drift Portal Inspection (Default)',
      description: 'Cinematic flythrough following the rails through timber arches into the mineralized drift face.',
      durationFrames: 90,
      loop: true,
      isBuiltIn: true,
      createdAt: 'Pre-loaded',
      keyframes: [
        {
          id: 'kf_1',
          name: 'Portal Entrance Overview',
          frame: 0,
          position: { x: 16, y: 10, z: 22 },
          target: { x: -0.5, y: 2.5, z: 0 },
          fov: 44,
          notes: 'Diorama wide shot capturing entire mining complex and entrance portal.',
        },
        {
          id: 'kf_2',
          name: 'Timber Support Sets & Rail Bed',
          frame: 24,
          position: { x: 6, y: 3.5, z: 12 },
          target: { x: -0.5, y: 2.0, z: 4 },
          fov: 46,
          notes: 'Low perspective gliding past heavy Douglas fir timber sets.',
        },
        {
          id: 'kf_3',
          name: 'Mine Cart & Ore Chunks',
          frame: 50,
          position: { x: 2.5, y: 2.2, z: 0 },
          target: { x: -0.5, y: 1.4, z: 0 },
          fov: 42,
          notes: 'Medium close-up of rolling ore cart filled with auriferous quartz rock.',
        },
        {
          id: 'kf_4',
          name: 'Hanging Miner Lanterns & Duct',
          frame: 70,
          position: { x: -2.0, y: 4.8, z: -8 },
          target: { x: -1.0, y: 3.0, z: -14 },
          fov: 48,
          notes: 'High ceiling perspective highlighting ventilation pipe and warm worklights.',
        },
        {
          id: 'kf_5',
          name: 'Drift Face & Vein Terminus',
          frame: 90,
          position: { x: -0.5, y: 2.4, z: -16 },
          target: { x: -0.5, y: 2.4, z: -24 },
          fov: 50,
          notes: 'Terminal tunnel face where primary high-grade gold seam intersects roof.',
        },
      ],
    },
    {
      id: 'tour_ore_cart_ride',
      name: '2. Ore Cart Ride-Along',
      description: 'First-person perspective tracking directly behind and above the ore cart traversing the drift.',
      durationFrames: 90,
      loop: true,
      isBuiltIn: true,
      createdAt: 'Pre-loaded',
      keyframes: [
        {
          id: 'kf_cart_1',
          name: 'Rear Cart Mount',
          frame: 0,
          position: { x: -0.5, y: 2.4, z: 19 },
          target: { x: -0.5, y: 1.2, z: 14 },
          fov: 55,
        },
        {
          id: 'kf_cart_2',
          name: 'Mid-drift Rail Travel',
          frame: 45,
          position: { x: -0.5, y: 2.4, z: 4 },
          target: { x: -0.5, y: 1.2, z: -2 },
          fov: 52,
        },
        {
          id: 'kf_cart_3',
          name: 'Approaching Unloading Ledge',
          frame: 90,
          position: { x: -0.5, y: 2.4, z: -12 },
          target: { x: -0.5, y: 1.2, z: -18 },
          fov: 50,
        },
      ],
    },
    {
      id: 'tour_geological_seam',
      name: '3. Geological Vein & Strata Survey',
      description: 'Close inspection of the auriferous quartz seam, hanging wall rockbolts, and granodiorite contact.',
      durationFrames: 90,
      loop: true,
      isBuiltIn: true,
      createdAt: 'Pre-loaded',
      keyframes: [
        {
          id: 'kf_geo_1',
          name: 'Strata Contact Wall (ST-01)',
          frame: 0,
          position: { x: -4.2, y: 3.0, z: 12 },
          target: { x: -6.0, y: 3.5, z: 12 },
          fov: 40,
        },
        {
          id: 'kf_geo_2',
          name: 'Hanging Wall Rockbolts (ST-02)',
          frame: 45,
          position: { x: -3.5, y: 4.8, z: 0 },
          target: { x: -5.0, y: 5.5, z: 0 },
          fov: 45,
        },
        {
          id: 'kf_geo_3',
          name: 'High-Grade Gold Quartz Face (ST-03)',
          frame: 90,
          position: { x: -2.8, y: 2.5, z: -14 },
          target: { x: -4.5, y: 2.5, z: -16 },
          fov: 40,
        },
      ],
    },
  ];
}

/**
 * Geological & engineering points of interest for interactive hotspot inspection.
 */
export function getDefaultTunnelHotspots(): HotspotInfo[] {
  return [
    {
      id: 'spot_gold_vein',
      name: 'Auriferous Quartz Vein Seam',
      category: 'geology',
      position: { x: -4.8, y: 3.2, z: -4.0 },
      description: 'Primary gold-bearing hydrothermal quartz vein intersecting hanging wall rock mass.',
      details: [
        { label: 'Estimated Grade', value: '5.2 - 7.4 g/t Au' },
        { label: 'Strike / Dip', value: 'N18°W / 76°NE' },
        { label: 'Average Thickness', value: '46 cm' },
        { label: 'Mineralization', value: 'Pyrite-arsenopyrite quartz breccia' },
      ],
    },
    {
      id: 'spot_timber_arch',
      name: 'Timber Support Set #04',
      category: 'support',
      position: { x: -1.2, y: 5.2, z: 6.0 },
      description: 'Heavy square-set Douglas fir timber frame sustaining vaulted drift roof pressure.',
      details: [
        { label: 'Beam Cross-Section', value: '30 cm × 30 cm' },
        { label: 'Installed Spacing', value: '2.70 m center-to-center' },
        { label: 'Design Load Capacity', value: '42 tonnes per set' },
        { label: 'Condition Index', value: 'Excellent (RMR Class II compliant)' },
      ],
    },
    {
      id: 'spot_ore_cart',
      name: 'Mine Ore Cart (End-Dump)',
      category: 'equipment',
      position: { x: -0.5, y: 1.2, z: 2.0 },
      description: 'Rusted steel mining car loaded with broken auriferous quartz ore chunks.',
      details: [
        { label: 'Capacity', value: '1.8 tonnes payload' },
        { label: 'Track Gauge', value: '600 mm narrow gauge' },
        { label: 'Wheelset Bearings', value: 'Chilled iron flanged rollers' },
        { label: 'Current Tonnage', value: '1.45 t ore payload' },
      ],
    },
    {
      id: 'spot_work_light',
      name: 'Vapor-Proof Mining Lantern',
      category: 'electrical',
      position: { x: -3.2, y: 5.5, z: 8.0 },
      description: 'Flameproof 110V industrial tungsten worklight providing warm localized illumination.',
      details: [
        { label: 'Luminous Flux', value: '2,800 Lumens (Warm Amber)' },
        { label: 'Voltage & Enclosure', value: '110V AC / MSHA explosion-proof' },
        { label: 'Suspension Type', value: 'Reinforced messenger wire cable' },
      ],
    },
    {
      id: 'spot_vent_duct',
      name: 'Underground Ventilation Duct',
      category: 'equipment',
      position: { x: -3.8, y: 5.8, z: -2.0 },
      description: 'Rigid galvanized spiral duct delivering fresh forced intake air to active drift face.',
      details: [
        { label: 'Diameter', value: '750 mm (30 inches)' },
        { label: 'Air Flow Rate', value: '8.5 m³/second' },
        { label: 'Gas Clearance', value: 'Methane < 0.1%, CO < 5 ppm' },
      ],
    },
  ];
}
