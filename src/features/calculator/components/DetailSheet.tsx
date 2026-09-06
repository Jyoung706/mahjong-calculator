import type { ScoreResult, Wind } from '../../../../engine/types';
import { errorLabel, fuLabel, LIMIT_LABEL, YAKU_LABEL, YAKUMAN_LABEL } from '../../../lib/scoreLabels';
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
  honba: number;
  riichiSticks: number;
  onClose: () => void;
  onContact: () => void;
}

export function DetailSheet({ open, result, missing, isDealer, isTsumo, roundWind, seatWind, honba, riichiSticks, onClose, onContact }: Props) {
  const ok = result?.valid === true;
  // 본장은 총액으로 항상 300점(론 300 / 쯔모 각 100 × 3), 리치봉은 1개당 1000점
  const honbaBonus = honba * 300;
  const stickBonus = riichiSticks * 1000;
  const settled = ok && (honbaBonus > 0 || stickBonus > 0);
  const num = (v?: number) => v?.toLocaleString() ?? '-';
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
            {ok ? `${result.han}판 ${result.limit ? LIMIT_LABEL[result.limit] : `${result.fu}부`} · ${isDealer ? '친' : '자'} · ${isTsumo ? '쯔모' : '론'}` : '—'}
          </div>
          <div className={s.headlineRow}>
            <div className={`mono ${s.headline}`}>{ok ? result.payment.total.toLocaleString() : '––––'}</div>
            <div className={s.unit}>점</div>
          </div>
        </div>

        <div className={s.body}>
          {!ok && <div className={`notice ${s.errNotice}`}>{result?.error ? errorLabel(result.error) : missing}</div>}

          {ok && result.yakuman.length > 0 && (
            <Block title="성립한 역만" right="">
              {result.yakuman.map((y) => <Line key={y.id} name={YAKUMAN_LABEL[y.id]} val={y.multiplier > 1 ? '더블' : '역만'} />)}
            </Block>
          )}
          {ok && result.yakuman.length === 0 && (
            <>
              <Block title="성립한 역" right={`합 ${result.han}판`}>
                {result.yaku.map((y) => <Line key={y.id} name={YAKU_LABEL[y.id]} val={`${y.han}판`} />)}
              </Block>
              <Block title="부 계산" right={`${result.fu}부`}>
                {result.fuBreakdown.map((f, i) => <Line key={i} name={fuLabel(f, roundWind, seatWind)} val={`${f.fu}부`} />)}
                <Line name="절상 후" val={`${result.fu}부`} bold />
              </Block>
              <div className={s.block}>
                <div className={s.blockHead}>
                  <div className={s.blockTitle}>점수표 대조</div>
                  <div className={s.blockRight}>{result.limit ? '판수가 높아 고정 점수' : `현재: ${result.han}판 ${result.fu}부`}</div>
                </div>
                <ScoreGrid han={result.han} fu={result.fu} isDealer={isDealer} isTsumo={isTsumo} limited={!!result.limit} />
                {settled && <div className={s.gridNote}>표의 값은 본장·리치봉을 뺀 기본 점수입니다</div>}
              </div>
            </>
          )}

          {ok && (
            <Block title="지불 내역" right={isTsumo ? '쯔모' : '론'}>
              {!isTsumo && <Line name="방총자에게서" val={num(result.payment.ron)} />}
              {isTsumo && isDealer && <Line name="자 3명에게서 각" val={num(result.payment.tsumoFromNonDealer)} />}
              {isTsumo && !isDealer && (
                <>
                  <Line name="친에게서" val={num(result.payment.tsumoFromDealer)} />
                  <Line name="자 2명에게서 각" val={num(result.payment.tsumoFromNonDealer)} />
                </>
              )}
              {stickBonus > 0 && <Line name={`리치봉 ${riichiSticks}개 회수`} val={`+${stickBonus.toLocaleString()}`} />}
              <Line name="받는 점수" val={num(result.payment.total)} bold />
              {honbaBonus > 0 && (
                <div className={s.blockNote}>
                  위 금액에는 {honba}본장({isTsumo ? '각 100' : '300'}점)이 포함되어 있습니다
                </div>
              )}
            </Block>
          )}

          <div onClick={onClose} className={s.returnBtn}>패 수정으로 돌아가기</div>

          <button type="button" onClick={onContact} className={s.askBox}>
            <div className={s.askCol}>
              <div className={s.askTitle}>계산이 이상한가요?</div>
              <div className={s.askDesc}>현재 손패·룰 설정·결과가 함께 전달됩니다</div>
            </div>
            <div className={s.askArrow}>→</div>
          </button>
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
