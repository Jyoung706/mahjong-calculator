import { TileView } from '../../../components/Tile';
import { MELD_LABELS, type MeldInst, type UiMeldType } from '../useCalculatorState';
import { cx } from '../../../lib/cx';
import s from './MeldSection.module.css';

interface Props {
  melds: MeldInst[];
  pending: { type: UiMeldType } | null;
  onTogglePending: (t: UiMeldType) => void;
  onBreakMeld: (key: number) => void;
}

const TYPES: UiMeldType[] = ['chi', 'pon', 'minkan', 'ankan'];

export function MeldSection({ melds, pending, onTogglePending, onBreakMeld }: Props) {
  return (
    <div className={s.wrap}>
      <div className={s.head}>
        <div className="section-label">① 부로 <span className="hint">있으면 먼저</span></div>
        <div className={s.chips}>
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => onTogglePending(t)} className={cx(s.chip, pending?.type === t && s.chipOn)}>
              {MELD_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {pending && (
        <div className="notice">
          {MELD_LABELS[pending.type]} — 패 1개를 탭하면 자동으로 묶입니다{pending.type === 'chi' ? ' (탭한 패부터 연속 3장)' : ''}
        </div>
      )}

      {melds.length > 0 && (
        <div className={s.meldList}>
          {melds.map((m) => (
            <button key={m.key} type="button" onClick={() => onBreakMeld(m.key)} className={s.meldCard}>
              <div className={`mono ${s.meldType}`}>{MELD_LABELS[m.type]} · 해제</div>
              <div className={s.meldTiles}>
                {m.tiles.map((t) => <TileView key={t.key} id={t.id} red={t.red} size={28} />)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
