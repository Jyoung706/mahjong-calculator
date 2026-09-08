// 라우트별 SEO 메타 — SPA는 모든 경로가 같은 index.html을 받으므로
// canonical·title·description을 렌더 시점에 경로에 맞게 갱신해야
// 구글이 하위 경로를 홈의 중복으로 취급하지 않는다.
const ORIGIN = 'https://panbu.cloud';

const META: Record<string, { title: string; description: string }> = {
  '/': {
    title: '판부 — 리치마작 점수 계산기',
    description: '리치마작 점수 계산기 판부(判符). 손패를 그대로 입력하면 역·판수·부수·지불 점수를 자동 계산하고 계산 내역까지 보여줍니다.',
  },
  '/calculator': {
    title: '점수 계산기 — 판부',
    description: '리치마작 손패 13장과 화료패를 탭으로 입력하면 역·판수·부수·지불 점수를 즉시 계산합니다. 부수 내역과 점수표 대조 제공.',
  },
  '/quiz': {
    title: '점수 퀴즈 — 판부',
    description: '랜덤으로 만들어진 리치마작 손패의 판·부·점수를 직접 맞히며 점수 계산을 연습하는 퀴즈. 난이도별 출제와 항목별 채점 해설.',
  },
  '/score-table': {
    title: '점수표 — 판부',
    description: '리치마작 판·부 점수표. 자/친, 론/쯔모별 지불 점수와 만관 이상 구간, 부수 계산 참고표를 한눈에.',
  },
  '/rules': {
    title: '룰 설정 — 판부',
    description: '더블역만·카조에역만·쿠이탕·적도라 등 리치마작 계산 룰 9가지를 설정합니다.',
  },
  '/info': {
    title: '이용 안내 — 판부',
    description: '판부 리치마작 점수 계산기 이용 안내.',
  },
  '/contact': {
    title: '문의하기 — 판부',
    description: '판부에 의견이나 오류를 알려주세요.',
  },
};

/** 현재 경로에 맞춰 title·description·canonical·og 태그 갱신 */
export function applyRouteMeta(pathname: string) {
  const meta = META[pathname] ?? META['/'];
  document.title = meta.title;
  setAttr('meta[name="description"]', 'content', meta.description);
  setAttr('link[rel="canonical"]', 'href', ORIGIN + (pathname === '/' ? '/' : pathname));
  setAttr('meta[property="og:title"]', 'content', meta.title);
  setAttr('meta[property="og:description"]', 'content', meta.description);
  setAttr('meta[property="og:url"]', 'content', ORIGIN + (pathname === '/' ? '/' : pathname));
}

function setAttr(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}
