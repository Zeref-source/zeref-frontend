import React from 'react'
import GameContainer from '../../games/courage-runner/GameContainer'

export default function GamingPage() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', position: 'relative', overflow: 'hidden' }}>
      <GameContainer />
    </div>
  )
}
