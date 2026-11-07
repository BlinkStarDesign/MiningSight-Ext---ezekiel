import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceMeters,
  clampTunnelWalkPosition,
  interpolateCameraTour,
  getDefaultCameraTours,
  getDefaultTunnelHotspots,
} from './cameraAnimation';

test('calculateDistanceMeters computes proper 3D Euclidean length', () => {
  const p1 = { x: 0, y: 0, z: 0 };
  const p2 = { x: 3, y: 4, z: 0 };
  assert.equal(calculateDistanceMeters(p1, p2), 5.0);

  const p3 = { x: 1, y: 2, z: 2 };
  assert.equal(Math.round(calculateDistanceMeters(p1, p3) * 100) / 100, 3.0);
});

test('clampTunnelWalkPosition confines camera inside physical cavern', () => {
  // Inside bounds - unchanged
  const valid = { x: -1.0, y: 1.8, z: 5.0 };
  assert.deepEqual(clampTunnelWalkPosition(valid), valid);

  // Far outside X and Z
  const outOfBounds = { x: 50.0, y: -10.0, z: -100.0 };
  const clamped = clampTunnelWalkPosition(outOfBounds);
  assert.equal(clamped.x, 2.4);
  assert.equal(clamped.y, 1.2);
  assert.equal(clamped.z, -23.0);
});

test('interpolateCameraTour smoothly transitions between keyframes', () => {
  const keyframes = [
    {
      id: 'k0',
      name: 'Start',
      frame: 0,
      position: { x: 0, y: 10, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      fov: 40,
    },
    {
      id: 'k1',
      name: 'End',
      frame: 100,
      position: { x: 100, y: 10, z: 0 },
      target: { x: 100, y: 0, z: 0 },
      fov: 60,
    },
  ];

  // At frame 0: matches start exactly
  const atStart = interpolateCameraTour(keyframes, 0, 100);
  assert.deepEqual(atStart.position, { x: 0, y: 10, z: 0 });
  assert.equal(atStart.fov, 40);

  // At frame 100: matches end exactly
  const atEnd = interpolateCameraTour(keyframes, 100, 100);
  assert.deepEqual(atEnd.position, { x: 100, y: 10, z: 0 });
  assert.equal(atEnd.fov, 60);

  // At midpoint frame 50: position.x is exactly 50 due to smoothstep symmetry
  const atMid = interpolateCameraTour(keyframes, 50, 100);
  assert.equal(atMid.position.x, 50);
  assert.equal(atMid.target.x, 50);
  assert.equal(atMid.fov, 50);

  // Clamps before start or after end
  const beforeStart = interpolateCameraTour(keyframes, -10, 100);
  assert.equal(beforeStart.position.x, 0);

  const afterEnd = interpolateCameraTour(keyframes, 150, 100);
  assert.equal(afterEnd.position.x, 100);
});

test('getDefaultCameraTours contains valid sequential tours with keyframes', () => {
  const tours = getDefaultCameraTours();
  assert.equal(tours.length >= 3, true);

  const defaultTour = tours[0];
  assert.equal(defaultTour.keyframes.length, 5);
  assert.equal(defaultTour.keyframes[0].frame, 0);
  assert.equal(defaultTour.keyframes[4].frame, 90);

  // Ensure keyframes have valid positions and targets
  defaultTour.keyframes.forEach((kf) => {
    assert.equal(typeof kf.position.x, 'number');
    assert.equal(typeof kf.position.y, 'number');
    assert.equal(typeof kf.position.z, 'number');
    assert.equal(typeof kf.target.x, 'number');
  });
});

test('getDefaultTunnelHotspots provides complete geotechnical inspection points', () => {
  const spots = getDefaultTunnelHotspots();
  assert.equal(spots.length >= 5, true);
  const goldVein = spots.find((s) => s.id === 'spot_gold_vein');
  assert.ok(goldVein);
  assert.equal(goldVein?.category, 'geology');
  assert.equal(goldVein?.details.length >= 3, true);
});
