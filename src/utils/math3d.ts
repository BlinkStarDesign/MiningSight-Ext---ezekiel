import { Vector3D } from '../types/c4d';

export const C4D_UNIT_SCALE = 0.01; // 100 cm = 1 Three.js unit

/**
 * Converts Cinema 4D cm coordinates into Three.js scene units.
 */
export function cmToUnits(cm: number): number {
  return cm * C4D_UNIT_SCALE;
}

/**
 * Converts Three.js scene units into Cinema 4D cm coordinates.
 */
export function unitsToCm(units: number): number {
  return Math.round(units / C4D_UNIT_SCALE * 100) / 100;
}

/**
 * Converts degrees to radians.
 */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 */
export function radToDeg(rad: number): number {
  return Math.round(((rad * 180) / Math.PI) * 100) / 100;
}

/**
 * Formats numeric value as C4D unit string (e.g. "120 cm" or "45 °").
 */
export function formatValue(val: number, unit: 'cm' | 'deg' | 'ratio' = 'cm'): string {
  const rounded = Math.round(val * 100) / 100;
  if (unit === 'cm') return `${rounded} cm`;
  if (unit === 'deg') return `${rounded} °`;
  return `${rounded}`;
}

/**
 * Parses user input string from C4D text field (handles numbers with or without units).
 */
export function parseC4DInput(input: string): number {
  const sanitized = input.replace(/[^0-9.-]/g, '').trim();
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : num;
}

/**
 * Calculates current playback time in seconds from frame number and FPS.
 */
export function frameToSeconds(frame: number, fps: number = 30): number {
  return frame / fps;
}

/**
 * Advances current frame with looping bounds.
 */
export function stepFrame(current: number, min: number, max: number, delta: number = 1, loop: boolean = true): number {
  let next = current + delta;
  if (next > max) {
    next = loop ? min : max;
  } else if (next < min) {
    next = loop ? max : min;
  }
  return next;
}

/**
 * Calculates cart position along a track for a given timeline frame (0 to maxFrames).
 */
export function calculateCartZ(frame: number, maxFrames: number, startZ: number, endZ: number): number {
  const t = Math.max(0, Math.min(1, frame / maxFrames));
  return startZ + (endZ - startZ) * t;
}

/**
 * Calculates wheel rotation angle (in radians) from distance traveled and wheel radius.
 */
export function calculateWheelRotation(distanceTraveled: number, wheelRadius: number): number {
  if (wheelRadius <= 0) return 0;
  return distanceTraveled / wheelRadius;
}

/**
 * Clamps vector coordinates within realistic limits.
 */
export function clampVector(v: Vector3D, minVal: number = -100000, maxVal: number = 100000): Vector3D {
  return {
    x: Math.min(Math.max(v.x, minVal), maxVal),
    y: Math.min(Math.max(v.y, minVal), maxVal),
    z: Math.min(Math.max(v.z, minVal), maxVal),
  };
}
