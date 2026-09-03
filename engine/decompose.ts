import type { Tile, Meld, Decomposition, DecomposedMeld, WaitType } from './types';
import { ALL_TILES, countTiles, isHonor, isYaochu, num, suit } from './tiles';

type Counts = Partial<Record<Tile, number>>;

/**
 * 감춰진 패(화료패 포함) + 부로 → 가능한 모든 분해 목록.
 * 빈 배열이면 화료형 아님.
 * fromWin은 여기서 정하지 않는다(false 고정) — 화료패가 어느 면자에 속하는지는
 * 분해 하나에도 여러 해석이 있어 대기 판정 단계에서 배치한다.
 */
export function decompose(concealedWithWin: Tile[], melds: Meld[]): Decomposition[] {
  const results: Decomposition[] = [];
  const counts = countTiles(concealedWithWin);

  const fixed: DecomposedMeld[] = melds.map((m) => ({
    type: m.type === 'chi' ? 'shuntsu' : m.type === 'pon' ? 'koutsu' : 'kan',
    tiles: [...m.tiles].sort(),
    open: m.type !== 'ankan',
    fromWin: false,
  }));

  // 일반형: 머리 1개 + 면자 (4 - 부로수)개
  for (const pair of ALL_TILES) {
    if ((counts[pair] ?? 0) < 2) continue;
    counts[pair]! -= 2;
    for (const found of extractMelds(counts, 4 - melds.length)) {
      results.push({ type: 'standard', pair, melds: [...found, ...fixed] });
    }
    counts[pair]! += 2;
  }

  if (melds.length === 0) {
    // 치토이츠: 서로 다른 7종 × 2장 (같은 패 4장 = 2쌍 불가)
    const kinds = Object.entries(counts).filter(([, n]) => n > 0);
    if (kinds.length === 7 && kinds.every(([, n]) => n === 2)) {
      results.push({ type: 'chiitoi', pairs: kinds.map(([t]) => t as Tile) });
    }
    // 국사무쌍: 13종 요구패 모두 + 1종 중복
    const yaochu = ALL_TILES.filter(isYaochu);
    if (yaochu.every((t) => (counts[t] ?? 0) >= 1)) {
      const pair = yaochu.find((t) => counts[t] === 2);
      if (pair) results.push({ type: 'kokushi', pair });
    }
  }

  return results;
}

/** counts에서 면자 need개를 전부 뽑는 모든 방법 (백트래킹) */
function extractMelds(counts: Counts, need: number): DecomposedMeld[][] {
  if (need === 0) {
    return Object.values(counts).every((n) => !n) ? [[]] : [];
  }
  // 남은 것 중 가장 앞선 패는 반드시 어떤 면자의 시작이어야 한다 → 중복 열거 방지
  const t = ALL_TILES.find((t) => (counts[t] ?? 0) > 0);
  if (!t) return [];

  const out: DecomposedMeld[][] = [];

  if (counts[t]! >= 3) {
    counts[t]! -= 3;
    for (const rest of extractMelds(counts, need - 1)) {
      out.push([{ type: 'koutsu', tiles: [t, t, t], open: false, fromWin: false }, ...rest]);
    }
    counts[t]! += 3;
  }

  if (!isHonor(t) && num(t) <= 7) {
    const t2 = `${num(t) + 1}${suit(t)}` as Tile;
    const t3 = `${num(t) + 2}${suit(t)}` as Tile;
    if ((counts[t2] ?? 0) > 0 && (counts[t3] ?? 0) > 0) {
      counts[t]!--; counts[t2]!--; counts[t3]!--;
      for (const rest of extractMelds(counts, need - 1)) {
        out.push([{ type: 'shuntsu', tiles: [t, t2, t3], open: false, fromWin: false }, ...rest]);
      }
      counts[t]!++; counts[t2]!++; counts[t3]!++;
    }
  }

  return out;
}

/** 대기 형태 판정: 화료패가 어느 면자/머리에 속하는지에 따라 분해마다 여러 해석 가능 */
export function waitTypes(d: Decomposition, winningTile: Tile): WaitType[] {
  throw new Error('TODO: waitTypes');
}
