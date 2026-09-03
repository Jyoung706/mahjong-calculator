import type { Tile } from "../../../engine/types";
import { tileSrc } from "../../lib/tileAssets";

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
}: {
  onStartCalculator: () => void;
  onOpenRules: () => void;
  onOpenScoreTable: () => void;
}) {
  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        height: "100dvh",
        background: "var(--card)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "56px 28px 0",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <img
            src='/icon/default_mode_icon.png'
            alt='판부 마크'
            style={{ width: 58, height: 58, objectFit: "contain" }}
          />
          <img
            src='/icon/logo-trim.png'
            alt='판부'
            style={{ height: 50, width: "auto", mixBlendMode: "multiply" }}
          />
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#6e6a62",
            lineHeight: 1.65,
            textAlign: "center",
          }}
        >
          리치마작 점수를 손패 그대로 계산하고,<br />판·부를 눈으로 익힙니다.
        </div>
      </div>

      <div
        style={{
          padding: "32px 20px 0",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button
          type='button'
          onClick={onStartCalculator}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            cursor: "pointer",
            boxShadow: "0 2px 0 #e6e1d7",
            textAlign: "left",
            font: "inherit",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>점수 계산기</div>
              <div
                style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}
              >
                손패 13장 + 화료패를 탭으로 입력
                <br />
                판·부·지불액과 계산 내역까지
              </div>
            </div>
            <div style={{ fontSize: 18, color: "var(--ink)" }}>→</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {PREVIEW.map((t, i) => (
              <div
                key={i}
                style={{
                  width: 26,
                  height: 35,
                  borderRadius: 4,
                  border: "1px solid var(--line-soft)",
                  background: `url('${tileSrc(t.id, t.red)}') center/76% auto no-repeat var(--surface)`,
                }}
              />
            ))}
          </div>
        </button>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            boxShadow: "0 2px 0 #e6e1d7",
            opacity: 0.85,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>점수 퀴즈</div>
              <Badge>준비중</Badge>
            </div>
            <div
              style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}
            >
              랜덤으로 만들어진 패의 판·부를
              <br />
              직접 맞히며 연습
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#c4bfb5" }}>→</div>
        </div>

        <button
          type='button'
          onClick={onOpenScoreTable}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid var(--line-soft)",
            borderRadius: 12,
            padding: "16px 18px",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
            font: "inherit",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>점수표 보기</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              판·부 표와 부 계산 참고표
            </div>
          </div>
          <div style={{ fontSize: 16, color: "var(--muted)" }}>→</div>
        </button>

        <button
          type='button'
          onClick={onOpenRules}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid var(--line-soft)",
            borderRadius: 12,
            padding: "16px 18px",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
            font: "inherit",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>룰 설정</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              더블역만 · 카조에역만 · 쿠이탕 등 9가지
            </div>
          </div>
          <div style={{ fontSize: 16, color: "var(--muted)" }}>→</div>
        </button>
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: "0 28px 34px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div className='mono' style={{ fontSize: 10, color: "var(--faint)" }}>
          © 2026 Jun Young JEON. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span
      className='mono'
      style={{
        fontSize: 10,
        letterSpacing: ".06em",
        color: "var(--accent)",
        border: "1px solid #e8d7d0",
        background: "var(--accent-bg)",
        borderRadius: 4,
        padding: "2px 6px",
      }}
    >
      {children}
    </span>
  );
}
