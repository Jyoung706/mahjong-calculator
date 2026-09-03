import { TileView } from '../../../components/Tile';
import { MELD_LABELS, type MeldInst, type UiMeldType } from '../useCalculatorState';

interface Props {
  melds: MeldInst[];
  pending: { type: UiMeldType; tiles: { key: number; id: string; red: boolean }[] } | null;
  onTogglePending: (t: UiMeldType) => void;
  onBreakMeld: (key: number) => void;
}

const TYPES: UiMeldType[] = ['chi', 'pon', 'minkan', 'ankan'];

export function MeldSection({ melds, pending, onTogglePending, onBreakMeld }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="section-label">① 부로 <span className="hint">있으면 먼저</span></div>
        <div style={{ display: 'flex', gap: 5 }}>
          {TYPES.map((t) => {
            const on = pending?.type === t;
            return (
              <button key={t} type="button" onClick={() => onTogglePending(t)}
                style={{
                  padding: '6px 10px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                  background: on ? 'var(--accent)' : 'var(--surface)',
                  color: on ? 'var(--surface)' : '#4a463f',
                }}>
                {MELD_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      {pending && (
        <div className="notice">
          {MELD_LABELS[pending.type]} — 패 1개를 탭하면 자동으로 묶입니다{pending.type === 'chi' ? ' (탭한 패부터 연속 3장)' : ''}
        </div>
      )}

      {melds.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {melds.map((m) => (
            <button key={m.key} type="button" onClick={() => onBreakMeld(m.key)}
              style={{ border: '1px solid var(--line)', borderRadius: 9, padding: '6px 7px 5px', background: 'var(--soft)', display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.05em' }}>{MELD_LABELS[m.type]} · 해제</div>
              <div style={{ display: 'flex', gap: 3 }}>
                {m.tiles.map((t) => <TileView key={t.key} id={t.id} red={t.red} size={28} />)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
