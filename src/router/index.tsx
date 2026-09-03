import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
} from '@tanstack/react-router';
import { HomePage } from '../features/home/HomePage';
import { CalculatorPage } from '../features/calculator/CalculatorPage';
import { RulesPage } from '../features/rules/RulesPage';
import { ScoreTablePage } from '../features/scoreTable/ScoreTablePage';
import { QuizPage } from '../features/quiz/QuizPage';
import { useRules } from '../features/rules/useRules';

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
    return <CalculatorPage rules={rules} onBack={() => navigate({ to: '/' })} />;
  },
});

const rulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rules',
  component: function RulesScreen() {
    const navigate = useNavigate();
    const r = useRules();
    return <RulesPage rules={r.rules} changedCount={r.changedCount} onToggle={r.toggle} onReset={r.reset} onBack={() => navigate({ to: '/' })} />;
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

export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute, calculatorRoute, rulesRoute, scoreTableRoute, quizRoute]),
  defaultNotFoundComponent: () => null,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
