import type { Tile as TileId } from '../../engine/types';
import { tileSrc, tileLabel } from '../lib/tileAssets';
import { cx } from '../lib/cx';
import s from './Tile.module.css';

interface Props {
  id: TileId;
  red?: boolean;
  size?: number; // 폭(px), 높이는 34:46 비율
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
      className={cx(s.tile, onClick && s.clickable, selected && s.selected, dimmed && s.dimmed)}
      style={{ width: size, height: Math.round(size * (46 / 34)), backgroundImage: `url('${tileSrc(id, red)}')` }}
    />
  );
}
