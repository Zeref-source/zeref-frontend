import React from 'react'
import CourageRuns2D from '../../games/courage-runner/CourageRuns2D'

export default function GamingPage() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', position: 'relative', overflow: 'hidden' }}>
      <CourageRuns2D />
    </div>
  )
}
