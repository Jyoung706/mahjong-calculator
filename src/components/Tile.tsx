import type { Tile as TileId } from '../../engine/types';
import { tileSrc, tileLabel } from '../lib/tileAssets';

interface Props {
  id: TileId;
  red?: boolean;
  size?: number; // 폭(px), 높이는 4:3 비율
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
}

export function TileView({ id, red = false, size = 34, selected = false, dimmed = false, onClick }: Props) {
  return (
    <button
      type="button"
      title={tileLabel(id)}
      onClick={onClick}
      style={{
        width: size,
        height: Math.round(size * (46 / 34)),
        borderRadius: 5,
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--line)'}`,
        background: `url('${tileSrc(id, red)}') center/76% auto no-repeat ${
          selected ? 'var(--accent-bg)' : dimmed ? 'var(--soft)' : 'var(--surface)'
        }`,
        boxShadow: '0 1px 0 #e2ded5',
      }}
    />
  );
}
