import fetch from 'node-fetch';

const AV_BASE = 'https://agentverse.ai/v1';

const jsonResponse = (status, body) => ({
  statusCode: status,
  headers: {
    // CORS
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    // JSON
    'Content-Type': 'application/json'
  },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

export const handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path || '/';
    const key = process.env.AGENTVERSE_API_KEY;

    if (!key) return jsonResponse(500, { error: 'Missing AGENTVERSE_API_KEY env on Lambda' });

    // Preflight CORS
    if (method === 'OPTIONS') return jsonResponse(200, {});

    // POST /submit  -> forwards to Agentverse Proxy submit
    if (method === 'POST' && path.endsWith('/submit')) {
      const body = event.body || '{}';
      const res = await fetch(`${AV_BASE}/proxy/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body
      });
      const text = await res.text();
      return jsonResponse(res.status, text);
    }

const almanacDigests = path.startsWith('/Prod/almanac/manifests/digests') || path.startsWith('/almanac/manifests/digests');
if (method === 'GET' && almanacDigests) {
  const qs = event.queryStringParameters || {};
  const sp = new URLSearchParams(qs).toString();
  const url = `${AV_BASE}/almanac/manifests/digests${sp ? `?${sp}` : ''}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${key}` } });
  const text = await res.text();
  return jsonResponse(res.status, text);
}

    // GET /resolve/{address} -> forwards to Agentverse Proxy resolve
    const resolveMatch = path.match(/\/resolve\/(.+)$/);
    if (method === 'GET' && resolveMatch) {
      const address = decodeURIComponent(resolveMatch[1]);
      const res = await fetch(`${AV_BASE}/proxy/resolve/${address}`, {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      const text = await res.text();
      return jsonResponse(res.status, text);
    }

    // GET /search/agents/{address} -> fetch full agent profile (incl. protocols, endpoint)
    const profileMatch = path.match(/\/search\/agents\/(.+)$/);
    if (method === 'GET' && profileMatch) {
      const address = decodeURIComponent(profileMatch[1]);
      const url = `${AV_BASE}/search/agents/${address}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${key}` } });
      const text = await res.text();
      return jsonResponse(res.status, text);
    }

    return jsonResponse(404, { error: 'Not found' });
  } catch (e) {
    return jsonResponse(500, { error: String(e?.message || e) });
  }


  
};
