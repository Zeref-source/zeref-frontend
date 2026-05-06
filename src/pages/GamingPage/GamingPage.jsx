import React from 'react'
import CourageRuns3D from '../../games/courage-runner/CourageRuns3D'

export default function GamingPage() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', position: 'relative', overflow: 'hidden' }}>
      <CourageRuns3D />
    </div>
  )
}
