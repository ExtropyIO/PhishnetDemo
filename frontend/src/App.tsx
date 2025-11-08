import React, { useMemo, useState } from 'react'
import { CFG, Service } from './config'
import { analyze, resolveOrHealth } from './api'

function Json({value}:{value:any}) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return <pre className="mono text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-auto min-h-40 max-h-[50vh]">{text}</pre>
}

export default function App() {
  const [svc, setSvc] = useState<Service>('intake')
  const [urlToTest, setUrlToTest] = useState('https://example.com/suspicious')
  const [reqPreview, setReqPreview] = useState<any>('')
  const [resp, setResp] = useState<any>('')
  const [busy, setBusy] = useState(false)

  const modeBadge = useMemo(() => CFG.MODE === 'agentverse'
    ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800', [])

  async function onAnalyze() {
    setBusy(true)
    try {
      const { preview, response } = await analyze(urlToTest, svc)
      setReqPreview(preview)
      setResp(response)
    } catch (e:any) {
      setResp('Error: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  async function onResolve() {
    setBusy(true)
    try {
      const info = await resolveOrHealth(svc)
      setResp(info)
    } catch (e:any) {
      setResp('Error: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">PhishNet — Agentverse / ECS</h1>
        <div className="flex items-center gap-3">
          <span className={"text-xs px-2 py-1 rounded-full " + modeBadge}>
            Mode: <b>{CFG.MODE === 'agentverse' ? 'Agentverse' : 'ECS'}</b>
          </span>
        </div>
      </header>

      <section className="bg-white rounded-2xl shadow p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL to analyse</label>
            <input value={urlToTest} onChange={e=>setUrlToTest(e.target.value)} type="url" placeholder="https://example.com/suspicious"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Agent role</label>
            <div className="flex flex-wrap gap-3">
              {(['intake','analyzer','referee','onchain'] as Service[]).map(x => (
                <label key={x} className="inline-flex items-center gap-2">
                  <input type="radio" name="svc" checked={svc===x} onChange={()=>setSvc(x)} className="accent-indigo-600"/><span className="capitalize">{x}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onAnalyze} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50" disabled={busy}>Analyze</button>
          <button onClick={onResolve} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200" disabled={busy}>Resolve / Health</button>
          {busy && <div className="size-5 border-2 border-indigo-600 rounded-full border-t-transparent spin" />}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Request</label>
            <Json value={reqPreview} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Response</label>
            <Json value={resp} />
          </div>
        </div>
      </section>

      <section className="text-xs text-slate-500 mt-6">
        <p><b>Note:</b> All config is build-time via .env. No runtime settings UI.</p>
      </section>
    </div>
  )
}
