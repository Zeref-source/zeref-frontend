import React, { useEffect, useState } from 'react'

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  delay: Math.random() * 6,
  duration: Math.random() * 8 + 6,
}))

export default function ComingSoonPage({ onBack }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`cs-root ${loaded ? 'cs-loaded' : ''}`}>
      {/* Ambient background glows */}
      <div className="cs-glow cs-glow-1" />
      <div className="cs-glow cs-glow-2" />
      <div className="cs-glow cs-glow-3" />

      {/* Grid texture */}
      <div className="cs-grid" />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="cs-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Back button — top left */}
      <button className="cs-back-btn" onClick={onBack} id="cs-back-btn">
        ← Home
      </button>

      {/* Center content */}
      <div className="cs-center">
        <div className="cs-icon-wrap">
          <span className="cs-icon">🎮</span>
          <div className="cs-icon-ring" />
        </div>

        <div className="cs-tag">SECTION 02 · GAMING</div>

        <h1 className="cs-title">
          Coming<br />
          <span className="cs-title-accent">Soon</span>
        </h1>

        <p className="cs-desc">
          The gaming hub is being assembled.<br />
          IGN · GameSpot · Eurogamer · Polygon · PC Gamer and more —<br />
          all in one place. Stay locked in.
        </p>

        <div className="cs-features">
          {[
            { icon: '🗞️', text: 'Live Gaming News' },
            { icon: '🏆', text: 'Esports Coverage' },
            { icon: '🎯', text: 'Game Reviews' },
            { icon: '📡', text: '10+ Sources' },
          ].map(f => (
            <div key={f.text} className="cs-feature-pill">
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="cs-status">
          <span className="cs-status-dot" />
          <span>In Development</span>
        </div>
      </div>
    </div>
  )
}
