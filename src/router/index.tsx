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

export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute, calculatorRoute, rulesRoute, scoreTableRoute, quizRoute, contactRoute]),
  defaultNotFoundComponent: () => null,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
