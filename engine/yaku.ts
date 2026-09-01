import type { Decomposition, Context } from './types';

/** 일반 역 판정 (§6.2, §6.3 흡수 규칙 포함) */
export function detectYaku(d: Decomposition, ctx: Context): { name: string; han: number }[] {
  // TODO: 상황역(리치/일발/멘젠쯔모/해저/하저/영상/창깡)
  // TODO: 형태역(핑후/이페코/량페코/탄야오/역패/치토이츠/토이토이/삼안커/삼색/일기/찬타/준찬타/혼일/청일/혼노두/소삼원/삼깡즈)
  // TODO: 흡수 규칙(준찬타→찬타, 청일→혼일, 량페코→이페코 ...)
  throw new Error('TODO: detectYaku');
}
