import { describe, expect, test } from 'vitest';
import { normalize, toWinInput, sticksOnTable, type CalcState } from '../src/features/calculator/useCalculatorState';

let key = 0;
const t = (id: string) => ({ key: ++key, id: id as never, red: false });
const meld = (type: 'chi' | 'pon' | 'minkan' | 'ankan', ids: string[]) => ({ key: ++key, type, tiles: ids.map(t) });

const base: CalcState = {
  hand: [], melds: [], winTile: null, pending: null, target: 'hand',
  roundWind: '1z', seatWind: '2z', isTsumo: false, riichi: false, doraInd: [], uraInd: [],
  honba: 0, riichiSticks: 0,
  doubleRiichi: false, ippatsu: false, haitei: false, houtei: false,
  rinshan: false, chankan: false, tenhou: false, chiihou: false,
};

describe('normalize — 성립할 수 없게 된 선택 정리', () => {
  test('부로를 추가하면 리치와 리치 전제 역이 풀린다', () => {
    const st = normalize({ ...base, riichi: true, ippatsu: true, doubleRiichi: true, uraInd: [t('1m')], melds: [meld('chi', ['1m', '2m', '3m'])] });
    expect(st.riichi).toBe(false);
    expect(st.ippatsu).toBe(false);
    expect(st.doubleRiichi).toBe(false);
    expect(st.uraInd).toEqual([]); // 우라도라는 리치 없이 볼 수 없다
  });

  test('안깡은 멘젠이므로 리치가 유지된다', () => {
    const st = normalize({ ...base, riichi: true, ippatsu: true, melds: [meld('ankan', ['1m', '1m', '1m', '1m'])] });
    expect(st.riichi).toBe(true);
    expect(st.ippatsu).toBe(true);
  });

  test('론으로 바꾸면 쯔모 전용 상황역이 꺼진다', () => {
    const st = normalize({ ...base, isTsumo: false, haitei: true, rinshan: true });
    expect(st.haitei).toBe(false);
    expect(st.rinshan).toBe(false);
  });

  test('깡이 없으면 영상개화가 꺼진다', () => {
    expect(normalize({ ...base, isTsumo: true, rinshan: true }).rinshan).toBe(false);
    expect(normalize({ ...base, isTsumo: true, rinshan: true, melds: [meld('ankan', ['1m', '1m', '1m', '1m'])] }).rinshan).toBe(true);
  });

  test('자로 자리를 옮기면 천화가 꺼진다', () => {
    const dealer = normalize({ ...base, isTsumo: true, seatWind: '1z', tenhou: true });
    expect(dealer.tenhou).toBe(true);
    expect(normalize({ ...dealer, seatWind: '2z' }).tenhou).toBe(false);
  });
});

describe('toWinInput', () => {
  test('본인 리치봉이 자동으로 더해진다', () => {
    expect(sticksOnTable({ riichi: true, riichiSticks: 2 })).toBe(3);
    expect(sticksOnTable({ riichi: false, riichiSticks: 2 })).toBe(2);
  });

  test('상황역 플래그가 엔진 입력으로 전달된다', () => {
    const st: CalcState = { ...base, hand: [t('1m')], winTile: t('1m'), isTsumo: true, riichi: true, ippatsu: true, haitei: true, riichiSticks: 1, honba: 3 };
    const input = toWinInput(st);
    expect(input).toMatchObject({ isTsumo: true, riichi: true, ippatsu: true, haitei: true, honba: 3, riichiSticks: 2 });
  });
});
