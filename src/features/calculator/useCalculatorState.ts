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
  target: Target;
  roundWind: Wind;
  seatWind: Wind;
  isTsumo: boolean;
  riichi: boolean;
  doraInd: TileInst[];
  uraInd: TileInst[];
  /** 적산 본장 수 — 화료 시 론 300점 / 쯔모 각 100점 가산 */
  honba: number;
  /** 남이 낸 리치봉(공탁) 개수. 본인 리치봉은 riichi에서 자동으로 더한다 */
  riichiSticks: number;
  doubleRiichi: boolean;
  ippatsu: boolean;
  haitei: boolean;
  houtei: boolean;
  rinshan: boolean;
  chankan: boolean;
  tenhou: boolean;
  chiihou: boolean;
}

export type SituationKey = 'doubleRiichi' | 'ippatsu' | 'haitei' | 'houtei' | 'rinshan' | 'chankan' | 'tenhou' | 'chiihou';

/** 안깡은 멘젠을 깨지 않는다 */
export const isMenzen = (st: Pick<CalcState, 'melds'>) => st.melds.every((m) => m.type === 'ankan');
export const isDealer = (st: Pick<CalcState, 'seatWind'>) => st.seatWind === '1z';
const hasKan = (st: Pick<CalcState, 'melds'>) => st.melds.some((m) => m.type === 'minkan' || m.type === 'ankan');

/**
 * 상황역 목록.
 * `show`는 이번 화료 방식으로는 성립 자체가 불가능한 역을 감춘다 — 론/쯔모 토글 하나로
 * 목록이 절반씩 갈리므로 남는 칩이 두 줄을 넘지 않는다.
 * `ok`는 사용자가 지금 채울 수 있는 조건이라 비활성으로만 남기고, `need`에 무엇이
 * 모자란지 적는다 (터치 기기에서는 title 툴팁이 뜨지 않는다).
 * 조건이 깨지면 normalize가 자동으로 끄므로, 규칙은 여기 한 곳에만 둔다.
 */
export const SITUATIONS: {
  key: SituationKey;
  label: string;
  hint: string;
  ok: (st: CalcState) => boolean;
  show: (st: CalcState) => boolean;
  /** ok가 false일 때 칩에 함께 띄우는 사유. 터치 기기에서는 title 툴팁이 뜨지 않는다 */
  need?: (st: CalcState) => string;
}[] = [
  { key: 'doubleRiichi', label: '더블리치', hint: '첫 순에 건 리치', ok: (st) => st.riichi, show: () => true, need: () => '리치 필요' },
  { key: 'ippatsu', label: '일발', hint: '리치 후 1순 이내 화료', ok: (st) => st.riichi, show: () => true, need: () => '리치 필요' },
  { key: 'haitei', label: '해저로월', hint: '마지막 패를 쯔모해 화료', ok: () => true, show: (st) => st.isTsumo },
  { key: 'rinshan', label: '영상개화', hint: '깡 후 영상패로 쯔모', ok: hasKan, show: (st) => st.isTsumo, need: () => '깡 필요' },
  { key: 'houtei', label: '하저로어', hint: '마지막 버림패로 론', ok: () => true, show: (st) => !st.isTsumo },
  { key: 'chankan', label: '창깡', hint: '남의 가깡 패를 론', ok: () => true, show: (st) => !st.isTsumo },
  { key: 'tenhou', label: '천화', hint: '친의 첫 쯔모로 화료 (역만)', ok: () => true, show: (st) => st.isTsumo && st.melds.length === 0 && isDealer(st) },
  { key: 'chiihou', label: '지화', hint: '자의 첫 쯔모로 화료 (역만)', ok: () => true, show: (st) => st.isTsumo && st.melds.length === 0 && !isDealer(st) },
];

/** 동시에 성립할 수 없는 짝 — 한쪽을 켜면 반대쪽을 끈다 */
const CONFLICT: Partial<Record<SituationKey, SituationKey>> = {
  haitei: 'rinshan', rinshan: 'haitei',
  houtei: 'chankan', chankan: 'houtei',
  tenhou: 'chiihou', chiihou: 'tenhou',
};

/**
 * 성립할 수 없게 된 선택을 정리한다. 모든 상태 변경이 이 함수를 거치므로
 * "부로를 추가하면 리치가 풀린다" 같은 규칙을 조작 지점마다 반복하지 않는다.
 */
export function normalize(st: CalcState): CalcState {
  const riichi = st.riichi && isMenzen(st);
  const next: CalcState = {
    ...st,
    riichi,
    uraInd: riichi ? st.uraInd : [],
    target: !riichi && st.target === 'ura' ? 'hand' : st.target,
  };
  for (const sit of SITUATIONS) {
    if (next[sit.key] && !(sit.ok(next) && sit.show(next))) next[sit.key] = false;
  }
  return next;
}

const sortTiles = (list: TileInst[]) =>
  [...list].sort((a, b) => (a.id[1] === b.id[1] ? a.id[0].localeCompare(b.id[0]) : 'mpsz'.indexOf(a.id[1]) - 'mpsz'.indexOf(b.id[1])));

let uid = 0;
const inst = (id: Tile, red: boolean): TileInst => ({ key: ++uid, id, red });

const INITIAL: CalcState = {
  hand: [], melds: [], winTile: null, pending: null, target: 'hand',
  roundWind: '1z', seatWind: '2z', isTsumo: false, riichi: false, doraInd: [], uraInd: [],
  honba: 0, riichiSticks: 0,
  doubleRiichi: false, ippatsu: false, haitei: false, houtei: false,
  rinshan: false, chankan: false, tenhou: false, chiihou: false,
};

export function useCalculatorState() {
  const [s, setRaw] = useState<CalcState>(INITIAL);
  // 상태 변경의 단일 통로 — 여기서 normalize를 강제한다
  const set = (fn: (st: CalcState) => CalcState) => setRaw((st) => normalize(fn(st)));

  /** 부로 1개당 손패 슬롯 3개 차감. 화료패는 별도 1장 */
  const handNeed = 13 - 3 * s.melds.length;

  const countOf = (id: Tile) => tilesUsed(s, id);

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
        if (st[key].length >= 5 || tilesUsed(st, id) >= 4) return st;
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
          if (tilesUsed(st, t as Tile) + n > 4) return st; // 잔량 부족
        }
        let redLeft = red;
        const tiles = ids.map((t) => {
          const useRed = redLeft && t === id;
          if (useRed) redLeft = false;
          return inst(t, useRed);
        });
        return { ...st, pending: null, melds: [...st.melds, { key: ++uid, type, tiles }] };
      }
      if (tilesUsed(st, id) >= 4) return st;
      const need = 13 - 3 * st.melds.length;
      if (st.hand.length < need) return { ...st, hand: sortTiles([...st.hand, inst(id, red)]) };
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
    /** 손패의 패를 탭하면 곧바로 제거한다 */
    removeHandTile: (key: number) => set((st) => ({ ...st, hand: st.hand.filter((t) => t.key !== key) })),
    togglePending: (type: UiMeldType) =>
      set((st) => ({ ...st, pending: st.pending?.type === type ? null : { type, tiles: [] } })),
    breakMeld: (key: number) =>
      set((st) => {
        const m = st.melds.find((x) => x.key === key);
        if (!m) return st;
        return { ...st, melds: st.melds.filter((x) => x.key !== key), hand: sortTiles([...st.hand, ...m.tiles.slice(0, 3)]) };
      }),
    clearWin: () => set((st) => ({ ...st, winTile: null })),
    clearAll: () => set((st) => ({ ...st, hand: [], melds: [], winTile: null, pending: null })),
    resetAll: () => set(() => INITIAL),
    removeIndicator: (which: 'dora' | 'ura', key: number) =>
      set((st) => {
        const field = which === 'dora' ? 'doraInd' : 'uraInd';
        return { ...st, [field]: st[field].filter((t) => t.key !== key) };
      }),
    setTarget: (target: Target) => set((st) => ({ ...st, target: st.target === target ? 'hand' : target })),
    patch: (p: Partial<Pick<CalcState, 'roundWind' | 'seatWind' | 'isTsumo' | 'riichi' | 'honba' | 'riichiSticks'>>) =>
      set((st) => ({ ...st, ...p })),
    toggleSituation: (key: SituationKey) =>
      set((st) => {
        const on = !st[key];
        const next = { ...st, [key]: on };
        const conflict = CONFLICT[key];
        if (on && conflict) next[conflict] = false;
        return next;
      }),
  };
}

/**
 * 이미 쓴 장수. 도라·우라도라 표시패도 산에서 뒤집은 실제 패이므로
 * 손패·부로와 같은 4장 제한을 함께 나눠 쓴다.
 */
export function tilesUsed(st: CalcState, id: Tile) {
  let n = st.hand.filter((t) => t.id === id).length;
  for (const m of st.melds) n += m.tiles.filter((t) => t.id === id).length;
  if (st.pending) n += st.pending.tiles.filter((t) => t.id === id).length;
  if (st.winTile?.id === id) n += 1;
  n += st.doraInd.filter((t) => t.id === id).length;
  n += st.uraInd.filter((t) => t.id === id).length;
  return n;
}

/** 화료자가 회수하는 리치봉 총수 — 입력한 남의 봉 + 이번 판 본인 리치 1개 */
export const sticksOnTable = (s: Pick<CalcState, 'riichiSticks' | 'riichi'>) => s.riichiSticks + (s.riichi ? 1 : 0);

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
    doubleRiichi: s.doubleRiichi,
    ippatsu: s.ippatsu,
    haitei: s.haitei,
    houtei: s.houtei,
    rinshan: s.rinshan,
    chankan: s.chankan,
    tenhou: s.tenhou,
    chiihou: s.chiihou,
    doraIndicators: s.doraInd.map((t) => t.id),
    uraDoraIndicators: s.uraInd.map((t) => t.id),
    akaDora,
    honba: s.honba,
    riichiSticks: sticksOnTable(s),
  };
}
