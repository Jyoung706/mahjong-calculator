import type { Difficulty } from '../../../engine/generate';
import { cx } from '../../lib/cx';
import type { QuizMode, QuizSettings } from './types';
import s from './SetupView.module.css';

const DIFFICULTIES: { key: Difficulty; name: string; desc: string }[] = [
  { key: 'beginner', name: '입문', desc: '멘젠 · 20~40부 · 4판 이하' },
  { key: 'normal', name: '일반', desc: '부로 · 안커 · 대기 부수 포함' },
  { key: 'expert', name: '실전', desc: '깡 · 치토이 · 만관 이상까지' },
];
const MODES: { key: QuizMode; label: string }[] = [
  { key: 'full', label: '판·부·점수' },
  { key: 'fu', label: '부수만' },
  { key: 'score', label: '점수만' },
];
const COUNTS = [5, 10, 20, Infinity];

interface Props {
  settings: QuizSettings;
  onChange: (s: QuizSettings) => void;
  onStart: () => void;
}

export function SetupView({ settings, onChange, onStart }: Props) {
  return (
    <>
      <div className={s.body}>
        <div className={s.section}>
          <div className={s.sectionTitle}>난이도</div>
          <div className={`card ${s.radioList}`}>
            {DIFFICULTIES.map((d) => (
              <div key={d.key} className={s.radioItem} onClick={() => onChange({ ...settings, difficulty: d.key })}>
                <div className={cx(s.radioDot, settings.difficulty === d.key && s.radioDotOn)} />
                <div className={s.radioBody}>
                  <div className={s.radioName}>{d.name}</div>
                  <div className={s.radioDesc}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={s.section}>
          <div className={s.sectionTitle}>무엇을 맞힐까요</div>
          <div className={s.chipRow}>
            {MODES.map((m) => (
              <button key={m.key} type="button" className={cx(s.chip, settings.mode === m.key && s.chipOn)}
                onClick={() => onChange({ ...settings, mode: m.key })}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className={s.section}>
          <div className={s.sectionTitle}>문제 수</div>
          <div className={s.chipRow}>
            {COUNTS.map((c) => (
              <button key={c} type="button" className={cx('mono', s.chip, settings.count === c && s.chipOn)}
                onClick={() => onChange({ ...settings, count: c })}>
                {c === Infinity ? '무제한' : c}
              </button>
            ))}
          </div>
        </div>

        <div className={s.note}>문제는 룰 설정을 따릅니다. 적도라를 끄면 빨간 5가 출제되지 않습니다.</div>
      </div>
      <div className={s.footer}>
        <button type="button" className={s.startBtn} onClick={onStart}>시작</button>
      </div>
    </>
  );
}
