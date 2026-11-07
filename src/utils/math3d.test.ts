import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cmToUnits,
  unitsToCm,
  degToRad,
  radToDeg,
  formatValue,
  parseC4DInput,
  frameToSeconds,
  stepFrame,
  calculateCartZ,
  calculateWheelRotation,
  clampVector,
} from './math3d';

test('cmToUnits and unitsToCm convert reversibly', () => {
  assert.equal(cmToUnits(100), 1.0);
  assert.equal(unitsToCm(1.0), 100);
  assert.equal(cmToUnits(2500), 25.0);
  assert.equal(unitsToCm(25.0), 2500);
});

test('degToRad and radToDeg convert accurately', () => {
  assert.equal(degToRad(180), Math.PI);
  assert.equal(degToRad(90), Math.PI / 2);
  assert.equal(radToDeg(Math.PI), 180);
  assert.equal(radToDeg(Math.PI / 2), 90);
});

test('formatValue outputs standard Cinema 4D string notation', () => {
  assert.equal(formatValue(0, 'cm'), '0 cm');
  assert.equal(formatValue(150.25, 'cm'), '150.25 cm');
  assert.equal(formatValue(45, 'deg'), '45 °');
  assert.equal(formatValue(1, 'ratio'), '1');
});

test('parseC4DInput parses numbers with and without unit suffixes', () => {
  assert.equal(parseC4DInput('100 cm'), 100);
  assert.equal(parseC4DInput('-45.5°'), -45.5);
  assert.equal(parseC4DInput('  250  '), 250);
  assert.equal(parseC4DInput('invalid'), 0);
});

test('frameToSeconds calculates proper duration', () => {
  assert.equal(frameToSeconds(30, 30), 1.0);
  assert.equal(frameToSeconds(90, 30), 3.0);
  assert.equal(frameToSeconds(0, 30), 0);
});

test('stepFrame handles playback wrapping and bounds', () => {
  assert.equal(stepFrame(0, 0, 90, 1, true), 1);
  assert.equal(stepFrame(90, 0, 90, 1, true), 0);
  assert.equal(stepFrame(90, 0, 90, 1, false), 90);
  assert.equal(stepFrame(0, 0, 90, -1, true), 90);
});

test('calculateCartZ smoothly interpolates track position', () => {
  assert.equal(calculateCartZ(0, 90, -20, 20), -20);
  assert.equal(calculateCartZ(45, 90, -20, 20), 0);
  assert.equal(calculateCartZ(90, 90, -20, 20), 20);
});

test('calculateWheelRotation determines correct angular travel', () => {
  assert.equal(calculateWheelRotation(0, 0.5), 0);
  assert.equal(calculateWheelRotation(Math.PI, 0.5), 2 * Math.PI);
});

test('clampVector confines coordinates safely', () => {
  const clamped = clampVector({ x: 500000, y: -500000, z: 25 }, -10000, 10000);
  assert.deepEqual(clamped, { x: 10000, y: -10000, z: 25 });
});
