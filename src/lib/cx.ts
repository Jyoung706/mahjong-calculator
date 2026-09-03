/** 조건부 클래스 결합: cx(s.a, cond && s.b) */
export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
