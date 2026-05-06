import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, OrbitControls, Environment as DreiEnv, PerspectiveCamera } from '@react-three/drei'
import { useGameStore } from './useGameStore'
import Player from './Player'
import World from './World'
import UI from './UI/Overlay'

export default function GameContainer() {
  const status = useGameStore((state) => state.status)

  return (
    <div style={{ width: '100%', height: '100%', background: '#050505' }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={50} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, 5, -5]} intensity={0.5} color="#ff6b2b" />
        
        <Sky sunPosition={[100, 20, 100]} />
        <fog attach="fog" args={['#050505', 5, 45]} />

        <Suspense fallback={null}>
          <World />
          <Player />
        </Suspense>

        {/* OrbitControls for debugging, disable during final play */}
        {/* <OrbitControls /> */}
      </Canvas>

      <UI />
    </div>
  )
}
