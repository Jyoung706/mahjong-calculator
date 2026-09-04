// 문의를 받아 Discord 웹훅으로 전달
// 환경변수: DISCORD_WEBHOOK_URL (Workers 설정 > Variables and Secrets에 Secret으로 등록)
import type { Env } from './index';

const CATEGORY_LABELS: Record<string, string> = {
  'wrong-result': '계산 결과가 이상함',
  'rule-request': '룰 추가 요청',
  usability: '사용이 불편함',
  other: '그 외',
};

const MAX_MESSAGE = 2000;
const MAX_CONTACT = 200;

export async function handleContact(request: Request, env: Env): Promise<Response> {
  if (!env.DISCORD_WEBHOOK_URL) return json({ error: 'not_configured' }, 500);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  // 허니팟 — 사람은 비워두는 필드. 채워져 있으면 봇이므로 조용히 성공 처리
  if (typeof body.website === 'string' && body.website.length > 0) return json({ ok: true });

  const category = String(body.category ?? 'other');
  const message = String(body.message ?? '').trim();
  const contact = String(body.contact ?? '').trim().slice(0, MAX_CONTACT);
  if (message.length < 5 || message.length > MAX_MESSAGE) return json({ error: 'bad_message' }, 400);

  const attachment = body.attachment ?? null;
  const meta = (body.meta ?? {}) as Record<string, string>;
  const ip = request.headers.get('cf-connecting-ip') ?? '';

  const lines = [
    `**[${CATEGORY_LABELS[category] ?? category}]**`,
    message,
    contact ? `\n회신처: \`${contact}\`` : '',
    `\n-# ${meta.url ?? ''} · ${trim(meta.userAgent ?? '', 80)} · ${hash(ip)}`,
  ].filter(Boolean);

  // 첨부는 코드블록 JSON — 그대로 테스트 케이스로 재현 가능
  const files: { name: string; body: string }[] = [];
  if (attachment) {
    files.push({ name: 'attachment.json', body: JSON.stringify(attachment, null, 2) });
  }

  const form = new FormData();
  form.append(
    'payload_json',
    JSON.stringify({
      content: trim(lines.join('\n'), 1900),
      allowed_mentions: { parse: [] },
    }),
  );
  files.forEach((f, i) => form.append(`files[${i}]`, new Blob([f.body], { type: 'application/json' }), f.name));

  const res = await fetch(env.DISCORD_WEBHOOK_URL, { method: 'POST', body: form });
  if (!res.ok) return json({ error: 'delivery_failed' }, 502);
  return json({ ok: true });
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

const trim = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** IP 원문 대신 짧은 해시 — 중복 문의 식별용, 개인정보 최소화 */
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36).slice(0, 6);
}
