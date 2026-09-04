/**
 * 개인정보 처리방침.
 *
 * 지금은 계정도 가입도 없어 수집하는 개인정보가 없으므로 화면에 노출하지 않는다.
 * 로그인·가입 기능이 생기면 이 상수를 true로 바꾸면 정보 화면의 링크와 /privacy 경로가
 * 함께 살아난다. 그때 아래 본문의 [ ] 표시된 항목을 실제 수집 내용으로 채울 것.
 */
export const PRIVACY_ENABLED: boolean = false;

/** 방침을 고칠 때마다 올린다. 시행일과 함께 표시된다 */
export const PRIVACY_VERSION = '1.0';
export const PRIVACY_EFFECTIVE_DATE = '2026-09-05';

import s from './PrivacyPage.module.css';

interface Props {
  onBack: () => void;
  onContact: () => void;
}

export function PrivacyPage({ onBack, onContact }: Props) {
  return (
    <div className="page">
      <header className="page-header">
        <button type="button" onClick={onBack} className="back-btn">←</button>
        <div className="page-title">개인정보 처리방침</div>
      </header>

      <div className={s.body}>
        <p className={`mono ${s.meta}`}>
          시행일 {PRIVACY_EFFECTIVE_DATE} · 버전 {PRIVACY_VERSION}
        </p>

        <Section title="1. 수집하는 정보">
          판부는 계정이나 로그인 기능을 제공하지 않으며, 이름·연락처 등 개인을 식별할 수 있는
          정보를 수집하지 않습니다. 입력한 손패와 룰 설정은 브라우저 안에서만 처리되며 서버로
          전송되지 않습니다.
        </Section>

        <Section title="2. 문의를 보낼 때">
          문의하기로 내용을 보내면 다음이 함께 전달됩니다.
          <ul className={s.list}>
            <li>문의 내용과 분류</li>
            <li>회신처 (선택 입력 — 비워 두어도 문의는 접수됩니다)</li>
            <li>첨부에 동의한 경우 계산 화면의 손패·룰 설정·계산 결과</li>
            <li>문의를 보낸 주소와 브라우저 종류, 앱 버전</li>
            <li>중복 문의 식별을 위해 IP를 되돌릴 수 없는 형태로 변환한 짧은 값</li>
          </ul>
          IP 주소 원문은 저장하지 않습니다. 전달된 문의는 운영자만 볼 수 있는 채널에 보관되며,
          문의 처리 목적 외에는 사용하지 않습니다.
        </Section>

        <Section title="3. 브라우저에 저장되는 값">
          룰 설정 등 사용 편의를 위한 값이 브라우저 저장소에 남습니다. 이 값은 사용자의 기기를
          벗어나지 않으며, 브라우저의 저장 데이터를 지우면 함께 삭제됩니다.
        </Section>

        <Section title="4. 제3자 제공">
          수집한 정보를 판매하거나 광고 목적으로 제공하지 않습니다. 서비스 운영에 필요한 범위에서
          호스팅·문의 전달 사업자를 이용합니다.
        </Section>

        <Section title="5. 이용자의 권리">
          보낸 문의의 열람·삭제를 원하시면 아래 문의하기로 요청해 주세요. 확인 후 처리합니다.
        </Section>

        <Section title="6. 방침의 변경">
          내용이 바뀌면 이 화면의 시행일과 버전을 함께 갱신합니다.
        </Section>

        <button type="button" onClick={onContact} className={s.contact}>
          <span>문의하기</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={s.section}>
      <h2 className={s.title}>{title}</h2>
      <div className={s.text}>{children}</div>
    </section>
  );
}
