/**
 * Optional Cloudflare Worker + KV relay for real-time telemetry updates (<60s latency)
 * Free tier (100,000 reads/day + 1,000 writes/day on KV; no credit card needed).
 *
 * Bind KV namespace as TOPSY_KV and set secret PUT_TOKEN via:
 *   npx wrangler secret put PUT_TOKEN
 */

const ALLOWED_KEYS = new Set([
  'telemetry.json',
  'history_live.json',
  'history_daily.json',
  'history_ac.json',
  'biometrics.json',
  'thermal.jpg',
  'topsy_snapshot.jpg',
]);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const key = url.pathname.replace(/^\/+/, '');
    if (!ALLOWED_KEYS.has(key)) {
      return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    }

    const isJson = key.endsWith('.json');
    const contentType = isJson ? 'application/json; charset=utf-8' : 'image/jpeg';

    if (request.method === 'GET') {
      const data = await env.TOPSY_KV.get(key, { type: 'arrayBuffer' });
      if (!data) {
        return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
      }
      return new Response(data, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': contentType,
          'Cache-Control': isJson ? 'public, max-age=15' : 'public, max-age=30',
        },
      });
    }

    if (request.method === 'PUT') {
      const expected = `Bearer ${env.PUT_TOKEN || ''}`;
      if (!env.PUT_TOKEN || request.headers.get('Authorization') !== expected) {
        return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
      }
      const payload = await request.arrayBuffer();
      await env.TOPSY_KV.put(key, payload);
      return new Response(JSON.stringify({ ok: true, key, bytes: payload.byteLength }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
  },
};
