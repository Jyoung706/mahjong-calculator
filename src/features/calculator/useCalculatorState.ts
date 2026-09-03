import { useMemo, useState } from 'react';
import type { Tile, Wind, Meld } from '../../../engine/types';

export type UiMeldType = 'chi' | 'pon' | 'minkan' | 'ankan';
export const MELD_LABELS: Record<UiMeldType, string> = { chi: '치', pon: '펑', minkan: '명깡', ankan: '안깡' };
const MELD_SIZE: Record<UiMeldType, number> = { chi: 3, pon: 3, minkan: 4, ankan: 4 };

export interface TileInst { key: number; id: Tile; red: boolean }
export interface MeldInst { key: number; type: UiMeldType; tiles: TileInst[] }

/** 패널 탭이 패를 추가할 대상 */
export type Target = 'hand' | 'dora' | 'ura';

export interface CalcState {
  hand: TileInst[];
  melds: MeldInst[];
  winTile: TileInst | null;
  pending: { type: UiMeldType; tiles: TileInst[] } | null;
  selected: number[];
  target: Target;
  roundWind: Wind;
  seatWind: Wind;
  isTsumo: boolean;
  riichi: boolean;
  doraInd: TileInst[];
  uraInd: TileInst[];
}

const sortTiles = (list: TileInst[]) =>
  [...list].sort((a, b) => (a.id[1] === b.id[1] ? a.id[0].localeCompare(b.id[0]) : 'mpsz'.indexOf(a.id[1]) - 'mpsz'.indexOf(b.id[1])));

let uid = 0;
const inst = (id: Tile, red: boolean): TileInst => ({ key: ++uid, id, red });

const INITIAL: CalcState = {
  hand: [], melds: [], winTile: null, pending: null, selected: [], target: 'hand',
  roundWind: '1z', seatWind: '2z', isTsumo: false, riichi: false, doraInd: [], uraInd: [],
};

export function useCalculatorState() {
  const [s, set] = useState<CalcState>(INITIAL);

  /** 부로 1개당 손패 슬롯 3개 차감. 화료패는 별도 1장 */
  const handNeed = 13 - 3 * s.melds.length;

  const countOf = (id: Tile) => {
    let n = s.hand.filter((t) => t.id === id).length;
    for (const m of s.melds) n += m.tiles.filter((t) => t.id === id).length;
    if (s.pending) n += s.pending.tiles.filter((t) => t.id === id).length;
    if (s.winTile?.id === id) n += 1;
    return n;
  };

  const ready = s.hand.length === handNeed && s.winTile !== null;

  /** 해당 종류의 적패(각 색 1장뿐)가 이미 어딘가에 쓰였는가 */
  const redUsed = (id: Tile) =>
    s.hand.some((t) => t.id === id && t.red) ||
    s.melds.some((m) => m.tiles.some((t) => t.id === id && t.red)) ||
    (s.winTile !== null && s.winTile.id === id && s.winTile.red) ||
    s.doraInd.some((t) => t.id === id && t.red) ||
    s.uraInd.some((t) => t.id === id && t.red);

  /** 하단 패널에서 패를 탭했을 때의 단일 진입점 */
  const tapPanel = (id: Tile, red: boolean) => {
    set((st) => {
      if (st.target === 'dora' || st.target === 'ura') {
        const key = st.target === 'dora' ? 'doraInd' : 'uraInd';
        if (st[key].length >= 5) return st;
        return { ...st, [key]: [...st[key], inst(id, red)], target: 'hand' };
      }
      if (st.pending) {
        // 패 1개 탭 → 면자 자동 완성 (치: 탭한 패부터 연속 3장, 펑: 3장, 깡: 4장)
        const type = st.pending.type;
        let ids: Tile[];
        if (type === 'chi') {
          if (id[1] === 'z') return st; // 자패는 치 불가
          const start = Math.min(Number(id[0]), 7); // 8·9는 789로 보정
          ids = [start, start + 1, start + 2].map((n) => `${n}${id[1]}` as Tile);
        } else {
          ids = Array(MELD_SIZE[type]).fill(id);
        }
        const need: Partial<Record<Tile, number>> = {};
        for (const t of ids) need[t] = (need[t] ?? 0) + 1;
        for (const [t, n] of Object.entries(need)) {
          if (countOfIn(st, t as Tile) + n > 4) return st; // 잔량 부족
        }
        let redLeft = red;
        const tiles = ids.map((t) => {
          const useRed = redLeft && t === id;
          if (useRed) redLeft = false;
          return inst(t, useRed);
        });
        return { ...st, pending: null, melds: [...st.melds, { key: ++uid, type, tiles }] };
      }
      if (countOfIn(st, id) >= 4) return st;
      const need = 13 - 3 * st.melds.length;
      if (st.hand.length < need) return { ...st, hand: sortTiles([...st.hand, inst(id, red)]), selected: [] };
      if (!st.winTile) return { ...st, winTile: inst(id, red) };
      return st;
    });
  };

  return {
    state: s,
    handNeed,
    countOf,
    redUsed,
    ready,
    tapPanel,
    toggleSelect: (key: number) =>
      set((st) => ({ ...st, selected: st.selected.includes(key) ? st.selected.filter((k) => k !== key) : [...st.selected, key] })),
    deleteSelected: () => set((st) => ({ ...st, hand: st.hand.filter((t) => !st.selected.includes(t.key)), selected: [] })),
    togglePending: (type: UiMeldType) =>
      set((st) => ({ ...st, pending: st.pending?.type === type ? null : { type, tiles: [] } })),
    breakMeld: (key: number) =>
      set((st) => {
        const m = st.melds.find((x) => x.key === key);
        if (!m) return st;
        return { ...st, melds: st.melds.filter((x) => x.key !== key), hand: sortTiles([...st.hand, ...m.tiles.slice(0, 3)]) };
      }),
    clearWin: () => set((st) => ({ ...st, winTile: null })),
    clearAll: () => set((st) => ({ ...st, hand: [], melds: [], winTile: null, pending: null, selected: [] })),
    resetAll: () => set(INITIAL),
    removeIndicator: (which: 'dora' | 'ura', key: number) =>
      set((st) => {
        const field = which === 'dora' ? 'doraInd' : 'uraInd';
        return { ...st, [field]: st[field].filter((t) => t.key !== key) };
      }),
    setTarget: (target: Target) => set((st) => ({ ...st, target: st.target === target ? 'hand' : target })),
    patch: (p: Partial<Pick<CalcState, 'roundWind' | 'seatWind' | 'isTsumo' | 'riichi'>>) =>
      set((st) => ({ ...st, ...p })),
  };
}

function countOfIn(st: CalcState, id: Tile) {
  let n = st.hand.filter((t) => t.id === id).length;
  for (const m of st.melds) n += m.tiles.filter((t) => t.id === id).length;
  if (st.pending) n += st.pending.tiles.filter((t) => t.id === id).length;
  if (st.winTile?.id === id) n += 1;
  return n;
}

/** UI 상태 → 엔진 입력. 여기가 UI-엔진 연동의 유일한 접점 */
export function toWinInput(s: CalcState) {
  const akaDora =
    s.hand.filter((t) => t.red).length +
    s.melds.flatMap((m) => m.tiles).filter((t) => t.red).length +
    (s.winTile?.red ? 1 : 0);

  const melds: Meld[] = s.melds.map((m) => ({
    type: m.type,
    tiles: [...m.tiles.map((t) => t.id)].sort(),
  }));

  return {
    concealed: s.hand.map((t) => t.id),
    melds,
    winningTile: s.winTile!.id,
    isTsumo: s.isTsumo,
    roundWind: s.roundWind,
    seatWind: s.seatWind,
    riichi: s.riichi,
    doubleRiichi: false,
    ippatsu: false,
    haitei: false, houtei: false, rinshan: false, chankan: false, tenhou: false, chiihou: false,
    doraIndicators: s.doraInd.map((t) => t.id),
    uraDoraIndicators: s.uraInd.map((t) => t.id),
    akaDora,
    honba: 0,
    riichiSticks: 0,
  };
}
