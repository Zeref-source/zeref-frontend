import React from 'react'
import GameContainer from '../../games/courage-runner/GameContainer'

export default function GamingPage({ onBack }) {
  return (
    <div className="game-wrap">
      <GameContainer onBack={onBack} />
    </div>
  )
}
