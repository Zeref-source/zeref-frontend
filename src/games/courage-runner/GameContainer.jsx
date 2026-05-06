import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { useGameStore } from './useGameStore'
import Player from './Player'
import World from './World'
import UI from './UI/Overlay'
import AudioController from './AudioController'

export default function GameContainer() {
  const status = useGameStore((state) => state.status)

  return (
    <div style={{ width: '100%', height: '100%', background: '#050308' }}>
      <AudioController />
      <Canvas shadows dpr={[1, 2]}>

        <PerspectiveCamera makeDefault position={[0, 6, 12]} fov={45} />
        
        {/* --- LIGHTING --- */}
        {/* Soft purple fill for the night vibe */}
        <ambientLight intensity={0.4} color="#4b2a8a" />
        
        {/* Strong Moonlight */}
        <directionalLight
          position={[-15, 20, 10]}
          intensity={2}
          color="#b0c4de"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* Horizon Glow (Sunset remnants) */}
        <pointLight position={[0, 2, -50]} intensity={5} color="#ff6b2b" distance={100} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Dense Eerie Fog */}
        <fog attach="fog" args={['#050308', 10, 55]} />

        <Suspense fallback={null}>
          <World />
          <Player />
        </Suspense>

        {/* --- POST PROCESSING --- */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={0.5} 
            radius={0.4} 
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      <UI />
    </div>
  )
}

