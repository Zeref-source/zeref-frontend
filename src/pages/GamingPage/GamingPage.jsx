import React from 'react'
import GameContainer from '../../games/courage-runner/GameContainer'

export default function GamingPage() {
  return (
    <div
      className="game-wrap"
      style={{
        width: '100%',
        height: 'calc(100dvh - 96px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <GameContainer />
    </div>
  )
}
