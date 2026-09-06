import { useState } from 'react';
import { calcPayment } from '../../../engine/score';
import { Segmented } from '../../components/Segmented';
import { cx } from '../../lib/cx';
import s from './ScoreTablePage.module.css';

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
  if (r.limit) return '만관';
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
  return (
    <div className={`card ${s.wideCard}`}>
      <div className={`mono ${s.wideHead}`}>
        {[4, 3, 2, 1].map((h) => <div key={`d${h}`} className={s.wideHeadHan}>{h}판</div>)}
        <div className={s.wideHeadFu}>부</div>
        {[1, 2, 3, 4].map((h) => <div key={`c${h}`} className={s.wideHeadHan}>{h}판</div>)}
      </div>
      <div className={s.wideSideRow}>
        <div className={s.wideSideCell}>친 (親)</div>
        <div className={s.wideSideFu} />
        <div className={s.wideSideCell}>자 (子)</div>
      </div>
      {FU_ROWS.map((fu) => (
        <div key={fu} className={`mono ${s.wideRow}`}>
          {[4, 3, 2, 1].map((h) => <WideCell key={h} {...bothText(fu, h, true)} />)}
          <div className={s.wideFuCell}>
            <div className={s.wideFuNum}>{fu}</div>
            <div className={s.wideFuNote}>{FU_NOTES[fu] ?? ''}</div>
          </div>
          {[1, 2, 3, 4].map((h) => <WideCell key={h} {...bothText(fu, h, false)} />)}
        </div>
      ))}
      <div className={s.wideNote}>각 칸 위 = 론, 아래 = 쯔모 (친은 전원 동액 "올" / 자는 자/친 지불액)</div>
    </div>
  );
}

function WideCell({ ron, tsumo }: { ron: string; tsumo: string }) {
  return (
    <div className={cx(s.wideCell, ron === '만관' && s.wideCellLimit)}>
      {ron}<div className={s.wideTsumo}>{tsumo}</div>
    </div>
  );
}

/** PC — 만관 이상 (친·자 동시) */
function WideLimits() {
  return (
    <div className={`card ${s.wideCard}`}>
      <div className={`mono ${s.wideLimitHead}`}>
        <div className={s.wideLimitLabel}>만관 이상</div>
        {LIMIT_DEFS.map((l) => (
          <div key={l.name} className={s.wideLimitName}>
            {l.name}<div className={s.wideLimitHan}>{l.han}</div>
          </div>
        ))}
      </div>
      {[true, false].map((isDealer) => (
        <div key={String(isDealer)} className={`mono ${s.wideLimitRow}`}>
          <div className={s.wideLimitSide}>{isDealer ? '친' : '자'}</div>
          {LIMIT_DEFS.map((l) => {
            const t = limitText(l, isDealer);
            return (
              <div key={l.name} className={s.wideLimitVal}>
                {t.ron}<div className={s.wideTsumo}>{t.tsumo}</div>
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
    <div className="page st-container">
      <header className="page-header">
        <button type="button" onClick={onBack} className="back-btn">←</button>
        <div className="page-title">점수표</div>
      </header>

      <div className={`mobile-only ${s.toggles}`}>
        <Segmented options={['child', 'dealer'] as const} labels={['자', '친']} value={side} onChange={setSide} />
        <Segmented options={['ron', 'tsumo'] as const} labels={['론', '쯔모']} value={mode} onChange={setMode} />
      </div>

      <div className={s.body}>
        <div className="wide-only"><WideScoreTable /><WideLimits /></div>

        <div className={`mobile-only card ${s.tableCard}`}>
          <div className={`mono ${s.thead}`}>
            <div className={s.theadFu}>부</div>
            {HANS.map((h) => <div key={h} className={s.theadHan}>{h}판</div>)}
          </div>
          {FU_ROWS.map((fu) => (
            <div key={fu} className={s.row}>
              <div className={s.fuCell}>
                <div className={`mono ${s.fuNum}`}>{fu}</div>
                <div className={s.fuNote}>{FU_NOTES[fu] ?? ''}</div>
              </div>
              {HANS.map((h) => {
                const v = cellText(fu, h, isDealer, isTsumo);
                return (
                  <div key={h} className={cx('mono', s.cell, v === '–' && s.cellBlank, v === '만관' && s.cellLimit)}>{v}</div>
                );
              })}
            </div>
          ))}
        </div>
        <div className={`mobile-only ${s.note}`}>
          쯔모 표기는 자 = 자/친 지불액, 친 = 전원 동액("올"). 기본점이 2000을 넘으면 만관으로 처리합니다.
        </div>

        <div className={`mobile-only ${s.section}`}>
          <div className={s.sectionTitle}>만관 이상</div>
          <div className={`card ${s.tableCard}`}>
            <div className={`mono ${s.limitHead}`}>
              <div className={s.limitHeadCell} style={{ paddingLeft: 10 }}>구간</div>
              <div className={s.limitHeadCell}>판</div>
              <div className={s.limitHeadCenter}>론</div>
              <div className={s.limitHeadCenter}>쯔모</div>
            </div>
            {LIMIT_DEFS.map((def) => {
              const t = limitText(def, isDealer);
              return (
                <div key={def.name} className={s.limitRow}>
                  <div className={s.limitName}>{def.name}</div>
                  <div className={`mono ${s.limitHan}`}>{def.han}</div>
                  <div className={`mono ${s.limitVal}`}>{t.ron}</div>
                  <div className={`mono ${s.limitVal}`}>{t.tsumo}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={s.section}>
          <div className={s.sectionTitle}>부 계산 참고 — 기본 20부에서 가산, 1의 자리 올림</div>
          <div className={`card ${s.refCard}`}>
            <RefGrid title="화료 방식" cols={['', '멘젠', '부로']} rows={[['론', '+10', '0'], ['쯔모', '+2', '+2']]} />
            <div className={s.refHr} />
            <RefGrid title="몸통 — 중장패 / 요구패" cols={['', '중장', '요구']} rows={[['슌쯔', '0', '0'], ['명각', '+2', '+4'], ['안커', '+4', '+8'], ['명깡', '+8', '+16'], ['안깡', '+16', '+32']]} />
            <div className={s.refHr} />
            <div className={s.refCols}>
              <RefPairs title="머리" pairs={[['역패', '+2'], ['객풍', '0'], ['수패', '0']]} />
              <div className={s.refVr} />
              <RefPairs title="대기" pairs={[['양면 · 샤보', '0'], ['칸찬 · 펜찬', '+2'], ['단기', '+2']]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefGrid({ title, cols, rows }: { title: string; cols: string[]; rows: string[][] }) {
  return (
    <div className={s.refGroup}>
      <div className={`mono ${s.refTitle}`}>{title}</div>
      <div className={s.refGrid3}>
        {cols.map((c, i) => <div key={i} className={i ? s.refColHead : s.refRowHead}>{c}</div>)}
        {rows.flatMap((r, i) => r.map((v, j) => (
          <div key={`${i}-${j}`} className={cx(j > 0 && 'mono', j > 0 && s.refVal, v === '0' && s.refZero)}>{v}</div>
        )))}
      </div>
    </div>
  );
}

function RefPairs({ title, pairs }: { title: string; pairs: [string, string][] }) {
  return (
    <div className={s.refGroupGrow}>
      <div className={`mono ${s.refTitle}`}>{title}</div>
      <div className={s.refGridPair}>
        {pairs.flatMap(([k, v]) => [
          <div key={k}>{k}</div>,
          <div key={k + 'v'} className={cx('mono', v === '0' && s.refZero)}>{v}</div>,
        ])}
      </div>
    </div>
  );
}
