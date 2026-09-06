import type { ScoreResult } from '../../../../engine/types';
import { errorLabel, LIMIT_LABEL } from '../../../lib/scoreLabels';
import { cx } from '../../../lib/cx';
import s from './ScoreBar.module.css';

interface Props {
  result: ScoreResult | null; // null = 입력 미완성
  missing: string;            // 미완성 안내 문구
  isDealer: boolean;
  isTsumo: boolean;
  isMenzen: boolean;
  honba: number;
  riichiSticks: number;
  onOpenSheet: () => void;
}

export function ScoreBar({ result, missing, isDealer, isTsumo, isMenzen, honba, riichiSticks, onOpenSheet }: Props) {
  const ok = result?.valid === true;
  const headline = ok ? result.payment.total.toLocaleString() : result ? '화료 불가' : '––––';
  const limit = ok && result.limit ? LIMIT_LABEL[result.limit] : null;
  const sub = ok
    ? `${result.yakuman.length > 0 ? limit : `${result.han}판 ${result.fu}부`}${limit && result.yakuman.length === 0 ? ` · ${limit}` : ''}`
    : result?.error ? errorLabel(result.error) : '0판';

  return (
    <div onClick={onOpenSheet} className={s.bar}>
      <div className={s.left}>
        <div className={`mono ${s.sub}`}>{sub}</div>
        <div className={`mono ${s.sub}`}>
          {isDealer ? '친' : '자'} · {isTsumo ? '쯔모' : '론'} · {isMenzen ? '멘젠' : '부로'}
          {honba > 0 && ` · ${honba}본장`}
          {riichiSticks > 0 && ` · 리치봉 ${riichiSticks}`}
        </div>
        <div className={cx(s.cta, !ok && s.ctaDim)}>상세보기 ↑</div>
      </div>
      <div className={s.right}>
        <div className={cx('mono', s.headline, !ok && s.headlineDim)}>{headline}</div>
        <div className={s.note}>{result ? (ok ? paymentNote(result, isDealer, isTsumo) : '패 구성을 확인하세요') : missing}</div>
      </div>
    </div>
  );
}

/** 총점만으로는 몇 점씩 받는지 알 수 없다. 쯔모는 지불 단위가 사람마다 다르다 */
function paymentNote(r: ScoreResult, isDealer: boolean, isTsumo: boolean): string {
  const n = (v?: number) => v?.toLocaleString() ?? '-';
  if (!isTsumo) return `방총자에게서 ${n(r.payment.ron)}`;
  if (isDealer) return `자 3명에게서 각 ${n(r.payment.tsumoFromNonDealer)}`;
  return `자 각 ${n(r.payment.tsumoFromNonDealer)} · 친 ${n(r.payment.tsumoFromDealer)}`;
}
