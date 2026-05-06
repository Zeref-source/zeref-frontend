import React, { useState, useEffect } from 'react'
import { useGameStore } from '../useGameStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  
  const { score, status, reset } = useGameStore()

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaderboard`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const submitScore = async () => {
    if (!name.trim()) return
    try {
      const res = await fetch(`${API_BASE}/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: Math.floor(score) })
      })
      if (res.ok) {
        setSubmitted(true)
        fetchLeaderboard()
      }
    } catch (e) {
      console.error('Failed to submit score', e)
    }
  }

  return (
    <div style={{
      background: 'rgba(18, 29, 40, 0.95)',
      border: '1px solid #ff6b2b',
      borderRadius: '24px',
      padding: '24px',
      width: '100%',
      maxWidth: '400px',
      marginTop: '20px',
      pointerEvents: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#ff6b2b', textAlign: 'center' }}>🏆 HALL OF COURAGE</h3>
      
      {/* Submit Score Form */}
      {status === 'GAME_OVER' && !submitted && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Your Name" 
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              flex: 1, background: '#0c141d', border: '1px solid #333', borderRadius: '8px',
              padding: '8px 12px', color: 'white', outline: 'none'
            }}
          />
          <button 
            onClick={submitScore}
            style={{
              background: '#ff6b2b', color: '#050a0e', border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontWeight: 800, cursor: 'pointer'
            }}
          >
            SUBMIT
          </button>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#475569' }}>Loading...</div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569' }}>No scores yet. Be the first!</div>
        ) : (
          data.map((entry, i) => (
            <div key={i} style={{ 
              display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
              background: i === 0 ? 'rgba(255, 107, 43, 0.1)' : 'transparent',
              borderRadius: '8px', border: i === 0 ? '1px solid #ff6b2b' : '1px solid transparent'
            }}>
              <span style={{ fontWeight: i === 0 ? 800 : 400 }}>{i + 1}. {entry.name}</span>
              <span style={{ color: '#ff6b2b', fontWeight: 800 }}>{entry.score}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
