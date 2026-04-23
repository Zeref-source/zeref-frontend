import React, { useState } from 'react'
import './index.css'
import NewsPage from './pages/NewsPage'

export default function App() {
  const [page, setPage] = useState('gaming-news')

  const navigate = (p) => setPage(p)

  return (
    <div className="app-container">
      <div className="bg-mesh" />

      <header className="header">
        <span className="header-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('gaming-news')}>
          <img src="/logo.png" alt="RealityDive Logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8, filter: 'drop-shadow(0 0 8px rgba(255,107,43,0.6))' }} />
          <span className="header-title">RealityDive</span>
        </span>

        <nav className="header-nav">
          <button
            className={`nav-tab ${page === 'gaming-news' ? 'active' : ''}`}
            onClick={() => navigate('gaming-news')}
          >
            🎮 Gaming News
          </button>
          <button
            className={`nav-tab ${page === 'anime-news' ? 'active' : ''}`}
            onClick={() => navigate('anime-news')}
          >
            🌸 Anime News
          </button>
          <button
            className={`nav-tab ${page === 'hardware-news' ? 'active' : ''}`}
            onClick={() => navigate('hardware-news')}
          >
            ⚙️ Tech Hardware
          </button>
          <button
            className={`nav-tab ${page === 'geopolitics-news' ? 'active' : ''}`}
            onClick={() => navigate('geopolitics-news')}
          >
            🌍 Geopolitics
          </button>
        </nav>

        <span className="header-sub">A Gamer's Retreat</span>
      </header>

      {/* Mobile bottom navigation bar */}
      <nav className="mobile-bottom-nav">
        <button
          id="mob-nav-gaming"
          className={`mobile-nav-btn ${page === 'gaming-news' ? 'active' : ''}`}
          onClick={() => navigate('gaming-news')}
        >
          <span className="mobile-nav-icon">🎮</span>
          <span className="mobile-nav-label">Gaming</span>
        </button>
        <button
          id="mob-nav-anime"
          className={`mobile-nav-btn ${page === 'anime-news' ? 'active' : ''}`}
          onClick={() => navigate('anime-news')}
        >
          <span className="mobile-nav-icon">🌸</span>
          <span className="mobile-nav-label">Anime</span>
        </button>
        <button
          id="mob-nav-hardware"
          className={`mobile-nav-btn ${page === 'hardware-news' ? 'active' : ''}`}
          onClick={() => navigate('hardware-news')}
        >
          <span className="mobile-nav-icon">⚙️</span>
          <span className="mobile-nav-label">Hardware</span>
        </button>
        <button
          id="mob-nav-geopolitics"
          className={`mobile-nav-btn ${page === 'geopolitics-news' ? 'active' : ''}`}
          onClick={() => navigate('geopolitics-news')}
        >
          <span className="mobile-nav-icon">🌍</span>
          <span className="mobile-nav-label">GeoIntel</span>
        </button>
      </nav>

      {page === 'gaming-news' && <NewsPage category="Gaming" />}
      {page === 'anime-news' && <NewsPage category="Anime" />}
      {page === 'hardware-news' && <NewsPage category="Hardware" />}
      {page === 'geopolitics-news' && <NewsPage category="Geopolitics" />}
    </div>
  )
}
