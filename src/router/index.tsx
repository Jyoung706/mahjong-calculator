import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { HomePage } from '../features/home/HomePage';
import { CalculatorPage } from '../features/calculator/CalculatorPage';
import { RulesPage } from '../features/rules/RulesPage';
import { ScoreTablePage } from '../features/scoreTable/ScoreTablePage';
import { QuizPage } from '../features/quiz/QuizPage';
import { ContactPage } from '../features/contact/ContactPage';
import { InfoPage } from '../features/info/InfoPage';
import { PrivacyPage, PRIVACY_ENABLED } from '../features/info/PrivacyPage';
import type { ContactAttachment, ContactCategory } from '../features/contact/types';
import { useRules } from '../features/rules/useRules';

declare module '@tanstack/react-router' {
  interface HistoryState {
    contactAttachment?: ContactAttachment;
    contactCategory?: ContactCategory;
  }
}

const rootRoute = createRootRoute({ component: Outlet });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Home() {
    const navigate = useNavigate();
    return (
      <HomePage
        onStartCalculator={() => navigate({ to: '/calculator' })}
        onOpenRules={() => navigate({ to: '/rules' })}
        onOpenScoreTable={() => navigate({ to: '/score-table' })}
        onStartQuiz={() => navigate({ to: '/quiz' })}
        onOpenInfo={() => navigate({ to: '/info' })}
        onOpenContact={() => navigate({ to: '/contact' })}
      />
    );
  },
});

const calculatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calculator',
  component: function Calculator() {
    const navigate = useNavigate();
    const { rules } = useRules();
    return (
      <CalculatorPage
        rules={rules}
        onBack={() => navigate({ to: '/' })}
        onContact={(contactAttachment) =>
          navigate({ to: '/contact', state: { contactAttachment, contactCategory: 'wrong-result' } })}
      />
    );
  },
});

const rulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rules',
  component: function RulesScreen() {
    const navigate = useNavigate();
    const r = useRules();
    return (
      <RulesPage
        rules={r.rules}
        changedCount={r.changedCount}
        onToggle={r.toggle}
        onReset={r.reset}
        onBack={() => navigate({ to: '/' })}
        onContact={() =>
          navigate({
            to: '/contact',
            state: { contactAttachment: { kind: 'rules', rules: r.rules }, contactCategory: 'rule-request' },
          })}
      />
    );
  },
});

const scoreTableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/score-table',
  component: function ScoreTable() {
    const navigate = useNavigate();
    return <ScoreTablePage onBack={() => navigate({ to: '/' })} />;
  },
});

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quiz',
  component: function Quiz() {
    const navigate = useNavigate();
    const { rules } = useRules();
    return <QuizPage rules={rules} onBack={() => navigate({ to: '/' })} />;
  },
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: function Contact() {
    const navigate = useNavigate();
    // 진입 지점이 넘긴 맥락. 새로고침하면 사라지므로 첨부 없는 일반 문의로 폴백된다
    const state = useLocation().state;
    return (
      <ContactPage
        attachment={state.contactAttachment}
        defaultCategory={state.contactCategory}
        onBack={() => navigate({ to: '/' })}
      />
    );
  },
});

const infoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/info',
  component: function Info() {
    const navigate = useNavigate();
    return (
      <InfoPage
        onBack={() => navigate({ to: '/' })}
        onOpenRules={() => navigate({ to: '/rules' })}
        onOpenPrivacy={() => navigate({ to: '/privacy' })}
        onContact={() => navigate({ to: '/contact' })}
      />
    );
  },
});

// 수집하는 개인정보가 생기기 전까지는 링크도 화면도 나오지 않는다.
// PRIVACY_ENABLED 하나만 켜면 정보 화면의 링크와 이 경로가 함께 살아난다.
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: function Privacy() {
    const navigate = useNavigate();
    if (!PRIVACY_ENABLED) return null;
    return <PrivacyPage onBack={() => navigate({ to: '/info' })} onContact={() => navigate({ to: '/contact' })} />;
  },
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute, calculatorRoute, rulesRoute, scoreTableRoute, quizRoute, contactRoute, infoRoute, privacyRoute,
  ]),
  defaultNotFoundComponent: () => null,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
