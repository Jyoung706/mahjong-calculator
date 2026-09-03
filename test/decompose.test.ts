import { test, expect } from 'vitest';
import { decompose } from '../engine/decompose';
import type { Tile } from '../engine/types';

test('명세[1] 일반형: 111m 456p 789p 777z 55s', () => {
  const hand: Tile[] = ['1m','1m','1m','4p','5p','6p','7p','8p','9p','7z','7z','7z','5s','5s'];
  const results = decompose(hand, []);
  expect(results).toHaveLength(1);
  const d = results[0];
  expect(d.type).toBe('standard');
  if (d.type === 'standard') {
    expect(d.pair).toBe('5s');
    expect(d.melds.map((m) => m.type).sort()).toEqual(['koutsu', 'koutsu', 'shuntsu', 'shuntsu']);
  }
});

test('부로 포함: 234m 567p 345s 99s + 白폰', () => {
  const hand: Tile[] = ['2m','3m','4m','5p','6p','7p','3s','4s','5s','9s','9s'];
  const results = decompose(hand, [{ type: 'pon', tiles: ['5z','5z','5z'] }]);
  expect(results).toHaveLength(1);
  if (results[0].type === 'standard') {
    expect(results[0].pair).toBe('9s');
    const pon = results[0].melds.find((m) => m.tiles[0] === '5z');
    expect(pon).toMatchObject({ type: 'koutsu', open: true });
  }
});

test('량페코형은 일반형 + 치토이츠 둘 다', () => {
  const hand: Tile[] = ['1m','1m','2m','2m','3m','3m','4p','4p','5p','5p','6p','6p','7s','7s'];
  const types = decompose(hand, []).map((d) => d.type).sort();
  expect(types).toEqual(['chiitoi', 'standard']);
});

test('111222333m 44m 567s → 분해 여러 개 (커쯔×3 / 슌쯔×3 / 머리 이동)', () => {
  const hand: Tile[] = ['1m','1m','1m','2m','2m','2m','3m','3m','3m','4m','4m','5s','6s','7s'];
  const results = decompose(hand, []);
  expect(results.length).toBeGreaterThan(1);
  expect(results.every((d) => d.type === 'standard')).toBe(true);
  // 44m 머리 + 커쯔 3개, 44m 머리 + 슌쯔(123×3), 11m 머리 + 123 234 234 ...
  const pairs = new Set(results.map((d) => (d.type === 'standard' ? d.pair : '')));
  expect(pairs.has('4m')).toBe(true);
  expect(pairs.has('1m')).toBe(true);
});

test('치토이츠: 같은 패 4장은 2쌍으로 못 센다', () => {
  const hand: Tile[] = ['1m','1m','1m','1m','3p','3p','5p','5p','7p','7p','2s','2s','6s','6s'];
  expect(decompose(hand, [])).toHaveLength(0);
});

test('국사무쌍', () => {
  const hand: Tile[] = ['1m','9m','1p','9p','1s','9s','1z','2z','3z','4z','5z','6z','7z','7z'];
  const results = decompose(hand, []);
  expect(results).toHaveLength(1);
  expect(results[0]).toEqual({ type: 'kokushi', pair: '7z' });
});

test('노텐(화료형 아님) → 빈 배열', () => {
  const hand: Tile[] = ['1m','2m','4m','5m','7m','8m','1p','2p','4p','5p','7p','8p','1s','2s'];
  expect(decompose(hand, [])).toHaveLength(0);
});
