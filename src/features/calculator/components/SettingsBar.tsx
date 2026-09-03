import type { Wind } from '../../../../engine/types';
import { Segmented } from '../../../components/Segmented';
import { TileView } from '../../../components/Tile';
import { WIND_LABELS } from '../../../lib/tileAssets';
import type { TileInst, Target } from '../useCalculatorState';

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
    <div style={{ padding: '12px 18px', background: 'var(--surface)', borderBottom: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        <button
          type="button"
          onClick={() => p.onPatch({ riichi: !p.riichi })}
          style={{
            height: 32, padding: '0 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
            border: `1px solid ${p.riichi ? 'var(--accent)' : 'var(--line)'}`,
            background: p.riichi ? 'var(--accent-bg)' : 'var(--surface)',
            color: p.riichi ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          리치
        </button>
      </Row>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <IndicatorSlots label="도라 표시패" which="dora" tiles={p.doraInd} active={p.target === 'dora'} {...p} />
        {p.riichi && <IndicatorSlots label="우라도라 표시패" which="ura" tiles={p.uraInd} active={p.target === 'ura'} {...p} />}
        <div className="mono" style={{ flex: 1, textAlign: 'right', fontSize: 11, color: 'var(--muted)', paddingTop: 18 }}>{p.doraHan}</div>
      </div>

      {p.target !== 'hand' && (
        <div className="notice">{p.target === 'dora' ? '도라' : '우라도라'} 표시패로 지정할 패를 아래 패널에서 탭하세요</div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', width: 44, flexShrink: 0 }}>{label}</div>
      {children}
    </div>
  );
}

function IndicatorSlots({ label, which, tiles, active, onSetTarget, onRemoveIndicator }: {
  label: string; which: 'dora' | 'ura'; tiles: TileInst[]; active: boolean;
  onSetTarget: (t: Target) => void; onRemoveIndicator: (which: 'dora' | 'ura', key: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {tiles.map((t) => (
          <TileView key={t.key} id={t.id} red={t.red} size={30} onClick={() => onRemoveIndicator(which, t.key)} />
        ))}
        <button
          type="button"
          onClick={() => onSetTarget(which)}
          style={{
            width: 30, height: 40, borderRadius: 5, cursor: 'pointer', fontSize: 16, background: 'transparent',
            border: `1.5px dashed ${active ? 'var(--accent)' : 'var(--line)'}`,
            color: active ? 'var(--accent)' : '#c9c3b7',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
