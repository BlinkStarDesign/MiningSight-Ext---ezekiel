import * as THREE from 'three';
import { calculateCartZ, calculateWheelRotation } from '../utils/math3d';

export type ShadingDisplayMode = 'gouraud' | 'gouraud_lines' | 'wireframe' | 'points';

export interface MiningTunnelRig {
  root: THREE.Group;
  tunnelMesh: THREE.Mesh;
  mineCart: THREE.Group;
  wheels: THREE.Mesh[];
  lanterns: THREE.Group[];
  lanternLights: THREE.PointLight[];
  materials: {
    rock: THREE.MeshStandardMaterial;
    timber: THREE.MeshStandardMaterial;
    iron: THREE.MeshStandardMaterial;
    gold: THREE.MeshStandardMaterial;
  };
  animate: (time: number, isPlaying: boolean, currentFrame: number) => void;
  setWireframe: (enabled: boolean) => void;
  setDisplayMode: (mode: ShadingDisplayMode) => void;
}

/**
 * Creates procedural texture for the rugged rock tunnel strata with layered stone seams.
 */
function createRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base cavern granite tone
  ctx.fillStyle = '#484440';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Layered sedimentary stone strata
  for (let y = 0; y < canvas.height; y += 12) {
    const darkness = 0.3 + 0.4 * Math.sin(y * 0.05);
    ctx.fillStyle = `rgba(35, 32, 28, ${darkness})`;
    ctx.fillRect(0, y, canvas.width, 10 + Math.sin(y) * 4);
  }

  // Crag and fracture noise lines
  ctx.strokeStyle = 'rgba(20, 18, 16, 0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 80; i++) {
    ctx.beginPath();
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    ctx.moveTo(x, y);
    for (let step = 0; step < 6; step++) {
      x += (Math.random() - 0.5) * 60;
      y += (Math.random() - 0.3) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Gold/mineral dust flecks
  ctx.fillStyle = 'rgba(235, 185, 60, 0.45)';
  for (let i = 0; i < 150; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  return texture;
}

/**
 * Creates normal map for sharp rock facets and chisels.
 */
function createRockNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sharp chiseling relief
  ctx.fillStyle = '#6060e0';
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = 15 + Math.random() * 35;
    const h = 8 + Math.random() * 20;
    ctx.fillRect(x, y, w, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  return texture;
}

/**
 * Creates procedural weathered wood grain texture for timber mine props.
 */
function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a3728';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wood fibers
  ctx.strokeStyle = 'rgba(30, 20, 12, 0.45)';
  for (let x = 0; x < canvas.width; x += 3) {
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 8, canvas.height);
    ctx.stroke();
  }

  // Weathering knots
  ctx.fillStyle = '#2a1a0f';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, 4, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates procedural rusted iron texture for tracks and mine cart.
 */
function createIronTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#323438';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rust patches
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rad = 10 + Math.random() * 30;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, 'rgba(130, 60, 25, 0.55)');
    grad.addColorStop(1, 'rgba(130, 60, 25, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedurally builds the Mining Tunnel Complex with craggy rock cavern,
 * timber support arches, railway tracks, rolling ore cart, and hanging lanterns.
 */
export function createMiningTunnel(): MiningTunnelRig {
  const root = new THREE.Group();
  root.name = 'Mining_Tunnel_Complex';

  // --- Materials ---
  const rockTexture = createRockTexture();
  const rockNormal = createRockNormalMap();
  const woodTexture = createWoodTexture();
  const ironTexture = createIronTexture();

  const rockMaterial = new THREE.MeshStandardMaterial({
    name: 'Rock_Strata',
    color: 0x5a544e,
    roughness: 0.88,
    metalness: 0.12,
    map: rockTexture,
    normalMap: rockNormal,
    normalScale: new THREE.Vector2(0.5, 0.5),
    side: THREE.DoubleSide,
  });

  const timberMaterial = new THREE.MeshStandardMaterial({
    name: 'Timber_Beams',
    color: 0x4d3b2c,
    roughness: 0.75,
    metalness: 0.05,
    map: woodTexture,
  });

  const ironMaterial = new THREE.MeshStandardMaterial({
    name: 'Rusted_Iron',
    color: 0x3d3f44,
    roughness: 0.55,
    metalness: 0.72,
    map: ironTexture,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    name: 'Lantern_Gold',
    color: 0xffaa22,
    roughness: 0.25,
    metalness: 0.65,
    emissive: 0xff8811,
    emissiveIntensity: 0.7,
  });

  // 1. Procedural Rock Cavern Geometry with Open Cutaway Diorama Cross-Section
  // Creates a dramatic mining cavern with rugged back wall, vaulted ceiling, and
  // completely open front cutaway so railway tracks, mine cart, timber sets, and lanterns are fully visible.
  const tunnelLength = 56.0;
  const segmentsZ = 48;
  const segmentsU = 36;

  const tunnelGeo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iz = 0; iz <= segmentsZ; iz++) {
    const tz = iz / segmentsZ;
    const z = (tz - 0.5) * tunnelLength;

    for (let iu = 0; iu <= segmentsU; iu++) {
      const tu = iu / segmentsU;

      let x = 0;
      let y = 0;

      // Diorama Profile spanning across X:
      // tu = 0 to 0.30: Ground floor from near ledge (x = +6.2, y = 0.2) to far rock wall (x = -6.8, y = -0.15)
      // tu = 0.30 to 0.70: Craggy back cavern wall rising from x = -6.8, y = -0.15 to x = -6.4, y = 8.5
      // tu = 0.70 to 0.92: Vaulted ceiling curving from x = -6.4, y = 8.5 across the track center (x = -0.5, y = 9.4) to x = +1.6, y = 8.4
      // tu = 0.92 to 1.00: Chiseled rock cross-section cutaway rim from x = +1.6, y = 8.4 to x = +2.2, y = 9.0
      if (tu <= 0.30) {
        const tf = tu / 0.30;
        x = 6.2 - tf * 13.0; // from +6.2 to -6.8
        y = (1.0 - tf) * 0.25 - 0.15;
      } else if (tu <= 0.70) {
        const tw = (tu - 0.30) / 0.40;
        // Deep craggy back wall with natural cavern undulation
        const cragBulge = Math.sin(tw * Math.PI) * 0.8;
        x = -6.8 + cragBulge * 0.4;
        y = -0.15 + tw * 8.65;
      } else if (tu <= 0.92) {
        const tc = (tu - 0.70) / 0.22;
        // Smooth gothic arch over the tracks
        const archAngle = Math.PI - tc * (Math.PI * 0.58);
        x = -2.4 + Math.cos(archAngle) * 4.0;
        y = 5.2 + Math.sin(archAngle) * 4.2;
      } else {
        const tr = (tu - 0.92) / 0.08;
        // Jagged cutaway ceiling edge
        x = 1.6 + tr * 0.6;
        y = 8.4 + tr * 0.6;
      }

      // Procedural rock strata displacement & natural mineral fissures
      const rockNoise =
        Math.sin(x * 0.65 + z * 0.4) * 0.4 +
        Math.cos(y * 1.2 + z * 0.6) * 0.3 +
        Math.sin(x * 2.2 + y * 1.6 + z * 1.2) * 0.18;

      x += rockNoise * 0.45;
      y += rockNoise * 0.35;

      positions.push(x, y, z);
      uvs.push(tu * 4, tz * 10);
    }
  }

  // Double-sided indices so the rock is visible inside and out
  for (let iz = 0; iz < segmentsZ; iz++) {
    for (let iu = 0; iu < segmentsU; iu++) {
      const a = iz * (segmentsU + 1) + iu;
      const b = (iz + 1) * (segmentsU + 1) + iu;
      const c = (iz + 1) * (segmentsU + 1) + (iu + 1);
      const d = iz * (segmentsU + 1) + (iu + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  tunnelGeo.setIndex(indices);
  tunnelGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  tunnelGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  tunnelGeo.computeVertexNormals();

  const tunnelMesh = new THREE.Mesh(tunnelGeo, rockMaterial);
  tunnelMesh.name = 'Rock_Tunnel_Mesh';
  root.add(tunnelMesh);

  // Meshable wireframe line overlay for Gouraud Shading (Lines) & Wireframe modes
  const tunnelWireGeo = new THREE.WireframeGeometry(tunnelGeo);
  const tunnelWireMat = new THREE.LineBasicMaterial({
    color: 0x1f2c38,
    transparent: true,
    opacity: 0.55,
    depthTest: true,
  });
  const tunnelWireLines = new THREE.LineSegments(tunnelWireGeo, tunnelWireMat);
  tunnelWireLines.name = 'Rock_Tunnel_Wireframe';
  tunnelWireLines.visible = false;
  tunnelMesh.add(tunnelWireLines);

  // Meshable vertex points helper for Point Mode
  const tunnelPointsMat = new THREE.PointsMaterial({
    color: 0xe88724, // Cinema 4D iconic vertex orange
    size: 4,
    sizeAttenuation: false,
  });
  const tunnelPoints = new THREE.Points(tunnelGeo, tunnelPointsMat);
  tunnelPoints.name = 'Rock_Tunnel_Points';
  tunnelPoints.visible = false;
  tunnelMesh.add(tunnelPoints);

  // 2. Heavy Timber Support Arches (Mine Sets spaced every 6 units)
  const timberGroup = new THREE.Group();
  timberGroup.name = 'Timber_Support_Arches';
  const archCount = 9;
  const archSpacing = tunnelLength / (archCount + 1);

  for (let i = 0; i < archCount; i++) {
    const archZ = (i - (archCount - 1) / 2) * archSpacing;
    const arch = new THREE.Group();
    arch.position.set(0, 0, archZ);

    const postWidth = 0.55;
    const postHeight = 6.8;
    const postDepth = 0.55;
    const spanWidth = 9.2;

    // Left post
    const postGeo = new THREE.BoxGeometry(postWidth, postHeight, postDepth);
    const leftPost = new THREE.Mesh(postGeo, timberMaterial);
    leftPost.position.set(-spanWidth / 2, postHeight / 2 - 0.2, 0);
    leftPost.rotation.z = -0.06; // Inward batter angle
    arch.add(leftPost);

    // Right post
    const rightPost = new THREE.Mesh(postGeo, timberMaterial);
    rightPost.position.set(spanWidth / 2, postHeight / 2 - 0.2, 0);
    rightPost.rotation.z = 0.06;
    arch.add(rightPost);

    // Overhead lintel beam (Cap timber)
    const lintelGeo = new THREE.BoxGeometry(spanWidth + 0.8, postWidth, postDepth * 1.1);
    const lintel = new THREE.Mesh(lintelGeo, timberMaterial);
    lintel.position.set(0, postHeight - 0.2, 0);
    arch.add(lintel);

    // 45-degree corner knee braces
    const braceGeo = new THREE.BoxGeometry(1.6, 0.35, 0.4);
    const leftBrace = new THREE.Mesh(braceGeo, timberMaterial);
    leftBrace.position.set(-spanWidth / 2 + 0.8, postHeight - 1.0, 0);
    leftBrace.rotation.z = -Math.PI / 4;
    arch.add(leftBrace);

    const rightBrace = new THREE.Mesh(braceGeo, timberMaterial);
    rightBrace.position.set(spanWidth / 2 - 0.8, postHeight - 1.0, 0);
    rightBrace.rotation.z = Math.PI / 4;
    arch.add(rightBrace);

    // Lagging planks along the ceiling between arches (sides only, leaving center well-lit)
    if (i < archCount - 1) {
      for (const p of [-3, -2, 2, 3]) {
        const plankGeo = new THREE.BoxGeometry(0.85, 0.15, archSpacing);
        const plank = new THREE.Mesh(plankGeo, timberMaterial);
        plank.position.set(p * 1.25, postHeight + 0.15, archSpacing / 2);
        arch.add(plank);
      }
    }

    timberGroup.add(arch);
  }
  root.add(timberGroup);

  // 3. Railway Tracks & Ballast Bed
  const trackGroup = new THREE.Group();
  trackGroup.name = 'Railway_Tracks';

  // Ballast gravel rock bed
  const ballastGeo = new THREE.BoxGeometry(4.2, 0.25, tunnelLength);
  const ballast = new THREE.Mesh(ballastGeo, rockMaterial);
  ballast.position.set(0, -0.05, 0);
  trackGroup.add(ballast);

  // Parallel Steel Rails
  const trackGauge = 2.4;
  const railGeo = new THREE.BoxGeometry(0.12, 0.24, tunnelLength);
  const leftRail = new THREE.Mesh(railGeo, ironMaterial);
  leftRail.position.set(-trackGauge / 2, 0.2, 0);
  trackGroup.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, ironMaterial);
  rightRail.position.set(trackGauge / 2, 0.2, 0);
  trackGroup.add(rightRail);

  // Wooden Railroad Ties (Sleepers)
  const tieCount = 45;
  const tieSpacing = tunnelLength / tieCount;
  const tieGeo = new THREE.BoxGeometry(3.6, 0.2, 0.4);
  for (let t = 0; t < tieCount; t++) {
    const tieZ = (t - (tieCount - 1) / 2) * tieSpacing;
    const tie = new THREE.Mesh(tieGeo, timberMaterial);
    tie.position.set(0, 0.05, tieZ);
    trackGroup.add(tie);
  }
  root.add(trackGroup);

  // 4. Mine Cart Loaded with Ore & Crystals
  const mineCart = new THREE.Group();
  mineCart.name = 'Mine_Cart_Ore';
  const wheels: THREE.Mesh[] = [];

  // Cart Chassis / Undercarriage
  const chassisGeo = new THREE.BoxGeometry(2.6, 0.25, 3.8);
  const chassis = new THREE.Mesh(chassisGeo, ironMaterial);
  chassis.position.set(0, 0.65, 0);
  mineCart.add(chassis);

  // Flanged Steel Wheels & Axles
  const wheelRadius = 0.42;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.16, 24);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    { x: -trackGauge / 2, z: -1.2 },
    { x: trackGauge / 2, z: -1.2 },
    { x: -trackGauge / 2, z: 1.2 },
    { x: trackGauge / 2, z: 1.2 },
  ];

  wheelPositions.forEach((pos, idx) => {
    const wheel = new THREE.Mesh(wheelGeo, ironMaterial);
    wheel.name = `Cart_Wheel_${idx + 1}`;
    wheel.position.set(pos.x, wheelRadius + 0.15, pos.z);
    wheels.push(wheel);
    mineCart.add(wheel);
  });

  // Axle bars
  const axleGeo = new THREE.CylinderGeometry(0.08, 0.08, trackGauge, 16);
  axleGeo.rotateZ(Math.PI / 2);
  const frontAxle = new THREE.Mesh(axleGeo, ironMaterial);
  frontAxle.position.set(0, wheelRadius + 0.15, -1.2);
  mineCart.add(frontAxle);

  const rearAxle = new THREE.Mesh(axleGeo, ironMaterial);
  rearAxle.position.set(0, wheelRadius + 0.15, 1.2);
  mineCart.add(rearAxle);

  // Hopper Bucket (Tapered iron bin)
  // Base at y=0.8, rim at y=2.6
  const bucketShape = new THREE.Shape();
  bucketShape.moveTo(-1.2, 0);
  bucketShape.lineTo(1.2, 0);
  bucketShape.lineTo(1.5, 1.6);
  bucketShape.lineTo(-1.5, 1.6);
  bucketShape.closePath();

  const bucketSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: 3.4,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.05,
  };
  const bucketGeo = new THREE.ExtrudeGeometry(bucketShape, bucketSettings);
  bucketGeo.center();
  const bucket = new THREE.Mesh(bucketGeo, ironMaterial);
  bucket.position.set(0, 1.6, 0);
  mineCart.add(bucket);

  // Meshable wireframe lines for mine cart
  const bucketWireGeo = new THREE.WireframeGeometry(bucketGeo);
  const bucketWireMat = new THREE.LineBasicMaterial({
    color: 0x1f2c38,
    transparent: true,
    opacity: 0.55,
    depthTest: true,
  });
  const bucketWireLines = new THREE.LineSegments(bucketWireGeo, bucketWireMat);
  bucketWireLines.visible = false;
  bucket.add(bucketWireLines);

  // Meshable points for mine cart
  const cartPointsMat = new THREE.PointsMaterial({
    color: 0xe88724,
    size: 4,
    sizeAttenuation: false,
  });
  const cartPoints = new THREE.Points(bucketGeo, cartPointsMat);
  cartPoints.visible = false;
  bucket.add(cartPoints);

  // Riveted Iron Reinforcement Straps
  const strapGeo = new THREE.BoxGeometry(0.08, 1.65, 3.45);
  const leftStrap = new THREE.Mesh(strapGeo, ironMaterial);
  leftStrap.position.set(-1.48, 1.6, 0);
  mineCart.add(leftStrap);

  const rightStrap = new THREE.Mesh(strapGeo, ironMaterial);
  rightStrap.position.set(1.48, 1.6, 0);
  mineCart.add(rightStrap);

  // Piled Ore Rocks & Glowing Gold Chunks inside the cart
  const oreGroup = new THREE.Group();
  oreGroup.name = 'Raw_Ore_Payload';

  for (let r = 0; r < 18; r++) {
    const isGold = r % 2 === 0;
    const oreGeo = isGold
      ? new THREE.IcosahedronGeometry(0.32 + Math.random() * 0.3, 0)
      : new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.35, 0);
    const oreMesh = new THREE.Mesh(oreGeo, isGold ? goldMaterial : rockMaterial);
    oreMesh.position.set(
      (Math.random() - 0.5) * 1.8,
      2.1 + Math.random() * 0.65,
      (Math.random() - 0.5) * 2.5
    );
    oreMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    oreGroup.add(oreMesh);
  }
  mineCart.add(oreGroup);

  // Initial cart position
  mineCart.position.set(0, 0, 0);
  root.add(mineCart);

  // 5. Industrial Hanging Work Lights (Cage Lanterns)
  const lanterns: THREE.Group[] = [];
  const lanternLights: THREE.PointLight[] = [];
  const lanternPositionsZ = [-18, -6, 6, 18];

  lanternPositionsZ.forEach((lz, idx) => {
    const lantern = new THREE.Group();
    lantern.name = `Hanging_Work_Lantern_${idx + 1}`;
    lantern.position.set(0, 5.2, lz);

    // Hanging chain/cable suspended from timber cap
    const cableGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8);
    const cable = new THREE.Mesh(cableGeo, ironMaterial);
    cable.position.set(0, 0.9, 0);
    lantern.add(cable);

    // Protective wire cage
    const cageGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.8, 8, 1, true);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      wireframe: true,
      roughness: 0.6,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    lantern.add(cage);

    // Glowing tungsten filament bulb
    const bulbGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffd060,
      emissive: 0xffaa22,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    lantern.add(bulb);

    // Warm atmospheric Point Light
    const light = new THREE.PointLight(0xffa834, 7.5, 22, 1.4);
    light.position.set(0, -0.1, 0);
    light.castShadow = true;
    lantern.add(light);

    lanterns.push(lantern);
    lanternLights.push(light);
    root.add(lantern);
  });

  // 6. Ventilation Pipe along the Upper Wall
  const ventGroup = new THREE.Group();
  ventGroup.name = 'Ventilation_Duct';
  const ventRadius = 0.65;
  const ventGeo = new THREE.CylinderGeometry(ventRadius, ventRadius, tunnelLength, 32, 32);
  ventGeo.rotateX(Math.PI / 2);
  const ventMat = new THREE.MeshStandardMaterial({
    color: 0x7a8085,
    roughness: 0.45,
    metalness: 0.65,
  });
  const ventPipe = new THREE.Mesh(ventGeo, ventMat);
  ventPipe.position.set(-3.8, 5.8, 0);
  ventGroup.add(ventPipe);

  // Duct brackets
  for (let b = 0; b < 9; b++) {
    const bZ = (b - 4) * archSpacing;
    const ringGeo = new THREE.TorusGeometry(ventRadius + 0.08, 0.05, 8, 24);
    const ring = new THREE.Mesh(ringGeo, ironMaterial);
    ring.position.set(-3.8, 5.8, bZ);
    ventGroup.add(ring);
  }
  root.add(ventGroup);

  // 7. Mining Pickaxe Equipment resting on the timber arch
  const pickaxe = new THREE.Group();
  pickaxe.name = 'Mining_Pickaxe';
  const handleGeo = new THREE.CylinderGeometry(0.06, 0.08, 2.4, 12);
  const handle = new THREE.Mesh(handleGeo, timberMaterial);
  pickaxe.add(handle);

  const headGeo = new THREE.CylinderGeometry(0.04, 0.12, 1.6, 6);
  headGeo.rotateZ(Math.PI / 2);
  const head = new THREE.Mesh(headGeo, ironMaterial);
  head.position.set(0, 1.1, 0);
  pickaxe.add(head);

  pickaxe.position.set(-4.2, 0.8, 3.2);
  pickaxe.rotation.set(0.2, 0.4, 0.35);
  root.add(pickaxe);

  // Overall orientation for Cinema 4D Viewport:
  // Tunnel oriented diagonally across viewport with cutaway facing the camera
  root.position.set(0, 0, 0);
  root.rotation.set((4 * Math.PI) / 180, (-60 * Math.PI) / 180, (2 * Math.PI) / 180);

  const setDisplayMode = (mode: ShadingDisplayMode) => {
    const isWire = mode === 'wireframe';
    const showLines = mode === 'gouraud_lines' || mode === 'wireframe' || mode === 'points';
    const showPoints = mode === 'points';

    rockMaterial.wireframe = isWire;
    timberMaterial.wireframe = isWire;
    ironMaterial.wireframe = isWire;
    goldMaterial.wireframe = isWire;

    tunnelWireLines.visible = showLines;
    bucketWireLines.visible = showLines;

    if (mode === 'gouraud_lines') {
      tunnelWireMat.color.setHex(0x1a2632);
      tunnelWireMat.opacity = 0.65;
      bucketWireMat.color.setHex(0x1a2632);
      bucketWireMat.opacity = 0.65;
    } else if (mode === 'wireframe') {
      tunnelWireMat.color.setHex(0x6a96c0);
      tunnelWireMat.opacity = 0.95;
      bucketWireMat.color.setHex(0xe88724);
      bucketWireMat.opacity = 0.95;
    } else if (mode === 'points') {
      tunnelWireMat.color.setHex(0x2d3a48);
      tunnelWireMat.opacity = 0.35;
      bucketWireMat.color.setHex(0x2d3a48);
      bucketWireMat.opacity = 0.35;
    }

    tunnelPoints.visible = showPoints;
    cartPoints.visible = showPoints;
  };

  return {
    root,
    tunnelMesh,
    mineCart,
    wheels,
    lanterns,
    lanternLights,
    materials: {
      rock: rockMaterial,
      timber: timberMaterial,
      iron: ironMaterial,
      gold: goldMaterial,
    },
    animate: (time: number, isPlaying: boolean, currentFrame: number) => {
      // Cart movement driven by timeline frame or continuous play
      const startZ = 16.0;
      const endZ = -16.0;
      const currentCartZ = calculateCartZ(currentFrame, 90, startZ, endZ);
      mineCart.position.z = currentCartZ;

      // Wheel rotation proportional to travel distance
      const distance = startZ - currentCartZ;
      const rot = calculateWheelRotation(distance, wheelRadius);
      wheels.forEach((w) => {
        w.rotation.x = rot;
      });

      // Subtle atmospheric lantern sway
      lanterns.forEach((l, idx) => {
        const swayPhase = time * 2.0 + idx * 1.2;
        l.rotation.z = Math.sin(swayPhase) * 0.04;
        l.rotation.x = Math.cos(swayPhase * 0.8) * 0.03;
      });
    },
    setWireframe: (enabled: boolean) => {
      setDisplayMode(enabled ? 'wireframe' : 'gouraud');
    },
    setDisplayMode,
  };
}
