import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import { SpookyTree, Windmill, Farmhouse, Fence } from './Assets'

const LANE_WIDTH = 4
const CHUNK_SIZE = 60
const NUM_CHUNKS = 3

function FloorChunk({ position }) {
  return (
    <group position={position}>
      {/* Main Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, CHUNK_SIZE]} />
        <meshStandardMaterial color="#4a2a5a" roughness={1} />
      </mesh>
      
      {/* Path / Lane Area */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15, CHUNK_SIZE]} />
        <meshStandardMaterial color="#3a1a4a" roughness={0.8} />
      </mesh>

      {/* Side Scenery Decorations */}
      <SpookyTree position={[-12, 0, -20]} />
      <SpookyTree position={[15, 0, 10]} />
      <Windmill position={[-20, 0, 0]} />
      <Fence position={[-7.5, 0, -CHUNK_SIZE/2]} />
      <Fence position={[7.5, 0, -CHUNK_SIZE/2]} />
      <Fence position={[-7.5, 0, 0]} />
      <Fence position={[7.5, 0, 0]} />
    </group>
  )
}

function Obstacle({ position, onHit }) {
  const ref = useRef()
  const status = useGameStore(s => s.status)
  
  useFrame((state, delta) => {
    if (status !== 'PLAYING') return
    const speed = useGameStore.getState().speed
    ref.current.position.z += speed * delta
    
    const playerX = useGameStore.getState().playerX || 0
    const distZ = Math.abs(ref.current.position.z - 0)
    const distX = Math.abs(ref.current.position.x - playerX)
    
    if (distZ < 1.2 && distX < 1.8) {
      onHit()
      ref.current.position.z = 100
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Thematic Obstacle: Spooky Hay Bale or Crate */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 1.5, 2]} />
        <meshStandardMaterial color="#d4af37" roughness={1} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[2.6, 0.2, 2.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
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

    setChunks(prev => prev.map(z => {
      let nextZ = z + speed * delta
      if (nextZ > CHUNK_SIZE) {
        nextZ -= CHUNK_SIZE * NUM_CHUNKS
        addScore(10)
        incrementSpeed()
      }
      return nextZ
    }))

    if (state.clock.elapsedTime > lastObstacleZ.current + (4 / (speed/10))) {
      const lane = Math.floor(Math.random() * 3) - 1
      setObstacles(prev => [
        ...prev.filter(o => o.z < 20),
        { id: Date.now(), x: lane * LANE_WIDTH, z: -120 }
      ])
      lastObstacleZ.current = state.clock.elapsedTime
    }
  })

  return (
    <group>
      {chunks.map((z, i) => (
        <React.Fragment key={i}>
          <FloorChunk position={[0, 0, z]} />
          {/* Add a rare farmhouse in the distance for one chunk */}
          {i === 2 && <Farmhouse position={[30, 0, z - 10]} />}
        </React.Fragment>
      ))}
      {obstacles.map(o => (
        <Obstacle key={o.id} position={[o.x, 0.75, o.z]} onHit={damage} />
      ))}
    </group>
  )
}

