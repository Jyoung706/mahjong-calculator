import type { ScoreResult, Wind } from '../../../../engine/types';
import { formatTileText } from '../../../lib/tileAssets';
import { ScoreGrid } from '../../../components/ScoreGrid';
import { cx } from '../../../lib/cx';
import s from './DetailSheet.module.css';

interface Props {
  open: boolean;
  result: ScoreResult | null;
  missing: string;
  isDealer: boolean;
  isTsumo: boolean;
  roundWind: Wind;
  seatWind: Wind;
  onClose: () => void;
}

export function DetailSheet({ open, result, missing, isDealer, isTsumo, roundWind, seatWind, onClose }: Props) {
  const ok = result?.valid === true;
  return (
    <>
      <div onClick={onClose} className={cx(s.backdrop, open && s.backdropOpen)} />
      <div className={cx(s.sheet, open && s.sheetOpen)}>
        <div onClick={onClose} className={s.handle}><div className={s.handleBar} /></div>
        <div className={s.head}>
          <div className={s.headTitle}>계산 상세</div>
          <div onClick={onClose} className={s.closeText}>닫기</div>
        </div>

        <div className={s.summary}>
          <div className={`mono ${s.summarySub}`}>
            {ok ? `${result.han}판 ${result.limitName ?? `${result.fu}부`} · ${isDealer ? '친' : '자'} · ${isTsumo ? '쯔모' : '론'}` : '—'}
          </div>
          <div className={s.headlineRow}>
            <div className={`mono ${s.headline}`}>{ok ? result.payment.total.toLocaleString() : '––––'}</div>
            <div className={s.unit}>점</div>
          </div>
        </div>

        <div className={s.body}>
          {!ok && <div className={`notice ${s.errNotice}`}>{result ? result.error : missing}</div>}

          {ok && result.yakuman.length > 0 && (
            <Block title="성립한 역만" right="">
              {result.yakuman.map((y) => <Line key={y.name} name={y.name} val={y.multiplier > 1 ? '더블' : '역만'} />)}
            </Block>
          )}
          {ok && result.yakuman.length === 0 && (
            <>
              <Block title="성립한 역" right={`합 ${result.han}판`}>
                {result.yaku.map((y) => <Line key={y.name} name={y.name} val={`${y.han}판`} />)}
              </Block>
              <Block title="부 계산" right={`${result.fu}부`}>
                {result.fuBreakdown.map((f, i) => <Line key={i} name={formatTileText(f.label, roundWind, seatWind)} val={`${f.fu}부`} />)}
                <Line name="절상 후" val={`${result.fu}부`} bold />
              </Block>
              <div className={s.block}>
                <div className={s.blockHead}>
                  <div className={s.blockTitle}>점수표 대조</div>
                  <div className={s.blockRight}>{result.limitName ? '판수가 높아 고정 점수' : `현재: ${result.han}판 ${result.fu}부`}</div>
                </div>
                <ScoreGrid han={result.han} fu={result.fu} isDealer={isDealer} isTsumo={isTsumo} limited={!!result.limitName} />
              </div>
            </>
          )}

          <div onClick={onClose} className={s.returnBtn}>패 수정으로 돌아가기</div>
        </div>
      </div>
    </>
  );
}

function Block({ title, right, children }: { title: string; right: string; children: React.ReactNode }) {
  return (
    <div className={s.block}>
      <div className={s.blockHead}>
        <div className={s.blockTitle}>{title}</div>
        <div className={`mono ${s.blockRight}`}>{right}</div>
      </div>
      <div className={`card ${s.blockCard}`}>{children}</div>
    </div>
  );
}

function Line({ name, val, bold = false }: { name: string; val: string; bold?: boolean }) {
  return (
    <div className={cx(s.line, bold && s.lineBold)}>
      <span className={s.lineName}>{name}</span>
      <span className={`mono ${s.lineVal}`}>{val}</span>
    </div>
  );
}
