// 명세 §12 테스트 케이스 (전부 실제 계산 기대값)
import { test, expect } from 'vitest';
import { calculateScore } from '../engine';
import { calcPayment } from '../engine/score';
import type { WinInput, Tile } from '../engine/types';

const win = (concealed: Tile[], winningTile: Tile, over: Partial<WinInput> = {}): WinInput => ({
  concealed, winningTile, melds: [],
  isTsumo: false, roundWind: '1z', seatWind: '2z',
  riichi: false, doubleRiichi: false, ippatsu: false,
  haitei: false, houtei: false, rinshan: false, chankan: false, tenhou: false, chiihou: false,
  doraIndicators: [], uraDoraIndicators: [], akaDora: 0, honba: 0, riichiSticks: 0,
  ...over,
});

const yakuNames = (r: ReturnType<typeof calculateScore>) => r.yaku.map((y) => y.name);
const yakumanNames = (r: ReturnType<typeof calculateScore>) => r.yakuman.map((y) => y.name);

test('[1] 자 리치 + 中 → 2판 50부 3200 (론)', () => {
  const r = calculateScore(win(
    ['1m','1m','1m','4p','5p','6p','7p','8p','9p','7z','7z','7z','5s'], '5s', { riichi: true }));
  expect(r.valid).toBe(true);
  expect(yakuNames(r).sort()).toEqual(['리치', '역패 中']);
  expect(r.han).toBe(2);
  expect(r.fu).toBe(50);
  expect(r.payment.ron).toBe(3200);
});

test('[2] 핑후 쯔모 20부 고정 → 3판 700/1300', () => {
  const r = calculateScore(win(
    // 명세 원본(678p)은 탄야오도 성립해 4판 — 789p로 바꿔 3판 유지
    ['2m','3m','4m','3p','4p','5p','7p','8p','9p','3s','4s','5s','5s'], '2s',
    { isTsumo: true, doraIndicators: ['2p'] }));
  expect(yakuNames(r).sort()).toEqual(['도라', '멘젠쯔모', '핑후']);
  expect(r.han).toBe(3);
  expect(r.fu).toBe(20);
  expect(r.payment.tsumoFromDealer).toBe(1300);
  expect(r.payment.tsumoFromNonDealer).toBe(700);
});

test('[3] 白폰 → 1판 30부 1000 (론)', () => {
  const r = calculateScore(win(
    ['2m','3m','4m','5p','6p','7p','9s','9s','3s','4s'], '5s',
    { melds: [{ type: 'pon', tiles: ['5z','5z','5z'] }], doraIndicators: ['1s'] }));
  expect(yakuNames(r)).toEqual(['역패 白']);
  expect(r.han).toBe(1);
  expect(r.fu).toBe(30);
  expect(r.payment.ron).toBe(1000);
});

test('[4] 쿠이핑후형: 부로+무부수+론 → 30부 (20부 아님) → 2판 2000', () => {
  const r = calculateScore(win(
    ['3m','4m','5m','6p','7p','8p','5m','5m','7s','8s'], '6s',
    { melds: [{ type: 'chi', tiles: ['2s','3s','4s'] }], doraIndicators: ['6p'] }));
  expect(yakuNames(r).sort()).toEqual(['도라', '탄야오']);
  expect(r.han).toBe(2);
  expect(r.fu).toBe(30);
  expect(r.payment.ron).toBe(2000);
});

test('[5] 치토이츠 25부 고정 + 리치 → 3판 3200 (론)', () => {
  const r = calculateScore(win(
    ['1m','1m','5m','5m','9m','9m','3p','3p','7p','7p','2s','2s','6s'], '6s', { riichi: true }));
  expect(yakuNames(r).sort()).toEqual(['리치', '치토이츠']);
  expect(r.han).toBe(3);
  expect(r.fu).toBe(25);
  expect(r.payment.ron).toBe(3200);
});

test('[6~9] 만관 경계 (calcPayment 직접)', () => {
  const pay = (han: number, fu: number, isDealer: boolean) =>
    calcPayment({ han, fu, yakumanMultiplier: 0, isDealer, isTsumo: false, honba: 0, riichiSticks: 0, kazoeYakuman: true });
  expect(pay(4, 30, true).payment.ron).toBe(11600);   // 기본점 1920, 만관 아님
  expect(pay(4, 30, true).limitName).toBeUndefined();
  expect(pay(4, 40, true).payment.ron).toBe(12000);   // 기본점 2560 → 만관 절삭
  expect(pay(4, 40, true).limitName).toBe('만관');
  expect(pay(4, 30, false).payment.ron).toBe(7700);
  expect(pay(4, 40, false).payment.ron).toBe(8000);
});

test('[10] 친 東장 東가 + 東커쯔 → 역패 2판 (장풍+자풍)', () => {
  const r = calculateScore(win(
    ['1z','1z','1z','2m','3m','4m','5p','6p','7p','4s','5s','8s','8s'], '3s', { seatWind: '1z' }));
  expect(yakuNames(r).sort()).toEqual(['역패 자풍', '역패 장풍']);
  expect(r.han).toBe(2);
});

test('[11] 혼노두 → 토이토이+삼안커 자동 성립 (론) / 쯔모면 사안커', () => {
  const concealed: Tile[] = ['1m','1m','1m','9m','9m','9m','1p','1p','1p','9p','9p','1z','1z'];
  const ron = calculateScore(win(concealed, '9p'));
  expect(yakuNames(ron).sort()).toEqual(['삼안커', '토이토이', '혼노두']);
  expect(ron.han).toBe(6);
  expect(ron.limitName).toBe('하네만');

  const tsumo = calculateScore(win(concealed, '9p', { isTsumo: true }));
  expect(yakumanNames(tsumo)).toEqual(['사안커']);
});

test('[12] 청일색 + 일기통관 + 핑후 = 9판 배만', () => {
  const r = calculateScore(win(
    ['1m','2m','3m','4m','5m','6m','7m','8m','9m','2m','3m','5m','5m'], '4m'));
  expect(yakuNames(r).sort()).toEqual(['일기통관', '청일색', '핑후']);
  expect(r.han).toBe(9);
  expect(r.limitName).toBe('배만');
});

test('[13] 사안커 (샤보 쯔모)', () => {
  const r = calculateScore(win(
    ['1m','1m','1m','9m','9m','9m','1p','1p','1p','9s','9s','1z','1z'], '9s', { isTsumo: true }));
  expect(r.yakuman).toEqual([{ name: '사안커', multiplier: 1 }]);
});

test('[14] 사안커 단기 (론) → 더블역만', () => {
  const r = calculateScore(win(
    ['1s','1s','1s','9s','9s','9s','1m','1m','1m','9p','9p','9p','2z'], '2z'));
  expect(r.yakuman).toEqual([{ name: '사안커 단기', multiplier: 2 }]);
  expect(r.limitName).toBe('더블역만');
});

test('[15] 국사무쌍 13면 → 더블역만', () => {
  const r = calculateScore(win(
    ['1m','9m','1p','9p','1s','9s','1z','2z','3z','4z','5z','6z','7z'], '1m'));
  expect(r.yakuman).toEqual([{ name: '국사무쌍 13면', multiplier: 2 }]);
});

test('[16] 순정구련보등 → 더블역만', () => {
  const r = calculateScore(win(
    ['1p','1p','1p','2p','3p','4p','5p','6p','7p','8p','9p','9p','9p'], '5p'));
  expect(yakumanNames(r)).toEqual(['순정구련보등']);
});

test('[17] 녹일색', () => {
  const r = calculateScore(win(
    ['2s','2s','2s','3s','3s','3s','4s','4s','4s','6z','6z','6z','8s'], '8s'));
  expect(yakumanNames(r)).toContain('녹일색');
});

test('[18] 자일색 + 소사희 중첩', () => {
  const r = calculateScore(win(
    ['1z','1z','1z','2z','2z','2z','3z','3z','3z','7z','7z','7z','4z'], '4z'));
  const names = yakumanNames(r);
  expect(names).toContain('자일색');
  expect(names).toContain('소사희');
});

test('[19] 부로 + 역 없음 → 에러', () => {
  const r = calculateScore(win(
    ['2m','3m','4m','5p','6p','7p','9s','9s','3s','4s'], '5s',
    { melds: [{ type: 'pon', tiles: ['9m','9m','9m'] }] }));
  expect(r.valid).toBe(false);
  expect(r.error).toBe('역 없음');
});
