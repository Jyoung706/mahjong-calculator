import type { Rules } from '../../../engine/types';
import { DEFAULT_RULES } from '../../../engine';
import { RULE_SECTIONS } from './ruleDefs';

interface Props {
  rules: Rules;
  changedCount: number;
  onToggle: (key: keyof Rules) => void;
  onReset: () => void;
  onBack: () => void;
}

export function RulesPage({ rules, changedCount, onToggle, onReset, onBack }: Props) {
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', height: '100dvh', background: 'var(--card)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '14px 18px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line-soft)', background: 'var(--surface)' }}>
        <button type="button" onClick={onBack} style={{ border: 'none', background: 'none', fontSize: 15, color: 'var(--muted)', cursor: 'pointer', padding: 0 }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>룰 설정</div>
        <div style={{ flex: 1 }} />
        <div className="mono" style={{ fontSize: 11, color: changedCount > 0 ? 'var(--accent)' : 'var(--muted)' }}>
          {changedCount > 0 ? `${changedCount}개 변경됨` : '기본값'}
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 20px' }}>
        <div style={{ padding: '10px 12px', marginBottom: 14, borderRadius: 9, background: 'var(--soft)', fontSize: 11, color: '#6e6a62', lineHeight: 1.6 }}>
          토글을 바꾸면 계산기 점수에 즉시 반영됩니다.
        </div>

        {RULE_SECTIONS.map((sec) => (
          <div key={sec.title} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em', marginBottom: 8 }}>{sec.title}</div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {sec.items.map((it, i) => {
                const on = rules[it.key];
                const changed = on !== DEFAULT_RULES[it.key];
                return (
                  <div key={it.key} onClick={() => onToggle(it.key)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', borderBottom: i < sec.items.length - 1 ? '1px solid var(--hairline)' : 'none', cursor: 'pointer' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: changed ? 'var(--accent)' : 'var(--ink)' }}>{it.name}</div>
                        {changed && <div className="mono" style={{ fontSize: 9, letterSpacing: '.04em', color: 'var(--accent)' }}>변경됨</div>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{it.desc}</div>
                    </div>
                    <div style={{ width: 38, height: 22, borderRadius: 11, background: on ? 'var(--accent)' : 'var(--line)', padding: 2, flexShrink: 0, marginTop: 2, transition: 'background .18s ease' }}>
                      <div style={{ width: 18, height: 18, borderRadius: 9, background: 'var(--surface)', boxShadow: '0 1px 2px rgba(38,36,31,.2)', transition: 'transform .18s ease', transform: on ? 'translateX(16px)' : 'translateX(0)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button type="button" onClick={onReset} disabled={changedCount === 0}
          style={{
            width: '100%', height: 46, borderRadius: 10, background: 'var(--surface)', fontSize: 14, fontWeight: 500,
            border: `1px solid ${changedCount > 0 ? 'var(--accent)' : 'var(--line)'}`,
            color: changedCount > 0 ? 'var(--accent)' : '#c4bfb5',
            cursor: changedCount > 0 ? 'pointer' : 'default',
          }}>
          기본값으로 되돌리기
        </button>
      </div>
    </div>
  );
}
