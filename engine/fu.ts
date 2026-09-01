import type { Decomposition, Context } from './types';

/** 부수 계산 (§7) */
export function calcFu(
  d: Decomposition,
  ctx: Context,
  hasPinfu: boolean,
): { fu: number; breakdown: { label: string; fu: number }[] } {
  // TODO: 부저20 + 멘젠론10 + 쯔모2 + 면자/머리/대기 부 → 10단위 올림
  // TODO: 예외 — 핑후쯔모 20 고정, 핑후론 30 고정, 치토이 25 고정, 쿠이핑후형 30
  throw new Error('TODO: calcFu');
}
