import { test, expect } from 'vitest';
import { generateProblem } from '../engine/generate';
import { DEFAULT_RULES } from '../engine';

test('입문: 30문제 전부 유효, 멘젠·4판 이하·20~40부', () => {
  for (let i = 0; i < 30; i++) {
    const p = generateProblem('beginner', DEFAULT_RULES);
    expect(p.result.valid).toBe(true);
    expect(p.input.melds).toHaveLength(0);
    expect(p.result.han).toBeLessThanOrEqual(4);
    expect(p.result.fu).toBeGreaterThanOrEqual(20);
    expect(p.result.fu).toBeLessThanOrEqual(40);
    expect(p.result.yakuman).toHaveLength(0);
  }
});

test('일반: 30문제 전부 유효, 만관 미만', () => {
  for (let i = 0; i < 30; i++) {
    const p = generateProblem('normal', DEFAULT_RULES);
    expect(p.result.valid).toBe(true);
    expect(p.result.limitName).toBeUndefined();
  }
});

test('실전: 30문제 전부 유효', () => {
  for (let i = 0; i < 30; i++) {
    expect(generateProblem('expert', DEFAULT_RULES).result.valid).toBe(true);
  }
});

test('적도라 표시 개수 = akaDora 입력값', () => {
  for (let i = 0; i < 20; i++) {
    const p = generateProblem('normal', DEFAULT_RULES);
    const reds =
      p.handDisplay.filter((t) => t.red).length +
      (p.winDisplay.red ? 1 : 0) +
      p.meldsDisplay.flatMap((m) => m.tiles).filter((t) => t.red).length;
    expect(reds).toBe(p.input.akaDora);
  }
});

test('적도라 룰 OFF면 적패 미출제', () => {
  const rules = { ...DEFAULT_RULES, akaDora: false };
  for (let i = 0; i < 10; i++) {
    const p = generateProblem('beginner', rules);
    expect(p.input.akaDora).toBe(0);
    expect(p.handDisplay.some((t) => t.red)).toBe(false);
  }
});
