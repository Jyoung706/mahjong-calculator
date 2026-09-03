import { useState } from 'react';
import { calcPayment } from '../../../engine/score';
import { Segmented } from '../../components/Segmented';

const FU_ROWS = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
const HANS = [1, 2, 3, 4];
const FU_NOTES: Record<number, string> = { 20: '핑후쯔모', 25: '치토이츠' };

/** 존재하지 않는 조합(빈 칸) 판정 */
function impossible(fu: number, han: number, isTsumo: boolean): boolean {
  if (fu === 20) return !isTsumo || han < 2; // 20부는 핑후 쯔모뿐 (최소 핑후+쯔모 2판)
  if (fu === 25) return han < 2 || (isTsumo && han < 3); // 치토이 2판 + 쯔모 시 +1
  return false;
}

function cellText(fu: number, han: number, isDealer: boolean, isTsumo: boolean): string {
  if (impossible(fu, han, isTsumo)) return '–';
  const r = calcPayment({ han, fu, yakumanMultiplier: 0, isDealer, isTsumo, honba: 0, riichiSticks: 0, kazoeYakuman: true });
  if (r.limitName) return '만관';
  if (!isTsumo) return String(r.payment.ron);
  return isDealer ? `${r.payment.tsumoFromNonDealer}올` : `${r.payment.tsumoFromNonDealer}/${r.payment.tsumoFromDealer}`;
}

const LIMIT_DEFS = [
  { name: '만관', han: '4판40부~5판', calc: { han: 5 } },
  { name: '하네만', han: '6~7판', calc: { han: 6 } },
  { name: '배만', han: '8~10판', calc: { han: 8 } },
  { name: '삼배만', han: '11~12판', calc: { han: 11 } },
  { name: '역만', han: '13판~', calc: { yakuman: 1 } },
];

function limitText(def: (typeof LIMIT_DEFS)[number], isDealer: boolean): { ron: string; tsumo: string } {
  const base = { fu: 30, honba: 0, riichiSticks: 0, kazoeYakuman: true, isDealer, yakumanMultiplier: 'yakuman' in def.calc ? 1 : 0, han: 'han' in def.calc ? def.calc.han! : 0 };
  const ron = calcPayment({ ...base, isTsumo: false });
  const tsumo = calcPayment({ ...base, isTsumo: true });
  return {
    ron: ron.payment.ron!.toLocaleString(),
    tsumo: isDealer
      ? `${tsumo.payment.tsumoFromNonDealer!.toLocaleString()}올`
      : `${tsumo.payment.tsumoFromNonDealer!.toLocaleString()}/${tsumo.payment.tsumoFromDealer!.toLocaleString()}`,
  };
}

function bothText(fu: number, han: number, isDealer: boolean): { ron: string; tsumo: string } {
  return { ron: cellText(fu, han, isDealer, false), tsumo: cellText(fu, han, isDealer, true) };
}

/** PC(와이드) — 친·자를 좌우로 펼친 전체 표 (디자인 06) */
function WideScoreTable() {
  const cols = 'repeat(4, 1fr) 62px repeat(4, 1fr)';
  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
      <div className="mono" style={{ display: 'grid', gridTemplateColumns: cols, background: 'var(--soft)', borderBottom: '1px solid var(--line-soft)', fontSize: 11 }}>
        {[4, 3, 2, 1].map((h) => <div key={`d${h}`} style={{ padding: '7px 4px', textAlign: 'center', color: 'var(--muted)' }}>{h}판</div>)}
        <div style={{ padding: '7px 4px', textAlign: 'center', color: 'var(--ink)', background: '#e6e1d7' }}>부</div>
        {[1, 2, 3, 4].map((h) => <div key={`c${h}`} style={{ padding: '7px 4px', textAlign: 'center', color: 'var(--muted)' }}>{h}판</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: '1px solid var(--line-soft)', fontSize: 12, fontWeight: 700 }}>
        <div style={{ gridColumn: 'span 4', padding: 7, textAlign: 'center', background: '#faf8f4' }}>친 (親)</div>
        <div style={{ background: '#e6e1d7' }} />
        <div style={{ gridColumn: 'span 4', padding: 7, textAlign: 'center', background: '#faf8f4' }}>자 (子)</div>
      </div>
      {FU_ROWS.map((fu) => (
        <div key={fu} className="mono" style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: '1px solid var(--hairline)', fontSize: 11 }}>
          {[4, 3, 2, 1].map((h) => {
            const t = bothText(fu, h, true);
            return (
              <div key={h} style={{ padding: '6px 3px', textAlign: 'center', lineHeight: 1.45, color: t.ron === '만관' ? 'var(--muted)' : 'var(--ink)' }}>
                {t.ron}<div style={{ color: 'var(--muted)' }}>{t.tsumo}</div>
              </div>
            );
          })}
          <div style={{ padding: '6px 3px', textAlign: 'center', background: '#e6e1d7', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{fu}</div>
            <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 8, color: '#6e6a62' }}>{FU_NOTES[fu] ?? ''}</div>
          </div>
          {[1, 2, 3, 4].map((h) => {
            const t = bothText(fu, h, false);
            return (
              <div key={h} style={{ padding: '6px 3px', textAlign: 'center', lineHeight: 1.45, color: t.ron === '만관' ? 'var(--muted)' : 'var(--ink)' }}>
                {t.ron}<div style={{ color: 'var(--muted)' }}>{t.tsumo}</div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--muted)' }}>각 칸 위 = 론, 아래 = 쯔모 (친은 전원 동액 "올" / 자는 자/친 지불액)</div>
    </div>
  );
}

/** PC — 만관 이상 (친·자 동시) */
function WideLimits() {
  const cols = '96px repeat(5, 1fr)';
  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
      <div className="mono" style={{ display: 'grid', gridTemplateColumns: cols, background: 'var(--soft)', borderBottom: '1px solid var(--line-soft)', fontSize: 11 }}>
        <div style={{ padding: '7px 10px', color: 'var(--muted)' }}>만관 이상</div>
        {LIMIT_DEFS.map((l) => (
          <div key={l.name} style={{ padding: '7px 4px', textAlign: 'center', color: 'var(--ink)', fontWeight: 500 }}>
            {l.name}<div style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 10 }}>{l.han}</div>
          </div>
        ))}
      </div>
      {[true, false].map((isDealer) => (
        <div key={String(isDealer)} className="mono" style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: '1px solid var(--hairline)', fontSize: 11 }}>
          <div style={{ padding: '8px 10px', fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, fontWeight: 700 }}>{isDealer ? '친' : '자'}</div>
          {LIMIT_DEFS.map((l) => {
            const t = limitText(l, isDealer);
            return (
              <div key={l.name} style={{ padding: '8px 4px', textAlign: 'center', lineHeight: 1.45 }}>
                {t.ron}<div style={{ color: 'var(--muted)' }}>{t.tsumo}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function ScoreTablePage({ onBack }: { onBack: () => void }) {
  const [side, setSide] = useState<'child' | 'dealer'>('child');
  const [mode, setMode] = useState<'ron' | 'tsumo'>('ron');
  const isDealer = side === 'dealer';
  const isTsumo = mode === 'tsumo';

  return (
    <div className="st-container" style={{ margin: '0 auto', height: '100dvh', background: 'var(--card)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '14px 18px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line-soft)', background: 'var(--surface)' }}>
        <button type="button" onClick={onBack} style={{ border: 'none', background: 'none', fontSize: 15, color: 'var(--muted)', cursor: 'pointer', padding: 0 }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>점수표</div>
      </header>

      <div className="mobile-only" style={{ padding: '12px 14px', display: 'flex', gap: 8, background: 'var(--surface)', borderBottom: '1px solid var(--line-soft)' }}>
        <Segmented options={['child', 'dealer'] as const} labels={['자', '친']} value={side} onChange={setSide} />
        <Segmented options={['ron', 'tsumo'] as const} labels={['론', '쯔모']} value={mode} onChange={setMode} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 14px 20px' }}>
        <div className="wide-only"><WideScoreTable /><WideLimits /></div>
        <div className="mobile-only card" style={{ overflow: 'hidden' }}>
          <div className="mono" style={{ display: 'grid', gridTemplateColumns: '58px repeat(4, 1fr)', fontSize: 12, background: 'var(--soft)', borderBottom: '1px solid var(--line-soft)' }}>
            <div style={{ padding: '9px 8px', color: 'var(--muted)' }}>부</div>
            {HANS.map((h) => <div key={h} style={{ padding: '9px 4px', textAlign: 'center', color: '#4a463f' }}>{h}판</div>)}
          </div>
          {FU_ROWS.map((fu) => (
            <div key={fu} style={{ display: 'grid', gridTemplateColumns: '58px repeat(4, 1fr)', borderBottom: '1px solid var(--hairline)', alignItems: 'stretch' }}>
              <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 1, background: '#faf8f4' }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{fu}</div>
                <div style={{ fontSize: 9, color: 'var(--faint)' }}>{FU_NOTES[fu] ?? ''}</div>
              </div>
              {HANS.map((h) => {
                const v = cellText(fu, h, isDealer, isTsumo);
                return (
                  <div key={h} className="mono" style={{
                    padding: '9px 3px', textAlign: 'center', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: v === '–' ? '#c9c3b7' : v === '만관' ? 'var(--muted)' : 'var(--ink)',
                    background: v === '만관' ? 'var(--soft)' : 'transparent',
                  }}>{v}</div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mobile-only" style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, margin: '16px 0' }}>
          쯔모 표기는 자 = 자/친 지불액, 친 = 전원 동액("올"). 기본점이 2000을 넘으면 만관으로 처리합니다.
        </div>

        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em' }}>만관 이상</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="mono" style={{ display: 'grid', gridTemplateColumns: '1fr 74px 96px 96px', fontSize: 11, background: 'var(--soft)', borderBottom: '1px solid var(--line-soft)' }}>
              <div style={{ padding: '8px 10px', color: 'var(--muted)' }}>구간</div>
              <div style={{ padding: '8px 4px', color: 'var(--muted)' }}>판</div>
              <div style={{ padding: '8px 4px', textAlign: 'center', color: '#4a463f' }}>론</div>
              <div style={{ padding: '8px 4px', textAlign: 'center', color: '#4a463f' }}>쯔모</div>
            </div>
            {LIMIT_DEFS.map((def) => {
              const t = limitText(def, isDealer);
              return (
                <div key={def.name} style={{ display: 'grid', gridTemplateColumns: '1fr 74px 96px 96px', borderBottom: '1px solid var(--hairline)', alignItems: 'center' }}>
                  <div style={{ padding: '9px 10px', fontSize: 13, fontWeight: 500 }}>{def.name}</div>
                  <div className="mono" style={{ padding: '9px 4px', fontSize: 10, color: 'var(--muted)' }}>{def.han}</div>
                  <div className="mono" style={{ padding: '7px 4px', textAlign: 'center', fontSize: 11 }}>{t.ron}</div>
                  <div className="mono" style={{ padding: '7px 4px', textAlign: 'center', fontSize: 11 }}>{t.tsumo}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em' }}>부 계산 참고 — 기본 20부에서 가산, 1의 자리 올림</div>
          <div className="card" style={{ padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <RefGrid title="화료 방식" cols={['', '멘젠', '부로']} rows={[['론', '+10', '0'], ['쯔모', '+2', '+2']]} />
            <Hr />
            <RefGrid title="몸통 — 중장패 / 요구패" cols={['', '중장', '요구']} rows={[['슌쯔', '0', '0'], ['명각', '+2', '+4'], ['안커', '+4', '+8'], ['명깡', '+8', '+16'], ['안깡', '+16', '+32']]} />
            <Hr />
            <div style={{ display: 'flex', gap: 16 }}>
              <RefPairs title="머리" pairs={[['역패', '+2'], ['객풍', '0'], ['수패', '0']]} />
              <div style={{ width: 1, background: 'var(--hairline)' }} />
              <RefPairs title="대기" pairs={[['양면 · 샤보', '0'], ['칸찬 · 펜찬', '+2'], ['단기', '+2']]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Hr = () => <div style={{ height: 1, background: 'var(--hairline)' }} />;

function RefGrid({ title, cols, rows }: { title: string; cols: string[]; rows: string[][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '.05em' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, fontSize: 12 }}>
        {cols.map((c, i) => <div key={i} style={{ textAlign: i ? 'center' : 'left', color: 'var(--muted)', fontSize: 10 }}>{c}</div>)}
        {rows.flatMap((r, i) => r.map((v, j) => (
          <div key={`${i}-${j}`} className={j ? 'mono' : ''} style={{ textAlign: j ? 'center' : 'left', color: v === '0' ? 'var(--muted)' : 'var(--ink)' }}>{v}</div>
        )))}
      </div>
    </div>
  );
}

function RefPairs({ title, pairs }: { title: string; pairs: [string, string][] }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '.05em' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 8px', fontSize: 12 }}>
        {pairs.flatMap(([k, v]) => [
          <div key={k}>{k}</div>,
          <div key={k + 'v'} className="mono" style={{ color: v === '0' ? 'var(--muted)' : 'var(--ink)' }}>{v}</div>,
        ])}
      </div>
    </div>
  );
}
