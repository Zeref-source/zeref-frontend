import React, { Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { useGameStore } from './useGameStore'
import { playerRef } from './gameState'
import Player from './Player'
import World from './World'
import UI from './UI/Overlay'
import AudioController from './AudioController'
import * as THREE from 'three'

function CameraRig() {
  const { camera } = useThree()
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerRef.x * 0.18, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5.5 + playerRef.y * 0.15, 0.08)
    camera.lookAt(playerRef.x * 0.1, 1.5, -6)
  })
  return null
}

export default function GameContainer() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#050308' }}>
      <AudioController />

      {/*
        No shadows — saves an entire scene render pass per frame.
        No post-processing — Bloom alone costs 5-8 extra passes.
        dpr=1 — fixed pixel ratio, no high-DPI scaling.
      */}
      <Canvas dpr={1} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 5.5, 11]} fov={58} />
        <CameraRig />

        {/* Boosted non-PBR lighting — Lambert materials only, no shadow maps */}
        <ambientLight intensity={1.1} color="#8060c0" />
        <directionalLight position={[-8, 18, 6]} intensity={2.5} color="#d0e4ff" />
        <directionalLight position={[10, 12, 4]} intensity={1.0} color="#b070ff" />
        <hemisphereLight args={['#2a1060', '#180830', 0.7]} />

        {/* Fog pushed back so side scenery stays visible longer */}
        <color attach="background" args={['#060210']} />
        <fog attach="fog" args={['#050308', 30, 105]} />

        <Suspense fallback={null}>
          <World />
          <Player />
        </Suspense>
      </Canvas>

      <UI />
    </div>
  )
}
