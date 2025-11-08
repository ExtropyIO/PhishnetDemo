# PhishNet — Complete Project

This repo contains:
- `frontend/` — React + Vite (Tailwind), all config via `.env` (no settings UI).
- `proxy/` — AWS SAM app: Lambda + API Gateway that securely injects the Agentverse API key.

## Deploy order

1. Deploy **proxy** (SAM → API Gateway + Lambda).
2. Copy the resulting API base URL into the frontend `.env` as `VITE_AGENTVERSE_PROXY_BASE`.
3. Deploy **frontend** (Amplify Hosting).

---

## 1) Proxy (secure API key)

See `proxy/README.md` for exact `sam build && sam deploy` steps.

Environment variable to set in Lambda:
```
AGENTVERSE_API_KEY=AV_xxx
```

Routes provided by the proxy:
- `POST /submit` → forwards to `https://agentverse.ai/v1/proxy/submit`
- `GET  /resolve/{address}` → forwards to `https://agentverse.ai/v1/proxy/resolve/{address}`
CORS is enabled for `*` by default.

---

## 2) Frontend

Copy `frontend/.env.example` to `.env.local` (or set Amplify environment variables).

**Agentverse mode**:
```
VITE_DEFAULT_MODE=agentverse
VITE_AGENTVERSE_PROXY_BASE=https://<api-id>.execute-api.<region>.amazonaws.com/prod
VITE_SENDER=agent1qYOUR_SENDER...
VITE_ADDR_INTAKE=agent1q...
VITE_ADDR_ANALYZER=agent1q...
VITE_ADDR_REFEREE=agent1q...
VITE_ADDR_ONCHAIN=agent1q...
VITE_SCHEMA_DIGEST=chat-protocol-v1
VITE_PROTOCOL_DIGEST=
```

**ECS mode** (optional):
```
VITE_DEFAULT_MODE=ecs
VITE_ECS_BASE_URL=http://<ALB>
VITE_ECS_INVOKE_PATH=/{service}/invoke
VITE_ECS_REQ_TYPE=AnalyzeRequest
VITE_ECS_EXTRA=
```

### Run locally
```
cd frontend
npm i
npm run dev
```

### Amplify
Add `frontend/` as the app root for Amplify Hosting. The build uses `amplify.yml`.

---

## Notes
- The frontend constructs the uAgents **Envelope** and never sees the Agentverse API key.
- Proxy handles Authorization and CORS.
