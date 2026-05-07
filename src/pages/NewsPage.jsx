import React, { useState, useEffect, useMemo } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'


const SOURCE_MAP = {
  Gaming: ['IGN', 'GameSpot', 'Eurogamer', 'Polygon', 'PC Gamer',
           'Rock Paper Shotgun', 'VGC', 'GamesIndustry.biz', 'Ars Technica', 'Game Developer',
           'Kotaku', 'Destructoid', 'GamesRadar', 'Digit Gaming'],
  Anime: ['Anime News Network', 'Crunchyroll', 'Siliconera', 'Anime Corner', 'MyAnimeList', 'ComicBook Anime'],
  Hardware: ["Tom's Hardware", 'The Verge', 'Wccftech', 'Digital Trends', 'TechRadar', 'Engadget', 'ExtremeTech', 'HotHardware'],
  Geopolitics: ['BBC World', 'Al Jazeera', 'DW World', 'Foreign Policy', 'The Guardian World', 'The Hindu', 'Middle East Eye', 'OCCRP'],
  India: ['NDTV India', 'The Hindu National', 'Indian Express', 'India Today', 'The Hindu Sci-Tech', 'Scroll.in', 'YourStory'],
  Movies: ['IGN Movies', 'Variety', 'The Hollywood Reporter', 'Deadline', 'Collider', 'Screen Rant', 'IndieWire', 'The Wrap'],
  Finance: ['Moneycontrol', 'Economic Times', 'LiveMint', 'Business Line', 'NDTV Profit', 'Business Standard', 'CNBC TV18'],
}

const CONFIG = {
  Gaming: {
    title: 'Gaming',
    titleHighlight: 'News',
    subtitle: '14 sources — AAA releases, indie drops, industry deals, dev insight & reviews across PC, console & mobile',
    emoji: '🎮',
    placeholder: 'Search games, studios, releases, reviews...',
    fallbackEmoji: '🎮',
    infoNote: 'Covers reviews, releases, studio news & developer perspective from 14 sources. Anime and movie crossover articles are automatically re-routed to their own tabs so this feed stays pure gaming.',
  },
  Anime: {
    title: 'Anime',
    titleHighlight: 'Culture',
    subtitle: '6 dedicated sources — seasonal rankings, simulcasts, manga adaptations, studio announcements & streaming news',
    emoji: '🌸',
    placeholder: 'Search anime, manga, studios, season rankings...',
    fallbackEmoji: '🎌',
    infoNote: 'ANN for industry news & reviews, Crunchyroll for streaming announcements, Siliconera for Japan-side coverage, Anime Corner for seasonal rankings, MyAnimeList for community-driven news, ComicBook for Western fandom coverage.',
  },
  Hardware: {
    title: 'Tech',
    titleHighlight: 'Hardware',
    subtitle: '8 sources — GPU & CPU launches, benchmark reviews, peripherals, SSD/RAM, and PC build coverage',
    emoji: '⚙️',
    placeholder: 'Search GPUs, CPUs, benchmarks, builds, reviews...',
    fallbackEmoji: '⚙️',
    infoNote: "Tom's Hardware & ExtremeTech for deep benchmarks, Wccftech & HotHardware for launch coverage, TechRadar & Engadget for mainstream tech, Digital Trends for buying guides, The Verge for industry-level hardware analysis.",
  },
  Geopolitics: {
    title: 'Geopolitics',
    titleHighlight: 'Intel',
    subtitle: '8 sources across 5 regions — editorially independent press, investigative accountability journalism & regional reporters',
    emoji: '🌍',
    placeholder: 'Search conflicts, leaders, treaties, coups, sanctions...',
    fallbackEmoji: '🌍',
    infoNote: 'Multi-perspective filter: sources span Western, Middle Eastern, European, South Asian & Global South angles — cross-referencing cancels single-source bias. OCCRP for corruption investigations. RT, Sputnik, CGTN excluded.',
  },
  India: {
    title: 'INDIA',
    titleHighlight: 'RISING',
    subtitle: 'Ground news, tech breakthroughs, space missions, governance decisions & the story of where India is heading',
    emoji: '🚀',
    placeholder: 'Search ISRO, projects, policy, startups, infrastructure...',
    fallbackEmoji: '🇮🇳',
    infoNote: 'Covers ground news, science & tech advancement, government projects, and innovation — financial market news is in the Finance tab.',
  },
  Finance: {
    title: 'INDIAN FINANCIAL',
    titleHighlight: 'MARKET',
    subtitle: '7 sources — Nifty & Sensex movements, sector heatmaps, earnings, IPOs & next-session focus from India\'s top financial press',
    emoji: '📈',
    placeholder: 'Search Nifty, sectors, earnings, IPOs, Sensex...',
    fallbackEmoji: '📈',
    infoNote: 'Exclusively Indian financial markets coverage. Moneycontrol & ET for breaking moves, LiveMint for in-depth analysis, Business Standard & CNBC TV18 for institutional-grade reporting, Business Line & NDTV Profit for broad market tracking.',
  },
  Movies: {
    title: 'Movies &',
    titleHighlight: 'TV',
    subtitle: '8 sources — Hollywood trades, box office, OTT releases, trailers, awards & independent cinema',
    emoji: '🎬',
    placeholder: 'Search movies, shows, trailers, box office, directors...',
    fallbackEmoji: '🎬',
    infoNote: 'Variety, THR & Deadline for Hollywood trade news, Collider & Screen Rant for enthusiast coverage, IndieWire for independent & arthouse cinema, The Wrap for industry business, IGN Movies for gaming-adjacent film coverage.',
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

  const [articles, setArticles] = useState([])

  // Dynamically generate source filters so cross-category articles (e.g. Anime from IGN) get their own pills
  const sources = useMemo(() => {
    if (articles.length === 0) return SOURCE_MAP[category] || []
    return Array.from(new Set(articles.map(a => a.source))).sort()
  }, [articles, category])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSource, setActiveSource] = useState('All')
  const [search, setSearch] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [justRefreshed, setJustRefreshed] = useState(false)
  const [subCategory, setSubCategory] = useState('IGC_Domestic')

  const fetchNews = async (force = false) => {
    if (force) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/news?limit=1000${force ? '&force=true' : ''}`)
      if (!res.ok) throw new Error('Backend error')
      const data = await res.json()
      const categoryArticles = (data.articles || []).filter(a =>
        a.category === category
      )
      setArticles(categoryArticles)
      setLastUpdated(new Date())
      if (force) {
        setJustRefreshed(true)
        setTimeout(() => setJustRefreshed(false), 2500)
      }
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
  }, [articles, activeSource, search, subCategory, category])

  const sourceCounts = useMemo(() => {
    const counts = {}
    articles.forEach(a => { counts[a.source] = (counts[a.source] || 0) + 1 })
    return counts
  }, [articles])

  return (
    <main className="news-page">

      {/* Sliding progress bar — only visible during refresh */}
      {refreshing && <div className="news-refresh-bar" />}

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
            {refreshing
              ? <span className="news-status-refreshing">⟳ Fetching latest...</span>
              : justRefreshed
                ? <span className="news-status-done">✓ Updated just now</span>
                : lastUpdated ? `Updated ${timeAgo(lastUpdated.toISOString())}` : 'Loading...'}
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

      {/* ── Geopolitics Info Banner ── */}
      {cfg.infoNote && (
        <div className="geo-info-banner">
          <span className="geo-info-icon">🛡️</span>
          <span>{cfg.infoNote}</span>
        </div>
      )}

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
