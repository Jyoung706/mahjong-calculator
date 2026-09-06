import { useRef, useState } from 'react';
import type { Wind } from '../../../../engine/types';
import { Segmented } from '../../../components/Segmented';
import { TileView } from '../../../components/Tile';
import { WIND_LABELS } from '../../../lib/tileAssets';
import { SITUATIONS, isMenzen, sticksOnTable, type CalcState, type SituationKey, type TileInst, type Target } from '../useCalculatorState';
import { cx } from '../../../lib/cx';
import s from './SettingsBar.module.css';

const WINDS = ['1z', '2z', '3z', '4z'] as const;
const MAX_COUNT = 99;
const SWIPE = 24; // 이 이상 세로로 끌면 열고 닫는다

interface Props {
  st: CalcState;
  doraHan: string;
  onPatch: (p: Partial<{ roundWind: Wind; seatWind: Wind; isTsumo: boolean; riichi: boolean; honba: number; riichiSticks: number }>) => void;
  onToggleSituation: (key: SituationKey) => void;
  onSetTarget: (t: Target) => void;
  onRemoveIndicator: (which: 'dora' | 'ura', key: number) => void;
}

/**
 * 접힌 상태가 기본. 화면 대부분은 패를 넣는 데 쓰이고, 설정은 한 판에 한두 번만
 * 건드리므로 요약 줄로 접어 두고 필요할 때만 펼친다.
 */
export function SettingsBar({ st, doraHan, onPatch, onToggleSituation, onSetTarget, onRemoveIndicator }: Props) {
  const [open, setOpen] = useState(false);
  const startY = useRef<number | null>(null);
  const menzen = isMenzen(st);
  const picking = st.target !== 'hand';

  const onTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const from = startY.current;
    startY.current = null;
    if (from === null) return;
    const dy = e.changedTouches[0].clientY - from;
    if (dy > SWIPE) setOpen(true);
    else if (dy < -SWIPE) setOpen(false);
  };

  return (
    <div className={s.shell}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={cx(s.summary, open && s.summaryOpen)}
      >
        <div className={`mono ${s.summaryText}`}>{summarize(st)}</div>
        <div className={s.summaryCta}>{open ? '접기 ⌃' : '설정 ⌄'}</div>
      </button>

      <div className={cx(s.panel, open && s.panelOpen)}>
        <div className={s.wrap}>
          <Row label="장풍">
            <Segmented options={WINDS} labels={WIND_LABELS} value={st.roundWind} onChange={(v) => onPatch({ roundWind: v })} />
          </Row>
          <Row label="내 바람">
            <Segmented options={WINDS} labels={WIND_LABELS} value={st.seatWind} onChange={(v) => onPatch({ seatWind: v })} />
          </Row>
          <Row label="화료">
            <Segmented
              options={['ron', 'tsumo'] as const}
              labels={['론', '쯔모']}
              value={st.isTsumo ? 'tsumo' : 'ron'}
              onChange={(v) => onPatch({ isTsumo: v === 'tsumo' })}
            />
            <button
              type="button"
              disabled={!menzen}
              onClick={() => onPatch({ riichi: !st.riichi })}
              className={cx(s.riichiBtn, st.riichi && s.riichiOn)}
            >
              리치
            </button>
          </Row>
          {!menzen && <div className={s.hint}>부로한 손패로는 리치를 걸 수 없습니다</div>}

          <Row label="상황역">
            <div className={s.chips}>
              {SITUATIONS.filter((x) => x.show(st)).map((x) => {
                const blocked = !x.ok(st);
                return (
                  <button
                    key={x.key}
                    type="button"
                    disabled={blocked}
                    title={x.hint}
                    onClick={() => onToggleSituation(x.key)}
                    className={cx(s.chip, st[x.key] && s.chipOn)}
                  >
                    {x.label}
                    {blocked && x.need && <span className={s.chipNeed}>{x.need(st)}</span>}
                  </button>
                );
              })}
            </div>
          </Row>

          <Row label="본장">
            <Stepper value={st.honba} onChange={(v) => onPatch({ honba: v })} />
            <div className={s.inlineLabel}>남의 리치봉</div>
            <Stepper value={st.riichiSticks} onChange={(v) => onPatch({ riichiSticks: v })} />
          </Row>
          {st.riichi && <div className={s.hint}>본인 리치봉 1개는 자동으로 포함됩니다 — 다른 사람이 낸 것만 세어 주세요</div>}

          <div className={s.indicators}>
            <IndicatorSlots
              label="도라 표시패" which="dora" tiles={st.doraInd} active={st.target === 'dora'}
              onSetTarget={onSetTarget} onRemoveIndicator={onRemoveIndicator}
            />
            {st.riichi && (
              <IndicatorSlots
                label="우라도라 표시패" which="ura" tiles={st.uraInd} active={st.target === 'ura'}
                onSetTarget={onSetTarget} onRemoveIndicator={onRemoveIndicator}
              />
            )}
            <div className={`mono ${s.doraHan}`}>{doraHan}</div>
          </div>

          <div onClick={() => setOpen(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className={s.handle}>
            <div className={s.handleBar} />
          </div>
        </div>
      </div>

      {/* 표시패를 고르는 중이면 접혀 있어도 안내가 보여야 한다 */}
      {picking && (
        <div className={`notice ${s.pickNotice}`}>
          {st.target === 'dora' ? '도라' : '우라도라'} 표시패로 지정할 패를 아래 패널에서 탭하세요
        </div>
      )}
    </div>
  );
}

/** 접힌 줄에 들어갈 요약 — 기본값은 굳이 적지 않고 바꾼 것만 드러낸다 */
function summarize(st: CalcState): string {
  const parts = [`${WIND_LABELS[Number(st.roundWind[0]) - 1]}장 ${WIND_LABELS[Number(st.seatWind[0]) - 1]}가`];
  parts.push([st.isTsumo ? '쯔모' : '론', st.riichi && '리치'].filter(Boolean).join(' '));

  const situations = SITUATIONS.filter((x) => st[x.key]).map((x) => x.label);
  if (situations.length > 0) parts.push(situations.join(' '));

  const sticks = sticksOnTable(st);
  const counters = [st.honba > 0 && `${st.honba}본장`, sticks > 0 && `리치봉 ${sticks}`].filter(Boolean);
  if (counters.length > 0) parts.push(counters.join(' '));

  const indicators = st.doraInd.length + st.uraInd.length;
  parts.push(indicators > 0 ? `도라표시 ${indicators}` : '도라 없음');
  return parts.join(' · ');
}

/** 본장·리치봉처럼 0부터 세는 값의 증감 입력 */
function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const step = (d: number) => onChange(Math.min(MAX_COUNT, Math.max(0, value + d)));
  return (
    <div className={s.stepper}>
      <button type="button" onClick={() => step(-1)} disabled={value === 0} className={s.stepBtn}>−</button>
      <div className={cx('mono', s.stepValue, value > 0 && s.stepValueOn)}>{value}</div>
      <button type="button" onClick={() => step(1)} disabled={value === MAX_COUNT} className={s.stepBtn}>+</button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={s.row}>
      <div className={s.rowLabel}>{label}</div>
      {children}
    </div>
  );
}

function IndicatorSlots({ label, which, tiles, active, onSetTarget, onRemoveIndicator }: {
  label: string; which: 'dora' | 'ura'; tiles: TileInst[]; active: boolean;
  onSetTarget: (t: Target) => void; onRemoveIndicator: (which: 'dora' | 'ura', key: number) => void;
}) {
  return (
    <div className={s.slots}>
      <div className={s.slotLabel}>{label}</div>
      <div className={s.slotRow}>
        {tiles.map((t) => (
          <TileView key={t.key} id={t.id} red={t.red} size={30} onClick={() => onRemoveIndicator(which, t.key)} />
        ))}
        <button type="button" onClick={() => onSetTarget(which)} className={cx(s.addBtn, active && s.addActive)}>+</button>
      </div>
    </div>
  );
}
