import type { FuLine, LimitId, ScoreError, YakuId, YakumanId } from './ids';
export type { FuLine, FuReason, LimitId, ScoreError, YakuId, YakumanId } from './ids';

// 명세 §3 입력, §10 출력 모델
type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SuitTile = `${Digit}${'m' | 'p' | 's'}`; // 수패
export type HonorTile = `${1 | 2 | 3 | 4 | 5 | 6 | 7}z`; // 東南西北白發中
export type Tile = SuitTile | HonorTile;
export type Wind = '1z' | '2z' | '3z' | '4z';

export interface Meld {
  type: 'chi' | 'pon' | 'ankan' | 'minkan';
  tiles: Tile[];
}

export interface WinInput {
  concealed: Tile[]; // 화료패 제외
  melds: Meld[];
  winningTile: Tile;
  isTsumo: boolean;
  roundWind: Wind;
  seatWind: Wind;
  riichi: boolean;
  doubleRiichi: boolean;
  ippatsu: boolean;
  haitei: boolean;
  houtei: boolean;
  rinshan: boolean;
  chankan: boolean;
  tenhou: boolean;
  chiihou: boolean;
  doraIndicators: Tile[];
  uraDoraIndicators: Tile[];
  akaDora: number;
  honba: number;
  riichiSticks: number;
}

export interface ScoreResult {
  valid: boolean;
  error?: ScoreError;
  yaku: { id: YakuId; han: number }[];
  yakuman: { id: YakumanId; multiplier: number }[];
  han: number;
  fu: number;
  fuBreakdown: FuLine[];
  limit?: LimitId;
  basePoints: number;
  payment: {
    total: number;
    ron?: number;
    tsumoFromDealer?: number;
    tsumoFromNonDealer?: number;
  };
}

// 명세 §11 룰 옵션
export interface Rules {
  suuankoTankiDouble: boolean;
  kokushi13Double: boolean;
  chuurenJunseiDouble: boolean;
  daisuushiDouble: boolean;
  kazoeYakuman: boolean;
  doubleWindPairFu4: boolean;
  ryuuiisouRequiresHatsu: boolean;
  akaDora: boolean;
  kuitan: boolean;
}

// 분해 결과 (engine 내부 공통 입력)
export type WaitType = 'ryanmen' | 'shanpon' | 'kanchan' | 'penchan' | 'tanki';

export interface DecomposedMeld {
  type: 'shuntsu' | 'koutsu' | 'kan';
  tiles: Tile[];
  open: boolean; // 부로 여부 (안깡은 false)
  fromWin: boolean; // 화료패로 완성된 면자
}

export type Decomposition =
  | { type: 'standard'; pair: Tile; melds: DecomposedMeld[] }
  | { type: 'chiitoi'; pairs: Tile[] }
  | { type: 'kokushi'; pair: Tile };

// 역·부수 판정에 공통으로 넘기는 문맥
export interface Context {
  input: WinInput;
  rules: Rules;
  isMenzen: boolean;
  isDealer: boolean;
  waitType: WaitType;
}
