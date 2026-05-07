import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { useGameStore } from './useGameStore'
import Player from './Player'
import World from './World'
import UI from './UI/Overlay'
import AudioController from './AudioController'
import * as THREE from 'three'

function CameraRig() {
  const { camera } = useThree()
  const playerX = useGameStore(s => s.playerX)
  const playerY = useGameStore(s => s.playerY)

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerX * 0.18, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5.5 + playerY * 0.15, 0.08)
    camera.lookAt(playerX * 0.1, 1.5, -6)
  })

  return null
}

export default function GameContainer() {
  const status = useGameStore((state) => state.status)

  return (
    <div style={{ width: '100%', height: '100%', background: '#050308' }}>
      <AudioController />
      <Canvas shadows dpr={[1, 2]}>

        <PerspectiveCamera makeDefault position={[0, 5.5, 11]} fov={58} />
        <CameraRig />

        {/* Soft purple fill */}
        <ambientLight intensity={0.35} color="#4b2a8a" />

        {/* Strong moonlight */}
        <directionalLight
          position={[-15, 20, 10]}
          intensity={2.2}
          color="#b0c4de"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />

        {/* Horizon glow */}
        <pointLight position={[0, 2, -60]} intensity={6} color="#ff4400" distance={120} />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <fog attach="fog" args={['#050308', 15, 65]} />

        <Suspense fallback={null}>
          <World />
          <Player />
        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.6} radius={0.4} />
          <Noise opacity={0.04} />
          <Vignette eskil={false} offset={0.1} darkness={1.15} />
        </EffectComposer>
      </Canvas>

      <UI />
    </div>
  )
}
