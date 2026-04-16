import React, { useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

function secondsToMMSS(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function secondsToPlayerTime(s) { return s }

// Target is 8 minutes = 480 seconds
// Each highlight clip is estimated at ~32 seconds (8min / 15 highlights)
const CLIP_DURATION_SEC = 32
const TARGET_SEC = 480

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="custom-tooltip">
      <div className="label">⏱ {secondsToMMSS(label)}</div>
      <div className="value">Hype: {(d?.hype_score * 100).toFixed(1)}%</div>
      {d?.chat_count > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>💬 {d.chat_count} msgs</div>}
    </div>
  )
}

export default function ResultsPage({ results, onBack }) {
  const [activeTimestamp, setActiveTimestamp] = useState(null)
  const [selectedItems, setSelectedItems] = useState(() => new Set(results?.highlights?.map(h => h.time_seconds) || []))
  const [copied, setCopied] = useState(false)

  const { highlights = [], timeline = [], video_id } = results || {}

  const toggleItem = (time_seconds) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(time_seconds)) next.delete(time_seconds)
      else next.add(time_seconds)
      return next
    })
  }

  const selectedHighlights = highlights.filter(h => selectedItems.has(h.time_seconds))
  const totalDurationSec = selectedHighlights.length * CLIP_DURATION_SEC

  const handleTimestampClick = (ts) => {
    setActiveTimestamp(ts.time_seconds)
  }

  const handleChartClick = (data) => {
    if (!data?.activePayload?.[0]) return
    const time = data.activePayload[0].payload.time_seconds
    // Find nearest highlight
    const nearest = highlights.reduce((prev, curr) =>
      Math.abs(curr.time_seconds - time) < Math.abs(prev.time_seconds - time) ? curr : prev
    )
    setActiveTimestamp(nearest.time_seconds)
  }

  const exportText = () => {
    const lines = selectedHighlights.map(h => h.formatted).join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `soul-zeref-highlights-${video_id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyAll = () => {
    const lines = selectedHighlights.map(h => h.formatted).join('\n')
    navigator.clipboard.writeText(lines)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const playerSrc = video_id
    ? `https://www.youtube.com/embed/${video_id}?start=${activeTimestamp ?? 0}&autoplay=${activeTimestamp != null ? 1 : 0}&enablejsapi=1`
    : null

  const maxHype = Math.max(...timeline.map(t => t.hype_score), 0.001)

  return (
    <main className="results-page">
      {/* Header row */}
      <div className="results-header">
        <button id="back-btn" className="back-btn" onClick={onBack}>← New Analysis</button>
        <h1 className="results-title">⚡ Highlights Found</h1>
        <span className="results-badge">✅ {highlights.length} moments detected</span>
      </div>

      {/* Main grid */}
      <div className="results-grid">
        {/* Left column: chart + player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>
          {/* Hype chart */}
          <div className="chart-card">
            <p className="card-title">🔥 Stream Hype Timeline — click a bar to jump to that moment</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={timeline}
                margin={{ top: 4, right: 0, left: -32, bottom: 0 }}
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              >
                <XAxis
                  dataKey="time_seconds"
                  tickFormatter={(v) => secondsToMMSS(v)}
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hype_score" radius={[3, 3, 0, 0]}>
                  {timeline.map((entry, index) => {
                    const isHighlight = highlights.some(h => h.time_seconds === entry.time_seconds)
                    const isActive = activeTimestamp === entry.time_seconds
                    let fill = isActive
                      ? '#ff6b2b'
                      : isHighlight
                        ? 'rgba(255,107,43,0.5)'
                        : 'rgba(255,255,255,0.06)'
                    return <Cell key={`cell-${index}`} fill={fill} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* YouTube player */}
          {playerSrc && (
            <div className="player-card">
              <div className="player-wrapper">
                <iframe
                  key={`${video_id}-${activeTimestamp}`}
                  src={playerSrc}
                  title="Stream Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* Right column: timestamps */}
        <div className="timestamps-card">
          <p className="card-title">📋 Timestamp List</p>

          {/* Duration counter */}
          <div className="duration-counter">
            <div className="duration-label">Selected Clip Duration</div>
            <div className="duration-value">
              {Math.floor(totalDurationSec / 60)}m {totalDurationSec % 60}s
            </div>
            <div className="duration-target" style={{
              color: totalDurationSec >= TARGET_SEC ? 'var(--success)' : 'var(--text-muted)'
            }}>
              {totalDurationSec >= TARGET_SEC
                ? '🎉 Target hit! 8 minutes achieved!'
                : `🎯 Need ~${Math.max(0, TARGET_SEC - totalDurationSec)}s more for 8 min`}
            </div>
          </div>

          {/* Actions */}
          <div className="timestamps-actions">
            <button id="copy-all-btn" className="action-btn primary" onClick={copyAll}>
              {copied ? '✅ Copied!' : '📋 Copy All'}
            </button>
            <button id="export-btn" className="action-btn" onClick={exportText}>
              💾 Export .txt
            </button>
          </div>

          {/* List */}
          <div className="timestamps-list">
            {highlights.map((h, i) => (
              <div
                key={h.time_seconds}
                id={`timestamp-${i}`}
                className={`timestamp-item${activeTimestamp === h.time_seconds ? ' active' : ''}`}
                onClick={() => {
                  handleTimestampClick(h)
                  toggleItem(h.time_seconds)
                }}
              >
                <div className="ts-top-row">
                  <span className="ts-time">{h.timestamp}</span>
                  {h.is_chapter && (
                    <span className="ts-chapter-badge" title={h.chapter_name}>📐 Chapter</span>
                  )}
                  {h.comment_mentions > 0 && (
                    <span className="ts-comment-badge" title={`${h.comment_mentions} viewers mentioned this timestamp`}>💬 ×{h.comment_mentions}</span>
                  )}
                  <div className="ts-hype-bar">
                    <div
                      className="ts-hype-fill"
                      style={{ width: `${(h.hype_score / maxHype) * 100}%` }}
                    />
                  </div>
                  <span className="ts-rank">
                    {selectedItems.has(h.time_seconds) ? '✅' : '⬜'}
                  </span>
                </div>
                <div className="ts-title">{h.title}</div>
                <div className="ts-desc">{h.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
