import React, { useState } from 'react'
import './index.css'
import HomePage from './pages/HomePage'
import AnalyzingPage from './pages/AnalyzingPage'
import ResultsPage from './pages/ResultsPage'
import NewsPage from './pages/NewsPage'

export default function App() {
  const [page, setPage] = useState('home')
  const [jobId, setJobId] = useState(null)
  const [results, setResults] = useState(null)

  const goHome = () => setPage('home')
  const navigate = (p) => setPage(p)

  return (
    <div className="app-container">
      <div className="bg-mesh" />

      <header className="header">
        <span className="header-logo" style={{ cursor: 'pointer' }} onClick={goHome}>
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hzGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00fff2"/>
                <stop offset="100%" stopColor="#0088aa"/>
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="12" fill="#060b10"/>
            <rect x="1" y="1" width="62" height="62" rx="11" fill="none" stroke="#00d4d4" strokeWidth="0.8" opacity="0.6"/>
            <polygon points="10,10 54,10 54,18 26,18" fill="url(#hzGrad)" opacity="0.95"/>
            <polygon points="26,18 54,18 38,46 10,46" fill="url(#hzGrad)" opacity="0.88"/>
            <polygon points="10,46 38,46 10,54 54,54 54,46" fill="url(#hzGrad)" opacity="0.95"/>
            <rect x="10" y="10" width="9" height="8" fill="#00ffee" opacity="0.45" rx="1"/>
          </svg>
          Machchli's Newspaper
        </span>

        <nav className="header-nav">
          <button
            className={`nav-tab ${['home', 'analyzing', 'results'].includes(page) ? 'active' : ''}`}
            onClick={goHome}
          >
            🎬 Highlights
          </button>
          <button
            className={`nav-tab ${page === 'gaming-news' ? 'active' : ''}`}
            onClick={() => navigate('gaming-news')}
          >
            🎮 Gaming News
          </button>
          <button
            className={`nav-tab ${page === 'hardware-news' ? 'active' : ''}`}
            onClick={() => navigate('hardware-news')}
          >
            ⚙️ Tech Hardware
          </button>
        </nav>

        <span className="header-sub">A Gamer's Retreat</span>
      </header>

      {/* Mobile bottom navigation bar */}
      <nav className="mobile-bottom-nav">
        <button
          id="mob-nav-highlights"
          className={`mobile-nav-btn ${['home', 'analyzing', 'results'].includes(page) ? 'active' : ''}`}
          onClick={goHome}
        >
          <span className="mobile-nav-icon">🎬</span>
          <span className="mobile-nav-label">Highlights</span>
        </button>
        <button
          id="mob-nav-gaming"
          className={`mobile-nav-btn ${page === 'gaming-news' ? 'active' : ''}`}
          onClick={() => navigate('gaming-news')}
        >
          <span className="mobile-nav-icon">🎮</span>
          <span className="mobile-nav-label">Gaming</span>
        </button>
        <button
          id="mob-nav-hardware"
          className={`mobile-nav-btn ${page === 'hardware-news' ? 'active' : ''}`}
          onClick={() => navigate('hardware-news')}
        >
          <span className="mobile-nav-icon">⚙️</span>
          <span className="mobile-nav-label">Hardware</span>
        </button>
      </nav>

      {page === 'home' && (
        <HomePage onAnalyze={(id) => { setJobId(id); setPage('analyzing') }} />
      )}
      {page === 'analyzing' && (
        <AnalyzingPage
          jobId={jobId}
          onDone={(data) => { setResults(data); setPage('results') }}
          onError={() => setPage('home')}
        />
      )}
      {page === 'results' && (
        <ResultsPage results={results} onBack={() => setPage('home')} />
      )}
      {page === 'gaming-news' && <NewsPage category="Gaming" />}
      {page === 'hardware-news' && <NewsPage category="Hardware" />}
    </div>
  )
}
