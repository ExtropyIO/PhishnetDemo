# Agentverse Secure Proxy (AWS SAM)

A tiny Lambda + API Gateway that forwards to Agentverse **Proxy API** while injecting the **Authorization** header from a private env var.

## Endpoints
- `POST /submit` → forwards to `https://agentverse.ai/v1/proxy/submit`
- `GET /resolve/{address}` → forwards to `https://agentverse.ai/v1/proxy/resolve/{address}`
- CORS: `*`

## Deploy
```bash
cd proxy
npm i
sam build
sam deploy --guided
```
During `sam deploy`, set environment variable:
- `AGENTVERSE_API_KEY=AV_xxx`

Copy the output **ApiUrl** and put it into `frontend/.env` as `VITE_AGENTVERSE_PROXY_BASE`.
