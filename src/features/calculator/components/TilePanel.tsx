import { useState } from 'react';
import type { Tile } from '../../../../engine/types';
import { PANELS, tileSrc, tileLabel } from '../../../lib/tileAssets';
import { cx } from '../../../lib/cx';
import s from './TilePanel.module.css';

interface Props {
  countOf: (id: Tile) => number;
  redUsed: (id: Tile) => boolean;
  onTap: (id: Tile, red: boolean) => void;
}

export function TilePanel({ countOf, redUsed, onTap }: Props) {
  const [tab, setTab] = useState('m');
  const [pick, setPick] = useState<Tile | null>(null); // 적5 선택 팝오버
  const panel = PANELS.find((p) => p.key === tab)!;

  return (
    <div className={s.panel}>
      <div className={s.tabs}>
        {PANELS.map((p) => (
          <button key={p.key} type="button" onClick={() => { setTab(p.key); setPick(null); }} className={cx(s.tab, p.key === tab && s.tabActive)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className={s.grid}>
        {panel.tiles.map((id) => {
          const used = countOf(id);
          const full = used >= 4;
          // 적패가 이미 쓰였으면 보통 5만 추가 가능하므로 팝업 생략
          const hasRed = id[0] === '5' && id[1] !== 'z' && !redUsed(id);
          return (
            <div key={id} className={s.cellWrap}>
              <button
                type="button"
                title={tileLabel(id)}
                onClick={() => (hasRed ? setPick(pick === id ? null : id) : onTap(id, false))}
                className={cx(s.tileBtn, full && s.tileFull)}
                style={{ backgroundImage: `url('${tileSrc(id)}')` }}
              >
                <span className={cx('mono', s.dots, full && s.dotsFull)}>{used > 0 ? '●'.repeat(used) : ''}</span>
              </button>
              {hasRed && <span className={`mono ${s.redMark}`}>적</span>}
              {pick === id && (
                <div className={s.popover}>
                  {[false, true].map((red) => (
                    <button key={String(red)} type="button" onClick={() => { onTap(id, red); setPick(null); }} className={s.opt}>
                      <div className={s.optTile} style={{ backgroundImage: `url('${tileSrc(id, red)}')` }} />
                      <div className={s.optLabel}>{red ? '아카' : '보통'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
