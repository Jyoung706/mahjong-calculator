// 파이프라인 진입점 (§4)
import type { WinInput, Rules, ScoreResult } from './types';
import { validate } from './tiles';
import { decompose } from './decompose';
import { detectYaku } from './yaku';
import { detectYakuman } from './yakuman';
import { calcFu } from './fu';
import { countDora } from './dora';
import { calcPayment } from './score';

export type * from './types';

export const DEFAULT_RULES: Rules = {
  suuankoTankiDouble: true,
  kokushi13Double: true,
  chuurenJunseiDouble: true,
  daisuushiDouble: true,
  kazoeYakuman: true,
  doubleWindPairFu4: false,
  ryuuiisouRequiresHatsu: false,
  akaDora: true,
  kuitan: true,
};

export function calculateScore(input: WinInput, rules: Rules = DEFAULT_RULES): ScoreResult {
  const error = validate(input);
  if (error) return invalid(error);

  // TODO:
  // 1. decompose → 분해 목록
  // 2. 분해 × 대기형태마다 { yakuman | yaku+dora, fu } 계산
  // 3. calcPayment 로 점수 비교, 최대 채택
  // 4. 역 없음이면 invalid('역 없음')
  throw new Error('TODO: calculateScore');
}

function invalid(error: string): ScoreResult {
  return { valid: false, error, yaku: [], yakuman: [], han: 0, fu: 0, fuBreakdown: [], basePoints: 0, payment: { total: 0 } };
}
