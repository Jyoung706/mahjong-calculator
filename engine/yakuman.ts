import type { Decomposition, Context } from './types';
import { DRAGONS, WINDS, isHonor, isTerminal, num, suit } from './tiles';
import { isAnko, tilesOf } from './decompose';

const GREEN = new Set(['2s', '3s', '4s', '6s', '8s', '6z']);
const CHUUREN_COUNTS = [0, 3, 1, 1, 1, 1, 1, 1, 1, 3]; // index = 숫자

/** 역만 판정 (§6.1). 빈 배열이면 역만 아님 */
export function detectYakuman(d: Decomposition, ctx: Context): { name: string; multiplier: number }[] {
  const { input, rules, isMenzen, isDealer } = ctx;
  const out: { name: string; multiplier: number }[] = [];

  if (input.tenhou && isDealer) out.push({ name: '천화', multiplier: 1 });
  if (input.chiihou && !isDealer) out.push({ name: '지화', multiplier: 1 });

  if (d.type === 'kokushi') {
    // 화료패가 머리가 됐다 = 텐파이 시 13종 각 1장 = 13면 대기
    if (input.winningTile === d.pair && rules.kokushi13Double)
      out.push({ name: '국사무쌍 13면', multiplier: 2 });
    else out.push({ name: '국사무쌍', multiplier: 1 });
    return out;
  }

  const tiles = tilesOf(d);
  if (tiles.every(isHonor)) out.push({ name: '자일색', multiplier: 1 });
  if (tiles.every(isTerminal)) out.push({ name: '청노두', multiplier: 1 });
  if (tiles.every((t) => GREEN.has(t)) && (!rules.ryuuiisouRequiresHatsu || tiles.includes('6z')))
    out.push({ name: '녹일색', multiplier: 1 });

  if (d.type === 'chiitoi') return out; // 치토이 형태 역만은 자일색(대칠성)뿐

  const koutsuLike = d.melds.filter((m) => m.type !== 'shuntsu');

  // 사안커 (단기 대기면 더블)
  if (d.melds.filter((m) => isAnko(m, input.isTsumo)).length === 4) {
    if (ctx.waitType === 'tanki' && rules.suuankoTankiDouble) out.push({ name: '사안커 단기', multiplier: 2 });
    else out.push({ name: '사안커', multiplier: 1 });
  }
  // 대삼원
  if (DRAGONS.every((t) => koutsuLike.some((m) => m.tiles[0] === t))) out.push({ name: '대삼원', multiplier: 1 });
  // 사희패
  const windKoutsu = WINDS.filter((t) => koutsuLike.some((m) => m.tiles[0] === t)).length;
  if (windKoutsu === 4) out.push({ name: '대사희', multiplier: rules.daisuushiDouble ? 2 : 1 });
  else if (windKoutsu === 3 && WINDS.includes(d.pair)) out.push({ name: '소사희', multiplier: 1 });
  // 사깡즈
  if (d.melds.filter((m) => m.type === 'kan').length === 4) out.push({ name: '사깡즈', multiplier: 1 });
  // 구련보등 (멘젠 한정, 한 색 수패 14장)
  if (isMenzen && tiles.length === 14 && !tiles.some(isHonor) && new Set(tiles.map(suit)).size === 1) {
    const counts = Array(10).fill(0);
    for (const t of tiles) counts[num(t)]++;
    if (CHUUREN_COUNTS.every((need, n) => counts[n] >= need)) {
      const winNum = num(input.winningTile);
      const junsei = counts[winNum] === CHUUREN_COUNTS[winNum] + 1; // 텐파이 시 정확히 1112345678999
      if (junsei && rules.chuurenJunseiDouble) out.push({ name: '순정구련보등', multiplier: 2 });
      else out.push({ name: '구련보등', multiplier: 1 });
    }
  }

  return out;
}
