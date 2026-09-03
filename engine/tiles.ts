import type { Tile, WinInput } from './types';

// 패 표기: 1m~9m, 1p~9p, 1s~9s, 1z~7z (東南西北白發中)
export const SUITS = ['m', 'p', 's'] as const;
export const HONORS: Tile[] = ['1z', '2z', '3z', '4z', '5z', '6z', '7z'];
export const WINDS: Tile[] = ['1z', '2z', '3z', '4z'];
export const DRAGONS: Tile[] = ['5z', '6z', '7z'];

export const ALL_TILES: Tile[] = [
  ...SUITS.flatMap((s) => ([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((n): Tile => `${n}${s}`)),
  ...HONORS,
];

export const isHonor = (t: Tile) => t.endsWith('z');
export const num = (t: Tile) => Number(t[0]);
export const suit = (t: Tile) => t[1];
export const isTerminal = (t: Tile) => !isHonor(t) && (num(t) === 1 || num(t) === 9); // 노두패
export const isYaochu = (t: Tile) => isHonor(t) || isTerminal(t); // 요구패
export const isSimple = (t: Tile) => !isYaochu(t); // 중장패

/** tiles 배열 → { '1m': 2, ... } */
export function countTiles(tiles: Tile[]): Partial<Record<Tile, number>> {
  const c: Partial<Record<Tile, number>> = {};
  for (const t of tiles) c[t] = (c[t] ?? 0) + 1;
  return c;
}

/** 입력 검증. 문제 있으면 에러 메시지, 없으면 null */
export function validate(input: WinInput): string | null {
  const { concealed, melds, winningTile } = input;

  for (const m of melds) {
    const expected = m.type === 'chi' || m.type === 'pon' ? 3 : 4;
    if (m.tiles.length !== expected) return `부로 매수 오류: ${m.type}은 ${expected}장`;
    if (m.type === 'chi') {
      const [a, b, c] = [...m.tiles].sort();
      if (isHonor(a) || suit(a) !== suit(b) || suit(b) !== suit(c) || num(b) !== num(a) + 1 || num(c) !== num(a) + 2)
        return `부로 구성 오류: 치는 연속 수패 (${m.tiles.join(',')})`;
    } else if (m.tiles.some((t) => t !== m.tiles[0])) {
      return `부로 구성 오류: ${m.type}은 같은 패 (${m.tiles.join(',')})`;
    }
  }

  // 깡은 4장이지만 면자 1개(3장)로 계산 → 손패는 13 - 부로수×3 장이어야 함
  if (concealed.length + 1 + melds.length * 3 !== 14)
    return `패 매수 오류: 손패 ${concealed.length}장 (부로 ${melds.length}개면 ${13 - melds.length * 3}장이어야 함)`;

  const counts = countTiles([concealed, [winningTile], ...melds.map((m) => m.tiles)].flat());
  for (const [t, n] of Object.entries(counts)) {
    if (n > 4) return `같은 패 5장 이상: ${t} ${n}장`;
  }

  return null;
}

