import { TileView } from '../../../components/Tile';
import type { TileInst } from '../useCalculatorState';
import { cx } from '../../../lib/cx';
import s from './HandSection.module.css';

interface Props {
  hand: TileInst[];
  need: number;
  onRemove: (key: number) => void;
  onClearAll: () => void;
}

export function HandSection({ hand, need, onRemove, onClearAll }: Props) {
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
          <TileView key={t.key} id={t.id} red={t.red} onClick={() => onRemove(t.key)} />
        ))}
        {Array.from({ length: Math.max(0, need - hand.length) }, (_, i) => <div key={i} className={s.empty} />)}
      </div>

      {hand.length > 0 && <div className={s.tip}>패를 탭하면 손패에서 빠집니다</div>}
    </div>
  );
}
