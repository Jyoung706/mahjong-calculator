import type { ScoreResult } from './types';

export interface PaymentInput {
  han: number;
  fu: number;
  yakumanMultiplier: number; // 0이면 일반 역
  isDealer: boolean;
  isTsumo: boolean;
  honba: number;
  riichiSticks: number;
  kazoeYakuman: boolean;
}

/** 점수 산출 (§9) */
export function calcPayment(p: PaymentInput): Pick<ScoreResult, 'basePoints' | 'limitName' | 'payment'> {
  // TODO: 기본점 = fu × 2^(2+han), 2000 초과 시 만관 절삭
  // TODO: 하네만/배만/삼배만/(카조에)역만 구간
  // TODO: 친/자 × 론/쯔모 지불액, 100점 올림, 본장·리치봉
  throw new Error('TODO: calcPayment');
}
