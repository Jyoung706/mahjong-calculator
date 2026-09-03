import type { Tile } from '../../engine/types';

const SUIT_FILE = { m: 'Man', p: 'Pin', s: 'Sou' } as const;
const HONOR_FILE = ['Ton', 'Nan', 'Shaa', 'Pei', 'Haku', 'Hatsu', 'Chun'];
const HONOR_LABEL = ['동', '남', '서', '북', '백', '발', '중'];
const SUIT_LABEL = { m: '만', p: '통', s: '삭' } as const;

export function tileSrc(id: Tile, red = false): string {
  const n = Number(id[0]);
  const suit = id[1] as 'm' | 'p' | 's' | 'z';
  if (suit === 'z') return `/tiles/${HONOR_FILE[n - 1]}.svg`;
  if (red && n === 5) return `/tiles/${SUIT_FILE[suit]}5-Dora.svg`;
  return `/tiles/${SUIT_FILE[suit]}${n}.svg`;
}

export function tileLabel(id: Tile): string {
  const n = Number(id[0]);
  const suit = id[1] as 'm' | 'p' | 's' | 'z';
  return suit === 'z' ? HONOR_LABEL[n - 1] : `${n}${SUIT_LABEL[suit]}`;
}

/** 하단 입력 패널 탭 구성 */
export const PANELS: { key: string; label: string; tiles: Tile[] }[] = [
  { key: 'm', label: '만', tiles: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}m` as Tile) },
  { key: 'p', label: '통', tiles: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}p` as Tile) },
  { key: 's', label: '삭', tiles: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}s` as Tile) },
  { key: 'z', label: '자패', tiles: [1, 2, 3, 4, 5, 6, 7].map((n) => `${n}z` as Tile) },
];

export const WIND_LABELS = ['동', '남', '서', '북'];

const HONOR_HANJA = ['東', '南', '西', '北', '白', '發', '中'];

/**
 * 부수 내역 등 엔진이 주는 문자열 속 패 코드를 일반 사용자용 표기로 변환.
 * 수패: 1m → 1만 · 자패: 한자 + (장풍/자풍/삼원패) 주석
 */
export function formatTileText(text: string, roundWind: Tile, seatWind: Tile): string {
  return text.replace(/[1-9][mps]|[1-7]z/g, (code) => {
    const n = Number(code[0]);
    if (code[1] !== 'z') return `${n}${SUIT_LABEL[code[1] as 'm' | 'p' | 's']}`;
    const hanja = HONOR_HANJA[n - 1];
    if (n >= 5) return `${hanja}(삼원패)`;
    const roles = [code === roundWind && '장풍', code === seatWind && '자풍'].filter(Boolean);
    return roles.length > 0 ? `${hanja}(${roles.join('·')})` : hanja;
  });
}
