import type { Decomposition, Context, FuLine } from './types';
import { DRAGONS, isYaochu } from './tiles';
import { isAnko } from './decompose';

/** 부수 계산 (§7). hasPinfu는 역 판정 결과에서 넘겨받는다 */
export function calcFu(
  d: Decomposition,
  ctx: Context,
  hasPinfu: boolean,
): { fu: number; breakdown: FuLine[] } {
  if (d.type === 'chiitoi') return { fu: 25, breakdown: [{ id: 'chiitoi', fu: 25 }] };
  if (d.type === 'kokushi') return { fu: 0, breakdown: [] }; // 역만이라 부수 무의미

  const { input, rules, isMenzen, waitType } = ctx;

  if (hasPinfu && input.isTsumo) {
    return { fu: 20, breakdown: [{ id: 'pinfuTsumo', fu: 20 }] };
  }

  const bd: FuLine[] = [{ id: 'base', fu: 20 }];
  if (isMenzen && !input.isTsumo) bd.push({ id: 'menzenRon', fu: 10 });
  if (input.isTsumo) bd.push({ id: 'tsumo', fu: 2 });

  for (const m of d.melds) {
    if (m.type === 'shuntsu') continue;
    const anko = isAnko(m, input.isTsumo);
    const fu = 2 * (anko ? 2 : 1) * (m.type === 'kan' ? 4 : 1) * (isYaochu(m.tiles[0]) ? 2 : 1);
    const kind = m.type === 'kan' ? (m.open ? 'minkan' : 'ankan') : anko ? 'ankou' : 'minkou';
    bd.push({ id: 'set', tile: m.tiles[0], kind, fu });
  }

  let pairFu = DRAGONS.includes(d.pair) ? 2 : 0;
  const windFu = (d.pair === input.roundWind ? 2 : 0) + (d.pair === input.seatWind ? 2 : 0);
  pairFu += rules.doubleWindPairFu4 ? windFu : Math.min(windFu, 2);
  if (pairFu > 0) bd.push({ id: 'yakuhaiPair', fu: pairFu });

  if (waitType === 'kanchan' || waitType === 'penchan' || waitType === 'tanki') {
    bd.push({ id: 'wait', wait: waitType, fu: 2 });
  }

  let total = bd.reduce((a, b) => a + b.fu, 0);
  if (total === 20 && !isMenzen && !input.isTsumo) {
    // 부로 + 무부수 + 론 (쿠이핑후형) → 30부
    bd.push({ id: 'openNoFuRon', fu: 10 });
    total = 30;
  }
  return { fu: Math.ceil(total / 10) * 10, breakdown: bd };
}
