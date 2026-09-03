import type { Rules } from '../../../engine/types';

/** 화면 표시용 룰 정의 — key는 엔진 Rules와 1:1 */
export const RULE_SECTIONS: { title: string; items: { key: keyof Rules; name: string; desc: string }[] }[] = [
  {
    title: '더블역만 인정',
    items: [
      { key: 'suuankoTankiDouble', name: '사안커 단기 더블역만', desc: '안커 4개를 단기 대기로 화료하면 역만 2배로 계산합니다.' },
      { key: 'kokushi13Double', name: '국사무쌍 13면 대기 더블역만', desc: '요구패 13종을 모두 모아 어느 패로든 화료 가능한 상태를 2배로 계산합니다.' },
      { key: 'chuurenJunseiDouble', name: '순정구련보등 더블역만', desc: '구련보등 중 9종 대기 형태를 2배로 계산합니다.' },
      { key: 'daisuushiDouble', name: '대사희 더블역만', desc: '동·남·서·북을 모두 커쯔로 모은 역을 2배로 계산합니다.' },
    ],
  },
  {
    title: '점수 규칙',
    items: [
      { key: 'kazoeYakuman', name: '카조에역만', desc: '역만 없이 판수만 13판 이상 쌓여도 역만으로 지불합니다. 끄면 삼배만이 상한입니다.' },
      { key: 'doubleWindPairFu4', name: '연풍패 머리 4부', desc: '장풍과 자풍이 같은 머리를 2부가 아닌 4부로 셉니다.' },
    ],
  },
  {
    title: '역 규칙',
    items: [
      { key: 'kuitan', name: '쿠이탕', desc: '부로한 상태의 탄야오를 역으로 인정합니다.' },
      { key: 'ryuuiisouRequiresHatsu', name: '녹일색 發 필수', desc: '녹일색 성립에 發을 반드시 포함하도록 요구합니다.' },
      { key: 'akaDora', name: '적도라 사용', desc: '빨간 5(아카도라)를 도라 1장으로 셉니다. 끄면 보통 5로 취급합니다.' },
    ],
  },
];
