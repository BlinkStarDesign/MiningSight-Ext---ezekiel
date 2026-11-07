import * as THREE from 'three';
import { MiningTunnelRig, ShadingDisplayMode } from './miningTunnelGenerator';
import { ProceduralTunnelParams } from '../types/tunnelScene';
import { calculateCartZ, calculateWheelRotation } from '../utils/math3d';

/**
 * Creates procedural texture for the rugged ochre quartzite rock strata
 * directly derived from the reference photo /public/assets/aistudio/Rugged_Timbered_Mine_Tunnel_53b5c504.png
 */
function createPhotoRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base warm ochre / weathered quartzite siltstone tone matching reference photo
  ctx.fillStyle = '#6b543d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stratified sedimentary rock layers with golden-tan & umber veins
  for (let y = 0; y < canvas.height; y += 14) {
    const bandTone = Math.sin(y * 0.04) * 0.5 + 0.5;
    const r = Math.floor(115 + bandTone * 45);
    const g = Math.floor(85 + bandTone * 35);
    const b = Math.floor(55 + bandTone * 25);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, y, canvas.width, 10 + Math.sin(y * 0.1) * 6);
  }

  // Chiseled rock facets & fracture shadows
  ctx.strokeStyle = 'rgba(38, 28, 18, 0.75)';
  ctx.lineWidth = 2.0;
  for (let i = 0; i < 110; i++) {
    ctx.beginPath();
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    ctx.moveTo(x, y);
    for (let step = 0; step < 7; step++) {
      x += (Math.random() - 0.48) * 55;
      y += (Math.random() - 0.3) * 45;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Lighter mineral highlights (quartzite & calcite edges)
  ctx.strokeStyle = 'rgba(215, 185, 140, 0.45)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 70; i++) {
    ctx.beginPath();
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    ctx.moveTo(x, y);
    for (let step = 0; step < 5; step++) {
      x += (Math.random() - 0.5) * 40;
      y += (Math.random() - 0.3) * 35;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Scattered sand and rock dust specks
  ctx.fillStyle = 'rgba(235, 210, 165, 0.35)';
  for (let i = 0; i < 260; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Creates normal map for the rugged rock face with sharp fractures
 */
function createPhotoRockNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Jagged relief blocks
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = 20 + Math.random() * 45;
    const h = 10 + Math.random() * 25;
    const angle = (Math.random() - 0.5) * 0.4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = i % 2 === 0 ? '#5858e0' : '#7070f0';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Creates rough-sawn weathered mining timber texture matching the square posts and lagging in the photo
 */
function createPhotoTimberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm weathered pine/oak base tone
  ctx.fillStyle = '#614833';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Longitudinal wood grain fibers
  ctx.strokeStyle = 'rgba(42, 28, 16, 0.5)';
  for (let x = 0; x < canvas.width; x += 2.5) {
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, canvas.height);
    ctx.stroke();
  }

  // Sawmill blade marks (transverse scoring across the grain)
  ctx.strokeStyle = 'rgba(30, 20, 12, 0.25)';
  ctx.lineWidth = 1.0;
  for (let y = 0; y < canvas.height; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }

  // Weathering knots and aged grain pockets
  ctx.fillStyle = '#341f10';
  for (let i = 0; i < 9; i++) {
    const kx = Math.random() * canvas.width;
    const ky = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.ellipse(kx, ky, 5, 20, (Math.random() - 0.5) * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Subtle halo around knot
    ctx.strokeStyle = 'rgba(75, 52, 32, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(kx, ky, 8, 28, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Dusty sawdust coating
  ctx.fillStyle = 'rgba(190, 160, 120, 0.2)';
  for (let i = 0; i < 200; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates packed earthen dirt and pebble floor texture as seen in the photo foreground
 */
function createPhotoDirtFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#554231';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Packed sand and silt variations
  for (let i = 0; i < 250; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rad = 6 + Math.random() * 18;
    const lightness = 0.15 + Math.random() * 0.25;
    ctx.fillStyle = `rgba(135, 105, 75, ${lightness})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small embedded pebbles
  for (let i = 0; i < 120; i++) {
    const px = Math.random() * canvas.width;
    const py = Math.random() * canvas.height;
    ctx.fillStyle = i % 3 === 0 ? '#382b20' : (i % 3 === 1 ? '#73604d' : '#8f7b64');
    ctx.beginPath();
    ctx.ellipse(px, py, 2 + Math.random() * 3, 2 + Math.random() * 2.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 6);
  return texture;
}

/**
 * Procedurally constructs the Rugged Timbered Mine Tunnel modeled directly
 * after the reference photograph:
 * - 4-Tier horizontal side lagging planks between inward-battered timber posts
 * - Heavy square lintel cap beams with top longitudinal stringers
 * - Earthen drift floor with scattered 3D rock rubble chunks
 * - Transition into an unlined raw rock adit cavern bore at the vanishing depth
 * - Compatible with MiningTunnelRig (animatable cart, timeline, walk mode, C4D shading modes)
 */
export function createRuggedTimberedTunnel(userParams?: Partial<ProceduralTunnelParams>): MiningTunnelRig {
  const params: ProceduralTunnelParams = {
    timberSetCount: 7,
    timberSpacing: 4.8,
    timberWidth: 0.38,
    timberHeight: 4.6,
    spanWidth: 4.6,
    postBatterAngleDeg: 5.5,
    laggingPlankTiers: 4,
    laggingPlankWidth: 0.34,
    laggingGap: 0.14,
    includeRoofLagging: true,
    includeTopStringers: true,
    tunnelLength: 46.0,
    unlinedAditLength: 16.0,
    aditBoreRadius: 2.3,
    rockRoughness: 0.9,
    rockColorPalette: 'ochre_quartzite',
    floorType: 'packed_earth',
    includeRubbleDebris: true,
    rubbleCount: 38,
    includeRailwayTracks: true,
    includeOreCart: true,
    headlampIntensity: 3.5,
    ambientWarmth: 0.7,
    fogDensity: 0.012,
    ...userParams,
  };

  const root = new THREE.Group();
  root.name = 'Rugged_Timbered_Mine_Tunnel_Photo';

  // --- Procedural Textures & Materials ---
  const rockTexture = createPhotoRockTexture();
  const rockNormal = createPhotoRockNormalMap();
  const timberTexture = createPhotoTimberTexture();
  const dirtTexture = createPhotoDirtFloorTexture();

  const rockMaterial = new THREE.MeshStandardMaterial({
    name: 'Photo_Ochre_Rock_Strata',
    color: 0x6e5641,
    roughness: 0.88,
    metalness: 0.08,
    map: rockTexture,
    normalMap: rockNormal,
    normalScale: new THREE.Vector2(0.65, 0.65),
    side: THREE.DoubleSide,
  });

  const timberMaterial = new THREE.MeshStandardMaterial({
    name: 'Photo_Rough_Timbers',
    color: 0x644c36,
    roughness: 0.78,
    metalness: 0.04,
    map: timberTexture,
    side: THREE.DoubleSide,
  });

  const dirtFloorMaterial = new THREE.MeshStandardMaterial({
    name: 'Photo_Packed_Earth_Floor',
    color: 0x584433,
    roughness: 0.95,
    metalness: 0.02,
    map: dirtTexture,
    side: THREE.DoubleSide,
  });

  const ironMaterial = new THREE.MeshStandardMaterial({
    name: 'Rusted_Mine_Iron',
    color: 0x3d3936,
    roughness: 0.6,
    metalness: 0.7,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    name: 'Mineral_Gold_Ore',
    color: 0xf5b530,
    roughness: 0.3,
    metalness: 0.65,
    emissive: 0xaa7711,
    emissiveIntensity: 0.6,
  });

  // Track all wireframe overlays for Cinema 4D display modes
  const wireframeObjects: THREE.LineSegments[] = [];
  const pointCloudObjects: THREE.Points[] = [];

  // Helper to attach C4D wireframe & pointcloud overlays to meshes
  function attachC4DOverlays(mesh: THREE.Mesh, pointColor: number = 0xe88724) {
    const wireGeo = new THREE.WireframeGeometry(mesh.geometry);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x1f2c38,
      transparent: true,
      opacity: 0.55,
      depthTest: true,
    });
    const wireLines = new THREE.LineSegments(wireGeo, wireMat);
    wireLines.visible = false;
    mesh.add(wireLines);
    wireframeObjects.push(wireLines);

    const pointsMat = new THREE.PointsMaterial({
      color: pointColor,
      size: 4,
      sizeAttenuation: false,
    });
    const points = new THREE.Points(mesh.geometry, pointsMat);
    points.visible = false;
    mesh.add(points);
    pointCloudObjects.push(points);
  }

  // 1. Packed Earthen Ground Floor
  const floorGeo = new THREE.PlaneGeometry(params.spanWidth + 4.0, params.tunnelLength, 24, 48);
  floorGeo.rotateX(-Math.PI / 2);

  // Add natural floor ruts and gentle elevation variations
  const floorPos = floorGeo.attributes.position;
  for (let i = 0; i < floorPos.count; i++) {
    const x = floorPos.getX(i);
    const z = floorPos.getZ(i);
    // Subtle hollow in center footpath where miners walked
    const centerDip = Math.exp(-Math.pow(x / 1.5, 2)) * -0.08;
    const undulation = Math.sin(x * 1.5) * 0.03 + Math.sin(z * 0.8) * 0.04;
    floorPos.setY(i, centerDip + undulation);
  }
  floorGeo.computeVertexNormals();

  const floorMesh = new THREE.Mesh(floorGeo, dirtFloorMaterial);
  floorMesh.name = 'Earthen_Drift_Floor';
  floorMesh.position.set(0, 0, 0);
  root.add(floorMesh);
  attachC4DOverlays(floorMesh, 0x88bbdd);

  // 2. Continuous Craggy Rock Cavern Walls Behind Timber Sets + Unlined Adit Heading
  // Models the fractured bedrock behind the side lagging, transitioning to the raw unlined arched cave bore at the terminus
  const segmentsZ = 48;
  const segmentsU = 32;
  const rockCavernGeo = new THREE.BufferGeometry();
  const rockPositions: number[] = [];
  const rockUvs: number[] = [];
  const rockIndices: number[] = [];

  const timberedLength = params.timberSetCount * params.timberSpacing;
  const halfLength = params.tunnelLength / 2;

  for (let iz = 0; iz <= segmentsZ; iz++) {
    const tz = iz / segmentsZ;
    // z runs from front (+halfLength) to deep heading (-halfLength)
    const z = halfLength - tz * params.tunnelLength;

    // Is this slice in the timbered section or in the raw unlined heading?
    const inUnlinedAdit = z < -timberedLength / 2 + 2.0;
    const unlinedFactor = inUnlinedAdit
      ? Math.min(1.0, (-timberedLength / 2 + 2.0 - z) / params.unlinedAditLength)
      : 0.0;

    // In the unlined bore, the cross section narrows into an organic curved rock arch
    const archWidth = (params.spanWidth + 0.6) * (1.0 - unlinedFactor * 0.35);
    const archHeight = (params.timberHeight + 0.3) * (1.0 - unlinedFactor * 0.3);

    for (let iu = 0; iu <= segmentsU; iu++) {
      const tu = iu / segmentsU;

      let x = 0;
      let y = 0;

      // Cavern cross section: Left rock wall (tu = 0 to 0.35) -> Ceiling arch (0.35 to 0.65) -> Right rock wall (0.65 to 1.0)
      if (tu <= 0.35) {
        // Left wall
        const tf = tu / 0.35;
        x = -archWidth / 2 - 0.25;
        y = tf * archHeight;
      } else if (tu <= 0.65) {
        // Overhead vault
        const tc = (tu - 0.35) / 0.3;
        const angle = Math.PI - tc * Math.PI;
        x = Math.cos(angle) * (archWidth / 2 + 0.25);
        y = archHeight + Math.sin(angle) * 0.6;
      } else {
        // Right wall
        const tw = (tu - 0.65) / 0.35;
        x = archWidth / 2 + 0.25;
        y = (1.0 - tw) * archHeight;
      }

      // Procedural rock fracture displacement
      const noise =
        Math.sin(x * 1.2 + z * 0.8) * 0.25 +
        Math.cos(y * 1.5 + z * 1.1) * 0.2 +
        Math.sin(x * 3.0 + y * 2.2 + z * 1.8) * 0.12;

      // In the unlined adit, make the rock even more rugged and enclose toward the center
      x += (x < 0 ? -1 : 1) * Math.abs(noise * 0.6);
      y += noise * 0.4;

      // Close the end of the unlined adit with dark depth
      if (iz === segmentsZ) {
        // Final terminal cave wall
        x *= 0.25;
        y *= 0.35;
      }

      rockPositions.push(x, y, z);
      rockUvs.push(tu * 4, tz * 8);
    }
  }

  for (let iz = 0; iz < segmentsZ; iz++) {
    for (let iu = 0; iu < segmentsU; iu++) {
      const a = iz * (segmentsU + 1) + iu;
      const b = (iz + 1) * (segmentsU + 1) + iu;
      const c = (iz + 1) * (segmentsU + 1) + (iu + 1);
      const d = iz * (segmentsU + 1) + (iu + 1);

      rockIndices.push(a, b, d);
      rockIndices.push(b, c, d);
    }
  }

  rockCavernGeo.setIndex(rockIndices);
  rockCavernGeo.setAttribute('position', new THREE.Float32BufferAttribute(rockPositions, 3));
  rockCavernGeo.setAttribute('uv', new THREE.Float32BufferAttribute(rockUvs, 2));
  rockCavernGeo.computeVertexNormals();

  const rockCavernMesh = new THREE.Mesh(rockCavernGeo, rockMaterial);
  rockCavernMesh.name = 'Bedrock_Cavern_Bore';
  root.add(rockCavernMesh);
  attachC4DOverlays(rockCavernMesh, 0xe88724);

  // 3. Multi-Set Heavy Square Timber Shoring (Square Set System matching Photo)
  const timberGroup = new THREE.Group();
  timberGroup.name = 'Photo_Timber_Square_Sets';

  const setsCount = params.timberSetCount;
  const setSpacing = params.timberSpacing;
  const batterRad = (params.postBatterAngleDeg * Math.PI) / 180;
  const postWidth = params.timberWidth;
  const postHeight = params.timberHeight;
  const span = params.spanWidth;

  // Single reusable geometries for optimal GPU instancing / draw calls
  const postGeo = new THREE.BoxGeometry(postWidth, postHeight, postWidth);
  const capGeo = new THREE.BoxGeometry(span + postWidth * 2.2, postWidth, postWidth * 1.15);

  for (let s = 0; s < setsCount; s++) {
    const archZ = ((setsCount - 1) / 2 - s) * setSpacing;
    const archGroup = new THREE.Group();
    archGroup.name = `Timber_Set_${s + 1}`;
    archGroup.position.set(0, 0, archZ);

    // Left Vertical Post with inward batter
    const leftPost = new THREE.Mesh(postGeo, timberMaterial);
    leftPost.name = `Left_Post_Set_${s + 1}`;
    leftPost.position.set(-span / 2, postHeight / 2 - 0.05, 0);
    leftPost.rotation.z = -batterRad;
    archGroup.add(leftPost);

    // Right Vertical Post with inward batter
    const rightPost = new THREE.Mesh(postGeo, timberMaterial);
    rightPost.name = `Right_Post_Set_${s + 1}`;
    rightPost.position.set(span / 2, postHeight / 2 - 0.05, 0);
    rightPost.rotation.z = batterRad;
    archGroup.add(rightPost);

    // Overhead Cap / Lintel Timber Beam
    const capBeam = new THREE.Mesh(capGeo, timberMaterial);
    capBeam.name = `Cap_Beam_Set_${s + 1}`;
    capBeam.position.set(0, postHeight - 0.1, 0);
    archGroup.add(capBeam);

    // Top Longitudinal Stringers (connecting consecutive arches near ceiling corners)
    if (params.includeTopStringers && s < setsCount - 1) {
      const stringerGeo = new THREE.BoxGeometry(postWidth * 0.75, postWidth * 0.75, setSpacing);
      const leftStringer = new THREE.Mesh(stringerGeo, timberMaterial);
      leftStringer.position.set(-span / 2 + 0.15, postHeight - 0.1, -setSpacing / 2);
      archGroup.add(leftStringer);

      const rightStringer = new THREE.Mesh(stringerGeo, timberMaterial);
      rightStringer.position.set(span / 2 - 0.15, postHeight - 0.1, -setSpacing / 2);
      archGroup.add(rightStringer);
    }

    // 4-Tier Horizontal Side Lagging Planks (between timber posts, holding back rock face)
    if (s < setsCount - 1) {
      const tiers = params.laggingPlankTiers;
      const plankW = params.laggingPlankWidth;
      const plankGeo = new THREE.BoxGeometry(0.12, plankW, setSpacing - 0.05);

      for (let t = 0; t < tiers; t++) {
        // Vertical height of this lagging tier (from floor to cap)
        const tierY = 0.55 + t * (plankW + params.laggingGap);

        // Account for inward batter of post
        const inset = Math.sin(batterRad) * tierY;

        // Left wall lagging plank
        const leftPlank = new THREE.Mesh(plankGeo, timberMaterial);
        leftPlank.name = `Left_Lagging_Tier_${t + 1}_Set_${s + 1}`;
        leftPlank.position.set(-span / 2 + inset - 0.08, tierY, -setSpacing / 2);
        leftPlank.rotation.y = (Math.random() - 0.5) * 0.02; // slight organic variation
        archGroup.add(leftPlank);

        // Right wall lagging plank
        const rightPlank = new THREE.Mesh(plankGeo, timberMaterial);
        rightPlank.name = `Right_Lagging_Tier_${t + 1}_Set_${s + 1}`;
        rightPlank.position.set(span / 2 - inset + 0.08, tierY, -setSpacing / 2);
        rightPlank.rotation.y = (Math.random() - 0.5) * 0.02;
        archGroup.add(rightPlank);
      }

      // Overhead Roof Lagging Planks (shielding ceiling from loose stone fall)
      if (params.includeRoofLagging) {
        const roofPlanksCount = 5;
        const roofPlankW = (span - 0.6) / roofPlanksCount;
        const roofPlankGeo = new THREE.BoxGeometry(roofPlankW - 0.04, 0.12, setSpacing);

        for (let rp = 0; rp < roofPlanksCount; rp++) {
          const rpx = -span / 2 + 0.5 + rp * roofPlankW;
          const roofPlank = new THREE.Mesh(roofPlankGeo, timberMaterial);
          roofPlank.position.set(rpx, postHeight + 0.12, -setSpacing / 2);
          archGroup.add(roofPlank);
        }
      }
    }

    timberGroup.add(archGroup);
  }
  root.add(timberGroup);

  // 4. Scattered 3D Rock Rubble Chunks on the Drift Floor (Matching the Photo Debris)
  const rubbleGroup = new THREE.Group();
  rubbleGroup.name = 'Photo_Drift_Floor_Rubble';

  if (params.includeRubbleDebris) {
    const rubbleCount = params.rubbleCount;
    for (let r = 0; r < rubbleCount; r++) {
      const size = 0.15 + Math.random() * 0.35;
      const isGoldChunk = r % 8 === 0;
      const rubbleGeo = isGoldChunk
        ? new THREE.DodecahedronGeometry(size, 0)
        : new THREE.IcosahedronGeometry(size, 0);

      const rubbleMesh = new THREE.Mesh(rubbleGeo, isGoldChunk ? goldMaterial : rockMaterial);

      // Random position along the floor path (clustered mostly near the walls and along the corridor)
      const rx = (Math.random() - 0.5) * (span - 0.8);
      const rz = (Math.random() - 0.5) * (params.tunnelLength - 8.0);
      rubbleMesh.position.set(rx, size * 0.45, rz);
      rubbleMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rubbleGroup.add(rubbleMesh);
    }
  }
  root.add(rubbleGroup);

  // 5. Optional Railway Track (can be toggled in params, positioned along the floor)
  const trackGroup = new THREE.Group();
  trackGroup.name = 'Railway_Tracks';
  const trackGauge = 2.0;

  if (params.includeRailwayTracks) {
    const railLength = params.tunnelLength;
    const railGeo = new THREE.BoxGeometry(0.1, 0.16, railLength);
    const leftRail = new THREE.Mesh(railGeo, ironMaterial);
    leftRail.position.set(-trackGauge / 2, 0.12, 0);
    trackGroup.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, ironMaterial);
    rightRail.position.set(trackGauge / 2, 0.12, 0);
    trackGroup.add(rightRail);

    // Wooden Ties / Sleepers (partially embedded in the earthen floor)
    const tieCount = 36;
    const tieSpacing = railLength / tieCount;
    const tieGeo = new THREE.BoxGeometry(3.0, 0.14, 0.32);
    for (let t = 0; t < tieCount; t++) {
      const tz = (t - (tieCount - 1) / 2) * tieSpacing;
      const tie = new THREE.Mesh(tieGeo, timberMaterial);
      tie.position.set(0, 0.04, tz);
      trackGroup.add(tie);
    }
  }
  root.add(trackGroup);

  // 6. Mine Cart Loaded with Ore (Matches MiningTunnelRig interface)
  const mineCart = new THREE.Group();
  mineCart.name = 'Mine_Cart_Ore';
  const wheels: THREE.Mesh[] = [];

  if (params.includeOreCart) {
    // Chassis
    const chassisGeo = new THREE.BoxGeometry(2.2, 0.2, 3.2);
    const chassis = new THREE.Mesh(chassisGeo, ironMaterial);
    chassis.position.set(0, 0.55, 0);
    mineCart.add(chassis);

    // Wheels
    const wheelRadius = 0.38;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.14, 20);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelPositions = [
      { x: -trackGauge / 2, z: -1.0 },
      { x: trackGauge / 2, z: -1.0 },
      { x: -trackGauge / 2, z: 1.0 },
      { x: trackGauge / 2, z: 1.0 },
    ];

    wheelPositions.forEach((pos, idx) => {
      const wheel = new THREE.Mesh(wheelGeo, ironMaterial);
      wheel.name = `Cart_Wheel_${idx + 1}`;
      wheel.position.set(pos.x, wheelRadius + 0.08, pos.z);
      wheels.push(wheel);
      mineCart.add(wheel);
    });

    // Bucket
    const bucketShape = new THREE.Shape();
    bucketShape.moveTo(-1.0, 0);
    bucketShape.lineTo(1.0, 0);
    bucketShape.lineTo(1.25, 1.4);
    bucketShape.lineTo(-1.25, 1.4);
    bucketShape.closePath();

    const bucketGeo = new THREE.ExtrudeGeometry(bucketShape, {
      steps: 1,
      depth: 2.8,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.04,
    });
    bucketGeo.center();
    const bucket = new THREE.Mesh(bucketGeo, ironMaterial);
    bucket.position.set(0, 1.35, 0);
    mineCart.add(bucket);

    // Ore payload
    const orePayload = new THREE.Group();
    for (let r = 0; r < 14; r++) {
      const isGold = r % 2 === 0;
      const oreGeo = isGold
        ? new THREE.IcosahedronGeometry(0.28 + Math.random() * 0.2, 0)
        : new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.25, 0);
      const ore = new THREE.Mesh(oreGeo, isGold ? goldMaterial : rockMaterial);
      ore.position.set(
        (Math.random() - 0.5) * 1.5,
        1.75 + Math.random() * 0.5,
        (Math.random() - 0.5) * 2.0
      );
      orePayload.add(ore);
    }
    mineCart.add(orePayload);

    // Initial position
    mineCart.position.set(0, 0, 0);
  }
  root.add(mineCart);

  // 7. Atmospheric Lighting matching the Reference Photo
  // The reference photo is lit by a forward headlamp / survey light positioned in the foreground pointing down the tunnel bore
  const lanterns: THREE.Group[] = [];
  const lanternLights: THREE.PointLight[] = [];

  // Foreground Warm Headlamp Light illuminating the timber sets
  const headlampGroup = new THREE.Group();
  headlampGroup.name = 'Photo_Front_Survey_Light';
  headlampGroup.position.set(0, 3.2, halfLength - 2.0);

  const headlamp = new THREE.SpotLight(0xffecd0, params.headlampIntensity, 55, Math.PI / 3.2, 0.45, 1.2);
  headlamp.position.set(0, 0, 0);
  headlamp.target.position.set(0, 1.8, -halfLength);
  headlampGroup.add(headlamp);
  headlampGroup.add(headlamp.target);
  root.add(headlampGroup);

  // Lantern brackets mounted on timber posts (authentic mining oil/tungsten lanterns)
  const lanternZPositions = [-12, 0, 12];
  lanternZPositions.forEach((lz, idx) => {
    const lantern = new THREE.Group();
    lantern.name = `Timber_Wall_Lantern_${idx + 1}`;
    // Mounted on right timber post
    lantern.position.set(span / 2 - 0.25, 2.6, lz);

    // Iron wall bracket
    const bracketGeo = new THREE.BoxGeometry(0.06, 0.06, 0.45);
    const bracket = new THREE.Mesh(bracketGeo, ironMaterial);
    bracket.position.set(-0.15, 0, 0);
    lantern.add(bracket);

    // Glowing bulb
    const bulbGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffcc44,
      emissive: 0xff9911,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(-0.35, -0.1, 0);
    lantern.add(bulb);

    const pointLight = new THREE.PointLight(0xffa834, 4.5, 16, 1.5);
    pointLight.position.set(-0.35, -0.1, 0);
    pointLight.castShadow = true;
    lantern.add(pointLight);

    lanterns.push(lantern);
    lanternLights.push(pointLight);
    root.add(lantern);
  });

  // Overall orientation for Cinema 4D Viewport:
  // Positioned along origin, facing camera down the adit bore
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);

  const setDisplayMode = (mode: ShadingDisplayMode) => {
    const isWire = mode === 'wireframe';
    const showLines = mode === 'gouraud_lines' || mode === 'wireframe' || mode === 'points';
    const showPoints = mode === 'points';

    rockMaterial.wireframe = isWire;
    timberMaterial.wireframe = isWire;
    dirtFloorMaterial.wireframe = isWire;
    ironMaterial.wireframe = isWire;
    goldMaterial.wireframe = isWire;

    wireframeObjects.forEach((wf) => {
      wf.visible = showLines;
    });

    pointCloudObjects.forEach((pc) => {
      pc.visible = showPoints;
    });
  };

  return {
    root,
    tunnelMesh: rockCavernMesh,
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
      // Cart movement along timeline
      if (params.includeOreCart) {
        const startZ = 14.0;
        const endZ = -14.0;
        const currentCartZ = calculateCartZ(currentFrame, 90, startZ, endZ);
        mineCart.position.z = currentCartZ;

        const distance = startZ - currentCartZ;
        const rot = calculateWheelRotation(distance, 0.38);
        wheels.forEach((w) => {
          w.rotation.x = rot;
        });
      }

      // Subtle atmospheric lantern flicker / sway
      lanterns.forEach((l, idx) => {
        const flicker = Math.sin(time * 3.5 + idx * 2.0) * 0.02;
        l.rotation.z = flicker;
      });
    },
    setWireframe: (enabled: boolean) => {
      setDisplayMode(enabled ? 'wireframe' : 'gouraud');
    },
    setDisplayMode,
  };
}
