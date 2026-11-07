export type ToolMode =
  | 'live_selection'
  | 'move'
  | 'scale'
  | 'rotate'
  | 'model'
  | 'polygon'
  | 'edge'
  | 'point'
  | 'texture'
  | 'axis'
  | 'snap';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface C4DMaterial {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  specular: number;
  bumpScale?: number;
}

export interface C4DSceneObject {
  id: string;
  name: string;
  type: 'submarine' | 'cube' | 'cylinder' | 'sphere' | 'camera' | 'light' | 'group';
  position: Vector3D;
  rotation: Vector3D; // In degrees (Heading, Pitch, Bank / H, P, B or X, Y, Z)
  scale: Vector3D;
  visibleInEditor: boolean;
  visibleInRenderer: boolean;
  locked: boolean;
  expanded: boolean;
  materialIds: string[];
  children?: C4DSceneObject[];
  parameters?: Record<string, number | string | boolean>;
}

export interface TimelineState {
  currentFrame: number;
  minFrame: number;
  previewMaxFrame: number;
  projectMaxFrame: number;
  isPlaying: boolean;
  fps: number;
  loop: boolean;
}

export interface CoordinateState {
  system: 'world' | 'object';
  transformType: 'scale' | 'size';
  pos: Vector3D;
  size: Vector3D;
  rot: Vector3D;
}
