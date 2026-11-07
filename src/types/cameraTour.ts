export interface CameraKeyframe {
  id: string;
  name: string;
  frame: number; // 0 to maxFrame
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov?: number;
  pitch?: number;
  yaw?: number;
  notes?: string;
}

export interface CameraTour {
  id: string;
  name: string;
  description: string;
  durationFrames: number;
  loop: boolean;
  keyframes: CameraKeyframe[];
  isBuiltIn?: boolean;
  createdAt: string;
}

export interface HotspotInfo {
  id: string;
  name: string;
  category: 'geology' | 'support' | 'equipment' | 'survey' | 'electrical';
  position: { x: number; y: number; z: number };
  description: string;
  details: {
    label: string;
    value: string;
  }[];
}
