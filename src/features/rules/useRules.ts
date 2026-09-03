import { useState } from 'react';
import type { Rules } from '../../../engine/types';
import { DEFAULT_RULES } from '../../../engine';

const STORAGE_KEY = 'panbu-rules';

function load(): Rules {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_RULES, ...JSON.parse(raw) };
  } catch { /* 저장값 손상 시 기본값 */ }
  return DEFAULT_RULES;
}

export function useRules() {
  const [rules, setRules] = useState<Rules>(load);
  const save = (next: Rules) => {
    setRules(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  return {
    rules,
    toggle: (key: keyof Rules) => save({ ...rules, [key]: !rules[key] }),
    reset: () => save(DEFAULT_RULES),
    changedCount: Object.keys(DEFAULT_RULES).filter((k) => rules[k as keyof Rules] !== DEFAULT_RULES[k as keyof Rules]).length,
  };
}
