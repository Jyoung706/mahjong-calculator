import { TileView } from '../../components/Tile';
import { cx } from '../../lib/cx';
import type { QuizRecord, QuizSettings } from './types';
import s from './ResultView.module.css';

const DIFF_NAMES = { beginner: '입문', normal: '일반', expert: '실전' } as const;

interface Props {
  settings: QuizSettings;
  records: QuizRecord[];
  onRestart: () => void;
  onHome: () => void;
}

export function ResultView({ settings, records, onRestart, onHome }: Props) {
  const correct = records.filter((r) => r.allOk).length;
  const rate = (key: 'hanOk' | 'fuOk' | 'scoreOk') => {
    const graded = records.filter((r) => r[key] !== null);
    return { ok: graded.filter((r) => r[key] === true).length, total: graded.length };
  };
  const rates = [
    { label: '판수', ...rate('hanOk') },
    { label: '부수', ...rate('fuOk') },
    { label: '점수', ...rate('scoreOk') },
  ].filter((r) => r.total > 0);

  const worst = [...rates].sort((a, b) => a.ok / a.total - b.ok / b.total)[0];
  const comment =
    correct === records.length ? '전부 맞혔습니다. 난이도를 올려보세요.'
    : worst && worst.ok < worst.total ? `${worst.label}에서 ${worst.total - worst.ok}문제를 놓쳤습니다.`
    : '';

  const wrongs = records
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => !r.allOk);

  return (
    <>
      <div className={s.summary}>
        <div className={`mono ${s.summarySub}`}>{DIFF_NAMES[settings.difficulty]} · {records.length}문제</div>
        <div className={s.scoreRow}>
          <div className={`mono ${s.score}`}>{correct}</div>
          <div className={s.scoreOf}>/ {records.length} 정답</div>
        </div>
        {comment && <div className={s.comment}>{comment}</div>}
      </div>

      <div className={s.body}>
        <div className={s.section}>
          <div className={s.sectionTitle}>항목별 정답률</div>
          <div className={`card ${s.rateCard}`}>
            {rates.map((r) => {
              const bad = r.ok < r.total;
              return (
                <div key={r.label} className={s.rateRow}>
                  <div className={s.rateHead}>
                    <span>{r.label}</span>
                    <span className={cx('mono', s.rateNum, bad && s.rateNumBad)}>{r.ok} / {r.total}</span>
                  </div>
                  <div className={s.rateTrack}>
                    <div className={cx(s.rateFill, bad && s.rateFillBad)} style={{ width: `${(r.ok / r.total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {wrongs.length > 0 && (
          <div className={s.section}>
            <div className={s.sectionTitle}>틀린 문제</div>
            <div className={`card ${s.wrongList}`}>
              {wrongs.map(({ r, i }) => (
                <div key={i} className={s.wrongItem}>
                  <div className={s.wrongTiles}>
                    {r.problem.handDisplay.slice(0, 3).map((t, j) => <TileView key={j} id={t.id} red={t.red} size={20} />)}
                  </div>
                  <div className={s.wrongText}>Q{i + 1} · {wrongSummary(r)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={s.footer}>
        <button type="button" className={s.homeBtn} onClick={onHome}>홈으로</button>
        <button type="button" className={s.againBtn} onClick={onRestart}>다시 풀기</button>
      </div>
    </>
  );
}

function wrongSummary(r: QuizRecord): string {
  const { result } = r.problem;
  if (r.gaveUp) return `모르겠음 → ${result.han}판 ${result.payment.total.toLocaleString()}점`;
  const parts: string[] = [];
  if (r.hanOk === false) parts.push(`판수 ${r.myHan}→${result.han}`);
  if (r.fuOk === false) parts.push(`부수 ${r.myFu}→${result.fu}`);
  if (r.scoreOk === false) parts.push(`점수 ${r.myScore || '미입력'}→${result.payment.total.toLocaleString()}`);
  return parts.join(' · ');
}
