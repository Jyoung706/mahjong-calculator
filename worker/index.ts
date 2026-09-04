// Workers 진입점 — /api/* 는 이 Worker가 처리하고, 나머지는 정적 자산(dist)으로 넘긴다.
// 정적 자산 라우팅은 wrangler.jsonc의 assets 설정(SPA 폴백 포함)을 따른다.
import { handleContact } from './handleContact';

export interface Env {
  ASSETS: Fetcher;
  DISCORD_WEBHOOK_URL: string;
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
      return handleContact(request, env);
    }
    if (pathname.startsWith('/api/')) return new Response('Not Found', { status: 404 });

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
