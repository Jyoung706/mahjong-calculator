import { useMemo, useState } from 'react';
import { calculateScore } from '../../../engine';
import { decompose } from '../../../engine/decompose';
import { ALL_TILES } from '../../../engine/tiles';
import type { Rules } from '../../../engine/types';
import type { ContactAttachment } from '../contact/types';
import { useCalculatorState, toWinInput } from './useCalculatorState';
import { SettingsBar } from './components/SettingsBar';
import { MeldSection } from './components/MeldSection';
import { HandSection } from './components/HandSection';
import { WinTileSection } from './components/WinTileSection';
import { ScoreBar } from './components/ScoreBar';
import { DetailSheet } from './components/DetailSheet';
import { TilePanel } from './components/TilePanel';
import s from './CalculatorPage.module.css';

export function CalculatorPage({ rules, onBack, onContact }: {
  rules: Rules;
  onBack: () => void;
  onContact: (attachment: ContactAttachment) => void;
}) {
  const c = useCalculatorState();
  const { state: st } = c;
  const [sheet, setSheet] = useState(false);

  // 입력이 완성되는 순간 엔진이 즉시 계산 — 이 useMemo가 "실시간 점수"의 전부
  const result = useMemo(() => (c.ready ? calculateScore(toWinInput(st), rules) : null), [c.ready, st, rules]);

  // 손패가 다 차면 엔진 decompose로 대기패(화료 가능한 패) 목록을 미리 계산
  const awaiting = st.hand.length === c.handNeed && !st.winTile;
  const waits = useMemo(() => {
    if (!awaiting) return null;
    const hand = st.hand.map((t) => t.id);
    const melds = st.melds.map((m) => ({ type: m.type, tiles: m.tiles.map((t) => t.id).sort() }));
    return ALL_TILES.filter((t) => c.countOf(t) < 4 && decompose([...hand, t], melds).length > 0);
  }, [awaiting, st.hand, st.melds]);

  // 문의 첨부 — 완성된 입력이면 손패·결과까지, 아니면 룰만
  const buildAttachment = (): ContactAttachment =>
    c.ready && result
      ? { kind: 'calculation', rules, input: toWinInput(st), result }
      : { kind: 'rules', rules };

  const missing = st.hand.length < c.handNeed ? `손패 ${c.handNeed - st.hand.length}장 더 입력` : '화료패 1장을 지정하세요';
  const isDealer = st.seatWind === '1z';
  const isMenzen = st.melds.every((m) => m.type === 'ankan');
  const doraHan = result?.valid
    ? result.yaku.filter((y) => ['도라', '우라도라', '적도라'].includes(y.name)).map((y) => `${y.name} ${y.han}`).join(' · ') || '도라 없음'
    : '';

  return (
    <div className={`page ${s.page}`}>
      <header className="page-header">
        <div className={s.headerLeft}>
          <button type="button" onClick={onBack} className="back-btn">←</button>
          <div className="page-title">점수 계산</div>
        </div>
        <button type="button" onClick={c.resetAll} className={s.resetBtn}>초기화</button>
      </header>

      <SettingsBar
        roundWind={st.roundWind} seatWind={st.seatWind} isTsumo={st.isTsumo} riichi={st.riichi}
        doraInd={st.doraInd} uraInd={st.uraInd} target={st.target} doraHan={doraHan}
        onPatch={c.patch} onSetTarget={c.setTarget} onRemoveIndicator={c.removeIndicator}
      />

      <main className={s.main}>
        <MeldSection melds={st.melds} pending={st.pending} onTogglePending={c.togglePending} onBreakMeld={c.breakMeld} />
        <HandSection
          hand={st.hand} need={c.handNeed} selected={st.selected}
          onToggleSelect={c.toggleSelect} onDeleteSelected={c.deleteSelected} onClearAll={c.clearAll}
        />
        <WinTileSection winTile={st.winTile} isTsumo={st.isTsumo} awaiting={awaiting} waits={waits} onClear={c.clearWin} onPick={(id) => c.tapPanel(id, false)} />
      </main>

      <ScoreBar result={result} missing={missing} isDealer={isDealer} isTsumo={st.isTsumo} isMenzen={isMenzen} onOpenSheet={() => setSheet(true)} />
      <TilePanel countOf={c.countOf} redUsed={c.redUsed} onTap={c.tapPanel} />

      <DetailSheet open={sheet} result={result} missing={missing} isDealer={isDealer} isTsumo={st.isTsumo} roundWind={st.roundWind} seatWind={st.seatWind} onClose={() => setSheet(false)} onContact={() => onContact(buildAttachment())} />
    </div>
  );
}
