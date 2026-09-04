import type { Rules } from '../../../engine/types';
import { DEFAULT_RULES } from '../../../engine';
import { RULE_SECTIONS } from './ruleDefs';
import { cx } from '../../lib/cx';
import s from './RulesPage.module.css';

interface Props {
  rules: Rules;
  changedCount: number;
  onToggle: (key: keyof Rules) => void;
  onReset: () => void;
  onBack: () => void;
  onContact: () => void;
}

export function RulesPage({ rules, changedCount, onToggle, onReset, onBack, onContact }: Props) {
  return (
    <div className="page">
      <header className="page-header">
        <button type="button" onClick={onBack} className="back-btn">←</button>
        <div className="page-title">룰 설정</div>
        <div className={cx('mono', s.status, changedCount > 0 && s.statusChanged)}>
          {changedCount > 0 ? `${changedCount}개 변경됨` : '기본값'}
        </div>
      </header>

      <div className={s.body}>
        <div className={s.intro}>토글을 바꾸면 계산기 점수에 즉시 반영됩니다.</div>

        {RULE_SECTIONS.map((sec) => (
          <div key={sec.title} className={s.section}>
            <div className={s.sectionTitle}>{sec.title}</div>
            <div className={`card ${s.list}`}>
              {sec.items.map((it) => {
                const on = rules[it.key];
                const changed = on !== DEFAULT_RULES[it.key];
                return (
                  <div key={it.key} onClick={() => onToggle(it.key)} className={s.item}>
                    <div className={s.itemBody}>
                      <div className={s.itemHead}>
                        <div className={cx(s.itemName, changed && s.itemNameChanged)}>{it.name}</div>
                        {changed && <div className={s.changedMark}>변경됨</div>}
                      </div>
                      <div className={s.itemDesc}>{it.desc}</div>
                    </div>
                    <div className={cx(s.track, on && s.trackOn)}>
                      <div className={cx(s.knob, on && s.knobOn)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button type="button" onClick={onReset} disabled={changedCount === 0} className={cx(s.resetBtn, changedCount > 0 && s.resetActive)}>
          기본값으로 되돌리기
        </button>

        <button type="button" onClick={onContact} className={s.askBox}>
          <div className={s.askCol}>
            <div className={s.askTitle}>필요한 룰이 없나요?</div>
            <div className={s.askDesc}>사용하시는 룰을 알려주시면 추가하겠습니다</div>
          </div>
          <div className={s.askArrow}>→</div>
        </button>
      </div>
    </div>
  );
}
