// 엔진이 돌려준 ID에 한국어 이름을 붙이는 곳.
//
// 엔진은 '리치' 같은 문구를 모른다. 표기를 바꾸거나 언어를 추가할 때
// 계산 코드를 건드리지 않으려면 사람이 읽는 문자열은 전부 여기 모여 있어야 한다.
import type { FuLine, LimitId, ScoreError, Tile, WaitType, YakuId, YakumanId } from '../../engine/types';

export const YAKU_LABEL: Record<YakuId, string> = {
  riichi: '리치',
  doubleRiichi: '더블리치',
  ippatsu: '일발',
  menzenTsumo: '멘젠쯔모',
  haitei: '해저로월',
  houtei: '하저로어',
  rinshan: '영상개화',
  chankan: '창깡',
  tanyao: '탄야오',
  pinfu: '핑후',
  honroutou: '혼노두',
  honitsu: '혼일색',
  chinitsu: '청일색',
  chiitoitsu: '치토이츠',
  yakuhaiHaku: '역패 白',
  yakuhaiHatsu: '역패 發',
  yakuhaiChun: '역패 中',
  yakuhaiRound: '역패 장풍',
  yakuhaiSeat: '역패 자풍',
  toitoi: '토이토이',
  sanankou: '삼안커',
  sankantsu: '삼깡즈',
  shousangen: '소삼원',
  sanshokuDoukou: '삼색동각',
  sanshokuDoujun: '삼색동순',
  ittsuu: '일기통관',
  iipeikou: '이페코',
  ryanpeikou: '량페코',
  chanta: '찬타',
  junchan: '준찬타',
  dora: '도라',
  uraDora: '우라도라',
  akaDora: '적도라',
};

export const YAKUMAN_LABEL: Record<YakumanId, string> = {
  tenhou: '천화',
  chiihou: '지화',
  kokushi: '국사무쌍',
  kokushi13: '국사무쌍 13면',
  tsuuiisou: '자일색',
  chinroutou: '청노두',
  ryuuiisou: '녹일색',
  suuankou: '사안커',
  suuankouTanki: '사안커 단기',
  daisangen: '대삼원',
  daisuushii: '대사희',
  shousuushii: '소사희',
  suukantsu: '사깡즈',
  chuuren: '구련보등',
  chuurenJunsei: '순정구련보등',
};

export const LIMIT_LABEL: Record<LimitId, string> = {
  mangan: '만관',
  haneman: '하네만',
  baiman: '배만',
  sanbaiman: '삼배만',
  yakuman: '역만',
  doubleYakuman: '더블역만',
};

/** 판수에 합산되지만 역이 아닌 것 — 화면에서 따로 묶어 보여준다 */
export const DORA_IDS: YakuId[] = ['dora', 'uraDora', 'akaDora'];

const WAIT_LABEL: Record<WaitType, string> = {
  ryanmen: '양면', shanpon: '샤보', kanchan: '칸찬', penchan: '펜찬', tanki: '단기',
};

const SET_LABEL = { ankou: '안커', minkou: '명각', ankan: '안깡', minkan: '명깡' } as const;

const MELD_LABEL = { chi: '치', pon: '펑', minkan: '명깡', ankan: '안깡' } as const;

const SUIT_LABEL = { m: '만', p: '통', s: '삭' } as const;
const HONOR_HANJA = ['東', '南', '西', '北', '白', '發', '中'];

/** 부수 내역에 쓰는 패 표기. 자패는 한자 + 역할 주석 */
export function fuTileLabel(tile: Tile, roundWind: Tile, seatWind: Tile): string {
  const n = Number(tile[0]);
  if (tile[1] !== 'z') return `${n}${SUIT_LABEL[tile[1] as 'm' | 'p' | 's']}`;
  const hanja = HONOR_HANJA[n - 1];
  if (n >= 5) return `${hanja}(삼원패)`;
  const roles = [tile === roundWind && '장풍', tile === seatWind && '자풍'].filter(Boolean);
  return roles.length > 0 ? `${hanja}(${roles.join('·')})` : hanja;
}

/** 부수 한 줄의 이름 */
export function fuLabel(line: FuLine, roundWind: Tile, seatWind: Tile): string {
  switch (line.id) {
    case 'chiitoi': return '치토이츠 고정';
    case 'pinfuTsumo': return '핑후 쯔모 고정';
    case 'base': return '부저';
    case 'menzenRon': return '멘젠 론';
    case 'tsumo': return '쯔모';
    case 'set': return `${fuTileLabel(line.tile, roundWind, seatWind)} ${SET_LABEL[line.kind]}`;
    case 'yakuhaiPair': return '머리 역패';
    case 'wait': return `대기 (${WAIT_LABEL[line.wait]})`;
    case 'openNoFuRon': return '부로 무부수 론 보정';
  }
}

/** 계산이 불가능한 이유 */
export function errorLabel(error: ScoreError): string {
  switch (error.id) {
    case 'meldSize': return `부로 매수 오류: ${MELD_LABEL[error.meld]}은 ${error.expected}장`;
    case 'meldShape':
      return error.meld === 'chi'
        ? `부로 구성 오류: 치는 연속 수패 (${error.tiles.join(',')})`
        : `부로 구성 오류: ${MELD_LABEL[error.meld]}은 같은 패 (${error.tiles.join(',')})`;
    case 'handSize': return `패 매수 오류: 손패 ${error.count}장 (${error.expected}장이어야 함)`;
    case 'tileOverflow': return `같은 패 5장 이상: ${error.tile} ${error.count}장`;
    case 'notWinningShape': return '화료형이 아님 (텐파이 아님)';
    case 'noYaku': return '역 없음';
  }
}
