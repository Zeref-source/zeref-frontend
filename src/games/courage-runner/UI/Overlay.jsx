import React from 'react'
import { useGameStore } from '../useGameStore'
import Leaderboard from './Leaderboard'

export default function Overlay({ onBack }) {
  const { status, score, coins, distance, health, isMuted, startGame, reset, toggleMute } = useGameStore()

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

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute', top: '20px', left: '20px',
          background: 'rgba(0,0,0,0.5)', border: '1px solid #ff6b2b',
          borderRadius: '50%', width: '44px', height: '44px',
          cursor: 'pointer', pointerEvents: 'auto',
          fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Exit to home — only when not mid-run */}
      {onBack && status !== 'PLAYING' && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '99px', padding: '0 16px', height: '44px',
            cursor: 'pointer', pointerEvents: 'auto',
            fontSize: '13px', fontWeight: 700, color: '#94a3b8',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
          title="Back to site"
        >
          ← Exit
        </button>
      )}

      {/* Controls hint (bottom left during play) */}
      {status === 'PLAYING' && (
        <div style={{
          position: 'absolute', bottom: '20px', left: '20px',
          background: 'rgba(0,0,0,0.45)', borderRadius: '10px',
          padding: '8px 14px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.7
        }}>
          ← → lane &nbsp;|&nbsp; ↑ / Space jump &nbsp;|&nbsp; ↓ slide
        </div>
      )}

      {/* HUD */}
      {status === 'PLAYING' && (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '12px' }}>
          {/* Distance */}
          <div style={{ background: 'rgba(0,0,0,0.55)', padding: '10px 20px', borderRadius: '12px', border: '1px solid #ff6b2b', minWidth: '90px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#ff6b2b', fontWeight: 800, letterSpacing: 1 }}>DIST</div>
            <div style={{ fontSize: '22px', fontWeight: 900 }}>{Math.floor(distance)}m</div>
          </div>

          {/* Coins */}
          <div style={{ background: 'rgba(0,0,0,0.55)', padding: '10px 16px', borderRadius: '12px', border: '1px solid #ffd700', minWidth: '80px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#ffd700', fontWeight: 800, letterSpacing: 1 }}>COINS</div>
            <div style={{ fontSize: '22px', fontWeight: 900 }}>🪙 {coins}</div>
          </div>

          {/* Hearts */}
          <div style={{ display: 'flex', gap: '6px', alignSelf: 'center' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ fontSize: '26px', filter: i >= health ? 'grayscale(1) opacity(0.3)' : 'none', transition: 'filter 0.3s' }}>
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
          background: 'rgba(0,0,0,0.75)', pointerEvents: 'auto', textAlign: 'center', padding: '20px'
        }}>
          <h1 style={{ fontSize: '64px', fontWeight: 900, margin: '0', color: '#ff6b2b', textShadow: '0 0 24px rgba(255,107,43,0.6)' }}>
            COURAGE
          </h1>
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginTop: '6px', color: '#94a3b8' }}>THE COWARDLY RUNNER</h2>

          <div style={{ margin: '18px 0', fontSize: '15px', color: '#94a3b8', lineHeight: 1.8 }}>
            🐾 ← → switch lanes &nbsp;|&nbsp; ↑ / Space jump over barriers<br />
            ↓ slide under gates &nbsp;|&nbsp; collect 🪙 coins<br />
            Don't let Eustace catch you!
          </div>

          <button
            onClick={startGame}
            style={{
              padding: '16px 52px', fontSize: '20px', fontWeight: 800,
              background: '#ff6b2b', border: 'none', borderRadius: '99px',
              cursor: 'pointer', color: '#050a0e', transition: 'transform 0.2s',
              marginBottom: '24px'
            }}
            onMouseEnter={e => (e.target.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
          >
            LETS GO! 🐕
          </button>

          <Leaderboard />
        </div>
      )}

      {/* Game Over Screen */}
      {status === 'GAME_OVER' && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.88)', pointerEvents: 'auto', textAlign: 'center',
          overflowY: 'auto', padding: '40px 20px'
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#ff4d6d', margin: '0 0 4px' }}>STUPID DOG!</h1>
          <div style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '24px' }}>You made Eustace look bad.</div>

          <div style={{ background: '#121d28', padding: '28px 40px', borderRadius: '24px', border: '2px solid #ff6b2b', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ff6b2b', fontWeight: 800, letterSpacing: 1 }}>DISTANCE</div>
                <div style={{ fontSize: '40px', fontWeight: 900 }}>{Math.floor(distance)}m</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#ffd700', fontWeight: 800, letterSpacing: 1 }}>COINS</div>
                <div style={{ fontSize: '40px', fontWeight: 900 }}>🪙 {coins}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
            <button
              onClick={startGame}
              style={{
                padding: '12px 32px', fontSize: '16px', fontWeight: 800,
                background: '#ff6b2b', border: 'none', borderRadius: '99px',
                cursor: 'pointer', color: '#050a0e'
              }}
            >
              TRY AGAIN
            </button>
            <button
              onClick={reset}
              style={{
                padding: '12px 32px', fontSize: '16px', fontWeight: 800,
                background: 'transparent', border: '2px solid #ff6b2b',
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
