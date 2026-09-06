import { calcPayment } from '../../engine/score';
import { cx } from '../lib/cx';
import s from './ScoreGrid.module.css';

const GRID_FU = [20, 25, 30, 40, 50, 60];
const GRID_HAN = [1, 2, 3, 4];

interface Props {
  han: number;
  fu: number;
  isDealer: boolean;
  isTsumo: boolean;
  limited: boolean; // 만관 이상 — 강조 없음
  mine?: { han: number | null; fu: number | null }; // 퀴즈: 내가 고른 칸 표시
}

/** 판×부 점수표 대조 그리드 — 셀 값은 엔진 calcPayment로 생성 */
export function ScoreGrid({ han, fu, isDealer, isTsumo, limited, mine }: Props) {
  const cell = (f: number, h: number) => {
    const r = calcPayment({ han: h, fu: f, yakumanMultiplier: 0, isDealer, isTsumo, honba: 0, riichiSticks: 0, kazoeYakuman: true });
    if (r.limit) return '만관';
    return isTsumo
      ? (isDealer ? `${r.payment.tsumoFromNonDealer}올` : `${r.payment.tsumoFromNonDealer}/${r.payment.tsumoFromDealer}`)
      : String(r.payment.ron);
  };
  const hitHan = limited ? -1 : Math.min(4, han);
  const mineHan = mine?.han != null ? Math.min(4, mine.han) : null;

  return (
    <div className={`card ${s.gridCard}`}>
      <div className={`mono ${s.grid}`}>
        <div className={s.corner}>부\판</div>
        {GRID_HAN.map((h) => <div key={h} className={s.head}>{h}판</div>)}
        {GRID_FU.map((f) => (
          <FuRow key={f} f={f} cell={cell} hitHan={hitHan} hitFu={limited ? -1 : fu} mineHan={mineHan} mineFu={mine?.fu ?? null} />
        ))}
      </div>
    </div>
  );
}

function FuRow({ f, cell, hitHan, hitFu, mineHan, mineFu }: {
  f: number; cell: (f: number, h: number) => string;
  hitHan: number; hitFu: number; mineHan: number | null; mineFu: number | null;
}) {
  return (
    <>
      <div className={cx(s.fu, f === hitFu && s.fuHit)}>{f}</div>
      {GRID_HAN.map((h) => {
        const hit = f === hitFu && h === hitHan;
        const isMine = !hit && f === mineFu && h === mineHan;
        const v = (f === 20 || f === 25) && h === 1 ? '–' : cell(f, h);
        return (
          <div key={h} className={cx(s.cell, hit ? s.hit : isMine ? s.mine : (f === hitFu || h === hitHan) && s.soft, !hit && !isMine && v === '만관' && s.limit)}>
            {v}
          </div>
        );
      })}
    </>
  );
}
