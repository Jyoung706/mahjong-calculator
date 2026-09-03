// 파이프라인 진입점 (§4): 검증 → 분해 → (역만 | 역+도라 → 부수) → 점수 → 최대 채택
import type { WinInput, Rules, ScoreResult, Context } from './types';
import { validate } from './tiles';
import { decompose, winPlacements } from './decompose';
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

  const decomps = decompose([...input.concealed, input.winningTile], input.melds);
  if (decomps.length === 0) return invalid('화료형이 아님 (텐파이 아님)');

  const isMenzen = input.melds.every((m) => m.type === 'ankan');
  const isDealer = input.seatWind === '1z';
  const allTiles = [...input.concealed, input.winningTile, ...input.melds.flatMap((m) => m.tiles)];

  let best: ScoreResult | null = null;
  for (const base of decomps) {
    for (const { d, wait } of winPlacements(base, input.winningTile)) {
      const ctx: Context = { input, rules, isMenzen, isDealer, waitType: wait };

      const yakuman = detectYakuman(d, ctx);
      let candidate: ScoreResult;
      if (yakuman.length > 0) {
        const multiplier = yakuman.reduce((a, y) => a + y.multiplier, 0);
        const pay = calcPayment({ ...payBase(input, isDealer, rules), han: 0, fu: 0, yakumanMultiplier: multiplier });
        candidate = { valid: true, error: undefined, yaku: [], yakuman, han: 13 * multiplier, fu: 0, fuBreakdown: [], ...pay };
      } else {
        const yaku = detectYaku(d, ctx);
        if (yaku.length === 0) continue; // 역 없음 — 도라만으로는 화료 불가 (§6.4)
        const { fu, breakdown } = calcFu(d, ctx, yaku.some((y) => y.name === '핑후'));
        const { dora, ura, aka } = countDora(allTiles, input);
        if (dora > 0) yaku.push({ name: '도라', han: dora });
        if (ura > 0) yaku.push({ name: '우라도라', han: ura });
        if (rules.akaDora && aka > 0) yaku.push({ name: '적도라', han: aka });
        const han = yaku.reduce((a, y) => a + y.han, 0);
        const pay = calcPayment({ ...payBase(input, isDealer, rules), han, fu, yakumanMultiplier: 0 });
        candidate = { valid: true, error: undefined, yaku, yakuman: [], han, fu, fuBreakdown: breakdown, ...pay };
      }

      if (!best || better(candidate, best)) best = candidate;
    }
  }

  return best ?? invalid('역 없음');
}

const payBase = (input: WinInput, isDealer: boolean, rules: Rules) => ({
  isDealer,
  isTsumo: input.isTsumo,
  honba: input.honba,
  riichiSticks: input.riichiSticks,
  kazoeYakuman: rules.kazoeYakuman,
});

const better = (a: ScoreResult, b: ScoreResult) =>
  a.payment.total !== b.payment.total ? a.payment.total > b.payment.total
  : a.han !== b.han ? a.han > b.han
  : a.fu > b.fu;

function invalid(error: string): ScoreResult {
  return { valid: false, error, yaku: [], yakuman: [], han: 0, fu: 0, fuBreakdown: [], basePoints: 0, payment: { total: 0 } };
}
