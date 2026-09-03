import { useMemo, useState } from 'react';
import type { Rules } from '../../../engine/types';
import { generateProblem, type QuizProblem } from '../../../engine/generate';
import { cx } from '../../lib/cx';
import { SetupView } from './SetupView';
import { PlayView } from './PlayView';
import { ResultView } from './ResultView';
import type { QuizRecord, QuizSettings } from './types';
import s from './QuizPage.module.css';

type Phase = 'setup' | 'play' | 'result';

export function QuizPage({ rules, onBack }: { rules: Rules; onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [settings, setSettings] = useState<QuizSettings>({ difficulty: 'beginner', mode: 'full', count: 10 });
  const [records, setRecords] = useState<QuizRecord[]>([]);
  const [problemNo, setProblemNo] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState<QuizProblem | null>(null);

  const newProblem = () => setProblem(generateProblem(settings.difficulty, rules));

  const start = () => {
    setRecords([]);
    setProblemNo(1);
    setStreak(0);
    setProblem(generateProblem(settings.difficulty, rules));
    setPhase('play');
  };

  const handleNext = (record: QuizRecord) => {
    const next = [...records, record];
    setRecords(next);
    setStreak(record.allOk ? streak + 1 : 0);
    if (next.length >= settings.count) {
      setPhase('result');
    } else {
      setProblemNo(problemNo + 1);
      newProblem();
    }
  };

  const title = phase === 'setup' ? '퀴즈 시작' : phase === 'play' ? '점수 퀴즈' : '결과';
  const headerBack = () => (phase === 'setup' ? onBack() : setPhase('setup'));

  return (
    <div className={`page ${s.page}`}>
      <header className="page-header">
        <button type="button" onClick={headerBack} className="back-btn">←</button>
        <div className="page-title">{title}</div>
        {phase === 'play' && (
          <div className={s.headerRight}>
            <div className={`mono ${s.qNo}`}>Q{problemNo}</div>
            <div className={cx('mono', s.streak)}>{streak}연속</div>
          </div>
        )}
      </header>

      {phase === 'setup' && <SetupView settings={settings} onChange={setSettings} onStart={start} />}
      {phase === 'play' && problem && (
        <PlayView
          key={problemNo}
          problem={problem}
          mode={settings.mode}
          unlimited={settings.count === Infinity}
          answeredCount={records.length}
          onNext={handleNext}
          onEndSession={() => setPhase('result')}
        />
      )}
      {phase === 'result' && (
        <ResultView settings={settings} records={records} onRestart={start} onHome={onBack} />
      )}
    </div>
  );
}
