// 복합 역·경계 상황 스트레스 테스트. 기대값은 전부 수계산.
import { test, expect } from 'vitest';
import { calculateScore, DEFAULT_RULES } from '../engine';
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
const names = (r: ReturnType<typeof calculateScore>) => r.yaku.map((y) => y.id).sort();

test('7역 중첩: 리치+일발+쯔모+핑후+탄야오+이페코+삼색동순 = 8판 배만', () => {
  const r = calculateScore(win(
    ['3m','4m','5m','3p','4p','5p','3s','3s','4s','4s','5s','6s','6s'], '5s',
    { riichi: true, ippatsu: true, isTsumo: true }));
  expect(names(r)).toEqual(['iipeikou', 'ippatsu', 'menzenTsumo', 'pinfu', 'riichi', 'sanshokuDoujun', 'tanyao']);
  expect(r.han).toBe(8);
  expect(r.fu).toBe(20); // 핑후 쯔모 고정
  expect(r.limit).toBe('baiman');
  expect(r.payment.tsumoFromDealer).toBe(8000);
  expect(r.payment.tsumoFromNonDealer).toBe(4000);
});

test('량페코 vs 치토이츠: 높은 쪽(량페코 3판 40부)을 채택', () => {
  const r = calculateScore(win(
    ['1m','1m','2m','2m','3m','3m','4p','4p','5p','5p','6p','6p','7s'], '7s'));
  expect(names(r)).toEqual(['ryanpeikou']); // 치토이츠·이페코로 세지 않음
  expect(r.han).toBe(3);
  expect(r.fu).toBe(40); // 20+멘젠론10+단기2=32→40 (치토이면 25)
  expect(r.payment.ron).toBe(5200);
});

test('§7.3 함정: 샤보 론이면 명각 → 삼안커 불성립, 쯔모면 성립', () => {
  const concealed: Tile[] = ['2m','2m','2m','2p','2p','2p','2s','2s','3m','4m','5m','8m','8m'];
  const ron = calculateScore(win(concealed, '2s'));
  expect(names(ron)).toEqual(['sanshokuDoukou', 'tanyao']); // 2s커쯔는 명각이라 삼안커 없음
  expect(ron.han).toBe(3);
  expect(ron.fu).toBe(40); // 20+10+안커4+안커4+명각2=40

  const tsumo = calculateScore(win(concealed, '2s', { isTsumo: true }));
  expect(names(tsumo)).toEqual(['menzenTsumo', 'sanankou', 'sanshokuDoukou', 'tanyao']);
  expect(tsumo.han).toBe(6);
  expect(tsumo.limit).toBe('haneman');
});

test('찬타+이페코 (자패 머리라 준찬타 아님)', () => {
  const r = calculateScore(win(
    ['1m','1m','2m','2m','3m','3m','7p','8p','9p','9s','9s','9s','1z'], '1z'));
  expect(names(r)).toEqual(['chanta', 'iipeikou']);
  expect(r.han).toBe(3);
  expect(r.fu).toBe(50); // 20+10+9s안커8+머리 장풍1z 2+단기2=42→50
  expect(r.payment.ron).toBe(6400);
});

test('펜찬처럼 보이는 손: 12345m + 3m 화료 → 양면 해석으로 핑후 성립', () => {
  const r = calculateScore(win(
    ['1m','2m','3m','4m','5m','4p','5p','6p','7p','8p','9p','9s','9s'], '3m'));
  // 12m+3m(펜찬)이 아니라 123m 완성 + 45m+3m(양면)으로 해석하면 핑후
  expect(names(r)).toEqual(['pinfu']);
  expect(r.fu).toBe(30);
  expect(r.payment.ron).toBe(1000);
});

test('더블리치+일발+우라도라 → 5판 만관 (리치 항목은 없어야 함)', () => {
  const r = calculateScore(win(
    ['1m','1m','1m','4p','5p','6p','7p','8p','9p','7z','7z','7z','5s'], '5s',
    { doubleRiichi: true, ippatsu: true, uraDoraIndicators: ['4p'] }));
  expect(names(r)).toEqual(['doubleRiichi', 'ippatsu', 'uraDora', 'yakuhaiChun']);
  expect(r.han).toBe(5);
  expect(r.limit).toBe('mangan');
  expect(r.payment.ron).toBe(8000);
});

test('부로 복합: 發폰 + 白샤보론 + 혼일색 + 찬타 = 5판 만관', () => {
  const r = calculateScore(win(
    ['1p','2p','3p','7p','8p','9p','9p','9p','5z','5z'], '5z',
    { melds: [{ type: 'pon', tiles: ['6z','6z','6z'] }] }));
  expect(names(r)).toEqual(['chanta', 'honitsu', 'yakuhaiHaku', 'yakuhaiHatsu']);
  expect(r.han).toBe(5);
  expect(r.limit).toBe('mangan');
  expect(r.payment.ron).toBe(8000);
});

test('룰 옵션: 쿠이탕 OFF면 부로 탄야오 → 역 없음', () => {
  const input = win(
    ['3m','4m','5m','6p','7p','8p','5m','5m','7s','8s'], '6s',
    { melds: [{ type: 'chi', tiles: ['2s','3s','4s'] }] });
  expect(calculateScore(input).valid).toBe(true); // 기본(쿠이탕 ON)
  const r = calculateScore(input, { ...DEFAULT_RULES, kuitan: false });
  expect(r.valid).toBe(false);
  expect(r.error).toEqual({ id: 'noYaku' });
});

test('도라만 있는 부로 손 → 역 없음 (§6.4)', () => {
  const r = calculateScore(win(
    ['2m','3m','4m','5p','6p','7p','9s','9s','3s','4s'], '5s',
    { melds: [{ type: 'chi', tiles: ['4m','5m','6m'] }], doraIndicators: ['8s'] }));
  expect(r.valid).toBe(false);
  expect(r.error).toEqual({ id: 'noYaku' });
});

test('본장·리치봉 가산', () => {
  const r = calculateScore(win(
    ['2m','3m','4m','5p','6p','7p','9s','9s','3s','4s'], '5s',
    { melds: [{ type: 'pon', tiles: ['5z','5z','5z'] }], honba: 2, riichiSticks: 1 }));
  expect(r.payment.ron).toBe(1600);  // 1000 + 2본장×300
  expect(r.payment.total).toBe(2600); // + 리치봉 1000
});

// 상세보기의 정산 표시가 "본장은 총액 300점"이라는 산술에 기대고 있다
test('쯔모 본장·리치봉 — 본장은 각 100점이지만 총액은 론과 같은 300점', () => {
  const pay = (honba: number, riichiSticks: number) =>
    calcPayment({ han: 3, fu: 30, yakumanMultiplier: 0, isDealer: false, isTsumo: true, honba, riichiSticks, kazoeYakuman: true }).payment;
  const plain = pay(0, 0);
  const bonus = pay(2, 1);
  expect(bonus.tsumoFromNonDealer).toBe(plain.tsumoFromNonDealer! + 200);
  expect(bonus.tsumoFromDealer).toBe(plain.tsumoFromDealer! + 200);
  expect(bonus.total - plain.total).toBe(2 * 300 + 1000);
});

test('카조에 역만 룰 옵션', () => {
  const pay = (kazoe: boolean) =>
    calcPayment({ han: 13, fu: 30, yakumanMultiplier: 0, isDealer: false, isTsumo: false, honba: 0, riichiSticks: 0, kazoeYakuman: kazoe });
  expect(pay(true)).toMatchObject({ basePoints: 8000, limit: 'yakuman' });
  expect(pay(false)).toMatchObject({ basePoints: 6000, limit: 'sanbaiman' });
});
