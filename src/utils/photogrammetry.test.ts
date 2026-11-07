import test from 'node:test';
import assert from 'node:assert';
import { getDefaultSampleSurveyImages } from '../types/aiSurvey.ts';

test('getDefaultSampleSurveyImages provides sequential images with distance tags', () => {
  const images = getDefaultSampleSurveyImages();
  assert.strictEqual(images.length, 3);

  // Baseline origin image
  assert.strictEqual(images[0].distanceFromLast, 0.0);
  assert.strictEqual(images[0].stationId, 'ST-01');

  // Sequential images have positive distance tags
  assert.strictEqual(images[1].distanceFromLast, 2.8);
  assert.strictEqual(images[2].distanceFromLast, 2.6);

  // Cumulative distance calculation
  const totalDistance = images.reduce((sum, img, idx) => sum + (idx === 0 ? 0 : img.distanceFromLast), 0);
  assert.strictEqual(Math.round(totalDistance * 10) / 10, 5.4);
});
