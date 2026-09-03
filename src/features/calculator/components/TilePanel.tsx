import { useState } from 'react';
import type { Tile } from '../../../../engine/types';
import { PANELS, tileSrc, tileLabel } from '../../../lib/tileAssets';

interface Props {
  countOf: (id: Tile) => number;
  onTap: (id: Tile, red: boolean) => void;
}

export function TilePanel({ countOf, onTap }: Props) {
  const [tab, setTab] = useState('m');
  const [pick, setPick] = useState<Tile | null>(null); // 적5 선택 팝오버
  const panel = PANELS.find((p) => p.key === tab)!;

  return (
    <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--line-soft)' }}>
      <div style={{ display: 'flex', padding: '8px 10px 0', gap: 4 }}>
        {PANELS.map((p) => (
          <button key={p.key} type="button" onClick={() => { setTab(p.key); setPick(null); }}
            style={{
              flex: 1, textAlign: 'center', padding: '9px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              borderRadius: '8px 8px 0 0', border: 'none',
              background: p.key === tab ? 'var(--card)' : 'transparent',
              color: p.key === tab ? 'var(--ink)' : 'var(--muted)',
              borderBottom: `2px solid ${p.key === tab ? 'var(--ink)' : 'transparent'}`,
            }}>
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '12px 12px 16px', minHeight: 76, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 5 }}>
        {panel.tiles.map((id) => {
          const used = countOf(id);
          const full = used >= 4;
          const hasRed = id[0] === '5' && id[1] !== 'z';
          return (
            <div key={id} style={{ position: 'relative' }}>
              <button type="button" title={tileLabel(id)}
                onClick={() => (hasRed ? setPick(pick === id ? null : id) : onTap(id, false))}
                style={{
                  width: '100%', height: 52, borderRadius: 6, border: '1px solid var(--line)', cursor: 'pointer',
                  background: `url('${tileSrc(id)}') center 42%/74% auto no-repeat ${full ? 'var(--soft)' : 'var(--surface)'}`,
                  boxShadow: '0 1px 0 #e2ded5', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center',
                }}>
                <span className="mono" style={{ height: 10, lineHeight: '10px', fontSize: 8, color: full ? 'var(--accent)' : 'var(--muted)' }}>
                  {used > 0 ? '●'.repeat(used) : ''}
                </span>
              </button>
              {hasRed && <span className="mono" style={{ position: 'absolute', top: 2, right: 3, fontSize: 8, color: '#b0563c' }}>적</span>}
              {pick === id && (
                <div style={{ position: 'absolute', bottom: 58, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 7, display: 'flex', gap: 6, boxShadow: '0 6px 18px rgba(38,36,31,.16)' }}>
                  {[false, true].map((red) => (
                    <button key={String(red)} type="button" onClick={() => { onTap(id, red); setPick(null); }}
                      style={{ width: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
                      <div style={{ width: 40, height: 54, borderRadius: 6, border: '1px solid var(--line)', background: `url('${tileSrc(id, red)}') center/72% auto no-repeat var(--surface)` }} />
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{red ? '아카' : '보통'}</div>
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
