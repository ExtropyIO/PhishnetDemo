import { CFG, addrFor, Service } from './config'

function safePreviewHeaders(h: Record<string,string>) {
  const copy = {...h}
  if (copy['Authorization']) copy['Authorization'] = 'Bearer ***'
  return copy
}

export function buildAgentverseEnvelope(urlToTest: string, address: string) {
  // CPChatMessage format from uagents_core.contrib.protocols.chat
  const msg = {
    content: [
      {
        type: "text",
        text: urlToTest  // Just send the URL directly
      }
    ],
    msg_id: (crypto as any)?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString()
  }
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(msg))))
  const session = (crypto as any)?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  return {
    version: 1,
    sender: CFG.SENDER,
    target: address,
    session,
    schema_digest: CFG.SCHEMA_DIGEST || undefined,     // ADD THIS LINE
    protocol_digest: CFG.PROTOCOL_DIGEST || undefined,
    payload
  }
}

export function buildEcsBody(urlToTest: string) {
  const body: any = { type: CFG.ECS_REQ_TYPE, url: urlToTest }
  if (CFG.ECS_EXTRA) {
    try { Object.assign(body, JSON.parse(CFG.ECS_EXTRA)) } catch { throw new Error('VITE_ECS_EXTRA has invalid JSON') }
  }
  return body
}

export async function analyze(urlToTest: string, svc: Service) {
  if (CFG.MODE === 'agentverse') {
    const address = addrFor(svc)
    if (!address) throw new Error(`Missing agent address for ${svc} in env`)
    // Send to our secure proxy (Lambda/API GW)
    if (!CFG.AGENTVERSE_PROXY_BASE) throw new Error('Missing VITE_AGENTVERSE_PROXY_BASE for secure proxy')
    const endpoint = `${CFG.AGENTVERSE_PROXY_BASE.replace(/\/+$/, '')}/submit`
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    const body = buildAgentverseEnvelope(urlToTest, address)
    const preview = { endpoint, headers: safePreviewHeaders(headers), body }
    const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
    const text = await res.text()
    let data: any; try { data = JSON.parse(text) } catch { data = { raw: text } }
    return { preview, response: { status: res.status, ok: res.ok, data } }
  } else {
    if (!CFG.ECS_BASE_URL) throw new Error('Missing VITE_ECS_BASE_URL')
    const path = CFG.ECS_INVOKE_PATH.replace('{service}', encodeURIComponent(svc))
    const endpoint = `${CFG.ECS_BASE_URL.replace(/\/+$/, '')}${path}`
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    const body = buildEcsBody(urlToTest)
    const preview = { endpoint, headers: safePreviewHeaders(headers), body }
    const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
    const text = await res.text()
    let data: any; try { data = JSON.parse(text) } catch { data = { raw: text } }
    return { preview, response: { status: res.status, ok: res.ok, data } }
  }
}

export async function resolveOrHealth(svc: Service) {
  if (CFG.MODE === 'agentverse') {
    const address = addrFor(svc)
    if (!address) throw new Error(`Missing agent address for ${svc} in env`)
    // Use proxy resolve (preferred) or fall back to direct Agentverse
    if (CFG.AGENTVERSE_PROXY_BASE) {
      const endpoint = `${CFG.AGENTVERSE_PROXY_BASE.replace(/\/+$/, '')}/resolve/${encodeURIComponent(address)}`
      const res = await fetch(endpoint)
      const text = await res.text()
      let data: any; try { data = JSON.parse(text) } catch { data = { raw: text } }
      return { endpoint, status: res.status, data }
    } else {
      const endpoint = `${CFG.AGENTVERSE_BASE_URL.replace(/\/+$/, '')}/proxy/resolve/${encodeURIComponent(address)}`
      const res = await fetch(endpoint)
      const text = await res.text()
      let data: any; try { data = JSON.parse(text) } catch { data = { raw: text } }
      return { endpoint, status: res.status, data }
    }
  } else {
    if (!CFG.ECS_BASE_URL) throw new Error('Missing VITE_ECS_BASE_URL')
    const endpoint = `${CFG.ECS_BASE_URL.replace(/\/+$/, '')}/${svc}/health`
    const res = await fetch(endpoint)
    const text = await res.text()
    let data: any; try { data = JSON.parse(text) } catch { data = { raw: text } }
    return { endpoint, status: res.status, data }
  }
}
