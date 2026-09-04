import type { Rules, ScoreResult, WinInput } from '../../../engine/types';

export type ContactCategory = 'wrong-result' | 'rule-request' | 'usability' | 'other';

export const CATEGORIES: { key: ContactCategory; name: string; desc?: string; placeholder: string }[] = [
  { key: 'wrong-result', name: '계산 결과가 이상함', desc: '판·부·점수가 실제와 다르게 나옴', placeholder: '예: 핑후가 성립해야 하는데 역 목록에 나오지 않습니다.' },
  { key: 'rule-request', name: '룰 추가 요청', desc: '우리 모임에서 쓰는 룰이 없음', placeholder: '예: 하네만 이상에서 절상만관을 적용하는 룰을 쓰고 있습니다.' },
  { key: 'usability', name: '사용이 불편함', desc: '입력·화면 구성에 대한 의견', placeholder: '예: 손패를 지울 때 한 장씩 지우기가 번거롭습니다.' },
  { key: 'other', name: '그 외', placeholder: '자유롭게 남겨주세요.' },
];

/** 문의에 함께 보내는 맥락. 계산 화면에서는 손패까지, 룰 화면에서는 룰만 */
export interface ContactAttachment {
  kind: 'calculation' | 'rules';
  rules: Rules;
  input?: WinInput;
  result?: Pick<ScoreResult, 'valid' | 'error' | 'han' | 'fu' | 'limitName' | 'payment' | 'yaku' | 'yakuman'>;
}

export interface ContactPayload {
  category: ContactCategory;
  message: string;
  contact?: string;
  website?: string; // 허니팟 — 항상 비워둠
  attachment?: ContactAttachment;
  meta: { url: string; userAgent: string; version: string };
}
