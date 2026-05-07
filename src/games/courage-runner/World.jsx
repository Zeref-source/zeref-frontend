import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import { SpookyTree, Windmill, Fence } from './Assets'
import * as THREE from 'three'

const LANES = [-4, 0, 4]
const CHUNK_SIZE = 90
const NUM_CHUNKS = 3
const COIN_GOLD = '#ffd700'

// ─── Obstacles ───────────────────────────────────────────────────────────────

function LowBarrier({ position }) {
  return (
    <group position={position}>
      {/* Hay bale bottom */}
      <mesh castShadow>
        <boxGeometry args={[2.8, 1.2, 1.6]} />
        <meshStandardMaterial color="#c8a832" roughness={1} />
      </mesh>
      {/* Hay bale top */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[2.6, 0.8, 1.5]} />
        <meshStandardMaterial color="#d4b84a" roughness={1} />
      </mesh>
      {/* Rope bands */}
      <mesh position={[0, 0.4, 0.81]}>
        <boxGeometry args={[2.9, 1.8, 0.05]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
    </group>
  )
}

function HighGate({ position }) {
  return (
    <group position={position}>
      {/* Left post */}
      <mesh position={[-1.5, 2.2, 0]} castShadow>
        <boxGeometry args={[0.35, 4.4, 0.35]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      {/* Right post */}
      <mesh position={[1.5, 2.2, 0]} castShadow>
        <boxGeometry args={[0.35, 4.4, 0.35]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      {/* Top beam */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <boxGeometry args={[3.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      {/* Spooky sign */}
      <mesh position={[0, 3.5, 0.25]}>
        <boxGeometry args={[1.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#8b0000" emissive="#440000" emissiveIntensity={0.4} />
      </mesh>
      {/* Gap indicator glow */}
      <pointLight position={[0, 0.8, 1]} intensity={1.5} distance={5} color="#ff3300" />
    </group>
  )
}

function TrainCar({ position }) {
  return (
    <group position={position}>
      {/* Main car body */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[3.2, 2.8, 4]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.95, 0]} castShadow>
        <boxGeometry args={[3.4, 0.25, 4.2]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
      </mesh>
      {/* Wheels */}
      {[-1.3, 1.3].map((x, i) => (
        [-1.2, 1.2].map((z, j) => (
          <mesh key={`w${i}${j}`} position={[x, 0.35, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 12]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      ))}
      {/* Window */}
      <mesh position={[0, 1.6, 2.05]}>
        <boxGeometry args={[1.6, 0.9, 0.05]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[0, 1.6, 2.5]} intensity={2} distance={6} color="#ff3300" />
    </group>
  )
}

// ─── Coin ────────────────────────────────────────────────────────────────────

function CoinMesh({ position }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.12
    ref.current.rotation.y += 0.06
  })
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 12]} />
        <meshStandardMaterial color={COIN_GOLD} emissive={COIN_GOLD} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

// ─── Floor Chunk ─────────────────────────────────────────────────────────────

function FloorChunk({ zOffset }) {
  return (
    <group position={[0, 0, zOffset]}>
      {/* Wide ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, CHUNK_SIZE]} />
        <meshStandardMaterial color="#1a0f2a" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Running path */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, CHUNK_SIZE]} />
        <meshStandardMaterial color="#120828" roughness={0.7} />
      </mesh>
      {/* Lane dividers */}
      {[-2, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, CHUNK_SIZE]} />
          <meshStandardMaterial color="#3a1a5a" emissive="#2a0a4a" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Side scenery */}
      <SpookyTree position={[-16, 0, -CHUNK_SIZE * 0.3]} />
      <SpookyTree position={[18, 0, CHUNK_SIZE * 0.1]} />
      <SpookyTree position={[-20, 0, CHUNK_SIZE * 0.35]} />
      <Fence position={[-7.5, 0, -CHUNK_SIZE / 4]} />
      <Fence position={[7.5, 0, -CHUNK_SIZE / 4]} />
      <Fence position={[-7.5, 0, CHUNK_SIZE / 4]} />
      <Fence position={[7.5, 0, CHUNK_SIZE / 4]} />
    </group>
  )
}

// ─── Main World ──────────────────────────────────────────────────────────────

function generateCoinPattern(laneIdx, baseZ) {
  const x = LANES[laneIdx]
  const patterns = [
    // Straight line in one lane
    [0, 1, 2, 3, 4].map(i => [x, 1.2, baseZ - i * 2.5]),
    // Zigzag across all 3 lanes
    [0, 1, 2, 3, 4].map(i => [LANES[i % 3], 1.2, baseZ - i * 3]),
    // Arc — same lane, 3 coins
    [-1, 0, 1].map(i => [x, 1.2 + Math.abs(i) * 0.5, baseZ + i * 2.5]),
  ]
  return patterns[Math.floor(Math.random() * patterns.length)]
}

export default function World() {
  const status = useGameStore(s => s.status)
  const damage = useGameStore(s => s.damage)
  const addCoins = useGameStore(s => s.addCoins)
  const addScore = useGameStore(s => s.addScore)
  const addDistance = useGameStore(s => s.addDistance)
  const incrementSpeed = useGameStore(s => s.incrementSpeed)

  // Chunk Z positions
  const chunkZRef = useRef([0, -CHUNK_SIZE, -CHUNK_SIZE * 2])

  // Obstacles: { id, type, lane, z, dead }
  const obstaclesRef = useRef([])
  const coinsRef = useRef([]) // { id, pos:[x,y,z], collected }
  const lastSpawnTimeRef = useRef(0)
  const lastSpeedIncRef = useRef(0)
  const distanceRef = useRef(0)

  // Force re-render by tracking a tick counter
  const tickRef = useRef(0)
  const [, forceRender] = React.useReducer(x => x + 1, 0)

  useFrame((state, delta) => {
    if (status !== 'PLAYING') return

    const speed = useGameStore.getState().speed
    const playerX = useGameStore.getState().playerX
    const playerY = useGameStore.getState().playerY
    const isSliding = useGameStore.getState().isSliding

    // Chunk recycling
    chunkZRef.current = chunkZRef.current.map(z => {
      let next = z + speed * delta
      if (next > CHUNK_SIZE) next -= CHUNK_SIZE * NUM_CHUNKS
      return next
    })

    // Distance + score
    const traveled = speed * delta
    distanceRef.current += traveled
    addDistance(traveled * 0.1)
    addScore(traveled * 0.5)

    // Speed ramp every 80 units
    if (distanceRef.current - lastSpeedIncRef.current > 80) {
      incrementSpeed()
      lastSpeedIncRef.current = distanceRef.current
    }

    // Spawn obstacles + coins
    const spawnInterval = Math.max(1.2, 4 / (speed / 10))
    if (state.clock.elapsedTime - lastSpawnTimeRef.current > spawnInterval) {
      lastSpawnTimeRef.current = state.clock.elapsedTime

      // Pick obstacle type
      const types = ['low', 'high', 'train']
      const type = types[Math.floor(Math.random() * types.length)]

      // Pick lane(s)
      let lane = Math.floor(Math.random() * 3)

      // For train, block one lane; ensure others are free
      obstaclesRef.current.push({
        id: Date.now() + Math.random(),
        type,
        lane,
        z: -130,
        dead: false,
      })

      // Spawn a coin pattern occasionally
      if (Math.random() < 0.6) {
        const coinLane = (lane + 1 + Math.floor(Math.random() * 2)) % 3
        const pattern = generateCoinPattern(coinLane, -110)
        pattern.forEach((pos, i) => {
          coinsRef.current.push({
            id: Date.now() + i + Math.random(),
            pos,
            collected: false,
          })
        })
      }

      forceRender()
    }

    // Move obstacles + collision
    let needsRender = false
    obstaclesRef.current.forEach(obs => {
      if (obs.dead) return
      obs.z += speed * delta

      if (obs.z > 15) {
        obs.dead = true
        needsRender = true
        return
      }

      // Collision window
      const distZ = Math.abs(obs.z)
      const distX = Math.abs(LANES[obs.lane] - playerX)

      if (distZ < 1.5 && distX < 1.6) {
        let hit = false

        if (obs.type === 'low') {
          // Jump over it — hit if player y is low (not airborne enough)
          if (playerY < 2.0) hit = true
        } else if (obs.type === 'high') {
          // Slide under it — hit if player is NOT sliding
          if (!isSliding) hit = true
        } else if (obs.type === 'train') {
          // Must be in different lane
          hit = true
        }

        if (hit) {
          obs.dead = true
          damage()
          needsRender = true
        }
      }
    })

    // Move coins + collection
    coinsRef.current.forEach(coin => {
      if (coin.collected) return
      coin.pos[2] += speed * delta

      if (coin.pos[2] > 12) {
        coin.collected = true
        needsRender = true
        return
      }

      const distZ = Math.abs(coin.pos[2])
      const distX = Math.abs(coin.pos[0] - playerX)
      if (distZ < 1.2 && distX < 1.5) {
        coin.collected = true
        addCoins(1)
        needsRender = true
      }
    })

    // Prune dead/collected
    if (obstaclesRef.current.length > 40) {
      obstaclesRef.current = obstaclesRef.current.filter(o => !o.dead)
      needsRender = true
    }
    if (coinsRef.current.length > 80) {
      coinsRef.current = coinsRef.current.filter(c => !c.collected)
      needsRender = true
    }

    if (needsRender) forceRender()
  })

  // Reset on new game
  React.useEffect(() => {
    if (status === 'START' || status === 'PLAYING') {
      obstaclesRef.current = []
      coinsRef.current = []
      lastSpawnTimeRef.current = 0
      lastSpeedIncRef.current = 0
      distanceRef.current = 0
      chunkZRef.current = [0, -CHUNK_SIZE, -CHUNK_SIZE * 2]
    }
  }, [status])

  return (
    <group>
      {/* Floor chunks */}
      {chunkZRef.current.map((z, i) => (
        <FloorChunk key={i} zOffset={z} />
      ))}

      {/* Windmill in the distance */}
      <Windmill position={[-25, 0, -80]} />

      {/* Obstacles */}
      {obstaclesRef.current.filter(o => !o.dead).map(obs => {
        const x = LANES[obs.lane]
        const pos = [x, 0, obs.z]
        if (obs.type === 'low') return <LowBarrier key={obs.id} position={pos} />
        if (obs.type === 'high') return <HighGate key={obs.id} position={pos} />
        if (obs.type === 'train') return <TrainCar key={obs.id} position={[x, 0, obs.z]} />
        return null
      })}

      {/* Coins */}
      {coinsRef.current.filter(c => !c.collected).map(coin => (
        <CoinMesh key={coin.id} position={coin.pos} />
      ))}
    </group>
  )
}
