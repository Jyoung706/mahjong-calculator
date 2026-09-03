import type { ScoreResult, Wind } from '../../../../engine/types';
import { calcPayment } from '../../../../engine/score';
import { formatTileText } from '../../../lib/tileAssets';

interface Props {
  open: boolean;
  result: ScoreResult | null;
  missing: string;
  isDealer: boolean;
  isTsumo: boolean;
  roundWind: Wind;
  seatWind: Wind;
  onClose: () => void;
}

const GRID_FU = [20, 25, 30, 40, 50, 60];
const GRID_HAN = [1, 2, 3, 4];

export function DetailSheet({ open, result, missing, isDealer, isTsumo, roundWind, seatWind, onClose }: Props) {
  const ok = result?.valid === true;
  return (
    <>
      <div onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(38,36,31,.32)', zIndex: 3, transition: 'opacity .26s ease', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '96%', zIndex: 4, background: 'var(--card)',
        borderRadius: '18px 18px 0 0', boxShadow: '0 -2px 24px rgba(38,36,31,.14)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', transition: 'transform .3s cubic-bezier(.32,.72,0,1)', transform: open ? 'translateY(0)' : 'translateY(101%)',
      }}>
        <div onClick={onClose} style={{ padding: '10px 0 6px', display: 'flex', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: '#d5cfc3' }} />
        </div>
        <div style={{ padding: '2px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-soft)', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>계산 상세</div>
          <div onClick={onClose} style={{ fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>닫기</div>
        </div>

        <div style={{ padding: 18, background: 'var(--surface)', borderBottom: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
          <div className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>
            {ok ? `${result.han}판 ${result.limitName ?? `${result.fu}부`} · ${isDealer ? '친' : '자'} · ${isTsumo ? '쯔모' : '론'}` : '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <div className="mono" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1, letterSpacing: '-.02em' }}>
              {ok ? result.payment.total.toLocaleString() : '––––'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>점</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px 24px' }}>
          {!ok && <div className="notice" style={{ marginBottom: 16, lineHeight: 1.6 }}>{result ? result.error : missing}</div>}

          {ok && result.yakuman.length > 0 && (
            <Block title="성립한 역만" right="">
              {result.yakuman.map((y) => <Line key={y.name} name={y.name} val={y.multiplier > 1 ? '더블' : '역만'} />)}
            </Block>
          )}
          {ok && result.yakuman.length === 0 && (
            <>
              <Block title="성립한 역" right={`합 ${result.han}판`}>
                {result.yaku.map((y) => <Line key={y.name} name={y.name} val={`${y.han}판`} />)}
              </Block>
              <Block title="부 계산" right={`${result.fu}부`}>
                {result.fuBreakdown.map((f, i) => <Line key={i} name={formatTileText(f.label, roundWind, seatWind)} val={`${f.fu}부`} />)}
                <Line name="절상 후" val={`${result.fu}부`} bold />
              </Block>
              <ScoreGrid han={result.han} fu={result.fu} isDealer={isDealer} isTsumo={isTsumo} limited={!!result.limitName} />
            </>
          )}

          <div onClick={onClose}
            style={{ height: 46, borderRadius: 10, background: 'var(--ink)', color: '#f7f6f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            패 수정으로 돌아가기
          </div>
        </div>
      </div>
    </>
  );
}

function Block({ title, right, children }: { title: string; right: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em' }}>{title}</div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{right}</div>
      </div>
      <div className="card" style={{ padding: '2px 13px' }}>{children}</div>
    </div>
  );
}

function Line({ name, val, bold = false }: { name: string; val: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: bold ? 'none' : '1px solid var(--hairline)', fontSize: 13, fontWeight: bold ? 700 : 400 }}>
      <span style={{ color: bold ? 'var(--ink)' : '#4a463f' }}>{name}</span>
      <span className="mono" style={{ color: bold ? 'var(--ink)' : 'var(--muted)' }}>{val}</span>
    </div>
  );
}

/** 점수표 대조 — 엔진 calcPayment로 셀을 동적 생성 */
function ScoreGrid({ han, fu, isDealer, isTsumo, limited }: { han: number; fu: number; isDealer: boolean; isTsumo: boolean; limited: boolean }) {
  const cell = (f: number, h: number) => {
    const r = calcPayment({ han: h, fu: f, yakumanMultiplier: 0, isDealer, isTsumo, honba: 0, riichiSticks: 0, kazoeYakuman: true });
    if (r.limitName) return '만관';
    return isTsumo
      ? (isDealer ? `${r.payment.tsumoFromNonDealer}올` : `${r.payment.tsumoFromNonDealer}/${r.payment.tsumoFromDealer}`)
      : String(r.payment.ron);
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em' }}>점수표 대조</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{limited ? '판수가 높아 고정 점수' : `현재: ${han}판 ${fu}부`}</div>
      </div>
      <div className="card" style={{ padding: 10 }}>
        <div className="mono" style={{ display: 'grid', gridTemplateColumns: '46px repeat(4, 1fr)', fontSize: 11 }}>
          <div style={{ padding: '7px 4px', color: 'var(--muted)' }}>부\판</div>
          {GRID_HAN.map((h) => <div key={h} style={{ padding: '7px 4px', textAlign: 'center', color: 'var(--muted)' }}>{h}판</div>)}
          {GRID_FU.map((f) => (
            <FuRow key={f} f={f} cell={cell} hitHan={limited ? -1 : Math.min(4, han)} hitFu={fu} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FuRow({ f, cell, hitHan, hitFu }: { f: number; cell: (f: number, h: number) => string; hitHan: number; hitFu: number }) {
  return (
    <>
      <div style={{ padding: '7px 4px', color: f === hitFu ? 'var(--ink)' : 'var(--muted)', background: f === hitFu ? 'var(--soft)' : 'transparent', borderRadius: '5px 0 0 5px' }}>{f}</div>
      {GRID_HAN.map((h) => {
        const hit = f === hitFu && h === hitHan;
        const v = f === 20 && h === 1 ? '–' : f === 25 && h === 1 ? '–' : cell(f, h);
        return (
          <div key={h} style={{
            padding: '7px 3px', textAlign: 'center', borderRadius: 5,
            background: hit ? 'var(--accent)' : f === hitFu || h === hitHan ? 'var(--soft)' : 'transparent',
            color: hit ? 'var(--surface)' : v === '만관' ? 'var(--muted)' : 'var(--ink)',
          }}>{v}</div>
        );
      })}
    </>
  );
}
