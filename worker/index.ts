// Workers 진입점 — /api/* 는 이 Worker가 처리하고, 나머지는 정적 자산(dist)으로 넘긴다.
// 정적 자산 라우팅은 wrangler.jsonc의 assets 설정(SPA 폴백 포함)을 따른다.
import { handleContact } from './handleContact';

export interface Env {
  ASSETS: Fetcher;
  DISCORD_WEBHOOK_URL: string;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // www 는 정식 주소로 통일 (검색엔진 중복 색인 방지)
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    const { pathname } = url;

    if (pathname === '/api/contact') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
      return handleContact(request, env);
    }
    if (pathname.startsWith('/api/')) return new Response('Not Found', { status: 404 });

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
