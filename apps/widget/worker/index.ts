interface Env {
  BUCKET: R2Bucket;
}

const ALLOWED_FILES = ['widget.umd.js', 'widget.es.js'];

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Content-Type': 'application/javascript; charset=utf-8',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove leading slash

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow GET and HEAD
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Validate file path
    if (!ALLOWED_FILES.includes(path)) {
      return new Response('Not Found', { status: 404 });
    }

    // Try to get object from R2
    const object = await env.BUCKET.get(path);

    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    // Return the widget file with CDN headers
    return new Response(object.body, {
      headers: {
        ...CACHE_HEADERS,
        'ETag': object.httpEtag,
      },
    });
  },
};
