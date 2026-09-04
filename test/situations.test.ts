// 상황역·본장·리치봉처럼 손패만으로는 정해지지 않는 입력의 회귀 테스트.
// UI에서 이 값들이 하드코딩(false/0)되어 있던 적이 있어, 엔진 쪽 기대값을 고정해 둔다.
import { expect, test } from 'vitest';
import { calculateScore, DEFAULT_RULES } from '../engine';
import type { Rules, Tile, WinInput } from '../engine/types';

const base = {
  melds: [], isTsumo: false, roundWind: '1z', seatWind: '2z',
  riichi: false, doubleRiichi: false, ippatsu: false, haitei: false, houtei: false,
  rinshan: false, chankan: false, tenhou: false, chiihou: false,
  doraIndicators: [], uraDoraIndicators: [], akaDora: 0, honba: 0, riichiSticks: 0,
} as unknown as WinInput;
const win = (concealed: string[], winningTile: string, over: Partial<WinInput> = {}): WinInput =>
  ({ ...base, concealed: concealed as Tile[], winningTile: winningTile as Tile, ...over });
const rules = (over: Partial<Rules> = {}): Rules => ({ ...DEFAULT_RULES, ...over });

/** 핑후+탕야오 기본형 (자·멘젠, 5p 량면 대기) */
const PINFU = ['2m','3m','4m','5m','6m','7m','2p','3p','4p','6p','7p','5s','5s'];

test('일발·해저로월 — 쯔모 상황역', () => {
  const r = calculateScore(win(PINFU, '5p', { isTsumo: true, haitei: true }), DEFAULT_RULES);
  expect(r).toMatchObject({ han: 4, fu: 20 }); // 멘젠쯔모·해저로월·탄야오·핑후
  expect(r.payment.total).toBe(5200);
});

test('하저로어·창깡 — 론 상황역', () => {
  for (const flag of ['houtei', 'chankan'] as const) {
    const r = calculateScore(win(PINFU, '5p', { [flag]: true }), DEFAULT_RULES);
    expect(r).toMatchObject({ han: 3, fu: 30 });
    expect(r.payment.ron).toBe(3900);
  }
});

test('더블리치는 리치와 중복 계상되지 않는다', () => {
  const r = calculateScore(win(PINFU, '5p', { riichi: true, doubleRiichi: true }), DEFAULT_RULES);
  expect(r.yaku.map((y) => y.name)).not.toContain('리치');
  expect(r.han).toBe(4); // 더블리치2 + 탄야오1 + 핑후1
});

test('영상개화 — 안깡 60부, 멘젠쯔모와 함께 성립', () => {
  const r = calculateScore(win(['2m','3m','4m','5m','6m','7m','2p','3p','9s','9s'], '4p', {
    isTsumo: true, rinshan: true, melds: [{ type: 'ankan', tiles: ['1m','1m','1m','1m'] as Tile[] }],
  }), DEFAULT_RULES);
  expect(r).toMatchObject({ han: 2, fu: 60 }); // 20 + 요구패 안깡 32 + 쯔모 2 → 54 → 60
  expect(r.payment).toMatchObject({ tsumoFromDealer: 2000, tsumoFromNonDealer: 1000 });
});

test('천화·지화는 자리에 맞을 때만 붙는다', () => {
  const dealer = calculateScore(win(PINFU, '5p', { isTsumo: true, tenhou: true, seatWind: '1z' }), DEFAULT_RULES);
  expect(dealer.yakuman).toEqual([{ name: '천화', multiplier: 1 }]);
  expect(dealer.payment.total).toBe(48000);

  const wrongSeat = calculateScore(win(PINFU, '5p', { isTsumo: true, tenhou: true }), DEFAULT_RULES);
  expect(wrongSeat.yakuman).toEqual([]); // 자에게는 천화가 붙지 않는다

  const nonDealer = calculateScore(win(PINFU, '5p', { isTsumo: true, chiihou: true }), DEFAULT_RULES);
  expect(nonDealer.payment.total).toBe(32000);
});

test('본장·리치봉 — 친 쯔모 만관에 3본장과 리치봉 2개', () => {
  const r = calculateScore(win(PINFU, '5p', {
    isTsumo: true, seatWind: '1z', riichi: true, ippatsu: true, honba: 3, riichiSticks: 2,
  }), DEFAULT_RULES);
  expect(r.limitName).toBe('만관');
  expect(r.payment.tsumoFromNonDealer).toBe(4300); // 4000 + 3본장×100
  expect(r.payment.total).toBe(4300 * 3 + 2000);
});

test('연풍패 머리 부수 룰 — 30부와 40부로 갈린다', () => {
  const hand = () => win(['2m','3m','4m','5m','5m','5m','3p','5p','7s','8s','9s','1z','1z'], '4p',
    { seatWind: '1z', roundWind: '1z', isTsumo: true });
  expect(calculateScore(hand(), rules({ doubleWindPairFu4: false })).fu).toBe(30);
  expect(calculateScore(hand(), rules({ doubleWindPairFu4: true })).fu).toBe(40);
});

test('도라 표시패까지 합쳐 같은 패가 5장이면 무효', () => {
  // 2m 안깡(4장) + 표시패 2m → 5장
  const hand = ['5m','6m','7m','2p','3p','4p','6p','7p','5s','5s'];
  const kan = { melds: [{ type: 'ankan' as const, tiles: ['2m','2m','2m','2m'] as Tile[] }] };
  expect(calculateScore(win(hand, '5p', { ...kan, doraIndicators: ['2m'] }), DEFAULT_RULES)).toMatchObject({
    valid: false, error: '같은 패 5장 이상: 2m 5장',
  });
  expect(calculateScore(win(hand, '5p', { ...kan, doraIndicators: ['9p'] }), DEFAULT_RULES).valid).toBe(true);
});
