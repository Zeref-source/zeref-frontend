import React, { useState, useEffect } from 'react'

const CHILL_CATS = [
  { icon: '🌸', label: 'Anime' },
  { icon: '🎬', label: 'Movies' },
  { icon: '🌍', label: 'Geopolitics' },
  { icon: '🇮🇳', label: 'India' },
  { icon: '📈', label: 'Finance' },
  { icon: '⚙️', label: 'Hardware' },
]

export default function HomePage({ onEnterGaming, onEnterChill }) {
  const [hovered, setHovered] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`lp-root ${loaded ? 'lp-loaded' : ''}`}>

      {/* ══ LEFT — Read & Chill ══ */}
      <div
        className={`lp-panel lp-chill ${hovered === 'chill' ? 'lp-expanded' : hovered === 'gaming' ? 'lp-shrunk' : ''}`}
        onMouseEnter={() => setHovered('chill')}
        onMouseLeave={() => setHovered(null)}
        onClick={onEnterChill}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onEnterChill()}
        aria-label="Enter Read and Chill section"
      >
        {/* Animated glow orbs */}
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        {/* Grid texture */}
        <div className="lp-grid" />

        <div className="lp-content lp-content-chill">
          <span className="lp-tag">SECTION 01</span>

          <div className="lp-icons-row lp-icons-row-chill">
            {CHILL_CATS.map(c => (
              <span key={c.label} className="lp-icon" title={c.label}>{c.icon}</span>
            ))}
          </div>

          <h2 className="lp-title lp-title-chill">
            Read<br />&amp; Chill
          </h2>

          <p className="lp-subtitle">
            Anime · Movies · Geopolitics<br />India · Finance · Tech Hardware
          </p>

          <button className="lp-enter-btn lp-enter-btn-chill">
            <span className="lp-enter-arrow">←</span>
            <span>Enter</span>
          </button>
        </div>
      </div>

      {/* ══ CENTER DIVIDER + LOGO ══ */}
      <div className="lp-divider">
        <div className="lp-logo-badge">
          <img src="/logo.png" alt="RealityDive Logo" className="lp-logo-img" />
        </div>
        <span className="lp-site-name">RealityDive</span>
      </div>

      {/* ══ RIGHT — Gaming ══ */}
      <div
        className={`lp-panel lp-gaming ${hovered === 'gaming' ? 'lp-expanded' : hovered === 'chill' ? 'lp-shrunk' : ''}`}
        onMouseEnter={() => setHovered('gaming')}
        onMouseLeave={() => setHovered(null)}
        onClick={onEnterGaming}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onEnterGaming()}
        aria-label="Enter Gaming section"
      >
        {/* Animated glow orbs */}
        <div className="lp-orb lp-orb-3" />
        <div className="lp-orb lp-orb-4" />
        {/* Grid texture */}
        <div className="lp-grid" />

        <div className="lp-content lp-content-gaming">
          <span className="lp-tag lp-tag-gaming">SECTION 02</span>

          <div className="lp-icons-row">
            <span className="lp-icon lp-icon-big">🎮</span>
          </div>

          <h2 className="lp-title lp-title-gaming">
            Gaming
          </h2>

          <p className="lp-subtitle">
            IGN · GameSpot · Eurogamer<br />Polygon · PC Gamer · +5 more
          </p>

          <button className="lp-enter-btn lp-enter-btn-gaming">
            <span>Enter</span>
            <span className="lp-enter-arrow">→</span>
          </button>
        </div>
      </div>

    </div>
  )
}
