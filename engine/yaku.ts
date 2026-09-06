import type { Decomposition, Context, Tile, YakuId } from './types';
import { DRAGONS, isHonor, isSimple, isTerminal, isYaochu, num, suit } from './tiles';
import { isAnko, tilesOf } from './decompose';

const DRAGON_YAKU: Record<string, YakuId> = { '5z': 'yakuhaiHaku', '6z': 'yakuhaiHatsu', '7z': 'yakuhaiChun' };

const isYakuhaiPair = (pair: Tile, ctx: Context) =>
  DRAGONS.includes(pair) || pair === ctx.input.roundWind || pair === ctx.input.seatWind;

/** 일반 역 판정 (§6.2, §6.3 흡수 규칙 포함). 도라는 여기서 다루지 않는다 */
export function detectYaku(d: Decomposition, ctx: Context): { id: YakuId; han: number }[] {
  const { input, rules, isMenzen } = ctx;
  const yaku: { id: YakuId; han: number }[] = [];
  const dan = (menzen: number, open: number) => (isMenzen ? menzen : open); // 판내림

  // 상황역
  if (input.doubleRiichi) yaku.push({ id: 'doubleRiichi', han: 2 });
  else if (input.riichi) yaku.push({ id: 'riichi', han: 1 });
  if (input.ippatsu) yaku.push({ id: 'ippatsu', han: 1 });
  if (isMenzen && input.isTsumo) yaku.push({ id: 'menzenTsumo', han: 1 });
  if (input.haitei) yaku.push({ id: 'haitei', han: 1 });
  if (input.houtei) yaku.push({ id: 'houtei', han: 1 });
  if (input.rinshan) yaku.push({ id: 'rinshan', han: 1 });
  if (input.chankan) yaku.push({ id: 'chankan', han: 1 });

  const tiles = tilesOf(d);

  if (tiles.every(isSimple) && (isMenzen || rules.kuitan)) yaku.push({ id: 'tanyao', han: 1 });

  const honroutou = tiles.every(isYaochu);
  if (honroutou) yaku.push({ id: 'honroutou', han: 2 });

  const suits = new Set(tiles.filter((t) => !isHonor(t)).map(suit));
  if (suits.size === 1) {
    if (tiles.some(isHonor)) yaku.push({ id: 'honitsu', han: dan(3, 2) });
    else yaku.push({ id: 'chinitsu', han: dan(6, 5) }); // 청일 성립 → 혼일 제외
  }

  if (d.type === 'chiitoi') {
    yaku.push({ id: 'chiitoitsu', han: 2 });
    return yaku; // 구조상 핑후·토이토이·이페코 불가
  }
  if (d.type === 'kokushi') return yaku; // 역만 전용 — 여기 도달하지 않음

  const melds = d.melds;
  const koutsuLike = melds.filter((m) => m.type !== 'shuntsu');
  const shuntsu = melds.filter((m) => m.type === 'shuntsu');
  const starts = shuntsu.map((m) => m.tiles[0]);

  // 핑후
  if (isMenzen && shuntsu.length === 4 && ctx.waitType === 'ryanmen' && !isYakuhaiPair(d.pair, ctx))
    yaku.push({ id: 'pinfu', han: 1 });

  // 역패 (장풍·자풍·삼원패, 중복 가산)
  for (const m of koutsuLike) {
    const t = m.tiles[0];
    if (DRAGONS.includes(t)) yaku.push({ id: DRAGON_YAKU[t], han: 1 });
    if (t === input.roundWind) yaku.push({ id: 'yakuhaiRound', han: 1 });
    if (t === input.seatWind) yaku.push({ id: 'yakuhaiSeat', han: 1 });
  }

  if (koutsuLike.length === 4) yaku.push({ id: 'toitoi', han: 2 });
  if (melds.filter((m) => isAnko(m, input.isTsumo)).length === 3) yaku.push({ id: 'sanankou', han: 2 });
  if (melds.filter((m) => m.type === 'kan').length === 3) yaku.push({ id: 'sankantsu', han: 2 });

  // 소삼원
  const dragonKoutsu = koutsuLike.filter((m) => DRAGONS.includes(m.tiles[0]));
  if (dragonKoutsu.length === 2 && DRAGONS.includes(d.pair)) yaku.push({ id: 'shousangen', han: 2 });

  // 삼색동각
  for (let n = 1; n <= 9; n++) {
    const s = new Set(
      koutsuLike.filter((m) => !isHonor(m.tiles[0]) && num(m.tiles[0]) === n).map((m) => suit(m.tiles[0])),
    );
    if (s.size === 3) yaku.push({ id: 'sanshokuDoukou', han: 2 });
  }
  // 삼색동순
  for (let n = 1; n <= 7; n++) {
    const s = new Set(starts.filter((t) => num(t) === n).map(suit));
    if (s.size === 3) yaku.push({ id: 'sanshokuDoujun', han: dan(2, 1) });
  }
  // 일기통관
  for (const su of ['m', 'p', 's']) {
    if ([1, 4, 7].every((n) => starts.some((t) => suit(t) === su && num(t) === n)))
      yaku.push({ id: 'ittsuu', han: dan(2, 1) });
  }
  // 이페코 / 량페코 (멘젠 전용)
  if (isMenzen) {
    const cnt: Record<string, number> = {};
    for (const t of starts.map((t, i) => `${t}:${shuntsu[i].tiles.join('')}`)) cnt[t] = (cnt[t] ?? 0) + 1;
    const dupPairs = Object.values(cnt).reduce((a, n) => a + Math.floor(n / 2), 0);
    if (dupPairs >= 2) yaku.push({ id: 'ryanpeikou', han: 3 }); // 량페코 성립 → 이페코 제외
    else if (dupPairs === 1) yaku.push({ id: 'iipeikou', han: 1 });
  }
  // 찬타 / 준찬타 (혼노두 성립 → 찬타 계열 제외, 준찬타 성립 → 찬타 제외)
  if (!honroutou && melds.every((m) => m.tiles.some(isYaochu)) && isYaochu(d.pair)) {
    if (melds.every((m) => m.tiles.some(isTerminal)) && isTerminal(d.pair))
      yaku.push({ id: 'junchan', han: dan(3, 2) });
    else yaku.push({ id: 'chanta', han: dan(2, 1) });
  }

  return yaku;
}
