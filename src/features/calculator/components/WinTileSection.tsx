import type { Tile } from '../../../../engine/types';
import { TileView } from '../../../components/Tile';
import type { TileInst } from '../useCalculatorState';
import { cx } from '../../../lib/cx';
import s from './WinTileSection.module.css';

interface Props {
  winTile: TileInst | null;
  isTsumo: boolean;
  awaiting: boolean; // 손패가 다 차서 다음 입력이 화료패인 상태
  waits: Tile[] | null; // awaiting일 때 화료 가능한 패 목록 (빈 배열 = 노텐)
  onClear: () => void;
  onPick: (id: Tile) => void;
}

export function WinTileSection({ winTile, isTsumo, awaiting, waits, onClear, onPick }: Props) {
  return (
    <div className={s.wrap}>
      <div className="section-label">③ 화료패 <span className="hint">론·쯔모로 완성한 1장</span></div>
      <div onClick={winTile ? onClear : undefined} className={cx(s.box, awaiting && s.boxAwaiting, !!winTile && s.boxHas)}>
        {winTile ? (
          <TileView id={winTile.id} red={winTile.red} size={38} />
        ) : (
          <div className={s.placeholder}>+</div>
        )}
        <div className={s.info}>
          <div className={s.infoTitle}>{isTsumo ? '쯔모로 화료' : '론으로 화료'}</div>
          <div className={cx(s.infoHint, awaiting && s.infoHintAccent)}>
            {winTile ? '탭하여 변경' : awaiting ? '아래 목록에서 화료패를 고르세요' : '마지막에 입력'}
          </div>
        </div>
      </div>

      {awaiting && waits && (
        waits.length > 0 ? (
          <div className={s.waitsCard}>
            <div className={`mono ${s.waitsLabel}`}>화료 가능한 패 {waits.length}종</div>
            <div className={s.waitsRow}>
              {waits.map((id) => <TileView key={id} id={id} size={30} onClick={() => onPick(id)} />)}
            </div>
          </div>
        ) : (
          <div className="notice">텐파이가 아닙니다 — 이 손패로는 화료할 수 없습니다</div>
        )
      )}
    </div>
  );
}
