import { useMemo, useState } from 'react';
import { calculateScore } from '../../../engine';
import { decompose } from '../../../engine/decompose';
import { ALL_TILES } from '../../../engine/tiles';
import { useCalculatorState, toWinInput } from './useCalculatorState';
import { SettingsBar } from './components/SettingsBar';
import { MeldSection } from './components/MeldSection';
import { HandSection } from './components/HandSection';
import { WinTileSection } from './components/WinTileSection';
import { ScoreBar } from './components/ScoreBar';
import { DetailSheet } from './components/DetailSheet';
import { TilePanel } from './components/TilePanel';

import type { Rules } from '../../../engine/types';

export function CalculatorPage({ rules, onBack }: { rules: Rules; onBack: () => void }) {
  const c = useCalculatorState();
  const { state: s } = c;
  const [sheet, setSheet] = useState(false);

  // 입력이 완성되는 순간 엔진이 즉시 계산 — 이 useMemo가 "실시간 점수"의 전부
  const result = useMemo(() => (c.ready ? calculateScore(toWinInput(s), rules) : null), [c.ready, s, rules]);

  // 손패가 다 차면 엔진 decompose로 대기패(화료 가능한 패) 목록을 미리 계산
  const awaiting = s.hand.length === c.handNeed && !s.winTile;
  const waits = useMemo(() => {
    if (!awaiting) return null;
    const hand = s.hand.map((t) => t.id);
    const melds = s.melds.map((m) => ({ type: m.type, tiles: m.tiles.map((t) => t.id).sort() }));
    return ALL_TILES.filter((t) => c.countOf(t) < 4 && decompose([...hand, t], melds).length > 0);
  }, [awaiting, s.hand, s.melds]);

  const missing =
    s.hand.length < c.handNeed
      ? `손패 ${c.handNeed - s.hand.length}장 더 입력`
      : '화료패 1장을 지정하세요';

  const isDealer = s.seatWind === '1z';
  const isMenzen = s.melds.every((m) => m.type === 'ankan');
  const doraHan = result?.valid
    ? result.yaku.filter((y) => ['도라', '우라도라', '적도라'].includes(y.name)).map((y) => `${y.name} ${y.han}`).join(' · ') || '도라 없음'
    : '';

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', height: '100dvh', background: 'var(--card)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <header style={{ padding: '14px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-soft)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={onBack} style={{ border: 'none', background: 'none', fontSize: 15, color: 'var(--muted)', cursor: 'pointer', padding: 0 }}>←</button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>점수 계산</div>
        </div>
        <button
          type="button"
          onClick={c.resetAll}
          style={{ height: 30, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface)', fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}
        >
          초기화
        </button>
      </header>

      <SettingsBar
        roundWind={s.roundWind} seatWind={s.seatWind} isTsumo={s.isTsumo} riichi={s.riichi}
        doraInd={s.doraInd} uraInd={s.uraInd} target={s.target} doraHan={doraHan}
        onPatch={c.patch} onSetTarget={c.setTarget} onRemoveIndicator={c.removeIndicator}
      />

      <main style={{ flex: 1, overflow: 'auto', padding: '14px 18px 8px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
        <MeldSection melds={s.melds} pending={s.pending} onTogglePending={c.togglePending} onBreakMeld={c.breakMeld} />
        <HandSection
          hand={s.hand} need={c.handNeed} selected={s.selected}
          onToggleSelect={c.toggleSelect} onDeleteSelected={c.deleteSelected} onClearAll={c.clearAll}
        />
        <WinTileSection winTile={s.winTile} isTsumo={s.isTsumo} awaiting={awaiting} waits={waits} onClear={c.clearWin} onPick={(id) => c.tapPanel(id, false)} />
      </main>

      <ScoreBar result={result} missing={missing} isDealer={isDealer} isTsumo={s.isTsumo} isMenzen={isMenzen} onOpenSheet={() => setSheet(true)} />
      <TilePanel countOf={c.countOf} onTap={c.tapPanel} />

      <DetailSheet open={sheet} result={result} missing={missing} isDealer={isDealer} isTsumo={s.isTsumo} roundWind={s.roundWind} seatWind={s.seatWind} onClose={() => setSheet(false)} />
    </div>
  );
}
