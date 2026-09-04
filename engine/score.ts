import type { LimitId, ScoreResult } from './types';

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

const roundUp100 = (x: number) => Math.ceil(x / 100) * 100;

/** 점수 산출 (§9) */
export function calcPayment(p: PaymentInput): Pick<ScoreResult, 'basePoints' | 'limit' | 'payment'> {
  let basePoints: number;
  let limit: LimitId | undefined;

  if (p.yakumanMultiplier > 0) {
    basePoints = 8000 * p.yakumanMultiplier;
    limit = p.yakumanMultiplier >= 2 ? 'doubleYakuman' : 'yakuman';
  } else if (p.han >= 13 && p.kazoeYakuman) {
    basePoints = 8000;
    limit = 'yakuman';
  } else if (p.han >= 11) {
    basePoints = 6000;
    limit = 'sanbaiman';
  } else if (p.han >= 8) {
    basePoints = 4000;
    limit = 'baiman';
  } else if (p.han >= 6) {
    basePoints = 3000;
    limit = 'haneman';
  } else {
    const raw = p.fu * 2 ** (2 + p.han);
    if (p.han >= 5 || raw > 2000) {
      basePoints = 2000;
      limit = 'mangan';
    } else {
      basePoints = raw;
    }
  }

  const sticks = p.riichiSticks * 1000;
  let payment: ScoreResult['payment'];
  if (!p.isTsumo) {
    const ron = roundUp100(basePoints * (p.isDealer ? 6 : 4)) + p.honba * 300;
    payment = { total: ron + sticks, ron };
  } else if (p.isDealer) {
    const each = roundUp100(basePoints * 2) + p.honba * 100;
    payment = { total: each * 3 + sticks, tsumoFromNonDealer: each };
  } else {
    const fromDealer = roundUp100(basePoints * 2) + p.honba * 100;
    const fromNonDealer = roundUp100(basePoints) + p.honba * 100;
    payment = { total: fromDealer + fromNonDealer * 2 + sticks, tsumoFromDealer: fromDealer, tsumoFromNonDealer: fromNonDealer };
  }

  return { basePoints, limit, payment };
}
