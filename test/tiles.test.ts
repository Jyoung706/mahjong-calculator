import { test, expect } from 'vitest';
import { countTiles, isYaochu, isSimple, isTerminal } from '../engine/tiles';
import type { Tile } from '../engine/types';

test('countTiles', () => {
  const hand: Tile[] = ['1m', '1m', '1m', '4p', '5p', '6p', '7z', '7z'];
  expect(countTiles(hand)).toEqual({ '1m': 3, '4p': 1, '5p': 1, '6p': 1, '7z': 2 });
});

test('패 분류', () => {
  expect(isTerminal('9m')).toBe(true);
  expect(isTerminal('1z')).toBe(false);
  expect(isYaochu('1z')).toBe(true);
  expect(isSimple('5p')).toBe(true);
  expect(isSimple('1m')).toBe(false);
});
