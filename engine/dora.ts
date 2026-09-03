import type { Tile, WinInput } from './types';
import { DRAGONS, WINDS, isHonor, num, suit } from './tiles';

/** 표시패 → 도라 (순환, §8) */
export function indicatorToDora(indicator: Tile): Tile {
  if (!isHonor(indicator)) return `${(num(indicator) % 9) + 1}${suit(indicator)}` as Tile;
  if (WINDS.includes(indicator)) return WINDS[(WINDS.indexOf(indicator) + 1) % 4];
  return DRAGONS[(DRAGONS.indexOf(indicator) + 1) % 3];
}

/** 전체 패(부로·깡·화료패 포함) 기준 도라 카운트. 우라는 리치일 때만 */
export function countDora(allTiles: Tile[], input: WinInput): { dora: number; ura: number; aka: number } {
  const count = (indicators: Tile[]) =>
    indicators.reduce((sum, ind) => {
      const target = indicatorToDora(ind);
      return sum + allTiles.filter((t) => t === target).length;
    }, 0);
  return {
    dora: count(input.doraIndicators),
    ura: input.riichi || input.doubleRiichi ? count(input.uraDoraIndicators) : 0,
    aka: input.akaDora,
  };
}
