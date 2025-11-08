import fetch from 'node-fetch'

const AV_BASE = 'https://agentverse.ai/v1'

const jsonResponse = (status, body, cors=true) => ({
  statusCode: status,
  headers: cors ? { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' } : {},
  body: typeof body === 'string' ? body : JSON.stringify(body),
})

export const handler = async (event) => {
  try {
    const method = event.httpMethod
    const path = event.path || '/'
    const key = process.env.AGENTVERSE_API_KEY
    if (!key) return jsonResponse(500, { error: 'Missing AGENTVERSE_API_KEY env on Lambda' })

    if (method === 'OPTIONS') return jsonResponse(200, {})

    if (method === 'POST' && path.endsWith('/submit')) {
      const body = event.body || '{}'
      const res = await fetch(`${AV_BASE}/proxy/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body
      })
      const text = await res.text()
      return jsonResponse(res.status, text)
    }

    const resolveMatch = path.match(/\/resolve\/(.+)$/)
    if (method === 'GET' && resolveMatch) {
      const address = decodeURIComponent(resolveMatch[1])
      const res = await fetch(`${AV_BASE}/proxy/resolve/${address}`, {
        headers: { 'Authorization': `Bearer ${key}` }
      })
      const text = await res.text()
      return jsonResponse(res.status, text)
    }

    return jsonResponse(404, { error: 'Not found' })
  } catch (e) {
    return jsonResponse(500, { error: String(e?.message || e) })
  }
}
