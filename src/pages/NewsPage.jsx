import React, { useState, useEffect, useMemo } from 'react'

const API_BASE = 'http://localhost:8000'

const SOURCE_MAP = {
  Gaming: ['IGN', 'GameSpot', 'Eurogamer', 'Polygon', 'PC Gamer',
           'Rock Paper Shotgun', 'VGC', 'GamesIndustry.biz', 'Ars Technica', 'Game Developer'],
  Hardware: ["Tom's Hardware", 'The Verge', 'Wccftech', 'Digital Trends', 'AnandTech'],
}

const CONFIG = {
  Gaming: {
    title: 'Gaming',
    titleHighlight: 'News',
    subtitle: 'Top gaming journalism from 10 credible sources worldwide',
    emoji: '🎮',
    placeholder: 'Search games, studios, releases...',
    fallbackEmoji: '🎮',
  },
  Hardware: {
    title: 'Tech',
    titleHighlight: 'Hardware',
    subtitle: 'Latest GPU, CPU, peripherals & tech coverage from 5 expert sources',
    emoji: '⚙️',
    placeholder: 'Search GPUs, CPUs, reviews...',
    fallbackEmoji: '⚙️',
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(isoStr) {
  const now = Date.now()
  const then = new Date(isoStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="news-card skeleton-card">
      <div className="skeleton-img" />
      <div className="news-card-body">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line mid" />
      </div>
    </div>
  )
}

// ── NewsCard ───────────────────────────────────────────────────────────────
function NewsCard({ article, fallbackEmoji }) {
  const [imgError, setImgError] = useState(false)

  return (
    <a className="news-card" href={article.url} target="_blank" rel="noopener noreferrer">
      <div className="news-card-img-wrap">
        {article.image && !imgError ? (
          <img
            src={article.image}
            alt={article.title}
            className="news-card-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="news-card-img-fallback">
            <span className="fallback-emoji">{fallbackEmoji}</span>
          </div>
        )}
        <div
          className="news-source-badge"
          style={{
            background: article.source_color + '22',
            borderColor: article.source_color + '66',
            color: article.source_color,
          }}
        >
          {article.source_emoji} {article.source}
        </div>
      </div>
      <div className="news-card-body">
        <h3 className="news-card-title">{article.title}</h3>
        {article.summary && <p className="news-card-summary">{article.summary}</p>}
        <div className="news-card-footer">
          <span className="news-card-time">🕐 {timeAgo(article.published_at)}</span>
          <span className="news-read-more">Read →</span>
        </div>
      </div>
    </a>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function NewsPage({ category = 'Gaming' }) {
  const cfg = CONFIG[category]
  const sources = SOURCE_MAP[category]

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSource, setActiveSource] = useState('All')
  const [search, setSearch] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNews = async (force = false) => {
    if (force) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/news?limit=150${force ? '&force=true' : ''}`)
      if (!res.ok) throw new Error('Backend error')
      const data = await res.json()
      // Only keep articles from this category's sources
      const categoryArticles = (data.articles || []).filter(
        a => a.category === category
      )
      setArticles(categoryArticles)
      setLastUpdated(new Date())
    } catch (e) {
      setError('Could not load news. Make sure the backend is running.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Reset source filter when switching categories
  useEffect(() => {
    setActiveSource('All')
    setSearch('')
    setArticles([])
    fetchNews()
  }, [category])

  // Auto-refresh every 15 min
  useEffect(() => {
    const timer = setInterval(() => fetchNews(), 15 * 60 * 1000)
    return () => clearInterval(timer)
  }, [category])

  const filtered = useMemo(() => {
    let list = articles
    if (activeSource !== 'All') list = list.filter(a => a.source === activeSource)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
      )
    }
    return list
  }, [articles, activeSource, search])

  const sourceCounts = useMemo(() => {
    const counts = {}
    articles.forEach(a => { counts[a.source] = (counts[a.source] || 0) + 1 })
    return counts
  }, [articles])

  return (
    <main className="news-page">

      {/* ── Page Header ── */}
      <div className="news-header">
        <div className="news-header-left">
          <div className="news-live-indicator">
            <span className="live-dot" />
            LIVE FEED
          </div>
          <h1 className="news-page-title">
            {cfg.title} <span className="gradient-text">{cfg.titleHighlight}</span>
          </h1>
          <p className="news-page-sub">
            {cfg.subtitle} · {articles.length} articles ·{' '}
            {lastUpdated ? `Updated ${timeAgo(lastUpdated.toISOString())}` : 'Loading...'}
          </p>
        </div>
        <button
          className={`news-refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchNews(true)}
          disabled={refreshing || loading}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* ── Search ── */}
      <div className="news-controls">
        <div className="news-search-wrap">
          <span className="news-search-icon">🔍</span>
          <input
            className="news-search"
            type="text"
            placeholder={cfg.placeholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="news-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* ── Source Filter Pills ── */}
        <div className="news-filters">
          {['All', ...sources].map(src => (
            <button
              key={src}
              className={`news-filter-pill ${activeSource === src ? 'active' : ''}`}
              onClick={() => setActiveSource(src)}
            >
              {src}
              {src !== 'All' && sourceCounts[src] ? (
                <span className="pill-count">{sourceCounts[src]}</span>
              ) : src === 'All' && articles.length ? (
                <span className="pill-count">{articles.length}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="error-banner" style={{ margin: '0 auto', maxWidth: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Results count ── */}
      {!loading && (search || activeSource !== 'All') && (
        <div className="news-results-count">
          Showing <strong>{filtered.length}</strong> article{filtered.length !== 1 ? 's' : ''}
          {activeSource !== 'All' ? ` from ${activeSource}` : ''}
          {search ? ` matching "${search}"` : ''}
        </div>
      )}

      {/* ── Card Grid ── */}
      <div className="news-grid">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="news-empty">
            <div className="news-empty-emoji">{cfg.fallbackEmoji}</div>
            <div className="news-empty-text">No articles found</div>
            <div className="news-empty-sub">Try a different filter or search term</div>
          </div>
        ) : (
          filtered.map((a, i) => (
            <NewsCard key={`${a.url}-${i}`} article={a} fallbackEmoji={cfg.fallbackEmoji} />
          ))
        )}
      </div>
    </main>
  )
}
