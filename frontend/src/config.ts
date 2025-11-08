export type Mode = 'agentverse' | 'ecs'
export type Service = 'intake' | 'analyzer' | 'referee' | 'onchain'

function reqEnv(name: string, allowEmpty=false) {
  const v = (import.meta as any).env[name]
  if (!allowEmpty && (!v || String(v).trim() === '')) {
    throw new Error(`Missing required env var ${name}`)
  }
  return String(v || '')
}

/** All config comes from build-time env (public VITE_ vars). */
export const CFG = {
  MODE: (reqEnv('VITE_DEFAULT_MODE', true) as Mode) || 'agentverse',
  // IMPORTANT: when using the secure proxy, this should be your API Gateway base (e.g. https://abc.execute-api.../prod)
  AGENTVERSE_PROXY_BASE: reqEnv('VITE_AGENTVERSE_PROXY_BASE', true),

  // For resolve (optional): proxy exposes /resolve too; otherwise keep direct AV base here
  AGENTVERSE_BASE_URL: reqEnv('VITE_AGENTVERSE_BASE_URL', true) || 'https://agentverse.ai/v1',

  // Agent addresses
  SENDER: reqEnv('VITE_SENDER'),
  ADDR_INTAKE: reqEnv('VITE_ADDR_INTAKE', true),
  ADDR_ANALYZER: reqEnv('VITE_ADDR_ANALYZER', true),
  ADDR_REFEREE: reqEnv('VITE_ADDR_REFEREE', true),
  ADDR_ONCHAIN: reqEnv('VITE_ADDR_ONCHAIN', true),

  // Protocol/schema
  SCHEMA_DIGEST: reqEnv('VITE_SCHEMA_DIGEST', true) || 'chat-protocol-v1',
  PROTOCOL_DIGEST: reqEnv('VITE_PROTOCOL_DIGEST', true),

  // ECS
  ECS_BASE_URL: reqEnv('VITE_ECS_BASE_URL', true),
  ECS_INVOKE_PATH: reqEnv('VITE_ECS_INVOKE_PATH', true) || '/{service}/invoke',
  ECS_REQ_TYPE: reqEnv('VITE_ECS_REQ_TYPE', true) || 'AnalyzeRequest',
  ECS_EXTRA: reqEnv('VITE_ECS_EXTRA', true) || ''
} as const

export function addrFor(service: Service) {
  return ({ intake: CFG.ADDR_INTAKE, analyzer: CFG.ADDR_ANALYZER, referee: CFG.ADDR_REFEREE, onchain: CFG.ADDR_ONCHAIN })[service]
}
