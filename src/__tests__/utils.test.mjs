import { test } from 'node:test';
import assert from 'node:assert';
import { rgbaToHexAndAlpha, hexToRgba } from '../utils.mjs';

test('rgbaToHexAndAlpha handles valid rgba', () => {
  const result = rgbaToHexAndAlpha('rgba(255, 255, 255, 1)');
  assert.strictEqual(result.hex, '#ffffff');
  assert.strictEqual(result.alpha, 1);
});

test('rgbaToHexAndAlpha handles defaults for non-rgba strings', () => {
  assert.deepStrictEqual(rgbaToHexAndAlpha(null), { hex: '#ffffff', alpha: 0.05 });
  assert.deepStrictEqual(rgbaToHexAndAlpha(''), { hex: '#ffffff', alpha: 0.05 });
  assert.deepStrictEqual(rgbaToHexAndAlpha('hex(#fff)'), { hex: '#ffffff', alpha: 0.05 });
});

test('rgbaToHexAndAlpha handles zero values', () => {
  const result = rgbaToHexAndAlpha('rgba(0, 0, 0, 0)');
  // We expect it to be #000000 and 0, but current code probably gives #ffffff and 0.05
  assert.strictEqual(result.hex, '#000000');
  assert.strictEqual(result.alpha, 0);
});

test('rgbaToHexAndAlpha handles extra spaces', () => {
  const result = rgbaToHexAndAlpha('rgba( 10 , 20 , 30 , 0.5 )');
  assert.strictEqual(result.hex, '#0a141e');
  assert.strictEqual(result.alpha, 0.5);
});

test('hexToRgba handles standard hex', () => {
  assert.strictEqual(hexToRgba('#ff0000', 1), 'rgba(255, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#000000', 0), 'rgba(0, 0, 0, 0)');
});

test('hexToRgba handles invalid, short, or malformed hex strings with fallbacks to 0', () => {
  // Invalid hex characters
  assert.strictEqual(hexToRgba('#zzzzzz', 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#gg00ff', 0.5), 'rgba(0, 0, 255, 0.5)');
  assert.strictEqual(hexToRgba('#ffgg00', 1), 'rgba(255, 0, 0, 1)');

  // Short/incomplete hex strings
  assert.strictEqual(hexToRgba('#', 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#f', 1), 'rgba(15, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#ff', 1), 'rgba(255, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#ff0', 1), 'rgba(255, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#ff00', 1), 'rgba(255, 0, 0, 1)');

  // Missing or non-string or without hash (these hit the first if-statement and return defaults)
  assert.strictEqual(hexToRgba(null, 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba(undefined, 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('', 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('ff0000', 1), 'rgba(0, 0, 0, 1)');
});
