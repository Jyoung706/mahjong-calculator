# 판부(判符) — 리치마작 점수 계산기

**작업 전 [docs/HANDOFF.md](docs/HANDOFF.md)를 읽을 것.** 구조·설계 의도·배포 함정이 정리되어 있다.
원본 기획은 [docs/명세.md](docs/명세.md).

## 명령어

```bash
npm run dev              # 개발 서버 (worker/ 미실행 → /api/contact 404)
npm run preview:worker   # Worker 포함 로컬 실행
npm test                 # vitest
npm run typecheck        # 앱 + worker
```

## 반드시 지킬 것

- **`engine/`은 순수하게 유지한다.** React·DOM·브라우저 API를 넣지 말 것.
  계산기·퀴즈·점수표·문의 첨부가 전부 이 엔진 하나를 재사용한다.
- **점수 값을 하드코딩하지 않는다.** 표·퀴즈 정답 모두 `calcPayment`/`calculateScore`로 생성한다.
- **UI↔엔진 접점은 `toWinInput()` 하나다** (`src/features/calculator/useCalculatorState.ts`).
- **스타일은 CSS Modules.** 인라인 스타일은 동적 값(이미지 URL·크기)에만.
  인라인이 미디어쿼리를 덮어써 반응형이 깨진 전례가 있다.
- **Cloudflare 설정은 `wrangler.jsonc`에 쓴다.** 대시보드에서만 바꾸면 다음 배포가 덮어쓴다.
- 규칙 변경 시 `test/cases.test.ts`(명세 §12)와 `test/combo.test.ts`(복합 역)를 먼저 확인할 것.

## 자주 틀리는 마작 규칙

- 론으로 완성된 커쯔는 명각 → 삼안커·사안커에서 제외
- 단기 대기 +2부는 머리가 역패가 아니어도 붙는다 (대기 부수와 머리 부수는 독립)
- 한 손패에 여러 분해가 가능 → 전수 계산 후 최고점 채택
- 만관 이상은 부수 무관 → 퀴즈에서 부수를 채점하지 않는다
