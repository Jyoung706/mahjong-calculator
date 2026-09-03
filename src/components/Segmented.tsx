interface Props<T extends string> {
  options: readonly T[];
  labels?: readonly string[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ options, labels, value, onChange }: Props<T>) {
  return (
    <div style={{ display: 'flex', background: 'var(--seg)', borderRadius: 8, padding: 2, gap: 2, flex: 1 }}>
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 6, fontSize: 13,
            fontWeight: 500, cursor: 'pointer', border: 'none',
            background: opt === value ? 'var(--surface)' : 'transparent',
            color: opt === value ? 'var(--ink)' : 'var(--muted)',
          }}
        >
          {labels?.[i] ?? opt}
        </button>
      ))}
    </div>
  );
}
