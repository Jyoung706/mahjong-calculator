import { useState } from 'react';
import { DEFAULT_RULES } from '../../../engine';
import type { Rules } from '../../../engine/types';
import { TileView } from '../../components/Tile';
import { WIND_LABELS } from '../../lib/tileAssets';
import { errorLabel, LIMIT_LABEL } from '../../lib/scoreLabels';
import { cx } from '../../lib/cx';
import { CATEGORIES, type ContactAttachment, type ContactCategory, type ContactPayload } from './types';
import s from './ContactPage.module.css';

const MAX_MESSAGE = 2000;
const MAX_TILES = 8; // 손패는 앞 8장만 미리보기 (전체는 첨부 JSON에)

interface Props {
  attachment?: ContactAttachment;
  defaultCategory?: ContactCategory;
  onBack: () => void;
}

type Status = 'idle' | 'sending' | 'done' | 'error';

export function ContactPage({ attachment, defaultCategory = 'other', onBack }: Props) {
  const [category, setCategory] = useState<ContactCategory>(defaultCategory);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState(''); // 허니팟
  const [attached, setAttached] = useState(true);
  const [status, setStatus] = useState<Status>('idle');

  const canSubmit = message.trim().length >= 5 && status !== 'sending';
  const placeholder = CATEGORIES.find((c) => c.key === category)!.placeholder;

  const submit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    const payload: ContactPayload = {
      category,
      message: message.trim(),
      contact: contact.trim() || undefined,
      website,
      attachment: attached ? attachment : undefined,
      meta: { url: location.href, userAgent: navigator.userAgent, version: __APP_VERSION__ },
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="page">
        <header className="page-header">
          <div className="page-title">문의하기</div>
        </header>
        <div className={s.done}>
          <div className={s.doneMark}>✓</div>
          <div className={s.doneTitle}>문의를 보냈습니다</div>
          <div className={s.doneBody}>
            남겨주신 내용을 확인하고 반영하겠습니다.
            {contact.trim() && <><br />회신이 필요한 경우 남겨주신 곳으로 연락드립니다.</>}
          </div>
          <button type="button" className={s.doneBtn} onClick={onBack}>돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <button type="button" onClick={onBack} className="back-btn">←</button>
        <div className="page-title">문의하기</div>
      </header>

      <div className={s.body}>
        <div className={s.section}>
          <div className={s.sectionHead}>
            <div className={s.sectionTitle}>무엇에 대한 문의인가요?</div>
          </div>
          <div className={`card ${s.list}`}>
            {CATEGORIES.map((c) => {
              const on = c.key === category;
              return (
                <div key={c.key} className={cx(s.item, on && s.itemOn)} onClick={() => setCategory(c.key)}>
                  <div className={cx(s.dot, on && s.dotOn)} />
                  <div className={s.itemBody}>
                    <div className={cx(s.itemName, on && s.itemNameOn)}>{c.name}</div>
                    {c.desc && <div className={s.itemDesc}>{c.desc}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {attachment && attached && (
          <div className={s.section}>
            <div className={s.sectionHead}>
              <div className={s.sectionTitle}>함께 보내는 정보</div>
              <button type="button" className={s.linkBtn} onClick={() => setAttached(false)}>첨부 해제</button>
            </div>
            <AttachmentCard attachment={attachment} />
          </div>
        )}
        {attachment && !attached && (
          <div className={s.section}>
            <div className={s.sectionHead}>
              <div className={s.sectionTitle}>함께 보내는 정보</div>
              <button type="button" className={s.linkBtn} onClick={() => setAttached(true)}>다시 첨부</button>
            </div>
            <div className="notice">첨부하지 않고 보냅니다 — 손패·룰 정보 없이는 재현이 어려울 수 있습니다.</div>
          </div>
        )}

        <div className={s.section}>
          <div className={s.sectionHead}>
            <div className={s.sectionTitle}>
              {category === 'wrong-result' ? '어떤 점이 이상했나요?' : '내용'}
            </div>
          </div>
          <textarea
            className={s.textarea}
            value={message}
            maxLength={MAX_MESSAGE}
            placeholder={placeholder}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className={s.counter}>{message.length} / {MAX_MESSAGE}</div>
        </div>

        <div className={s.section}>
          <div className={s.sectionHead}>
            <div className={s.sectionTitle}>답장받을 곳 <span className={s.optional}>선택</span></div>
          </div>
          <input
            className={s.input}
            value={contact}
            maxLength={200}
            placeholder="이메일 또는 디스코드 아이디"
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        {/* 허니팟 — 사람에게는 보이지 않음 */}
        <input className={s.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true"
          value={website} onChange={(e) => setWebsite(e.target.value)} />

        <button type="button" className={cx(s.submit, !canSubmit && s.submitDisabled)} onClick={submit}>
          {status === 'sending' ? '보내는 중…' : '보내기'}
        </button>
        {status === 'error' && (
          <div className={`notice ${s.error}`}>보내지 못했습니다. 잠시 후 다시 시도해 주세요.</div>
        )}
        <div className={s.note}>첨부 정보는 문의 확인에만 사용합니다.</div>
      </div>
    </div>
  );
}

function AttachmentCard({ attachment }: { attachment: ContactAttachment }) {
  const { input, result, rules } = attachment;
  const changed = changedRuleCount(rules);
  const tiles = input ? input.concealed : [];
  const shown = tiles.slice(0, MAX_TILES);

  return (
    <div className={`card ${s.attach}`}>
      {input && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className={`mono ${s.attachLabel}`}>손패 · 화료패</div>
            <div className={s.attachTiles}>
              {shown.map((t, i) => <TileView key={i} id={t} size={22} />)}
              {tiles.length > shown.length && <div className={`mono ${s.ellipsis}`}>…</div>}
              <TileView id={input.winningTile} size={22} dimmed />
            </div>
          </div>
          <div className={s.hr} />
          <div className={s.facts}>
            <Fact k="장풍 · 자풍" v={`${wind(input.roundWind)} · ${wind(input.seatWind)}`} />
            <Fact k="화료" v={input.isTsumo ? '쯔모' : '론'} />
            {result?.valid ? (
              <>
                <Fact k="계산 결과" v={result.yakuman.length > 0 && result.limit ? LIMIT_LABEL[result.limit] : `${result.han}판 ${result.fu}부`} />
                <Fact k="점수" v={result.payment.total.toLocaleString()} />
              </>
            ) : (
              <Fact k="계산 결과" v={result?.error ? errorLabel(result.error) : '—'} />
            )}
          </div>
          <div className={s.hr} />
        </>
      )}
      <div className={s.factRow}>
        <span className={s.factKey}>룰 설정</span>
        <span className={cx('mono', changed > 0 ? s.factAccent : s.factKey)}>
          {changed > 0 ? `기본값에서 ${changed}개 변경` : '기본값'}
        </span>
      </div>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className={s.fact}>
      <span className={s.factKey}>{k}</span>
      <span className="mono">{v}</span>
    </div>
  );
}

const wind = (w: string) => WIND_LABELS['1234'.indexOf(w[0])];
const changedRuleCount = (rules: Rules) =>
  (Object.keys(DEFAULT_RULES) as (keyof Rules)[]).filter((k) => rules[k] !== DEFAULT_RULES[k]).length;
