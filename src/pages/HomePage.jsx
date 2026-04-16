import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function HomePage({ onAnalyze }) {
  const [url, setUrl] = useState('')
  const [threshold, setThreshold] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    const trimmed = url.trim()
    if (!trimmed) { setError('Please paste a YouTube VOD link!'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: trimmed, hype_threshold: threshold / 100 }),
      })
      if (!res.ok) throw new Error('Backend returned an error.')
      const data = await res.json()
      onAnalyze(data.job_id)
    } catch (e) {
      setError(`Could not connect to backend. Make sure the Python server is running. (${e.message})`)
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleAnalyze() }

  return (
    <main className="home-page">
      <div className="hero-badge">🔥 Made for Indian Gaming Streamers</div>

      <h1 className="hero-title">
        Find Your <span className="gradient-text">Highlight Moments</span><br />
        with AI Magic
      </h1>

      <p className="hero-description">
        Paste a YouTube VOD link. Our engine fuses chat spikes, audio energy, 
        and Gemini AI to generate ready-to-use Hinglish timestamps for your 
        8-minute highlight reel.
      </p>

      <div className="input-card">
        <label className="input-label" htmlFor="vod-url-input">
          YouTube VOD Link
        </label>

        <div className="url-input-row">
          <input
            id="vod-url-input"
            className="url-input"
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            id="analyze-btn"
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
          >
            {loading ? '⏳ Starting...' : '⚡ Analyze'}
          </button>
        </div>

        <div className="advanced-row">
          <div className="range-group">
            <label htmlFor="threshold-slider">
              Hype Threshold &nbsp;
              <span className="range-value">{threshold}%</span>
            </label>
            <input
              id="threshold-slider"
              type="range"
              min="10"
              max="90"
              step="5"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
            />
          </div>
        </div>

        {error && (
          <div className="error-banner" style={{ marginTop: 16 }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="features-strip">
        {[
          '💬 Chat Spike Analysis',
          '🔊 Audio Energy Detection',
          '🤖 AI Hinglish Title Gen',
          '📋 One-Click Export',
        ].map(f => (
          <div className="feature-pill" key={f}>
            <span className="dot" />
            {f}
          </div>
        ))}
      </div>
    </main>
  )
}
