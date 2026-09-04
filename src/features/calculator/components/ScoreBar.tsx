import type { ScoreResult } from '../../../../engine/types';
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
  const sub = ok
    ? `${result.yakuman.length > 0 ? result.limitName : `${result.han}판 ${result.fu}부`}${result.limitName && result.yakuman.length === 0 ? ` · ${result.limitName}` : ''}`
    : result ? result.error : '0판';

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

function paymentNote(r: ScoreResult, isDealer: boolean, isTsumo: boolean): string {
  if (!isTsumo) return '방총자에게서 수취';
  if (isDealer) return `전원에게서 각 ${r.payment.tsumoFromNonDealer?.toLocaleString()}`;
  return `자 ${r.payment.tsumoFromNonDealer?.toLocaleString()} · 친 ${r.payment.tsumoFromDealer?.toLocaleString()}`;
}
