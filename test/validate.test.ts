import { test, expect } from 'vitest';
import { validate } from '../engine/tiles';
import type { WinInput, Meld, Tile } from '../engine/types';

const base = (concealed: Tile[], winningTile: Tile, melds: Meld[] = []): WinInput => ({
  concealed, melds, winningTile,
  isTsumo: false, roundWind: '1z', seatWind: '2z',
  riichi: false, doubleRiichi: false, ippatsu: false,
  haitei: false, houtei: false, rinshan: false, chankan: false, tenhou: false, chiihou: false,
  doraIndicators: [], uraDoraIndicators: [], akaDora: 0, honba: 0, riichiSticks: 0,
});

const hand13: Tile[] = ['1m', '1m', '1m', '4p', '5p', '6p', '7p', '8p', '9p', '7z', '7z', '7z', '5s'];

test('정상 멘젠 14장 → null', () => {
  expect(validate(base(hand13, '5s'))).toBeNull();
});

test('정상 부로 1개 → 손패 10장', () => {
  expect(validate(base(hand13.slice(3), '5s', [{ type: 'pon', tiles: ['5z', '5z', '5z'] }]))).toBeNull();
});

test('안깡은 4장이지만 면자 1개로 계산', () => {
  expect(validate(base(hand13.slice(3), '5s', [{ type: 'ankan', tiles: ['5z', '5z', '5z', '5z'] }]))).toBeNull();
});

test('손패 매수 오류', () => {
  expect(validate(base(hand13.slice(1), '5s'))).toMatchObject({ id: 'handSize', expected: 13 });
  expect(validate(base(hand13, '5s', [{ type: 'pon', tiles: ['5z', '5z', '5z'] }]))).toMatchObject({ id: 'handSize', expected: 10 });
});

test('같은 패 5장', () => {
  const h: Tile[] = ['1m', '1m', '1m', '1m', '5p', '6p', '7p', '8p', '9p', '7z', '7z', '7z', '1m'];
  expect(validate(base(h, '1m'))).toMatchObject({ id: 'tileOverflow', tile: '1m' });
});

test('부로 구성 오류', () => {
  expect(validate(base(hand13.slice(3), '5s', [{ type: 'pon', tiles: ['5z', '5z', '6z'] }]))).toMatchObject({ id: 'meldShape', meld: 'pon' });
  expect(validate(base(hand13.slice(3), '5s', [{ type: 'chi', tiles: ['1s', '2s', '4s'] }]))).toMatchObject({ id: 'meldShape', meld: 'chi' });
  expect(validate(base(hand13.slice(3), '5s', [{ type: 'chi', tiles: ['1z', '2z', '3z'] }]))).toMatchObject({ id: 'meldShape', meld: 'chi' });
  expect(validate(base(hand13.slice(3), '5s', [{ type: 'minkan', tiles: ['5z', '5z', '5z'] }]))).toMatchObject({ id: 'meldSize', meld: 'minkan', expected: 4 });
});
