import React from 'react'
import { useGameStore } from '../useGameStore'
import Leaderboard from './Leaderboard'

export default function Overlay() {
  const { status, score, health, startGame, reset } = useGameStore()

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Outfit', sans-serif",
      color: 'white'
    }}>
      
      {/* HUD */}
      {status === 'PLAYING' && (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '12px', border: '1px solid #ff6b2b' }}>
            <div style={{ fontSize: '12px', color: '#ff6b2b', fontWeight: 800 }}>SCORE</div>
            <div style={{ fontSize: '24px', fontWeight: 900 }}>{Math.floor(score)}</div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ fontSize: '24px', filter: i >= health ? 'grayscale(1) opacity(0.3)' : 'none' }}>
                💖
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Start Screen */}
      {status === 'START' && (
        <div style={{ 
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', pointerEvents: 'auto', textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '64px', fontWeight: 900, marginBottom: '0', color: '#ff6b2b', textShadow: '0 0 20px rgba(255,107,43,0.5)' }}>
            COURAGE
          </h1>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '0', color: '#94a3b8' }}>THE COWARDLY RUNNER</h2>
          
          <div style={{ margin: '20px 0', fontSize: '16px', color: '#94a3b8' }}>
            Avoid obstacles · Survive the farm · Don't get caught by Eustace
          </div>

          <button 
            onClick={startGame}
            style={{
              padding: '16px 48px', fontSize: '20px', fontWeight: 800, background: '#ff6b2b', border: 'none',
              borderRadius: '99px', cursor: 'pointer', color: '#050a0e', transition: 'transform 0.2s',
              marginBottom: '20px'
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            LETS GO!
          </button>

          <Leaderboard />
        </div>
      )}

      {/* Game Over Screen */}
      {status === 'GAME_OVER' && (
        <div style={{ 
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', pointerEvents: 'auto', textAlign: 'center', overflowY: 'auto', padding: '40px 0'
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#ff4d6d' }}>STUPID DOG!</h1>
          <div style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '20px' }}>You made Eustace look bad.</div>
          
          <div style={{ background: '#121d28', padding: '30px', borderRadius: '24px', border: '2px solid #ff6b2b', marginBottom: '30px' }}>
            <div style={{ fontSize: '14px', color: '#ff6b2b', fontWeight: 800 }}>FINAL SCORE</div>
            <div style={{ fontSize: '48px', fontWeight: 900 }}>{Math.floor(score)}</div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <button 
              onClick={startGame}
              style={{
                padding: '12px 32px', fontSize: '16px', fontWeight: 800, background: '#ff6b2b', border: 'none',
                borderRadius: '99px', cursor: 'pointer', color: '#050a0e'
              }}
            >
              TRY AGAIN
            </button>
            <button 
              onClick={reset}
              style={{
                padding: '12px 32px', fontSize: '16px', fontWeight: 800, background: 'transparent', border: '2px solid #ff6b2b',
                borderRadius: '99px', cursor: 'pointer', color: '#ff6b2b'
              }}
            >
              MAIN MENU
            </button>
          </div>

          <Leaderboard />
        </div>
      )}

    </div>
  )
}

