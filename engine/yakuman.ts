import type { Decomposition, Context } from './types';

/** 역만 판정 (§6.1). 빈 배열이면 역만 아님 */
export function detectYakuman(d: Decomposition, ctx: Context): { name: string; multiplier: number }[] {
  // TODO: 천화/지화/국사(13면)/사안커(단기)/대삼원/소사희/대사희/자일색/녹일색/청노두/구련(순정)/사깡즈
  throw new Error('TODO: detectYakuman');
}
