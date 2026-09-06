// 퀴즈 문제 생성 (명세 §16): 랜덤 완성형 손패를 만들어 calculateScore에 넣으면 그게 곧 정답
import type { Meld, Rules, ScoreResult, Tile, Wind, WinInput } from './types';
import { ALL_TILES, DRAGONS, isSimple, num, suit } from './tiles';
import { calculateScore } from './index';

export type Difficulty = 'beginner' | 'normal' | 'expert';

export interface QuizTile { id: Tile; red: boolean }

export interface QuizProblem {
  input: WinInput;
  result: ScoreResult;
  // 표시용(적도라 위치 포함). input.concealed와 내용 동일, 정렬됨
  handDisplay: QuizTile[];
  winDisplay: QuizTile;
  meldsDisplay: { type: Meld['type']; tiles: QuizTile[] }[];
}

const MAX_ATTEMPTS = 1000;
const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: readonly T[]): T => arr[rand(arr.length)];
const SIMPLES = ALL_TILES.filter(isSimple);
const WINDS4: Wind[] = ['1z', '2z', '3z', '4z'];
const sortTiles = (a: Tile[]) =>
  [...a].sort((x, y) => (x[1] === y[1] ? x[0].localeCompare(y[0]) : 'mpsz'.indexOf(x[1]) - 'mpsz'.indexOf(y[1])));

export function generateProblem(difficulty: Difficulty, rules: Rules): QuizProblem {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const p = tryGenerate(difficulty, rules);
    if (p) return p;
  }
  throw new Error('quiz: no problem matched the requested difficulty');
}

function tryGenerate(difficulty: Difficulty, rules: Rules): QuizProblem | null {
  const pool: Partial<Record<Tile, number>> = {};
  for (const t of ALL_TILES) pool[t] = 4;
  const take = (t: Tile, n: number) => {
    if ((pool[t] ?? 0) < n) return false;
    pool[t]! -= n;
    return true;
  };

  const roundWind = pick(['1z', '2z'] as const);
  const seatWind = pick(WINDS4);

  const meldCount = difficulty === 'beginner' ? 0 : rand(3); // 0~2
  const chiitoi = difficulty === 'expert' && meldCount === 0 && Math.random() < 0.2;

  const melds: Meld[] = [];
  let closed: Tile[]; // 부로 제외 손패 전체 (화료패 포함, 14 - 부로×3장)

  if (chiitoi) {
    const kinds = [...ALL_TILES].sort(() => Math.random() - 0.5).slice(0, 7);
    for (const k of kinds) take(k, 2);
    closed = kinds.flatMap((k) => [k, k]);
  } else {
    // 부로 손은 무역이 되기 쉬우므로: 탄야오 강제 또는 역패 커쯔 시드 (명세 §16.3 주의)
    const tanyaoMode = meldCount > 0 && Math.random() < 0.5;
    const allowed = tanyaoMode ? SIMPLES : ALL_TILES;
    const maxStart = tanyaoMode ? 6 : 7; // 탄야오면 슌쯔가 2~8 안에 있어야 함
    const sets: Tile[][] = [];

    if (meldCount > 0 && !tanyaoMode) {
      const t = pick([...DRAGONS, seatWind, roundWind]) as Tile;
      if (!take(t, 3)) return null;
      sets.push([t, t, t]);
    }
    while (sets.length < 4) {
      const set = genSet(pool, take, allowed, maxStart);
      if (!set) return null;
      sets.push(set);
    }
    const pairCands = allowed.filter((t) => (pool[t] ?? 0) >= 2);
    if (pairCands.length === 0) return null;
    const pairTile = pick(pairCands);
    take(pairTile, 2);

    // 앞의 meldCount개 세트를 부로로 (커쯔→펑, 슌쯔→치, 실전은 일부 커쯔를 명깡으로)
    for (let i = 0; i < meldCount; i++) {
      const tiles = sets[i];
      const isKoutsu = tiles[0] === tiles[1];
      if (isKoutsu && difficulty === 'expert' && Math.random() < 0.3 && take(tiles[0], 1)) {
        melds.push({ type: 'minkan', tiles: [tiles[0], tiles[0], tiles[0], tiles[0]] });
      } else {
        melds.push({ type: isKoutsu ? 'pon' : 'chi', tiles });
      }
    }
    closed = [pairTile, pairTile, ...sets.slice(meldCount).flat()];
  }

  // 화료패: 손안의 패 중 1장
  const winIdx = rand(closed.length);
  const winningTile = closed[winIdx];
  const concealed = sortTiles(closed.filter((_, i) => i !== winIdx));

  // 상황
  const riichi = melds.length === 0 && Math.random() < (difficulty === 'beginner' ? 0.6 : 0.4);
  const isTsumo = Math.random() < 0.5;

  // 도라 표시패: 남은 패에서 1~2장
  const drawIndicator = (): Tile | null => {
    const cands = ALL_TILES.filter((t) => (pool[t] ?? 0) > 0);
    if (cands.length === 0) return null;
    const t = pick(cands);
    take(t, 1);
    return t;
  };
  const doraCount = Math.random() < 0.25 ? 2 : 1;
  const doraIndicators: Tile[] = [];
  const uraDoraIndicators: Tile[] = [];
  for (let i = 0; i < doraCount; i++) {
    const d = drawIndicator();
    if (d) doraIndicators.push(d);
    if (riichi) {
      const u = drawIndicator();
      if (u) uraDoraIndicators.push(u);
    }
  }

  // 적도라: 색당 5가 손에 있으면 확률적으로 1장을 적으로 (표시 위치까지 기록)
  const handDisplay: QuizTile[] = concealed.map((id) => ({ id, red: false }));
  const winDisplay: QuizTile = { id: winningTile, red: false };
  const meldsDisplay = melds.map((m) => ({ type: m.type, tiles: m.tiles.map((id) => ({ id, red: false })) }));
  let akaDora = 0;
  if (rules.akaDora) {
    for (const su of ['m', 'p', 's']) {
      const five = `5${su}` as Tile;
      const spots: QuizTile[] = [
        ...handDisplay.filter((t) => t.id === five),
        ...(winDisplay.id === five ? [winDisplay] : []),
        ...meldsDisplay.flatMap((m) => m.tiles.filter((t) => t.id === five)),
      ];
      if (spots.length > 0 && Math.random() < 0.4) {
        pick(spots).red = true;
        akaDora++;
      }
    }
  }

  const input: WinInput = {
    concealed, melds, winningTile, isTsumo, roundWind, seatWind,
    riichi, doubleRiichi: false, ippatsu: false,
    haitei: false, houtei: false, rinshan: false, chankan: false, tenhou: false, chiihou: false,
    doraIndicators, uraDoraIndicators, akaDora, honba: 0, riichiSticks: 0,
  };
  const result = calculateScore(input, rules);
  if (!result.valid) return null;

  // 난이도 필터 (디자인 11의 정의)
  if (difficulty === 'beginner') {
    if (result.yakuman.length > 0 || result.limit || result.han > 4 || result.fu < 20 || result.fu > 40) return null;
  } else if (difficulty === 'normal') {
    if (result.yakuman.length > 0 || result.limit) return null;
  }

  return { input, result, handDisplay, winDisplay, meldsDisplay };
}

function genSet(
  pool: Partial<Record<Tile, number>>,
  take: (t: Tile, n: number) => boolean,
  allowed: Tile[],
  maxStart: number,
): Tile[] | null {
  if (Math.random() < 0.3) {
    const cands = allowed.filter((t) => (pool[t] ?? 0) >= 3);
    if (cands.length > 0) {
      const t = pick(cands);
      take(t, 3);
      return [t, t, t];
    }
  }
  const starts = allowed.filter((t) => {
    if (t.endsWith('z') || num(t) > maxStart) return false;
    const t2 = `${num(t) + 1}${suit(t)}` as Tile;
    const t3 = `${num(t) + 2}${suit(t)}` as Tile;
    return (pool[t] ?? 0) > 0 && (pool[t2] ?? 0) > 0 && (pool[t3] ?? 0) > 0;
  });
  if (starts.length === 0) return null;
  const t = pick(starts);
  const t2 = `${num(t) + 1}${suit(t)}` as Tile;
  const t3 = `${num(t) + 2}${suit(t)}` as Tile;
  take(t, 1); take(t2, 1); take(t3, 1);
  return [t, t2, t3];
}
