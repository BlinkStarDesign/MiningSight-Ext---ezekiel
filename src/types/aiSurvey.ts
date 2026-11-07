export interface SurveyImageItem {
  id: string;
  name: string;
  dataUrl: string;
  distanceFromLast: number; // in meters (critical for 3D measurement)
  stationId: string;
  depthBelowSurface: number; // in meters
  headingAzimuth: number; // in degrees (0-360)
  pitchAngle: number; // in degrees (-90 to +90)
  rockStrata: string;
  rqdPercent: number; // Rock Quality Designation %
  fractureSpacingCm: number;
}

export interface PhotogrammetryConstants {
  sensorFocalLengthMm: number;
  gsdMmPerPixel: number;
  overlapPercentage: number;
  convergenceToleranceMm: number;
}

export interface SurveyAnalysisResult {
  surveySummary: {
    siteName: string;
    geotechnicalUnit: string;
    rockMassRating: number;
    rockClass: string;
    faultOrientation: string;
    convergenceAssessment: string;
  };
  measurements: {
    totalDriftLengthMeters: number;
    averageTunnelWidthMeters: number;
    averageTunnelHeightMeters: number;
    volumetricExcavationM3: number;
    estimatedConvergenceMm: number;
  };
  goldVeinSeam: {
    gradeEstimateGramsPerTonne: number;
    strikeDip: string;
    averageVeinThicknessCm: number;
    estimatedGoldOreTonnage: number;
    mineralizedZoneDescription: string;
  };
  structuralAlerts: string[];
  meshGeneratedPoints: Array<{
    stationId: string;
    x: number;
    y: number;
    z: number;
    color: string;
    label: string;
  }>;
  suggested3DAction: string;
}

export interface SurveyRecord {
  id: string;
  timestamp: string;
  projectTitle: string;
  imagesCount: number;
  totalBaselineDistance: number;
  notes: string;
  result: SurveyAnalysisResult;
  source: string;
}

export interface StatusAlert {
  type: 'idle' | 'loading' | 'error' | 'success' | 'warning';
  message: string;
  details?: string;
  timestamp?: string;
  errorCode?: string;
}

/**
 * Generates an authentic simulated geological borehole/tunnel survey image with
 * rock strata, mineral veins, and metric measurement grid in base64 data URL format.
 */
export function generateSampleGeologicalImage(
  title: string,
  strata: string,
  depth: number,
  station: string
): string {
  if (typeof document === 'undefined') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="#2d2925"/></svg>';
  }
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Base rock backdrop
  const grad = ctx.createLinearGradient(0, 0, 0, 480);
  grad.addColorStop(0, '#2d2925');
  grad.addColorStop(0.5, '#443e39');
  grad.addColorStop(1, '#2b2723');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Sedimentary strata bands
  for (let y = 0; y < 480; y += 16) {
    const darkness = 0.2 + 0.3 * Math.sin(y * 0.08);
    ctx.fillStyle = `rgba(20, 18, 15, ${darkness})`;
    ctx.fillRect(0, y, 640, 10 + Math.sin(y * 0.2) * 6);
  }

  // Craggy fractures and fault joints
  ctx.strokeStyle = 'rgba(15, 12, 10, 0.75)';
  ctx.lineWidth = 2;
  for (let f = 0; f < 12; f++) {
    ctx.beginPath();
    let sx = 40 + f * 48;
    let sy = 20;
    ctx.moveTo(sx, sy);
    for (let step = 0; step < 8; step++) {
      sx += (Math.sin(f + step) * 35) + 8;
      sy += 55;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Golden quartz mineral vein
  ctx.strokeStyle = 'rgba(235, 175, 45, 0.85)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(100, 30);
  ctx.bezierCurveTo(240, 120, 200, 340, 420, 450);
  ctx.stroke();

  // Mineral sparkles
  ctx.fillStyle = 'rgba(255, 220, 110, 0.9)';
  for (let i = 0; i < 40; i++) {
    const px = 120 + Math.random() * 320;
    const py = 50 + Math.random() * 380;
    ctx.beginPath();
    ctx.arc(px, py, 1.5 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Metric survey crosshair grid & fiducial markers
  ctx.strokeStyle = 'rgba(0, 220, 255, 0.35)';
  ctx.lineWidth = 0.8;
  for (let x = 60; x < 640; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 480);
    ctx.stroke();
  }
  for (let y = 60; y < 480; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }

  // Survey HUD overlay
  ctx.fillStyle = 'rgba(12, 16, 20, 0.75)';
  ctx.fillRect(10, 10, 260, 68);
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, 260, 68);

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`SURVEY ID: ${station}`, 18, 28);
  ctx.fillStyle = '#ffaa24';
  ctx.font = '10px monospace';
  ctx.fillText(`STRATA: ${strata}`, 18, 44);
  ctx.fillStyle = '#ddd';
  ctx.fillText(`DEPTH: -${depth.toFixed(1)}m RL | METRIC GSD: 1.2mm`, 18, 60);

  // Crosshair center
  ctx.strokeStyle = '#e88724';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(320, 240, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(320, 210);
  ctx.lineTo(320, 270);
  ctx.moveTo(290, 240);
  ctx.lineTo(350, 240);
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Returns a ready-to-use sample dataset of geological survey images with distance tags.
 */
export function getDefaultSampleSurveyImages(): SurveyImageItem[] {
  return [
    {
      id: 'img_st01',
      name: 'Drift_Face_ST01_Baseline.jpg',
      dataUrl: generateSampleGeologicalImage('ST-01 Drift Face', 'Granodiorite Wall', 140.0, 'ST-01'),
      distanceFromLast: 0.0,
      stationId: 'ST-01',
      depthBelowSurface: 140.0,
      headingAzimuth: 115,
      pitchAngle: -4,
      rockStrata: 'Granodiorite Footwall',
      rqdPercent: 82,
      fractureSpacingCm: 35,
    },
    {
      id: 'img_st02',
      name: 'Tunnel_Advance_ST02_2.8m.jpg',
      dataUrl: generateSampleGeologicalImage('ST-02 Quartz Seam', 'Auriferous Quartzite', 142.4, 'ST-02'),
      distanceFromLast: 2.8,
      stationId: 'ST-02',
      depthBelowSurface: 142.4,
      headingAzimuth: 118,
      pitchAngle: -3,
      rockStrata: 'Auriferous Quartzite Seam',
      rqdPercent: 74,
      fractureSpacingCm: 22,
    },
    {
      id: 'img_st03',
      name: 'Ore_Vein_ST03_2.6m.jpg',
      dataUrl: generateSampleGeologicalImage('ST-03 Shear Contact', 'Pyrite-Silica Breccia', 144.8, 'ST-03'),
      distanceFromLast: 2.6,
      stationId: 'ST-03',
      depthBelowSurface: 144.8,
      headingAzimuth: 121,
      pitchAngle: -5,
      rockStrata: 'Pyrite-Silica Breccia Contact',
      rqdPercent: 68,
      fractureSpacingCm: 18,
    },
  ];
}
