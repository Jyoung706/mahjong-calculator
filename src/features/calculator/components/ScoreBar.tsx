import type { ScoreResult } from '../../../../engine/types';

interface Props {
  result: ScoreResult | null; // null = 입력 미완성
  missing: string;            // 미완성 안내 문구
  isDealer: boolean;
  isTsumo: boolean;
  isMenzen: boolean;
  onOpenSheet: () => void;
}

export function ScoreBar({ result, missing, isDealer, isTsumo, isMenzen, onOpenSheet }: Props) {
  const ok = result?.valid === true;
  const headline = ok
    ? result.payment.total.toLocaleString()
    : result ? '화료 불가' : '––––';
  const sub = ok
    ? `${result.yakuman.length > 0 ? result.limitName : `${result.han}판 ${result.fu}부`}${result.limitName && result.yakuman.length === 0 ? ` · ${result.limitName}` : ''}`
    : result ? result.error : '0판';

  return (
    <div onClick={onOpenSheet}
      style={{ padding: '12px 18px', background: 'var(--ink)', color: '#f7f6f3', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="mono" style={{ fontSize: 11, opacity: 0.6 }}>{sub}</div>
        <div className="mono" style={{ fontSize: 11, opacity: 0.6 }}>
          {isDealer ? '친' : '자'} · {isTsumo ? '쯔모' : '론'} · {isMenzen ? '멘젠' : '부로'}
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, marginTop: 3, color: ok ? '#f7f6f3' : 'rgba(247,246,243,.55)' }}>상세보기 ↑</div>
      </div>
      <div style={{ flex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="mono" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, color: ok ? '#f7f6f3' : '#c4bfb5' }}>{headline}</div>
        <div style={{ fontSize: 10, opacity: 0.55 }}>{result ? (ok ? paymentNote(result, isDealer, isTsumo) : '패 구성을 확인하세요') : missing}</div>
      </div>
    </div>
  );
}

function paymentNote(r: ScoreResult, isDealer: boolean, isTsumo: boolean): string {
  if (!isTsumo) return '방총자에게서 수취';
  if (isDealer) return `전원에게서 각 ${r.payment.tsumoFromNonDealer?.toLocaleString()}`;
  return `자 ${r.payment.tsumoFromNonDealer?.toLocaleString()} · 친 ${r.payment.tsumoFromDealer?.toLocaleString()}`;
}
