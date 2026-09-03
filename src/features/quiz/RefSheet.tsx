import { useState } from 'react';
import { calcPayment } from '../../../engine/score';
import { ScoreGrid } from '../../components/ScoreGrid';
import { Segmented } from '../../components/Segmented';
import { cx } from '../../lib/cx';
import s from './RefSheet.module.css';

interface Props {
  open: boolean;
  isTsumo: boolean;
  onClose: () => void;
}

const LIMITS = [
  { name: '만관', han: 5 },
  { name: '하네만', han: 6 },
  { name: '배만', han: 8 },
  { name: '삼배만', han: 11 },
  { name: '역만', han: 0, yakuman: 1 },
];

/** 퀴즈용 참고 점수표 — 론/쯔모는 문제에 명시된 값, 친/자는 힌트가 되지 않도록 사용자가 선택 */
export function RefSheet({ open, isTsumo, onClose }: Props) {
  const [side, setSide] = useState<'child' | 'dealer'>('child');
  const isDealer = side === 'dealer';
  return (
    <>
      <div onClick={onClose} className={cx(s.backdrop, open && s.backdropOpen)} />
      <div className={cx(s.sheet, open && s.sheetOpen)}>
        <div onClick={onClose} className={s.handle}><div className={s.handleBar} /></div>
        <div className={s.head}>
          <div className={s.title}>점수표</div>
          <div className={s.sub}>{isTsumo ? '쯔모' : '론'} 기준</div>
          <div onClick={onClose} className={s.close}>닫기</div>
        </div>
        <div className={s.body}>
          <div className={s.sideToggle}>
            <Segmented options={['child', 'dealer'] as const} labels={['자', '친']} value={side} onChange={setSide} />
          </div>
          <ScoreGrid han={0} fu={0} isDealer={isDealer} isTsumo={isTsumo} limited />
          <div className={`card ${s.limits}`}>
            {LIMITS.map((l) => {
              const r = calcPayment({
                han: l.han, fu: 30, yakumanMultiplier: l.yakuman ?? 0,
                isDealer, isTsumo, honba: 0, riichiSticks: 0, kazoeYakuman: true,
              });
              const val = isTsumo
                ? (isDealer ? `${r.payment.tsumoFromNonDealer?.toLocaleString()}올` : `${r.payment.tsumoFromNonDealer?.toLocaleString()}/${r.payment.tsumoFromDealer?.toLocaleString()}`)
                : r.payment.ron?.toLocaleString();
              return (
                <div key={l.name} className={s.limitRow}>
                  <span className={s.limitName}>{l.name}</span>
                  <span className={`mono ${s.limitVal}`}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
