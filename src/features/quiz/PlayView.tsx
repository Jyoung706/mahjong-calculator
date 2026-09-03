import { useState } from 'react';
import type { QuizProblem } from '../../../engine/generate';
import { TileView } from '../../components/Tile';
import { ScoreGrid } from '../../components/ScoreGrid';
import { WIND_LABELS, formatTileText } from '../../lib/tileAssets';
import { MELD_LABELS } from '../calculator/useCalculatorState';
import { cx } from '../../lib/cx';
import { HAN_CHIPS, FU_CHIPS, hanBracket, type QuizMode, type QuizRecord } from './types';
import { RefSheet } from './RefSheet';
import s from './PlayView.module.css';

interface Props {
  problem: QuizProblem;
  mode: QuizMode;
  unlimited: boolean;
  answeredCount: number;
  onNext: (record: QuizRecord) => void;
  onEndSession: () => void;
}

export function PlayView({ problem, mode, unlimited, answeredCount, onNext, onEndSession }: Props) {
  const [myHan, setMyHan] = useState<number | null>(null);
  const [myFu, setMyFu] = useState<number | null>(null);
  const [myScore, setMyScore] = useState('');      // 론 총점 / 친 쯔모 "올" 지불액
  const [myScoreOya, setMyScoreOya] = useState(''); // 자 쯔모: 친 지불액
  const [graded, setGraded] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [refOpen, setRefOpen] = useState(false);

  const { input, result } = problem;
  const isDealer = input.seatWind === '1z';
  const limited = !!result.limitName || result.yakuman.length > 0;

  // 채점 대상: 모드 + 만관 이상이면 부수 제외 (명세 §17.2)
  const askHan = mode === 'full';
  const askFu = mode !== 'score' && !limited;
  const askScore = mode !== 'fu';

  // 쯔모는 지불액 단위로 채점 (명세 §17.2): 자 쯔모 = 자/친 2칸, 친 쯔모 = "올" 1칸, 론 = 총점 1칸
  const koTsumo = input.isTsumo && !isDealer;
  const answerHanChip = hanBracket(result.han);
  const scoreFilled = koTsumo ? myScore.length > 0 && myScoreOya.length > 0 : myScore.length > 0;
  const canSubmit = (!askHan || myHan !== null) && (!askFu || myFu !== null) && (!askScore || scoreFilled);

  const num = (v: string) => v.replace(/[^0-9]/g, '');
  const scoreOk = !input.isTsumo
    ? num(myScore) === String(result.payment.total)
    : isDealer
      ? num(myScore) === String(result.payment.tsumoFromNonDealer)
      : num(myScore) === String(result.payment.tsumoFromNonDealer) && num(myScoreOya) === String(result.payment.tsumoFromDealer);
  const myScoreDisplay = koTsumo ? `${myScore || '?'}/${myScoreOya || '?'}` : myScore;
  const grade = (gave: boolean): QuizRecord => ({
    problem,
    myHan, myFu, myScore: myScoreDisplay, gaveUp: gave,
    hanOk: askHan ? !gave && myHan === answerHanChip : null,
    fuOk: askFu ? !gave && myFu === result.fu : null,
    scoreOk: askScore ? !gave && scoreOk : null,
    allOk: !gave && (!askHan || myHan === answerHanChip) && (!askFu || myFu === result.fu) && (!askScore || scoreOk),
  });
  const record = graded ? grade(gaveUp) : null;

  const submit = () => {
    if (graded) onNext(record!);
    else if (canSubmit) setGraded(true);
  };
  const giveUp = () => {
    if (graded) return;
    setGaveUp(true);
    setGraded(true);
  };

  const chipClass = (picked: boolean, isAnswer: boolean) => {
    if (!graded) return cx(s.chip, 'mono', picked && s.chipPicked);
    if (isAnswer) return cx(s.chip, 'mono', s.chipAnswer);
    if (picked) return cx(s.chip, 'mono', s.chipWrong);
    return cx(s.chip, 'mono');
  };

  return (
    <>
      <div className={s.body}>
        {/* 조건 */}
        <div className={`card ${s.cond}`}>
          <div className={s.condCol}>
            <div className={`mono ${s.condLabel}`}>장풍 / 자풍</div>
            <div className={s.condVal}>{windLabel(input.roundWind)} / {windLabel(input.seatWind)}</div>
          </div>
          <div className={s.condDivider} />
          <div className={s.condCol}>
            <div className={`mono ${s.condLabel}`}>화료</div>
            <div className={s.condVal}>{input.isTsumo ? '쯔모' : '론'} · {input.riichi ? '리치' : input.melds.length > 0 ? '부로' : '멘젠'}</div>
          </div>
          <div className={s.condDivider} />
          <div className={s.condCol}>
            <div className={`mono ${s.condLabel}`}>도라 표시패</div>
            <div className={s.condTiles}>
              {input.doraIndicators.map((t, i) => <TileView key={i} id={t} size={22} />)}
            </div>
          </div>
          {input.riichi && input.uraDoraIndicators.length > 0 && (
            <div className={s.condCol}>
              <div className={`mono ${s.condLabel}`}>우라 표시패</div>
              <div className={s.condTiles}>
                {input.uraDoraIndicators.map((t, i) => <TileView key={i} id={t} size={22} />)}
              </div>
            </div>
          )}
        </div>

        {/* 손패 */}
        <div className={s.titleRow}>
          <div className={s.sectionTitle}>이 손패의 점수는?</div>
          <button type="button" className={s.refBtn} onClick={() => setRefOpen(true)}>점수표 ↑</button>
        </div>
        <div className={`card ${s.handCard}`}>
          <div className={s.handTiles}>
            {problem.handDisplay.map((t, i) => <TileView key={i} id={t.id} red={t.red} size={30} />)}
          </div>
          <div className={s.winCol}>
            <TileView id={problem.winDisplay.id} red={problem.winDisplay.red} size={34} dimmed />
            <div className={`mono ${s.winLabel}`}>화료</div>
          </div>
        </div>
        {problem.meldsDisplay.length > 0 && (
          <div className={s.meldRow}>
            {problem.meldsDisplay.map((m, i) => (
              <div key={i} className={s.meldCard}>
                <div className={`mono ${s.meldType}`}>{MELD_LABELS[m.type]} (부로)</div>
                <div className={s.meldTiles}>
                  {m.tiles.map((t, j) => <TileView key={j} id={t.id} red={t.red} size={24} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 판 */}
        {askHan && (
          <div className={s.block}>
            <div className={s.sectionTitle}>판수</div>
            <div className={s.hanGrid}>
              {HAN_CHIPS.map((v) => (
                <button key={v} type="button" className={chipClass(myHan === v, graded && v === answerHanChip)}
                  onClick={() => { if (!graded) setMyHan(v); }}>
                  {v}판
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 부 */}
        {mode !== 'score' && (
          <div className={s.block}>
            <div className={s.sectionTitle}>부수</div>
            <div className={s.fuGrid}>
              {FU_CHIPS.map((v) => (
                <button key={v} type="button"
                  className={cx(chipClass(myFu === v, graded && askFu && v === result.fu), limited && s.chipDisabled)}
                  onClick={() => { if (!graded && !limited) setMyFu(v); }}>
                  {v}
                </button>
              ))}
            </div>
            {limited && <div className={s.fuSkipNote}>만관 이상은 부수와 무관하게 점수가 고정되어 부수는 채점하지 않습니다</div>}
          </div>
        )}

        {/* 점수 */}
        {askScore && (
          <div className={s.block}>
            <div className={s.sectionTitle}>
              {!input.isTsumo ? '지불 점수' : isDealer ? '지불 점수 — 전원 동액 (올)' : '지불 점수 — 자 / 친 각각'}
            </div>
            {koTsumo ? (
              <div className={s.scorePair}>
                <ScoreInput label="자 지불" value={myScore} onChange={setMyScore} graded={graded}
                  ok={num(myScore) === String(result.payment.tsumoFromNonDealer)} />
                <ScoreInput label="친 지불" value={myScoreOya} onChange={setMyScoreOya} graded={graded}
                  ok={num(myScoreOya) === String(result.payment.tsumoFromDealer)} />
              </div>
            ) : (
              <ScoreInput label={input.isTsumo ? '1인당' : '총점'} value={myScore} onChange={setMyScore} graded={graded} ok={scoreOk} />
            )}
          </div>
        )}

        {/* 채점 결과 */}
        {graded && record && (
          <>
            <div className={cx(s.verdict, record.allOk ? s.verdictOk : s.verdictNo)}>
              {record.allOk
                ? `정답 — ${result.han}판 ${limited ? result.limitName : `${result.fu}부`} ${result.payment.total.toLocaleString()}`
                : `정답은 ${result.han}판 ${limited ? result.limitName : `${result.fu}부`} · ${result.payment.total.toLocaleString()}점`}
            </div>

            <div className={`card ${s.answerCard}`}>
              <div className={`mono ${s.answerSub}`}>
                {result.han}판 {limited ? result.limitName : `${result.fu}부`} · {isDealer ? '친' : '자'} · {input.isTsumo ? '쯔모' : '론'}
              </div>
              <div className={s.answerScoreRow}>
                <div className={`mono ${s.answerScore}`}>{result.payment.total.toLocaleString()}</div>
                <div className={s.answerUnit}>점</div>
              </div>
              <div className={s.answerPay}>{payText(result, isDealer, input.isTsumo)}</div>
            </div>

            {!gaveUp && (
              <div className={`card ${s.myGrid}`}>
                {askHan && <MyCol label="내 판수" val={myHan !== null ? `${myHan}판` : '미선택'} ok={record.hanOk === true} />}
                {askFu && <MyCol label="내 부수" val={myFu !== null ? `${myFu}부` : '미선택'} ok={record.fuOk === true} />}
                {askScore && <MyCol label="내 점수" val={scoreFilled ? myScoreDisplay : '미입력'} ok={record.scoreOk === true} />}
              </div>
            )}

            <div className={s.blockHead}>
              <div className={s.sectionTitle} style={{ marginBottom: 0 }}>성립한 역</div>
              <div className={`mono ${s.blockRight}`}>{result.yakuman.length > 0 ? result.limitName : `합 ${result.han}판`}</div>
            </div>
            <div className={`card ${s.listCard}`}>
              {result.yakuman.length > 0
                ? result.yakuman.map((y) => <Line key={y.name} name={y.name} val={y.multiplier > 1 ? '더블' : '역만'} />)
                : result.yaku.map((y) => <Line key={y.name} name={y.name} val={`${y.han}판`} />)}
            </div>

            {result.yakuman.length === 0 && (
              <>
                <div className={s.blockHead}>
                  <div className={s.sectionTitle} style={{ marginBottom: 0 }}>부 계산</div>
                  <div className={`mono ${s.blockRight}`}>{result.fu}부</div>
                </div>
                <div className={`card ${s.listCard}`}>
                  {result.fuBreakdown.map((f, i) => (
                    <Line key={i} name={formatTileText(f.label, input.roundWind, input.seatWind)} val={`${f.fu}부`} />
                  ))}
                </div>

                {!limited && (
                  <>
                    <div className={s.blockHead}>
                      <div className={s.sectionTitle} style={{ marginBottom: 0 }}>점수표 대조</div>
                      <div className={s.blockRight}>정답 · 내 답</div>
                    </div>
                    <div className={s.block}>
                      <ScoreGrid han={result.han} fu={result.fu} isDealer={isDealer} isTsumo={input.isTsumo} limited={false}
                        mine={{ han: myHan, fu: myFu }} />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {!graded && <div className={s.hint}>판 → 부 → 점수 순으로 답해보세요</div>}
        {unlimited && answeredCount > 0 && (
          <button type="button" className={s.endLink} onClick={onEndSession}>세션 종료하고 결과 보기</button>
        )}
      </div>

      <div className={s.footer}>
        {!graded && <button type="button" className={s.giveUpBtn} onClick={giveUp}>모르겠음</button>}
        <button type="button" className={cx(s.submitBtn, (graded || canSubmit) && s.submitReady)} onClick={submit}>
          {graded ? '다음 문제' : '정답 확인'}
        </button>
      </div>

      <RefSheet open={refOpen} isTsumo={input.isTsumo} onClose={() => setRefOpen(false)} />
    </>
  );
}

const windLabel = (w: string) => WIND_LABELS['1234'.indexOf(w[0])];

function payText(result: QuizProblem['result'], isDealer: boolean, isTsumo: boolean): string {
  const p = result.payment;
  if (!isTsumo) return `방총자에게서 ${p.ron?.toLocaleString()} 수취`;
  if (isDealer) return `전원에게서 각 ${p.tsumoFromNonDealer?.toLocaleString()}`;
  return `자 ${p.tsumoFromNonDealer?.toLocaleString()} · 친 ${p.tsumoFromDealer?.toLocaleString()}`;
}

function ScoreInput({ label, value, onChange, graded, ok }: {
  label: string; value: string; onChange: (v: string) => void; graded: boolean; ok: boolean;
}) {
  return (
    <div className={cx(s.scoreBox, graded && (ok ? s.scoreBoxOk : s.scoreBoxWrong))}>
      <div className={s.scoreLabel}>{label}</div>
      <input
        value={value}
        onChange={(e) => { if (!graded) onChange(e.target.value.replace(/[^0-9]/g, '')); }}
        inputMode="numeric"
        placeholder="0"
        className={cx(s.scoreInput, graded && (ok ? s.scoreInputOk : s.scoreInputWrong))}
      />
      <div className={s.scoreUnit}>점</div>
    </div>
  );
}

function MyCol({ label, val, ok }: { label: string; val: string; ok: boolean }) {
  return (
    <div className={s.myCol}>
      <div className={`mono ${s.condLabel}`}>{label}</div>
      <div className={cx('mono', s.myVal, ok ? s.myOk : s.myWrong)}>{val}</div>
    </div>
  );
}

function Line({ name, val }: { name: string; val: string }) {
  return (
    <div className={s.line}>
      <span>{name}</span>
      <span className={`mono ${s.lineVal}`}>{val}</span>
    </div>
  );
}
