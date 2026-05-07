import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import { SpookyTree, Windmill, Fence } from './Assets'
import { playerRef } from './gameState'

const LANES = [-4, 0, 4]
const CHUNK_SIZE = 90
const POOL = 5   // obstacle slots per type
const POOL_COINS = 36

// ─── Pre-allocated pooled meshes (forwardRef so World can hold the refs) ─────

const LowBarrierMesh = React.forwardRef((_, ref) => (
  <group ref={ref} visible={false}>
    <mesh castShadow position={[0, 0.6, 0]}>
      <boxGeometry args={[2.8, 1.2, 1.6]} />
      <meshStandardMaterial color="#c8a832" roughness={1} />
    </mesh>
    <mesh castShadow position={[0, 1.35, 0]}>
      <boxGeometry args={[2.6, 0.6, 1.5]} />
      <meshStandardMaterial color="#d4b84a" roughness={1} />
    </mesh>
    <mesh position={[0, 0.7, 0.82]}>
      <boxGeometry args={[2.9, 1.4, 0.04]} />
      <meshStandardMaterial color="#5a3a1a" />
    </mesh>
  </group>
))

const HighGateMesh = React.forwardRef((_, ref) => (
  <group ref={ref} visible={false}>
    <mesh position={[-1.5, 2.2, 0]} castShadow>
      <boxGeometry args={[0.35, 4.4, 0.35]} />
      <meshStandardMaterial color="#2a1a0a" roughness={1} />
    </mesh>
    <mesh position={[1.5, 2.2, 0]} castShadow>
      <boxGeometry args={[0.35, 4.4, 0.35]} />
      <meshStandardMaterial color="#2a1a0a" roughness={1} />
    </mesh>
    <mesh position={[0, 4.2, 0]} castShadow>
      <boxGeometry args={[3.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#2a1a0a" roughness={1} />
    </mesh>
    <mesh position={[0, 3.5, 0.22]}>
      <boxGeometry args={[1.6, 0.55, 0.04]} />
      <meshStandardMaterial color="#8b0000" emissive="#440000" emissiveIntensity={0.5} />
    </mesh>
  </group>
))

const TrainCarMesh = React.forwardRef((_, ref) => (
  <group ref={ref} visible={false}>
    <mesh position={[0, 1.4, 0]} castShadow>
      <boxGeometry args={[3.2, 2.8, 4]} />
      <meshStandardMaterial color="#3a2a1a" roughness={0.6} metalness={0.4} />
    </mesh>
    <mesh position={[0, 2.95, 0]}>
      <boxGeometry args={[3.4, 0.25, 4.2]} />
      <meshStandardMaterial color="#2a1a0a" />
    </mesh>
    <mesh position={[-1.3, 0.38, 1.2]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.38, 0.38, 0.18, 10]} />
      <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[1.3, 0.38, 1.2]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.38, 0.38, 0.18, 10]} />
      <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[-1.3, 0.38, -1.2]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.38, 0.38, 0.18, 10]} />
      <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[1.3, 0.38, -1.2]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.38, 0.38, 0.18, 10]} />
      <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 1.6, 2.06]}>
      <boxGeometry args={[1.6, 0.9, 0.04]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.8} />
    </mesh>
  </group>
))

const CoinMeshItem = React.forwardRef((_, ref) => (
  <group ref={ref} visible={false}>
    <mesh>
      <cylinderGeometry args={[0.28, 0.28, 0.08, 10]} />
      <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
    </mesh>
  </group>
))

// ─── Static floor chunk (rendered once per chunk group) ───────────────────────

function FloorChunk() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, CHUNK_SIZE]} />
        <meshStandardMaterial color="#1a0f2a" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, CHUNK_SIZE]} />
        <meshStandardMaterial color="#120828" roughness={0.7} />
      </mesh>
      {[-2, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, CHUNK_SIZE]} />
          <meshStandardMaterial color="#3a1a5a" emissive="#2a0a4a" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <SpookyTree position={[-16, 0, -CHUNK_SIZE * 0.3]} />
      <SpookyTree position={[18, 0, CHUNK_SIZE * 0.1]} />
      <Fence position={[-7.5, 0, -CHUNK_SIZE / 4]} />
      <Fence position={[7.5, 0, -CHUNK_SIZE / 4]} />
    </>
  )
}

// ─── World ───────────────────────────────────────────────────────────────────

export default function World() {
  const status = useGameStore(s => s.status)
  const statusRef = useRef(status)
  useEffect(() => { statusRef.current = status }, [status])

  // Chunk group refs
  const chunkRefs = [useRef(), useRef(), useRef()]

  // Pre-allocated mesh refs (never change — JSX renders once on mount)
  const lowRefs   = useRef(Array.from({ length: POOL }, () => React.createRef()))
  const highRefs  = useRef(Array.from({ length: POOL }, () => React.createRef()))
  const trainRefs = useRef(Array.from({ length: POOL }, () => React.createRef()))
  const coinRefs  = useRef(Array.from({ length: POOL_COINS }, () => React.createRef()))

  // Pure-JS game data — mutated in useFrame, never stored in React state
  const chunkZ = useRef([0, -CHUNK_SIZE, -CHUNK_SIZE * 2])
  const obs = useRef({
    low:   Array.from({ length: POOL }, () => ({ active: false, lane: 1, z: -300 })),
    high:  Array.from({ length: POOL }, () => ({ active: false, lane: 1, z: -300 })),
    train: Array.from({ length: POOL }, () => ({ active: false, lane: 1, z: -300 })),
  })
  const coins = useRef(Array.from({ length: POOL_COINS }, () => ({ active: false, x: 0, baseY: 1.2, z: -300 })))
  const lastSpawn = useRef(0)
  const distTraveled = useRef(0)
  const lastSpeedInc = useRef(0)
  const hitCooldown = useRef(0)

  // Accumulate score/distance — flush to store every 0.4s to avoid 60fps Zustand updates
  const scoreAccum = useRef(0)
  const distAccum = useRef(0)
  const lastFlush = useRef(0)

  // Reset pools when a new game starts
  useEffect(() => {
    if (status !== 'PLAYING') return
    chunkZ.current = [0, -CHUNK_SIZE, -CHUNK_SIZE * 2];
    ['low', 'high', 'train'].forEach(t =>
      obs.current[t].forEach(o => { o.active = false; o.z = -300 })
    )
    coins.current.forEach(c => { c.active = false; c.z = -300 })
    lowRefs.current.forEach(r => { if (r.current) r.current.visible = false })
    highRefs.current.forEach(r => { if (r.current) r.current.visible = false })
    trainRefs.current.forEach(r => { if (r.current) r.current.visible = false })
    coinRefs.current.forEach(r => { if (r.current) r.current.visible = false })
    lastSpawn.current = 0; distTraveled.current = 0; lastSpeedInc.current = 0
    hitCooldown.current = 0; scoreAccum.current = 0; distAccum.current = 0; lastFlush.current = 0
  }, [status])

  useFrame((state, delta) => {
    if (statusRef.current !== 'PLAYING') return

    const dt = Math.min(delta, 0.05)
    const speed = useGameStore.getState().speed
    const elapsed = state.clock.elapsedTime

    // ── Chunks ──────────────────────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      chunkZ.current[i] += speed * dt
      if (chunkZ.current[i] > CHUNK_SIZE * 0.5) chunkZ.current[i] -= CHUNK_SIZE * 3
      if (chunkRefs[i].current) chunkRefs[i].current.position.z = chunkZ.current[i]
    }

    // ── Distance / score (accumulate, flush 2.5x/sec) ───────────────────────
    const dist = speed * dt
    distTraveled.current += dist
    scoreAccum.current += dist * 0.5
    distAccum.current += dist * 0.1

    if (elapsed - lastFlush.current > 0.4) {
      const store = useGameStore.getState()
      store.addScore(scoreAccum.current)
      store.addDistance(distAccum.current)
      scoreAccum.current = 0; distAccum.current = 0
      lastFlush.current = elapsed
    }

    // Speed ramp every 80 units
    if (distTraveled.current - lastSpeedInc.current > 80) {
      useGameStore.getState().incrementSpeed()
      lastSpeedInc.current = distTraveled.current
    }

    // ── Spawn ────────────────────────────────────────────────────────────────
    const spawnInterval = Math.max(1.5, 5 / (speed / 10))
    if (elapsed - lastSpawn.current > spawnInterval) {
      lastSpawn.current = elapsed
      const types = ['low', 'high', 'train']
      const type = types[Math.floor(Math.random() * types.length)]
      const lane = Math.floor(Math.random() * 3)
      const pool = obs.current[type]
      const slot = pool.findIndex(o => !o.active)
      if (slot !== -1) { pool[slot].active = true; pool[slot].lane = lane; pool[slot].z = -140 }

      // Coins in a different lane
      const coinLane = (lane + 1 + Math.floor(Math.random() * 2)) % 3
      const cx = LANES[coinLane]
      let spawned = 0
      for (let i = 0; i < POOL_COINS && spawned < 5; i++) {
        const c = coins.current[i]
        if (!c.active) { c.active = true; c.x = cx; c.baseY = 1.2; c.z = -120 - spawned * 3.2; spawned++ }
      }
    }

    // Hit cooldown
    if (hitCooldown.current > 0) hitCooldown.current -= dt

    // ── Helper: move + collide one obstacle pool ─────────────────────────────
    const processObs = (pool, refs, hitFn) => {
      for (let i = 0; i < pool.length; i++) {
        const o = pool[i]
        if (!o.active) continue
        o.z += speed * dt
        const mesh = refs.current[i].current
        if (!mesh) continue
        if (o.z > 12) { o.active = false; mesh.visible = false; continue }
        mesh.position.set(LANES[o.lane], 0, o.z)
        mesh.visible = true
        if (hitCooldown.current <= 0) {
          const dz = Math.abs(o.z), dx = Math.abs(LANES[o.lane] - playerRef.x)
          if (dz < 1.8 && dx < 1.6 && hitFn()) {
            o.active = false; mesh.visible = false
            hitCooldown.current = 2.0
            useGameStore.getState().damage()
          }
        }
      }
    }

    processObs(obs.current.low,   lowRefs,   () => playerRef.y < 2.2)          // jump over
    processObs(obs.current.high,  highRefs,  () => !playerRef.isSliding)        // slide under
    processObs(obs.current.train, trainRefs, () => true)                         // switch lane

    // ── Coins ────────────────────────────────────────────────────────────────
    for (let i = 0; i < POOL_COINS; i++) {
      const c = coins.current[i]
      if (!c.active) continue
      c.z += speed * dt
      const mesh = coinRefs.current[i].current
      if (!mesh) continue
      if (c.z > 10) { c.active = false; mesh.visible = false; continue }
      mesh.position.set(c.x, c.baseY + Math.sin(elapsed * 3 + c.x) * 0.1, c.z)
      mesh.rotation.y += dt * 3
      mesh.visible = true
      const dz = Math.abs(c.z), dx = Math.abs(c.x - playerRef.x)
      if (dz < 1.2 && dx < 1.5) { c.active = false; mesh.visible = false; useGameStore.getState().addCoins(1) }
    }
  })

  return (
    <group>
      {/* Floor chunks — positions updated via refs, geometry never re-renders */}
      <group ref={chunkRefs[0]}><FloorChunk /></group>
      <group ref={chunkRefs[1]}><FloorChunk /></group>
      <group ref={chunkRefs[2]}><FloorChunk /></group>

      <Windmill position={[-25, 0, -50]} />

      {/* Obstacle pools — mounted once, shown/hidden + repositioned via refs */}
      {lowRefs.current.map((r, i)   => <LowBarrierMesh key={`lo${i}`} ref={r} />)}
      {highRefs.current.map((r, i)  => <HighGateMesh   key={`hi${i}`} ref={r} />)}
      {trainRefs.current.map((r, i) => <TrainCarMesh   key={`tr${i}`} ref={r} />)}

      {/* Coin pool */}
      {coinRefs.current.map((r, i)  => <CoinMeshItem   key={`co${i}`} ref={r} />)}
    </group>
  )
}
