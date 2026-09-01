import type { Tile, WinInput } from './types';

/** 표시패 → 도라 (순환, §8) */
export function indicatorToDora(indicator: Tile): Tile {
  throw new Error('TODO: indicatorToDora');
}

/** 전체 14장(부로·깡 포함) 기준 도라/우라/적 카운트. 우라는 리치일 때만 */
export function countDora(allTiles: Tile[], input: WinInput): { dora: number; ura: number; aka: number } {
  throw new Error('TODO: countDora');
}
