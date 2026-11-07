import { MiningTunnelRig, ShadingDisplayMode } from '../scene/miningTunnelGenerator';
import { C4DSceneObject, C4DMaterial } from './c4d';

export type TunnelPresetId = 'classic_diorama' | 'rugged_timbered_photo' | 'ai_custom';

export interface ProceduralTunnelParams {
  id?: string;
  name?: string;
  description?: string;
  referenceImage?: string;
  // Timber Framing
  timberSetCount: number; // e.g. 7 frames
  timberSpacing: number; // e.g. 5.5 meters
  timberWidth: number; // e.g. 0.35m
  timberHeight: number; // e.g. 4.2m
  spanWidth: number; // e.g. 4.8m
  postBatterAngleDeg: number; // e.g. 5.5 degrees inward tilt
  laggingPlankTiers: number; // e.g. 4 horizontal planks per side
  laggingPlankWidth: number; // e.g. 0.38m
  laggingGap: number; // e.g. 0.15m open rock exposure
  includeRoofLagging: boolean;
  includeTopStringers: boolean;
  
  // Cavern & Rock Bore
  tunnelLength: number; // e.g. 48.0m
  unlinedAditLength: number; // e.g. 18.0m raw cave heading beyond timber sets
  aditBoreRadius: number; // e.g. 2.6m
  rockRoughness: number; // 0 to 1
  rockColorPalette: 'ochre_quartzite' | 'cavern_granite' | 'ironstone_red' | 'pyrite_gold';
  
  // Floor & Infrastructure
  floorType: 'packed_earth' | 'ballast_tracks' | 'stone_paved';
  includeRubbleDebris: boolean;
  rubbleCount: number; // e.g. 35 stones
  includeRailwayTracks: boolean;
  includeOreCart: boolean;
  
  // Lighting & Atmosphere
  headlampIntensity: number; // e.g. 3.5
  ambientWarmth: number; // 0 to 1
  fogDensity: number; // 0 to 0.05
}

export interface TunnelPresetMetadata {
  id: TunnelPresetId;
  name: string;
  subtitle: string;
  description: string;
  imageReference?: string;
  thumbnailIcon: string;
  keyFeatures: string[];
  defaultParams: ProceduralTunnelParams;
  getSceneObjects: () => C4DSceneObject[];
  getMaterials: () => C4DMaterial[];
}
