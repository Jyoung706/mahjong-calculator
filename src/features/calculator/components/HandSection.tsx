import { TileView } from '../../../components/Tile';
import type { TileInst } from '../useCalculatorState';

interface Props {
  hand: TileInst[];
  need: number;
  selected: number[];
  onToggleSelect: (key: number) => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
}

export function HandSection({ hand, need, selected, onToggleSelect, onDeleteSelected, onClearAll }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="section-label">② 손패 <span className="hint">부로 몸통 제외</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="mono" style={{ fontSize: 12, color: hand.length === need ? 'var(--accent)' : 'var(--muted)' }}>
            {hand.length} / {need}
          </div>
          <button type="button" onClick={onClearAll}
            style={{ fontSize: 11, color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline', border: 'none', background: 'none', padding: 0 }}>
            비움
          </button>
        </div>
      </div>

      <div style={{ minHeight: 64, background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 10, padding: 9, display: 'flex', flexWrap: 'wrap', gap: 5, alignContent: 'flex-start' }}>
        {hand.map((t) => (
          <TileView key={t.key} id={t.id} red={t.red} selected={selected.includes(t.key)} onClick={() => onToggleSelect(t.key)} />
        ))}
        {Array.from({ length: Math.max(0, need - hand.length) }, (_, i) => (
          <div key={i} style={{ width: 34, height: 46, borderRadius: 5, border: '1.5px dashed var(--line-soft)' }} />
        ))}
      </div>

      {selected.length > 0 && (
        <button type="button" onClick={onDeleteSelected}
          style={{ padding: '9px 0', textAlign: 'center', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13, color: 'var(--accent)', cursor: 'pointer' }}>
          {selected.length}장 삭제
        </button>
      )}
    </div>
  );
}
