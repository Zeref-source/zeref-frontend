import React, { Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { useGameStore } from './useGameStore'
import { playerRef } from './gameState'
import Player from './Player'
import World from './World'
import UI from './UI/Overlay'
import AudioController from './AudioController'
import * as THREE from 'three'

// Reads from playerRef (plain JS object) — zero Zustand subscriptions, zero re-renders
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
      <Canvas shadows dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 5.5, 11]} fov={58} />
        <CameraRig />

        <ambientLight intensity={0.35} color="#4b2a8a" />
        <directionalLight
          position={[-15, 20, 10]}
          intensity={2}
          color="#b0c4de"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[0, 2, -60]} intensity={5} color="#ff4400" distance={120} />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        <fog attach="fog" args={['#050308', 15, 65]} />

        <Suspense fallback={null}>
          <World />
          <Player />
        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.25} mipmapBlur intensity={0.5} radius={0.4} />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      <UI />
    </div>
  )
}
