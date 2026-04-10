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

    // Get the response from static assets
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

    // Get visitor IP
    const visitorIp = request.headers.get('CF-Connecting-IP') || 'unknown';

    // Filter out owner's IP (IPv6 /64 prefix)
    const ownerIpPrefix = '2a00:23ee:19a0:dc0:';
    const isOwner = visitorIp.startsWith(ownerIpPrefix);

    // Normalize path
    const normalizedPath = path.replace(/\/+/g, '/');

    // Common bot/scanner paths to ignore
    const scannerPaths = [
      '/admin', '/api', '/wp-admin', '/wp-login.php', '/wp-content', '/wp-json',
      '/index.php', '/xmlrpc.php', '/login', '/administrator', '/phpmyadmin',
      '/mysql', '/controlpanel', '/oauth', '/signup', '/register', '/auth',
      '/.env', '/.git', '/.aws', '/.docker', '/.github', '/.gitlab', '/.well-known',
      '/config', '/backup', '/terraform', '/docker', '/serverless', '/package.json',
      '/upload', '/uploads', '/webhook', '/form', '/import', '/fileupload',
      '/test', '/debug', '/console', '/shell', '/cgi-bin', '/phpinfo', '/info.php',
      '/rest', '/graphql', '/v1', '/v2', '/_next', '/_vercel',
      '/stripe', '/payment', '/checkout', '/cart', '/orders', '/billing',
      '/aws', '/s3', '/srv', '/opt', '/var', '/etc', '/root', '/home',
    ];
    const isScanner = scannerPaths.some(p =>
      normalizedPath === p ||
      normalizedPath.startsWith(p + '/') ||
      normalizedPath.startsWith(p + '.')
    );

    // Only track real page visits
    const shouldTrack = response.status === 200 &&
      !isOwner &&
      !isScanner &&
      !path.startsWith('/_astro') &&
      !path.endsWith('.js') &&
      !path.endsWith('.css') &&
      !path.endsWith('.png') &&
      !path.endsWith('.jpg') &&
      !path.endsWith('.jpeg') &&
      !path.endsWith('.ico') &&
      !path.endsWith('.svg') &&
      !path.endsWith('.woff2') &&
      !path.endsWith('.xml') &&
      !path.endsWith('.txt') &&
      path !== '/visitors' &&
      !path.startsWith('/api/');

    if (shouldTrack && env.VISITORS) {
      const cf = (request as any).cf || {};
      const visitor = {
        ip: visitorIp,
        city: cf.city || 'unknown',
        region: cf.region || 'unknown',
        country: cf.country || 'unknown',
        latitude: cf.latitude || null,
        longitude: cf.longitude || null,
        timezone: cf.timezone || 'unknown',
        page: path || '/',
        referrer: request.headers.get('Referer') || 'direct',
        userAgent: request.headers.get('User-Agent') || 'unknown',
        timestamp: new Date().toISOString(),
      };

      const key = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      ctx.waitUntil(
        env.VISITORS.put(key, JSON.stringify(visitor), { expirationTtl: 60 * 60 * 24 * 30 })
      );
    }

    return response;
  },
};
