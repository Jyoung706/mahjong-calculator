import type { Tile } from '../../../../engine/types';
import { TileView } from '../../../components/Tile';
import type { TileInst } from '../useCalculatorState';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="section-label">③ 화료패 <span className="hint">론·쯔모로 완성한 1장</span></div>
      <div
        onClick={winTile ? onClear : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 11, background: 'var(--surface)', borderRadius: 10, padding: '9px 11px',
          border: `1.5px solid ${awaiting ? 'var(--accent)' : winTile ? 'var(--ink)' : 'var(--line)'}`,
          cursor: winTile ? 'pointer' : 'default',
        }}
      >
        {winTile ? (
          <TileView id={winTile.id} red={winTile.red} size={38} />
        ) : (
          <div style={{ width: 38, height: 52, borderRadius: 5, border: '1.5px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#c9c3b7' }}>+</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{isTsumo ? '쯔모로 화료' : '론으로 화료'}</div>
          <div style={{ fontSize: 11, color: awaiting ? 'var(--accent)' : 'var(--faint)' }}>
            {winTile ? '탭하여 변경' : awaiting ? '아래 목록에서 화료패를 고르세요' : '마지막에 입력'}
          </div>
        </div>
      </div>

      {awaiting && waits && (
        waits.length > 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 10, padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '.05em' }}>화료 가능한 패 {waits.length}종</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
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
