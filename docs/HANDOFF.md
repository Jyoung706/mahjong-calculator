# 판부(判符) — 인수인계 문서

리치마작 점수 계산기. 다른 환경에서 작업을 이어갈 때 이 문서부터 읽으면 된다.

- 배포: https://panbu.cloud
- 저장소: github.com/Jyoung706/mahjong-calculator
- 라이선스: 독점(All rights reserved)
- 원본 기획: [명세.md](./명세.md)

---

## 1. 시작하기

```bash
npm install
npm run dev              # Vite 개발 서버 (worker/ 는 실행되지 않음 → /api/contact 404)
npm run preview:worker   # 빌드 후 Worker까지 포함해 로컬 실행 (문의 기능 테스트 가능)
npm test                 # vitest 47개
npm run typecheck        # 앱 + worker 타입 검사
npm run deploy           # 로컬에서 직접 배포 (평소엔 git push로 자동 배포)
```

로컬에서 직접 배포할 때는 `rm -rf dist` 후 빌드할 것. 파일 동기화로 `dist/`에
`robots 2.txt` 같은 중복 파일이 쌓이면 그대로 업로드된다.

## 2. 구조

```
engine/    순수 계산 로직 (React 무의존)
  types.ts       Tile·Meld·WinInput·Rules·ScoreResult
  tiles.ts       패 상수, validate (매수·4장 초과·부로 구성 검증)
  decompose.ts   손패 분해(머리 후보 × 면자 백트래킹), winPlacements(대기 형태), isAnko
  yaku.ts        일반 역 (판내림·흡수 규칙 포함)
  yakuman.ts     역만 (더블 조건은 Rules 옵션 연동)
  fu.ts          부수 (핑후쯔모 20 / 치토이 25 / 쿠이핑후 30 예외)
  dora.ts        도라 표시패 순환, 우라·적도라 집계
  score.ts       calcPayment — 기본점·만관 절삭·친자 지불·본장·리치봉
  generate.ts    퀴즈 문제 생성
  index.ts       calculateScore(input, rules) — 파이프라인 + 최고점 채택

src/
  lib/           tileAssets(패 코드↔SVG·라벨), cx(클래스 결합)
  components/    Tile · Segmented · ScoreGrid(계산기·퀴즈 공용)
  features/
    home/        진입 화면
    calculator/  useCalculatorState(입력 상태 + toWinInput) + 화면 조각들
    quiz/        SetupView → PlayView → ResultView
    scoreTable/  모바일(토글) / PC(와이드) 반응형
    rules/       useRules(localStorage) + 토글 화면
    contact/     문의 폼 + 첨부 카드
  router/        TanStack Router 라우트 5개

worker/          Cloudflare Worker
  index.ts       /api/* 라우팅, www→apex 301, 나머지는 ASSETS로
  handleContact.ts  문의 → Discord 웹훅

public/          정적 자산 (tiles/ 패 SVG, icon/ 로고, robots.txt, sitemap.xml)
docs/            이 문서들
```

## 3. 핵심 설계

**엔진은 순수 함수다.** `calculateScore(input, rules)` 하나가 모든 곳에서 재사용된다 —
계산기 화면, 퀴즈 정답 생성, 점수표 셀 값, 문의 첨부. 그래서:

- 퀴즈는 **정답 데이터를 저장하지 않는다.** 랜덤 손패를 만들어 엔진에 넣으면 그 출력이 정답이고,
  역이 없으면(`valid: false`) 폐기하고 재생성한다.
- 점수표는 **하드코딩하지 않는다.** 모든 셀이 `calcPayment` 결과라 표와 계산이 어긋날 수 없다.
- 문의 첨부의 `WinInput`·`Rules` JSON을 `test/`에 붙여넣으면 **버그가 100% 재현**된다.

**UI와 엔진의 접점은 `toWinInput()` 하나뿐이다** (`src/features/calculator/useCalculatorState.ts`).
UI를 바꿔도 이 함수만 유지하면 엔진은 건드릴 필요가 없다.

**스타일은 CSS Modules.** 컴포넌트마다 `*.module.css`, 공통 토큰과 `.page`/`.card` 같은
레이아웃만 `src/styles.css`. 인라인 스타일은 동적 값(패 이미지 URL, 크기)에만 남겼다 —
과거 인라인 `display:flex`가 미디어쿼리를 덮어써 반응형이 깨진 적이 있다.

## 4. 마작 규칙 중 헷갈리는 지점

구현하며 실제로 틀렸던 것들. 수정할 때 이 부분을 다시 깨뜨리지 않도록 주의.

- **론으로 완성된 커쯔는 명각**이다 → 삼안커·사안커 판정에서 제외 (`isAnko`)
- **대기 부수와 머리 부수는 독립**이다. 단기 대기 +2부는 머리가 역패가 아니어도 붙는다
- 한 손패가 **여러 분해**를 가질 수 있다 (`111222333m 44m` → 커쯔 3개 / 슌쯔 3개).
  분해 × 화료패 배치를 전수 계산해 최고점을 채택한다
- 슌쯔 대기 판정: 화료패가 가운데면 칸찬, 끝이면 `12+3`/`89+7`일 때만 펜찬
- 만관 이상은 부수와 무관 → 퀴즈에서도 부수를 채점하지 않는다

## 5. 배포 (Cloudflare Workers)

`git push` → Workers Builds가 `npm run build` → `npx wrangler deploy` 실행.

**`wrangler.jsonc`가 단일 진실 공급원이다.** 대시보드에서 바꾼 설정은 다음 배포가 덮어쓰므로,
커스텀 도메인·workers.dev 여부 등은 반드시 이 파일에 반영할 것. (실제로 배포 로그에
"remote configuration differs" 경고가 떴고, 도메인 연결이 끊길 뻔했다.)

**정적 자산이 Worker보다 먼저다.** `dist/`에 실재하는 파일(`/`, `/tiles/*.svg`)은
Worker를 거치지 않고 바로 서빙된다. 그래서 `worker/index.ts`의 www 리다이렉트가 `/`에서는
동작하지 않았고, Cloudflare **Redirect Rule**(대시보드)로 처리하고 있다.
파일이 없는 경로(`/calculator`)만 Worker가 받아 `not_found_handling`으로 index.html을 돌려준다.

**환경변수는 두 종류다.** 빌드 변수(빌드 중에만 존재)와 런타임 Secret(`env.X`로 읽음)은
다른 곳에 저장된다. `DISCORD_WEBHOOK_URL`은 **런타임 Secret**이어야 한다
(Worker → Settings → Variables and Secrets). 추가 후 재배포해야 적용된다.

시크릿 등록 여부 확인 (디스코드로 메시지가 가지 않는 안전한 프로브):
```bash
curl -sS -X POST https://panbu.cloud/api/contact -H 'content-type: application/json' \
  -d '{"category":"other","message":"hi","meta":{"url":"t","userAgent":"c"}}'
# {"error":"bad_message"} → 등록됨 / {"error":"not_configured"} → 미등록
```

### 도메인
- 등록기관: 호스팅케이알 (소유·갱신만). DNS는 Cloudflare가 관리
- `www` → apex 301 (Redirect Rule, 쿼리 보존). 두 출처로 갈리면 localStorage가 분리되므로 통일이 필요했다
- `workers.dev` 주소는 중복 색인 방지를 위해 비활성

## 6. SEO

- `index.html`에 메타·OG·canonical·JSON-LD(WebApplication)
- `public/robots.txt`, `public/sitemap.xml` (5개 URL). Cloudflare 관리 robots.txt가
  앞에 붙지만 우리 내용과 `Sitemap:` 줄은 유지된다
- Google Search Console 등록·사이트맵 제출 완료
- CSR이라 색인이 느릴 수 있음 → 누락이 보이면 프리렌더링 검토 (빌드 후 헤드리스 브라우저로
  각 라우트를 정적 HTML로 저장. SSR 전환은 이 규모에 과하다)

## 7. 앞으로 할 만한 것

1. 색인 상태 관찰 → 필요 시 프리렌더링
2. 퀴즈 출제 품질 — 지금은 완전 랜덤이라 탄야오·역패에 치우친다. 역 지정 템플릿(명세 §16.3)
3. 문의 스팸 발생 시 Cloudflare Turnstile (현재는 허니팟 + 길이 제한만)
4. 계산 이력 저장 (명세의 "기록" 화면, 미구현)
