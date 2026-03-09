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

test('rgbaToHexAndAlpha handles incomplete or invalid rgba values', () => {
  const result = rgbaToHexAndAlpha('rgba(255)');
  assert.strictEqual(result.hex, '#ffffff'); // 255, 255, 255
  assert.strictEqual(result.alpha, 0.05);

  const resultEmpty = rgbaToHexAndAlpha('rgba(,,,)');
  assert.strictEqual(resultEmpty.hex, '#ffffff');
  assert.strictEqual(resultEmpty.alpha, 0.05);

  const resultNaN = rgbaToHexAndAlpha('rgba(abc, def, ghi, jkl)');
  assert.strictEqual(resultNaN.hex, '#ffffff');
  assert.strictEqual(resultNaN.alpha, 0.05);
});

test('hexToRgba handles standard hex', () => {
  assert.strictEqual(hexToRgba('#ff0000', 1), 'rgba(255, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#000000', 0), 'rgba(0, 0, 0, 0)');
});

test('hexToRgba handles invalid inputs', () => {
  assert.strictEqual(hexToRgba(null, 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba(undefined, 0.5), 'rgba(0, 0, 0, 0.5)');
  assert.strictEqual(hexToRgba('', 0.2), 'rgba(0, 0, 0, 0.2)');
  assert.strictEqual(hexToRgba(123456, 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba({}, 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('ff0000', 1), 'rgba(0, 0, 0, 1)');
});

test('hexToRgba handles missing # prefix', () => {
  assert.strictEqual(hexToRgba('ff0000', 1), 'rgba(0, 0, 0, 1)');
});

test('hexToRgba handles invalid characters within hex string', () => {
  assert.strictEqual(hexToRgba('#zzzzzz', 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#ffzz00', 1), 'rgba(255, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#gg00ff', 0.5), 'rgba(0, 0, 255, 0.5)');
});

test('hexToRgba handles short/incomplete hex strings', () => {
  assert.strictEqual(hexToRgba('#', 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#f', 1), 'rgba(15, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#ff', 1), 'rgba(255, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#ff0', 1), 'rgba(255, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#ff00', 1), 'rgba(255, 0, 0, 1)');
});

test('rgbaToHexAndAlpha handles strings without ending parentheses', () => {
  const result = rgbaToHexAndAlpha('rgba(255, 128, 64, 0.5');
  assert.strictEqual(result.hex, '#ff8040');
  assert.strictEqual(result.alpha, 0.5);

  const result2 = rgbaToHexAndAlpha('rgba(1, 2, 3');
  assert.strictEqual(result2.hex, '#010203');
  assert.strictEqual(result2.alpha, 0.05); // default alpha

  const result3 = rgbaToHexAndAlpha('rgba(1, 2');
  assert.strictEqual(result3.hex, '#0102ff');
  assert.strictEqual(result3.alpha, 0.05);
});

test('rgbaToHexAndAlpha handles strings without spaces but missing parenthesis', () => {
  const result = rgbaToHexAndAlpha('rgba(100,200,300,0.1');
  assert.strictEqual(result.hex, '#64c92c');
  assert.strictEqual(result.alpha, 0.1);
});

test('rgbaToHexAndAlpha handles strings ending in comma without spaces', () => {
  const result = rgbaToHexAndAlpha('rgba(100,200,300,');
  assert.strictEqual(result.hex, '#64c92c');
  assert.strictEqual(result.alpha, 0.05);
});

test('rgbaToHexAndAlpha hits line 39 via internal break logic', () => {
  const result = rgbaToHexAndAlpha('rgba(1,2,3,4,5');
  assert.strictEqual(result.hex, '#010203');
  assert.strictEqual(result.alpha, 4);
});
