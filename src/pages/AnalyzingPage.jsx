import React, { useEffect, useRef } from 'react'

const API_BASE = 'http://localhost:8000'
const POLL_INTERVAL = 2000

export default function AnalyzingPage({ jobId, onDone, onError }) {
  const [progress, setProgress] = React.useState(0)
  const [step, setStep] = React.useState('Starting analysis...')
  const intervalRef = useRef(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const statusRes = await fetch(`${API_BASE}/status/${jobId}`)
        if (!statusRes.ok) throw new Error('Status fetch failed')
        const status = await statusRes.json()

        setProgress(status.progress)
        setStep(status.step)

        if (status.status === 'done') {
          clearInterval(intervalRef.current)
          const resultsRes = await fetch(`${API_BASE}/results/${jobId}`)
          const results = await resultsRes.json()
          onDone(results)
        } else if (status.status === 'error') {
          clearInterval(intervalRef.current)
          onError()
        }
      } catch (e) {
        console.error('Polling error:', e)
      }
    }

    intervalRef.current = setInterval(poll, POLL_INTERVAL)
    poll()

    return () => clearInterval(intervalRef.current)
  }, [jobId])

  const steps = [
    { label: '💬 Fetching chat replay', done: progress > 35 },
    { label: '🔊 Downloading & analyzing audio', done: progress > 70 },
    { label: '🤖 Generating AI Hinglish titles', done: progress > 90 },
    { label: '✅ Done!', done: progress >= 100 },
  ]

  return (
    <main className="analyzing-page">
      <div className="pulse-ring">⚡</div>

      <div>
        <h1 className="analyzing-title">Analyzing your stream...</h1>
        <p className="analyzing-step">{step}</p>
      </div>

      <div className="progress-pct">{progress}%</div>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', width: '100%', maxWidth: 420 }}>
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
              color: s.done ? 'var(--success)' : 'var(--text-muted)',
              transition: 'color 0.4s',
            }}
          >
            <span style={{ fontSize: 18 }}>{s.done ? '✅' : '⏳'}</span>
            {s.label}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400 }}>
        This can take a few minutes for long streams. Audio download is the slowest step — hang tight! ☕
      </p>
    </main>
  )
}
