import { cx } from '../lib/cx';
import s from './Segmented.module.css';

interface Props<T extends string> {
  options: readonly T[];
  labels?: readonly string[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ options, labels, value, onChange }: Props<T>) {
  return (
    <div className={s.group}>
      {options.map((opt, i) => (
        <button key={opt} type="button" onClick={() => onChange(opt)} className={cx(s.option, opt === value && s.active)}>
          {labels?.[i] ?? opt}
        </button>
      ))}
    </div>
  );
}
