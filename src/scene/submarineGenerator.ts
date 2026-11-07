import * as THREE from 'three';

export interface SubmarineRig {
  root: THREE.Group;
  propeller: THREE.Group;
  materials: {
    hull: THREE.MeshStandardMaterial;
    parts: THREE.MeshStandardMaterial;
    props: THREE.MeshStandardMaterial;
  };
  animate: (time: number, isPlaying: boolean) => void;
}

/**
 * Creates high-detail procedural texture for the Virginia-class nuclear submarine:
 * Anechoic stealth acoustic tiles, hull plate seams, VLS missile hatches, and flank sonar array dots.
 */
function createHullTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base graphite hull tone (matches screenshot dark slate-charcoal #323438)
  ctx.fillStyle = '#323438';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Upper casing / Lower keel subtle tonal gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#36383c');
  gradient.addColorStop(0.48, '#303236');
  gradient.addColorStop(0.50, '#26282b'); // Waterline
  gradient.addColorStop(1, '#1e2023');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Anechoic acoustic tiles grid
  ctx.strokeStyle = 'rgba(25, 27, 30, 0.45)';
  ctx.lineWidth = 1;
  const tileSize = 16;
  for (let x = 0; x < canvas.width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Major circumferential hull weld rings
  ctx.strokeStyle = 'rgba(18, 20, 22, 0.7)';
  ctx.lineWidth = 2.5;
  for (let x = 128; x < canvas.width; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Flank sonar array strips (hydrophone sensor ports along the sides)
  ctx.fillStyle = 'rgba(205, 210, 215, 0.75)';
  const flankY1 = 430;
  const flankY2 = 590;
  for (let x = 300; x < 1700; x += 28) {
    ctx.beginPath();
    ctx.arc(x, flankY1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, flankY2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // VLS (Vertical Launch System) deck hatch markings (white circles and cross markings on casing)
  ctx.strokeStyle = 'rgba(230, 235, 240, 0.85)';
  ctx.lineWidth = 2.5;
  const vlsStartX = 750;
  for (let col = 0; col < 6; col++) {
    const vx = vlsStartX + col * 52;
    ctx.beginPath();
    ctx.arc(vx, 210, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(vx, 255, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Forward rescue hatch and cross marking
  ctx.beginPath();
  ctx.arc(600, 232, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(600 - 15, 232);
  ctx.lineTo(600 + 15, 232);
  ctx.moveTo(600, 232 - 15);
  ctx.lineTo(600, 232 + 15);
  ctx.stroke();

  // Subtle tactical draft marks / hull numbers
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = 'rgba(220, 225, 230, 0.7)';
  ctx.fillText('774', 480, 238);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates normal map for subtle surface relief.
 */
function createHullNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#6868c8';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedurally constructs the Virginia-class nuclear attack submarine
 * with accurate proportions, conning tower sail, hydroplanes, missile deck,
 * cruciform stern, and functional shrouded pump-jet propulsor.
 *
 * Coordinates along Z axis:
 * Nose (Bow) is at +Z (foreground left).
 * Stern (Tail / Propulsor) is at -Z (background right).
 */
export function createVirginiaSubmarine(): SubmarineRig {
  const root = new THREE.Group();
  root.name = 'Virginia_class_Submarine';

  // --- Materials ---
  const hullTexture = createHullTexture();
  const hullNormal = createHullNormalMap();

  const hullMaterial = new THREE.MeshStandardMaterial({
    name: 'Submari',
    color: 0x36383b,
    roughness: 0.52,
    metalness: 0.28,
    map: hullTexture,
    normalMap: hullNormal,
    normalScale: new THREE.Vector2(0.2, 0.2),
  });

  const partsMaterial = new THREE.MeshStandardMaterial({
    name: 'Parts',
    color: 0x282a2d,
    roughness: 0.45,
    metalness: 0.48,
  });

  const propsMaterial = new THREE.MeshStandardMaterial({
    name: 'Props',
    color: 0x3d3830,
    roughness: 0.32,
    metalness: 0.78,
  });

  const hullRadius = 2.4;
  const cylinderLength = 32.0; // from z = -16 to z = +16

  // 1. Central Cylindrical Hull (from z = -16 to z = +16)
  const hullGeo = new THREE.CylinderGeometry(hullRadius, hullRadius, cylinderLength, 64, 16, false);
  hullGeo.rotateX(Math.PI / 2); // Axis becomes Z
  const mainHull = new THREE.Mesh(hullGeo, hullMaterial);
  mainHull.name = 'Main_Hull';
  mainHull.position.set(0, 0, 0);
  root.add(mainHull);

  // 2. Bow Sonar Dome (Smooth rounded bulbous ellipsoidal nose from z = +16 to z = +21.8)
  const domeLength = 5.8;
  const bowPoints: THREE.Vector2[] = [];
  const bowSteps = 32;
  for (let i = 0; i <= bowSteps; i++) {
    const theta = (Math.PI / 2) * (1 - i / bowSteps);
    const r = hullRadius * Math.sin(theta);
    const y = 16.0 + domeLength * Math.cos(theta);
    bowPoints.push(new THREE.Vector2(Math.max(r, 0.001), y));
  }
  const bowGeo = new THREE.LatheGeometry(bowPoints, 64);
  bowGeo.rotateX(Math.PI / 2);
  const bowMesh = new THREE.Mesh(bowGeo, hullMaterial);
  bowMesh.name = 'Bow_Sonar_Dome';
  root.add(bowMesh);

  // 3. Stern Hydrodynamic Taper (Tapering from z = -16 to z = -28.5)
  const sternPoints: THREE.Vector2[] = [];
  const sternSteps = 32;
  const sternLength = 12.5;
  const propHubRadius = 1.15;
  for (let i = 0; i <= sternSteps; i++) {
    const t = i / sternSteps;
    const y = -16.0 - t * sternLength;
    const r = hullRadius - (hullRadius - propHubRadius) * Math.pow(t, 1.35);
    sternPoints.push(new THREE.Vector2(Math.max(r, 0.001), y));
  }
  const sternGeo = new THREE.LatheGeometry(sternPoints, 64);
  sternGeo.rotateX(Math.PI / 2);
  const sternMesh = new THREE.Mesh(sternGeo, hullMaterial);
  sternMesh.name = 'Stern_Taper';
  root.add(sternMesh);

  // 4. Conning Tower / Sail (Fairwater tower forward at z = +7.5)
  const sailGroup = new THREE.Group();
  sailGroup.name = 'Sail_Tower';
  sailGroup.position.set(0, hullRadius * 0.9, 7.5);

  // Streamlined foil shape for sail
  // Forward nose of sail is at +Z, aft trailing edge at -Z
  const sailShape = new THREE.Shape();
  sailShape.moveTo(0, 3.4);
  sailShape.bezierCurveTo(0.7, 3.2, 0.85, 1.2, 0.7, -1.8);
  sailShape.bezierCurveTo(0.55, -3.2, 0.2, -3.6, 0, -3.6);
  sailShape.bezierCurveTo(-0.2, -3.6, -0.55, -3.2, -0.7, -1.8);
  sailShape.bezierCurveTo(-0.85, 1.2, -0.7, 3.2, 0, 3.4);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: 3.6,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.15,
    bevelSegments: 4,
  };
  const sailGeo = new THREE.ExtrudeGeometry(sailShape, extrudeSettings);
  sailGeo.rotateX(-Math.PI / 2); // Extrude upwards along Y
  const sailMesh = new THREE.Mesh(sailGeo, partsMaterial);
  sailMesh.name = 'Sail_Hull';
  sailGroup.add(sailMesh);

  // Sail Bridge Cockpit / Wind deflector rim
  const cockpitGeo = new THREE.BoxGeometry(0.9, 0.45, 1.5);
  const cockpit = new THREE.Mesh(cockpitGeo, partsMaterial);
  cockpit.position.set(0, 3.8, 1.2);
  sailGroup.add(cockpit);

  // Sail Dive Planes (Retractable horizontal fairwater hydroplanes)
  const sailPlaneGeo = new THREE.BoxGeometry(2.2, 0.16, 1.2);
  sailPlaneGeo.translate(1.2, 0, 0); // Pivot near root

  const stbdSailPlane = new THREE.Mesh(sailPlaneGeo, partsMaterial);
  stbdSailPlane.name = 'Sail_Plane_Starboard';
  stbdSailPlane.position.set(0.5, 2.1, 0.8);
  sailGroup.add(stbdSailPlane);

  const portSailPlane = new THREE.Mesh(sailPlaneGeo, partsMaterial);
  portSailPlane.name = 'Sail_Plane_Port';
  portSailPlane.scale.set(-1, 1, 1);
  portSailPlane.position.set(-0.5, 2.1, 0.8);
  sailGroup.add(portSailPlane);

  // Photonics Masts / Sensor Array on top of the sail
  const mastConfigs = [
    { x: -0.22, z: 0.5, h: 2.2, r: 0.065, name: 'Photonics_Mast_1' },
    { x: 0.22, z: 0.5, h: 1.9, r: 0.065, name: 'Photonics_Mast_2' },
    { x: 0.0, z: -0.3, h: 2.5, r: 0.075, name: 'Navigation_Radar_Mast' },
    { x: -0.25, z: -1.1, h: 1.8, r: 0.055, name: 'Snorkel_Induction_Mast' },
    { x: 0.25, z: -1.1, h: 2.0, r: 0.06, name: 'Comms_Antenna_Mast' },
  ];

  mastConfigs.forEach((cfg) => {
    const mGeo = new THREE.CylinderGeometry(cfg.r * 0.8, cfg.r, cfg.h, 16);
    const mMesh = new THREE.Mesh(mGeo, partsMaterial);
    mMesh.name = cfg.name;
    mMesh.position.set(cfg.x, 3.6 + cfg.h / 2, cfg.z);
    sailGroup.add(mMesh);
  });

  root.add(sailGroup);

  // 5. Cruciform Stern Empennage (Vertical Rudders and Horizontal Stabilizers at z = -26.5)
  const empennageGroup = new THREE.Group();
  empennageGroup.name = 'Stern_Empennage';
  empennageGroup.position.set(0, 0, -26.5);

  const planeShape = new THREE.Shape();
  planeShape.moveTo(0, 0);
  planeShape.lineTo(0.4, 0);
  planeShape.lineTo(0.7, 3.2);
  planeShape.lineTo(-0.6, 3.2);
  planeShape.lineTo(-0.4, 0);
  planeShape.closePath();

  const planeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
  };
  const planeGeo = new THREE.ExtrudeGeometry(planeShape, planeSettings);
  planeGeo.center();

  // Upper vertical rudder
  const upperRudder = new THREE.Mesh(planeGeo, partsMaterial);
  upperRudder.name = 'Rudder_Upper';
  upperRudder.position.set(0, 2.2, 0);
  empennageGroup.add(upperRudder);

  // Torpedo decoy / towed array dispenser pod atop upper rudder
  const podGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.8, 16);
  podGeo.rotateX(Math.PI / 2);
  const podMesh = new THREE.Mesh(podGeo, partsMaterial);
  podMesh.position.set(0, 3.8, 0);
  empennageGroup.add(podMesh);

  // Lower vertical rudder
  const lowerRudder = new THREE.Mesh(planeGeo, partsMaterial);
  lowerRudder.name = 'Rudder_Lower';
  lowerRudder.rotation.z = Math.PI;
  lowerRudder.position.set(0, -2.2, 0);
  empennageGroup.add(lowerRudder);

  // Horizontal Port Stabilizer Plane
  const portPlane = new THREE.Mesh(planeGeo, partsMaterial);
  portPlane.name = 'Stabilizer_Port';
  portPlane.rotation.z = Math.PI / 2;
  portPlane.position.set(-2.2, 0, 0);
  empennageGroup.add(portPlane);

  // Horizontal Starboard Stabilizer Plane
  const stbdPlane = new THREE.Mesh(planeGeo, partsMaterial);
  stbdPlane.name = 'Stabilizer_Starboard';
  stbdPlane.rotation.z = -Math.PI / 2;
  stbdPlane.position.set(2.2, 0, 0);
  empennageGroup.add(stbdPlane);

  root.add(empennageGroup);

  // 6. Pump-Jet Propulsor (Duct Shroud + Multi-Blade Rotor at z = -29.0)
  const propulsorGroup = new THREE.Group();
  propulsorGroup.name = 'PumpJet_Propulsor';
  propulsorGroup.position.set(0, 0, -29.0);

  // Circular Duct Shroud (Annular nozzle cowling)
  // Cross section in (r, y) where y goes from -1.2 to +1.2
  const shroudPoints: THREE.Vector2[] = [
    new THREE.Vector2(1.20, -1.0),
    new THREE.Vector2(1.45, -0.5),
    new THREE.Vector2(1.48, 0.5),
    new THREE.Vector2(1.25, 1.0),
    new THREE.Vector2(1.10, 0.9),
    new THREE.Vector2(1.30, 0.4),
    new THREE.Vector2(1.25, -0.8),
  ];
  const shroudGeo = new THREE.LatheGeometry(shroudPoints, 48);
  shroudGeo.rotateX(Math.PI / 2); // y becomes z!
  const shroudMesh = new THREE.Mesh(shroudGeo, partsMaterial);
  shroudMesh.name = 'Propulsor_Shroud_Duct';
  propulsorGroup.add(shroudMesh);

  // Stator vanes supporting the duct
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const vaneGeo = new THREE.BoxGeometry(0.08, 0.6, 0.8);
    const vane = new THREE.Mesh(vaneGeo, partsMaterial);
    vane.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0.2);
    vane.rotation.z = angle;
    propulsorGroup.add(vane);
  }

  // 7-Blade Skewed Propeller Rotor
  const propeller = new THREE.Group();
  propeller.name = 'Propeller_Rotor';

  // Rotor Hub Cone (pointing aft toward -Z)
  const hubGeo = new THREE.ConeGeometry(0.45, 1.5, 32);
  hubGeo.rotateX(Math.PI / 2); // Pointing toward -Z
  const hubMesh = new THREE.Mesh(hubGeo, propsMaterial);
  propeller.add(hubMesh);

  // 7 High-skew rotor blades
  const bladeCount = 7;
  for (let b = 0; b < bladeCount; b++) {
    const angle = (b * Math.PI * 2) / bladeCount;
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.85, 0.35);
    bladeGeo.translate(0, 0.55, 0); // Extend radially from hub
    const blade = new THREE.Mesh(bladeGeo, propsMaterial);
    blade.rotation.z = angle;
    blade.rotation.y = 0.45; // Blade pitch angle
    propeller.add(blade);
  }

  propulsorGroup.add(propeller);
  root.add(propulsorGroup);

  // Default Orientation matching the Cinema 4D screenshot:
  // Submarine nose pointed down-left foreground, tail pointed up-right background!
  root.rotation.set(
    (7 * Math.PI) / 180,
    (-39 * Math.PI) / 180,
    (8 * Math.PI) / 180
  );
  root.position.set(0, 0, 0);

  return {
    root,
    propeller,
    materials: {
      hull: hullMaterial,
      parts: partsMaterial,
      props: propsMaterial,
    },
    animate: (_time: number, isPlaying: boolean) => {
      if (isPlaying) {
        // Spin pump-jet propeller smoothly
        propeller.rotation.z += 0.28;
      }
    },
  };
}
