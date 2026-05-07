import React, { useState } from 'react'
import './index.css'
import NewsPage from './pages/NewsPage'
import HomePage from './pages/HomePage'
import GamingPage from './pages/GamingPage/GamingPage'

// ── News tabs — purely reading content ────────────────────────────────────
const TABS = [
  { id: 'gaming-news',      label: 'Gaming News',      shortLabel: 'Gaming',   icon: '🎮', category: 'Gaming'      },
  { id: 'anime-news',       label: 'Anime News',        shortLabel: 'Anime',    icon: '🌸', category: 'Anime'       },
  { id: 'movies-news',      label: 'Movies & TV',       shortLabel: 'Movies',   icon: '🎬', category: 'Movies'      },
  { id: 'hardware-news',    label: 'Tech Hardware',     shortLabel: 'Hardware', icon: '⚙️', category: 'Hardware'    },
  { id: 'geopolitics-news', label: 'Geopolitics',       shortLabel: 'GeoIntel', icon: '🌍', category: 'Geopolitics' },
  { id: 'india-news',       label: 'India',             shortLabel: 'India',    icon: <img src="https://flagcdn.com/w20/in.png" alt="India" width="20" style={{verticalAlign:'middle',borderRadius:'2px'}} />, category: 'India'       },
  { id: 'finance-news',     label: 'Financial Market',  shortLabel: 'Finance',  icon: '📈', category: 'Finance'     },
]

export default function App() {
  const [page, setPage] = useState('home')
  const navigate = (p) => setPage(p)

  // ── Landing page ───────────────────────────────────────────────────────
  if (page === 'home') {
    return (
      <>
        <div className="bg-mesh" />
        <HomePage
          onEnterGaming={() => navigate('arcade')}
          onEnterChill={() => navigate('anime-news')}
        />
      </>
    )
  }

  // ── Arcade (game) — fullscreen, no header or news tabs ─────────────────
  if (page === 'arcade') {
    return (
      <>
        <div className="bg-mesh" />
        <GamingPage onBack={() => navigate('home')} />
      </>
    )
  }

  // ── News reader — all 7 tabs, pure reading content ─────────────────────
  return (
    <div className="app-container">
      <div className="bg-mesh" />

      <header className="header">
        {/* ── Left: glowing logo orb ── */}
        <div
          className="header-logo-orb"
          onClick={() => navigate('home')}
          title="Back to Home"
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate('home')}
        >
          <img src="/logo.png" alt="RealityDive Logo" className="header-orb-img" />
        </div>

        {/* ── Center: brand + tagline ── */}
        <div className="header-brand" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>
          <span className="header-title">RealityDive</span>
          <span className="header-tagline">A Gamer's Retreat&nbsp;·&nbsp;Raw, Unfiltered</span>
        </div>

        {/* ── Desktop nav ── */}
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

        {/* ── Right: small logo badge ── */}
        <div className="header-logo-badge">
          <img src="/logo.png" alt="" className="header-badge-img" />
        </div>
      </header>

      <nav className="mobile-side-nav">
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

      <div className="mobile-content">
        {TABS.map(tab => (
          page === tab.id && <NewsPage key={tab.id} category={tab.category} />
        ))}
      </div>
    </div>
  )
}


