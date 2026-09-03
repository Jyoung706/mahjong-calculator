import { TileView } from '../../../components/Tile';
import type { TileInst } from '../useCalculatorState';
import { cx } from '../../../lib/cx';
import s from './HandSection.module.css';

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
    <div className={s.wrap}>
      <div className={s.head}>
        <div className="section-label">② 손패 <span className="hint">부로 몸통 제외</span></div>
        <div className={s.headRight}>
          <div className={cx('mono', s.count, hand.length === need && s.countFull)}>{hand.length} / {need}</div>
          <button type="button" onClick={onClearAll} className={s.clearBtn}>비움</button>
        </div>
      </div>

      <div className={s.tray}>
        {hand.map((t) => (
          <TileView key={t.key} id={t.id} red={t.red} selected={selected.includes(t.key)} onClick={() => onToggleSelect(t.key)} />
        ))}
        {Array.from({ length: Math.max(0, need - hand.length) }, (_, i) => <div key={i} className={s.empty} />)}
      </div>

      {selected.length > 0 && (
        <button type="button" onClick={onDeleteSelected} className={s.deleteBtn}>{selected.length}장 삭제</button>
      )}
    </div>
  );
}
