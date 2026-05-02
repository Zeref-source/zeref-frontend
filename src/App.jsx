import React, { useState } from 'react'
import './index.css'
import NewsPage from './pages/NewsPage'

// ── SINGLE SOURCE OF TRUTH ─────────────────────────────────────────────────
// To add a new tab, just add one object here. Done.
const TABS = [
  { id: 'gaming-news',     label: 'Gaming News',   shortLabel: 'Gaming',   icon: '🎮', category: 'Gaming'      },
  { id: 'anime-news',      label: 'Anime News',    shortLabel: 'Anime',    icon: '🌸', category: 'Anime'       },
  { id: 'hardware-news',   label: 'Tech Hardware', shortLabel: 'Hardware', icon: '⚙️', category: 'Hardware'    },
  { id: 'geopolitics-news',label: 'Geopolitics',   shortLabel: 'GeoIntel', icon: '🌍', category: 'Geopolitics' },

  { id: 'movies-news',     label: 'Movies & TV',   shortLabel: 'Movies',   icon: '🎬', category: 'Movies'      },
  { id: 'finance-news',    label: 'Financial Market',shortLabel:'Finance', icon: '📈', category: 'Finance'     },
]

export default function App() {
  const [page, setPage] = useState('gaming-news')
  const navigate = (p) => setPage(p)
  const activeTab = TABS.find(t => t.id === page)

  return (
    <div className="app-container">
      <div className="bg-mesh" />

      <header className="header">
        <span className="header-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('gaming-news')}>
          <img src="/logo.png" alt="RealityDive Logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8, filter: 'drop-shadow(0 0 8px rgba(255,107,43,0.6))' }} />
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

      {/* Main content, offset by sidebar */}
      <div className="mobile-content">
        {TABS.map(tab => (
          page === tab.id && <NewsPage key={tab.id} category={tab.category} />
        ))}
      </div>
    </div>
  )
}
