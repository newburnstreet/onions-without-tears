// Worker entry point - handles both static assets and visitor tracking

interface Env {
  VISITORS: KVNamespace;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle API endpoint for fetching visitors
    if (path === '/api/visitors') {
      const password = url.searchParams.get('key');
      if (password !== 'onions2026') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!env.VISITORS) {
        return new Response(JSON.stringify({ error: 'KV not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const list = await env.VISITORS.list({ prefix: 'visit_', limit: 500 });
      const visitors = await Promise.all(
        list.keys.map(async (key) => {
          const data = await env.VISITORS.get(key.name);
          return data ? JSON.parse(data) : null;
        })
      );

      const sorted = visitors
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return new Response(JSON.stringify(sorted), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      });
    }

    // Handle API endpoint for clearing visitors
    if (path === '/api/visitors/clear') {
      const password = url.searchParams.get('key');
      if (password !== 'onions2026') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!env.VISITORS) {
        return new Response(JSON.stringify({ error: 'KV not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      let deleted = 0;
      let cursor: string | undefined;
      do {
        const list = await env.VISITORS.list({ prefix: 'visit_', limit: 500, cursor });
        await Promise.all(list.keys.map(key => env.VISITORS.delete(key.name)));
        deleted += list.keys.length;
        cursor = list.list_complete ? undefined : list.cursor;
      } while (cursor);

      return new Response(JSON.stringify({ deleted }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle client-side tracking beacon
    if (path === '/api/track' && request.method === 'POST') {
      const visitorIp = request.headers.get('CF-Connecting-IP') || 'unknown';
      const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://onionswithouttears.co.uk',
        'Content-Type': 'application/json',
      };

      // Owner IP filters
      const ownerIPs = [
        '195.70.68.56',          // owner mobile (iPhone)
        '2a00:23c6:7e52:ed01:', // owner home broadband (IPv6 /64)
      ];
      if (ownerIPs.some(ip => visitorIp.startsWith(ip))) return new Response('{}', { headers: corsHeaders });

      try {
        const body = await request.json() as any;
        const page = (body.page || '/').toString().slice(0, 200);
        const referrer = (body.referrer || 'direct').toString().slice(0, 500);
        const userAgent = request.headers.get('User-Agent') || 'unknown';

        const cf = (request as any).cf || {};
        const visitor = {
          ip: visitorIp,
          city: cf.city || 'unknown',
          region: cf.region || 'unknown',
          country: cf.country || 'unknown',
          timezone: cf.timezone || 'unknown',
          page,
          referrer,
          userAgent,
          timestamp: new Date().toISOString(),
        };

        const key = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        ctx.waitUntil(
          env.VISITORS.put(key, JSON.stringify(visitor), { expirationTtl: 60 * 60 * 24 * 30 })
        );
      } catch {}

      return new Response('{}', { headers: corsHeaders });
    }

    // Handle CORS preflight for tracking
    if (path === '/api/track' && request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://onionswithouttears.co.uk',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Serve static assets
    let response = await env.ASSETS.fetch(request);

    // Serve custom 404 page for not found responses
    if (response.status === 404) {
      const notFoundPage = await env.ASSETS.fetch(new Request(new URL('/404.html', request.url)));
      if (notFoundPage.status === 200) {
        response = new Response(notFoundPage.body, {
          status: 404,
          headers: notFoundPage.headers,
        });
      }
    }

    return response;
  },
};
