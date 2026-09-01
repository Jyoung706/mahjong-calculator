import type { Tile, WinInput } from './types';

// 패 표기: 1m~9m, 1p~9p, 1s~9s, 1z~7z (東南西北白發中)
export const SUITS = ['m', 'p', 's'] as const;
export const HONORS: Tile[] = ['1z', '2z', '3z', '4z', '5z', '6z', '7z'];
export const WINDS: Tile[] = ['1z', '2z', '3z', '4z'];
export const DRAGONS: Tile[] = ['5z', '6z', '7z'];

export const ALL_TILES: Tile[] = [
  ...SUITS.flatMap((s) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}${s}`)),
  ...HONORS,
];

export const isHonor = (t: Tile) => t.endsWith('z');
export const num = (t: Tile) => Number(t[0]);
export const suit = (t: Tile) => t[1];
export const isTerminal = (t: Tile) => !isHonor(t) && (num(t) === 1 || num(t) === 9); // 노두패
export const isYaochu = (t: Tile) => isHonor(t) || isTerminal(t); // 요구패
export const isSimple = (t: Tile) => !isYaochu(t); // 중장패

/** tiles 배열 → { '1m': 2, ... } */
export function countTiles(tiles: Tile[]): Record<Tile, number> {
  const c: Record<Tile, number> = {};
  for (const t of tiles) c[t] = (c[t] ?? 0) + 1;
  return c;
}

/** 입력 검증. 문제 있으면 에러 메시지, 없으면 null */
export function validate(input: WinInput): string | null {
  // TODO: 총 14장(깡 보정), 같은 패 5장 이상, 화료패 포함 여부, 패 코드 형식
  throw new Error('TODO: validate');
}
