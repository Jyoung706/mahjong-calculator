import type { Tile } from "../../../engine/types";
import { tileSrc } from "../../lib/tileAssets";
import s from "./HomePage.module.css";

const PREVIEW: { id: Tile; red?: boolean }[] = [
  { id: "3m" },
  { id: "4m" },
  { id: "5m", red: true },
  { id: "7p" },
  { id: "9s" },
];

export function HomePage({
  onStartCalculator,
  onOpenRules,
  onOpenScoreTable,
  onStartQuiz,
}: {
  onStartCalculator: () => void;
  onOpenRules: () => void;
  onOpenScoreTable: () => void;
  onStartQuiz: () => void;
}) {
  return (
    <div className='page'>
      <div className={s.hero}>
        <div className={s.logoRow}>
          <img src='/icon/default_mode_icon.png' alt='판부 마크' className={s.mark} />
          <img src='/icon/logo-trim.png' alt='판부' className={s.wordmark} />
        </div>
        <div className={s.tagline}>
          리치마작 점수를 손패 그대로 계산하고,
          <br />
          판·부를 눈으로 익힙니다.
        </div>
      </div>

      <div className={s.menu}>
        <button type='button' onClick={onStartCalculator} className={s.cardBtn}>
          <div className={s.cardHead}>
            <div className={s.cardCol}>
              <div className={s.cardTitle}>점수 계산기</div>
              <div className={s.cardDesc}>
                손패 13장 + 화료패를 탭으로 입력
                <br />
                판·부·지불액과 계산 내역까지
              </div>
            </div>
            <div className={s.arrow}>→</div>
          </div>
          <div className={s.previewRow}>
            {PREVIEW.map((t, i) => (
              <div key={i} className={s.previewTile} style={{ backgroundImage: `url('${tileSrc(t.id, t.red)}')` }} />
            ))}
          </div>
        </button>

        <button type='button' onClick={onStartQuiz} className={`${s.cardBtn} ${s.cardQuiz}`}>
          <div className={s.cardCol}>
            <div className={s.cardTitle}>점수 퀴즈</div>
            <div className={s.cardDesc}>
              랜덤으로 만들어진 패의 판·부를
              <br />
              직접 맞히며 연습
            </div>
          </div>
          <div className={s.arrow}>→</div>
        </button>

        <button type='button' onClick={onOpenScoreTable} className={s.rowBtn}>
          <div className={s.rowCol}>
            <div className={s.rowTitle}>점수표 보기</div>
            <div className={s.rowDesc}>판·부 표와 부 계산 참고표</div>
          </div>
          <div className={s.rowArrow}>→</div>
        </button>

        <button type='button' onClick={onOpenRules} className={s.rowBtn}>
          <div className={s.rowCol}>
            <div className={s.rowTitle}>룰 설정</div>
            <div className={s.rowDesc}>더블역만 · 카조에역만 · 쿠이탕 등 9가지</div>
          </div>
          <div className={s.rowArrow}>→</div>
        </button>
      </div>

      <div className={s.spacer} />

      <div className={s.footer}>
        <div className={`mono ${s.copyright}`}>© 2026 Jun Young JEON. All rights reserved.</div>
      </div>
    </div>
  );
}
