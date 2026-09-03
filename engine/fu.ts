import type { Decomposition, Context } from './types';
import { DRAGONS, isYaochu } from './tiles';
import { isAnko } from './decompose';

const WAIT_NAMES = { ryanmen: '양면', shanpon: '샤보', kanchan: '칸찬', penchan: '펜찬', tanki: '단기' } as const;

/** 부수 계산 (§7). hasPinfu는 역 판정 결과에서 넘겨받는다 */
export function calcFu(
  d: Decomposition,
  ctx: Context,
  hasPinfu: boolean,
): { fu: number; breakdown: { label: string; fu: number }[] } {
  if (d.type === 'chiitoi') return { fu: 25, breakdown: [{ label: '치토이츠 고정', fu: 25 }] };
  if (d.type === 'kokushi') return { fu: 0, breakdown: [] }; // 역만이라 부수 무의미

  const { input, rules, isMenzen, waitType } = ctx;

  if (hasPinfu && input.isTsumo) {
    return { fu: 20, breakdown: [{ label: '핑후 쯔모 고정', fu: 20 }] };
  }

  const bd: { label: string; fu: number }[] = [{ label: '부저', fu: 20 }];
  if (isMenzen && !input.isTsumo) bd.push({ label: '멘젠 론', fu: 10 });
  if (input.isTsumo) bd.push({ label: '쯔모', fu: 2 });

  for (const m of d.melds) {
    if (m.type === 'shuntsu') continue;
    const anko = isAnko(m, input.isTsumo);
    const fu = 2 * (anko ? 2 : 1) * (m.type === 'kan' ? 4 : 1) * (isYaochu(m.tiles[0]) ? 2 : 1);
    const kind = m.type === 'kan' ? (m.open ? '명깡' : '안깡') : anko ? '안커' : '명각';
    bd.push({ label: `${m.tiles[0]} ${kind}`, fu });
  }

  let pairFu = DRAGONS.includes(d.pair) ? 2 : 0;
  const windFu = (d.pair === input.roundWind ? 2 : 0) + (d.pair === input.seatWind ? 2 : 0);
  pairFu += rules.doubleWindPairFu4 ? windFu : Math.min(windFu, 2);
  if (pairFu > 0) bd.push({ label: '머리 역패', fu: pairFu });

  if (waitType === 'kanchan' || waitType === 'penchan' || waitType === 'tanki') {
    bd.push({ label: `대기 (${WAIT_NAMES[waitType]})`, fu: 2 });
  }

  let total = bd.reduce((a, b) => a + b.fu, 0);
  if (total === 20 && !isMenzen && !input.isTsumo) {
    // 부로 + 무부수 + 론 (쿠이핑후형) → 30부
    bd.push({ label: '부로 무부수 론 보정', fu: 10 });
    total = 30;
  }
  return { fu: Math.ceil(total / 10) * 10, breakdown: bd };
}
