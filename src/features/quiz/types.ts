import type { QuizProblem, Difficulty } from '../../../engine/generate';

export type QuizMode = 'full' | 'fu' | 'score'; // 판·부·점수 / 부수만 / 점수만

export interface QuizSettings {
  difficulty: Difficulty;
  mode: QuizMode;
  count: number; // Infinity = 무제한
}

export interface QuizRecord {
  problem: QuizProblem;
  myHan: number | null;
  myFu: number | null;
  myScore: string;
  hanOk: boolean | null; // null = 채점 대상 아님
  fuOk: boolean | null;
  scoreOk: boolean | null;
  allOk: boolean;
  gaveUp: boolean;
}

/** 만관 이상 구간에서는 판수를 칩 값(구간 대표)으로 환산해 채점 */
export const HAN_CHIPS = [1, 2, 3, 4, 5, 6, 8, 11, 13];
export const FU_CHIPS = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
export const hanBracket = (h: number) => (h <= 4 ? h : h <= 5 ? 5 : h <= 7 ? 6 : h <= 10 ? 8 : h <= 12 ? 11 : 13);
