// 엔진이 화면에 내보내는 모든 값의 식별자.
//
// 엔진은 표시 문자열을 만들지 않는다. 여기 정의된 ID만 반환하고, 사람이 읽는
// 이름은 UI 계층(src/lib/scoreLabels.ts)이 붙인다. 이래야 표기를 바꾸거나
// 언어를 추가할 때 계산 코드를 건드리지 않는다.
import type { Tile, WaitType } from './types';

export type YakuId =
  // 상황역
  | 'riichi' | 'doubleRiichi' | 'ippatsu' | 'menzenTsumo'
  | 'haitei' | 'houtei' | 'rinshan' | 'chankan'
  // 손패 구성
  | 'tanyao' | 'pinfu' | 'honroutou' | 'honitsu' | 'chinitsu' | 'chiitoitsu'
  | 'yakuhaiHaku' | 'yakuhaiHatsu' | 'yakuhaiChun' | 'yakuhaiRound' | 'yakuhaiSeat'
  | 'toitoi' | 'sanankou' | 'sankantsu' | 'shousangen'
  | 'sanshokuDoukou' | 'sanshokuDoujun' | 'ittsuu'
  | 'iipeikou' | 'ryanpeikou' | 'chanta' | 'junchan'
  // 도라 (역은 아니지만 판수로 합산된다)
  | 'dora' | 'uraDora' | 'akaDora';

export type YakumanId =
  | 'tenhou' | 'chiihou' | 'kokushi' | 'kokushi13'
  | 'tsuuiisou' | 'chinroutou' | 'ryuuiisou'
  | 'suuankou' | 'suuankouTanki' | 'daisangen'
  | 'daisuushii' | 'shousuushii' | 'suukantsu'
  | 'chuuren' | 'chuurenJunsei';

export type LimitId = 'mangan' | 'haneman' | 'baiman' | 'sanbaiman' | 'yakuman' | 'doubleYakuman';

/** 부수 한 줄. 값이 필요한 항목은 필드로 들고 있어 UI가 직접 조립한다 */
export type FuReason =
  | { id: 'chiitoi' }
  | { id: 'pinfuTsumo' }
  | { id: 'base' }
  | { id: 'menzenRon' }
  | { id: 'tsumo' }
  | { id: 'set'; tile: Tile; kind: 'ankou' | 'minkou' | 'ankan' | 'minkan' }
  | { id: 'yakuhaiPair' }
  | { id: 'wait'; wait: WaitType }
  | { id: 'openNoFuRon' };

export type FuLine = FuReason & { fu: number };

/** 계산이 불가능한 이유. 문구 대신 사유와 값을 넘긴다 */
export type ScoreError =
  | { id: 'meldSize'; meld: 'chi' | 'pon' | 'minkan' | 'ankan'; expected: number }
  | { id: 'meldShape'; meld: 'chi' | 'pon' | 'minkan' | 'ankan'; tiles: Tile[] }
  | { id: 'handSize'; count: number; expected: number }
  | { id: 'tileOverflow'; tile: Tile; count: number }
  | { id: 'notWinningShape' }
  | { id: 'noYaku' };
