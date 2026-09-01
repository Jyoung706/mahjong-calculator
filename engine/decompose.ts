import type { Tile, Meld, Decomposition, WaitType } from './types';

/** 감춰진 패(화료패 포함) + 부로 → 가능한 모든 분해 목록 (일반형 + 치토이츠 + 국사무쌍) */
export function decompose(concealedWithWin: Tile[], melds: Meld[]): Decomposition[] {
  // TODO: 백트래킹으로 모든 일반형 열거 + 특수형 별도 검사
  throw new Error('TODO: decompose');
}

/** 대기 형태: 화료패가 어느 면자/머리에 속하는지에 따라 분해마다 여러 해석 가능 */
export function waitTypes(d: Decomposition, winningTile: Tile): WaitType[] {
  throw new Error('TODO: waitTypes');
}
