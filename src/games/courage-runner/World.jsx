import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import * as THREE from 'three'

const LANE_WIDTH = 4
const CHUNK_SIZE = 50
const NUM_CHUNKS = 3

function FloorChunk({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[15, CHUNK_SIZE]} />
      <meshStandardMaterial color="#1a120c" roughness={0.8} />
      {/* Decorative lines / grid */}
      <gridHelper args={[15, 5, '#ff6b2b', '#333']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} />
    </mesh>
  )
}

function Obstacle({ position, onHit }) {
  const ref = useRef()
  const status = useGameStore(s => s.status)
  
  useFrame((state, delta) => {
    if (status !== 'PLAYING') return
    const speed = useGameStore.getState().speed
    ref.current.position.z += speed * delta
    
    // Simple collision check (Player is at z=0, x in [-4, 0, 4])
    const playerX = useGameStore.getState().playerX || 0
    const distZ = Math.abs(ref.current.position.z - 0)
    const distX = Math.abs(ref.current.position.x - playerX)
    
    if (distZ < 1 && distX < 1.5) {
      onHit()
      // Move far away to "destroy"
      ref.current.position.z = 100
    }
  })

  return (
    <mesh ref={ref} position={position} castShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff4500" />
    </mesh>
  )
}

export default function World() {
  const status = useGameStore(s => s.status)
  const speed = useGameStore(s => s.speed)
  const damage = useGameStore(s => s.damage)
  const addScore = useGameStore(s => s.addScore)
  const incrementSpeed = useGameStore(s => s.incrementSpeed)

  const [chunks, setChunks] = useState([0, -CHUNK_SIZE, -CHUNK_SIZE * 2])
  const [obstacles, setObstacles] = useState([])
  const lastObstacleZ = useRef(-20)

  useFrame((state, delta) => {
    if (status !== 'PLAYING') return

    // Move chunks
    setChunks(prev => prev.map(z => {
      let nextZ = z + speed * delta
      if (nextZ > CHUNK_SIZE) {
        nextZ -= CHUNK_SIZE * NUM_CHUNKS
        addScore(10) // Score for distance
        incrementSpeed()
      }
      return nextZ
    }))

    // Spawn obstacles
    if (state.clock.elapsedTime > lastObstacleZ.current + (5 / (speed/10))) {
      const lane = Math.floor(Math.random() * 3) - 1 // -1, 0, 1
      setObstacles(prev => [
        ...prev.filter(o => o.z < 20), // Cleanup old
        { id: Date.now(), x: lane * LANE_WIDTH, z: -100 }
      ])
      lastObstacleZ.current = state.clock.elapsedTime
    }
  })

  return (
    <group>
      {chunks.map((z, i) => (
        <FloorChunk key={i} position={[0, 0, z]} />
      ))}
      {obstacles.map(o => (
        <Obstacle key={o.id} position={[o.x, 1, o.z]} onHit={damage} />
      ))}
    </group>
  )
}
