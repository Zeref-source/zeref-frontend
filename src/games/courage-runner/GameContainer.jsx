import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
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

// Moon follows camera so fog never obscures it; fog={false} skips the fog calc.
function Moon() {
  const meshRef = useRef()
  const { camera } = useThree()
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(
        camera.position.x - 35,
        camera.position.y + 52,
        camera.position.z - 80
      )
    }
  })
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[10, 16, 12]} />
      <meshBasicMaterial color="#dde8ff" fog={false} />
    </mesh>
  )
}

export default function GameContainer() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#050308' }}>
      <AudioController />

      {/* dpr=1 + no antialias keeps GPU load low even with Bloom */}
      <Canvas dpr={1} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 5.5, 11]} fov={58} />
        <CameraRig />

        {/* Moonlight direction matches moon position above-left */}
        <ambientLight intensity={1.0} color="#7858b8" />
        <directionalLight position={[-35, 55, -80]} intensity={2.0} color="#c8d8ff" />
        <directionalLight position={[10, 12, 4]} intensity={0.7} color="#b070ff" />
        <hemisphereLight args={['#2a1060', '#180830', 0.7]} />

        <color attach="background" args={['#060210']} />
        <fog attach="fog" args={['#050308', 30, 105]} />

        <Suspense fallback={null}>
          <Moon />
          <World />
          <Player />
        </Suspense>


      </Canvas>

      <UI />
    </div>
  )
}
