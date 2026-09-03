import type { Wind } from '../../../../engine/types';
import { Segmented } from '../../../components/Segmented';
import { TileView } from '../../../components/Tile';
import { WIND_LABELS } from '../../../lib/tileAssets';
import type { TileInst, Target } from '../useCalculatorState';
import { cx } from '../../../lib/cx';
import s from './SettingsBar.module.css';

const WINDS = ['1z', '2z', '3z', '4z'] as const;

interface Props {
  roundWind: Wind;
  seatWind: Wind;
  isTsumo: boolean;
  riichi: boolean;
  doraInd: TileInst[];
  uraInd: TileInst[];
  target: Target;
  doraHan: string;
  onPatch: (p: Partial<{ roundWind: Wind; seatWind: Wind; isTsumo: boolean; riichi: boolean }>) => void;
  onSetTarget: (t: Target) => void;
  onRemoveIndicator: (which: 'dora' | 'ura', key: number) => void;
}

export function SettingsBar(p: Props) {
  return (
    <div className={s.wrap}>
      <Row label="장풍">
        <Segmented options={WINDS} labels={WIND_LABELS} value={p.roundWind} onChange={(v) => p.onPatch({ roundWind: v })} />
      </Row>
      <Row label="내 바람">
        <Segmented options={WINDS} labels={WIND_LABELS} value={p.seatWind} onChange={(v) => p.onPatch({ seatWind: v })} />
      </Row>
      <Row label="화료">
        <Segmented
          options={['ron', 'tsumo'] as const}
          labels={['론', '쯔모']}
          value={p.isTsumo ? 'tsumo' : 'ron'}
          onChange={(v) => p.onPatch({ isTsumo: v === 'tsumo' })}
        />
        <button type="button" onClick={() => p.onPatch({ riichi: !p.riichi })} className={cx(s.riichiBtn, p.riichi && s.riichiOn)}>
          리치
        </button>
      </Row>

      <div className={s.indicators}>
        <IndicatorSlots label="도라 표시패" which="dora" tiles={p.doraInd} active={p.target === 'dora'} {...p} />
        {p.riichi && <IndicatorSlots label="우라도라 표시패" which="ura" tiles={p.uraInd} active={p.target === 'ura'} {...p} />}
        <div className={`mono ${s.doraHan}`}>{p.doraHan}</div>
      </div>

      {p.target !== 'hand' && (
        <div className="notice">{p.target === 'dora' ? '도라' : '우라도라'} 표시패로 지정할 패를 아래 패널에서 탭하세요</div>
      )}
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
