import { PRIVACY_ENABLED } from './PrivacyPage';
import s from './InfoPage.module.css';

const TILE_SOURCE = 'https://github.com/FluffyStuff/riichi-mahjong-tiles';
const GITHUB = 'https://github.com/Jyoung706';

interface Props {
  onBack: () => void;
  onOpenRules: () => void;
  onOpenPrivacy: () => void;
  onContact: () => void;
}

export function InfoPage({ onBack, onOpenRules, onOpenPrivacy, onContact }: Props) {
  return (
    <div className="page">
      <header className="page-header">
        <button type="button" onClick={onBack} className="back-btn">←</button>
        <div className="page-title">정보</div>
        <div className={`mono ${s.version}`}>v{__APP_VERSION__}</div>
      </header>

      <div className={s.body}>
        <div className={s.identity}>
          <img src="/icon/default_mode_icon.png" alt="" className={s.mark} />
          <div className={s.identityCol}>
            <div className={s.name}>판부</div>
            <div className={s.desc}>리치마작 점수 계산기</div>
          </div>
        </div>

        <Section title="이 앱에 대해">
          <p className={s.p}>
            손패를 그대로 입력하면 성립한 역과 부수를 짚어가며 판·부와 지불 점수를 계산합니다.
            점수표와 퀴즈도 같은 계산기로 만들어지므로 화면마다 값이 어긋나지 않습니다.
          </p>
        </Section>

        <Section title="계산 기준">
          <ul className={s.list}>
            <li>부수는 20부에서 시작해 면자·대기·화료 방식을 더한 뒤 10부 단위로 올립니다.</li>
            <li>한 손패를 여러 가지로 해석할 수 있으면 가장 높은 점수를 채택합니다.</li>
            <li>만관 이상은 부수와 무관하게 정해진 점수를 사용합니다.</li>
            <li>더블역만·카조에역만·쿠이탕 등은 <button type="button" className={s.inlineLink} onClick={onOpenRules}>룰 설정</button>에서 바꿀 수 있습니다.</li>
          </ul>
        </Section>

        <Section title="사용한 리소스">
          <p className={s.p}>
            마작패 이미지는 아래 저장소의 것을 사용했습니다. CC0 1.0(퍼블릭 도메인)으로 공개된
            저작물입니다.
          </p>
          <a href={TILE_SOURCE} target="_blank" rel="noreferrer noopener" className={s.link}>
            <span className={s.linkText}>FluffyStuff / riichi-mahjong-tiles</span>
            <span className={s.linkArrow} aria-hidden>↗</span>
          </a>
        </Section>

        <Section title="만든 사람">
          <p className={s.p}>판부는 개인이 만들어 운영하는 앱입니다.</p>
          <a href={GITHUB} target="_blank" rel="noreferrer noopener" className={s.link}>
            <span className={s.linkText}>GitHub · Jyoung706</span>
            <span className={s.linkArrow} aria-hidden>↗</span>
          </a>
        </Section>

        <Section title="문의">
          <p className={s.p}>
            계산이 이상하거나 필요한 룰이 없다면 알려주세요. 문의를 보낼 때 접속 주소·브라우저
            종류·앱 버전이 함께 전달되고, 회신처는 입력하지 않아도 됩니다.
          </p>
          <button type="button" onClick={onContact} className={s.link}>
            <span className={s.linkText}>버그 제보 · 문의하기</span>
            <span className={s.linkArrow} aria-hidden>→</span>
          </button>
        </Section>

        {PRIVACY_ENABLED && (
          <Section title="약관">
            <button type="button" onClick={onOpenPrivacy} className={s.link}>
              <span className={s.linkText}>개인정보 처리방침</span>
              <span className={s.linkArrow} aria-hidden>→</span>
            </button>
          </Section>
        )}

        <div className={s.footer}>
          <div className={`mono ${s.copyright}`}>© 2026 Jyoung706. All rights reserved.</div>
          <div className={s.footnote}>
            저작권 표시는 이 앱의 코드와 디자인에 대한 것이며, 마작패 이미지는 퍼블릭 도메인입니다.
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={s.section}>
      <div className={s.sectionTitle}>{title}</div>
      {children}
    </section>
  );
}
