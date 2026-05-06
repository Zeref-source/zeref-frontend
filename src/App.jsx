import React, { useState } from 'react'
import './index.css'
import NewsPage from './pages/NewsPage'
import HomePage from './pages/HomePage'
import GamingPage from './pages/GamingPage/GamingPage'

// ── SINGLE SOURCE OF TRUTH ─────────────────────────────────────────────────
const TABS = [
  { id: 'gaming-news',      label: 'Gaming News',      shortLabel: 'Gaming',   icon: '🎮', category: 'Gaming'      },
  { id: 'anime-news',       label: 'Anime News',        shortLabel: 'Anime',    icon: '🌸', category: 'Anime'       },
  { id: 'movies-news',      label: 'Movies & TV',       shortLabel: 'Movies',   icon: '🎬', category: 'Movies'      },
  { id: 'hardware-news',    label: 'Tech Hardware',     shortLabel: 'Hardware', icon: '⚙️', category: 'Hardware'    },
  { id: 'geopolitics-news', label: 'Geopolitics',       shortLabel: 'GeoIntel', icon: '🌍', category: 'Geopolitics' },
  { id: 'india-news',       label: 'India',             shortLabel: 'India',    icon: '🇮🇳', category: 'India'       },
  { id: 'finance-news',     label: 'Financial Market',  shortLabel: 'Finance',  icon: '📈', category: 'Finance'     },
]

export default function App() {
  // 'home' shows the landing page; any tab id shows the reader/game
  const [page, setPage] = useState('home')
  const navigate = (p) => setPage(p)

  // ── Landing page — full screen, no chrome ──────────────────────────────
  if (page === 'home') {
    return (
      <>
        <div className="bg-mesh" />
        <HomePage
          onEnterGaming={() => navigate('gaming-news')}
          onEnterChill={() => navigate('anime-news')}
        />
      </>
    )
  }

  // ── Reader / Gaming mode ───────────────────────────────────────────────
  return (
    <div className="app-container">
      <div className="bg-mesh" />

      <header className="header">
        {/* Logo → back to home */}
        <span
          className="header-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('home')}
          title="Back to Home"
        >
          <img
            src="/logo.png"
            alt="RealityDive Logo"
            style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8, filter: 'drop-shadow(0 0 8px rgba(255,107,43,0.6))' }}
          />
          <span className="header-title">RealityDive</span>
        </span>

        {/* Desktop nav — auto-generated */}
        <nav className="header-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${page === tab.id ? 'active' : ''}`}
              onClick={() => navigate(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <span className="header-sub">A Gamer's Retreat</span>
      </header>

      {/* Mobile left sidebar nav */}
      <nav className="mobile-side-nav">
        {/* Home button at top */}
        <button
          className="mobile-nav-btn"
          onClick={() => navigate('home')}
          title="Home"
          id="mob-nav-home"
        >
          <span className="mobile-nav-icon">🏠</span>
          <span className="mobile-nav-label">Home</span>
        </button>

        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`mob-nav-${tab.id}`}
            className={`mobile-nav-btn ${page === tab.id ? 'active' : ''}`}
            onClick={() => navigate(tab.id)}
          >
            <span className="mobile-nav-icon">{tab.icon}</span>
            <span className="mobile-nav-label">{tab.shortLabel}</span>
          </button>
        ))}
      </nav>

      {/* Main content area */}
      <div className="mobile-content">
        {/* Gaming Game Loop */}
        {page === 'gaming-news' && <GamingPage />}
        
        {/* News Reader Tabs (All except Gaming) */}
        {TABS.filter(t => t.id !== 'gaming-news').map(tab => (
          page === tab.id && <NewsPage key={tab.id} category={tab.category} />
        ))}
      </div>
    </div>
  )
}


