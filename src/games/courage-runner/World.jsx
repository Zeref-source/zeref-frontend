import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import { SpookyTree, Gravestone, Lantern, Scarecrow, OldBarn, Rock, BrokenWagon, Windmill, Fence, Pumpkin } from './Assets'
import { playerRef } from './gameState'

const LANES = [-4, 0, 4]
const CHUNK_SIZE = 90
const POOL = 6
const POOL_COINS = 40

// ─── Pooled obstacle meshes ───────────────────────────────────────────────────

const LowBarrierMesh = React.forwardRef((_, ref) => (
  <group ref={ref} visible={false}>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[2.8, 1.2, 1.6]} />
      <meshLambertMaterial color="#c8a832" />
    </mesh>
    <mesh position={[0, 1.35, 0]}>
      <boxGeometry args={[2.6, 0.6, 1.5]} />
      <meshLambertMaterial color="#d4b84a" />
    </mesh>
    <mesh position={[0, 0.7, 0.82]}>
      <boxGeometry args={[2.9, 1.4, 0.04]} />
      <meshLambertMaterial color="#5a3a1a" />
    </mesh>
  </group>
))

const HighGateMesh = React.forwardRef((_, ref) => (
  <group ref={ref} visible={false}>
    <mesh position={[-1.5, 2.2, 0]}>
      <boxGeometry args={[0.35, 4.4, 0.35]} />
      <meshLambertMaterial color="#3a2810" />
    </mesh>
    <mesh position={[1.5, 2.2, 0]}>
      <boxGeometry args={[0.35, 4.4, 0.35]} />
      <meshLambertMaterial color="#3a2810" />
    </mesh>
    <mesh position={[0, 4.2, 0]}>
      <boxGeometry args={[3.4, 0.4, 0.4]} />
      <meshLambertMaterial color="#3a2810" />
    </mesh>
    <mesh position={[0, 3.5, 0.22]}>
      <boxGeometry args={[1.6, 0.55, 0.04]} />
      <meshLambertMaterial color="#cc0000" emissive="#880000" />
    </mesh>
  </group>
))

const TrainCarMesh = React.forwardRef((_, ref) => (
  <group ref={ref} visible={false}>
    <mesh position={[0, 1.4, 0]}>
      <boxGeometry args={[3.2, 2.8, 4]} />
      <meshLambertMaterial color="#3a2a1a" />
    </mesh>
    <mesh position={[0, 2.95, 0]}>
      <boxGeometry args={[3.4, 0.25, 4.2]} />
      <meshLambertMaterial color="#1a1208" />
    </mesh>
    {[[-1.3, 1.2], [1.3, 1.2], [-1.3, -1.2], [1.3, -1.2]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.38, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.38, 0.18, 8]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
    ))}
    <mesh position={[0, 1.6, 2.06]}>
      <boxGeometry args={[1.6, 0.9, 0.04]} />
      <meshLambertMaterial color="#ff2200" emissive="#cc1100" />
    </mesh>
  </group>
))

const CoinMeshItem = React.forwardRef((_, ref) => (
  <group ref={ref} visible={false}>
    <mesh>
      <cylinderGeometry args={[0.28, 0.28, 0.08, 8]} />
      <meshLambertMaterial color="#ffd700" emissive="#aa8800" />
    </mesh>
  </group>
))

// ─── Floor chunks — 3 variants so recycled chunks look different ──────────────

function FloorChunk({ variant }) {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, CHUNK_SIZE]} />
        <meshLambertMaterial color="#140c20" />
      </mesh>
      {/* Running path */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, CHUNK_SIZE]} />
        <meshLambertMaterial color="#0e0618" />
      </mesh>
      {/* Lane divider strips */}
      {[-2, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, CHUNK_SIZE]} />
          <meshLambertMaterial color="#6030a0" emissive="#3a1060" />
        </mesh>
      ))}

      {/* ── LEFT — variant 0 ──────────────────────────── */}
      {variant === 0 && <>
        <Fence position={[-7.5, 0, -44]} length={5} />
        <Fence position={[-7.5, 0, 18]} length={3} />
        <Lantern position={[-8, 0, -38]} />
        <Lantern position={[-8, 0, -8]} />
        <Lantern position={[-8, 0, 24]} />
        <Gravestone position={[-9, 0, -28]} rotation={[0, 0.3, 0]} />
        <Gravestone position={[-9.5, 0, -18]} rotation={[0, -0.2, 0]} />
        <Gravestone position={[-9, 0, 14]} rotation={[0, 0.4, 0]} />
        <Gravestone position={[-10, 0, 38]} rotation={[0, -0.15, 0]} />
        <Pumpkin position={[-9, 0, -32]} scale={1.2} />
        <Pumpkin position={[-9.5, 0, 6]} scale={0.85} />
        <Pumpkin position={[-10, 0, 30]} scale={1.0} />
        <Rock position={[-10, 0, 22]} scale={1.2} />
        <Rock position={[-9.5, 0, -14]} scale={0.7} />
        <SpookyTree position={[-14, 0, -30]} scale={1.2} />
        <SpookyTree position={[-18, 0, 8]} />
        <SpookyTree position={[-13, 0, 36]} scale={0.85} />
        <SpookyTree position={[-20, 0, -10]} scale={1.1} />
        <Scarecrow position={[-22, 0, 18]} />
      </>}

      {/* ── LEFT — variant 1 ──────────────────────────── */}
      {variant === 1 && <>
        <Fence position={[-7.5, 0, -44]} length={4} />
        <Fence position={[-7.5, 0, 12]} length={4} />
        <OldBarn position={[-28, 0, 5]} />
        <Lantern position={[-8, 0, -32]} />
        <Lantern position={[-8, 0, -4]} />
        <Lantern position={[-8, 0, 30]} />
        <Gravestone position={[-9, 0, -15]} />
        <Gravestone position={[-9.5, 0, 18]} rotation={[0, 0.5, 0]} />
        <Gravestone position={[-10, 0, 24]} rotation={[0, -0.3, 0]} />
        <Gravestone position={[-9, 0, 38]} rotation={[0, 0.2, 0]} />
        <Pumpkin position={[-9.5, 0, -26]} scale={1.1} />
        <Pumpkin position={[-10, 0, 10]} scale={0.9} />
        <Pumpkin position={[-9, 0, 34]} scale={0.8} />
        <BrokenWagon position={[-11, 0, 14]} />
        <Rock position={[-9, 0, -28]} />
        <Rock position={[-10.5, 0, -5]} scale={0.8} />
        <SpookyTree position={[-15, 0, -18]} scale={1.4} />
        <SpookyTree position={[-20, 0, 28]} />
        <SpookyTree position={[-13, 0, -40]} scale={1.0} />
        <Scarecrow position={[-14, 0, -2]} />
      </>}

      {/* ── LEFT — variant 2 ──────────────────────────── */}
      {variant === 2 && <>
        <Fence position={[-7.5, 0, 8]} length={6} />
        <Windmill position={[-30, 0, -12]} />
        <Lantern position={[-8, 0, -30]} />
        <Lantern position={[-8, 0, 6]} />
        <Lantern position={[-8, 0, 38]} />
        <Gravestone position={[-9, 0, -22]} />
        <Gravestone position={[-9.5, 0, -8]} rotation={[0, 0.3, 0]} />
        <Gravestone position={[-9, 0, 34]} rotation={[0, -0.2, 0]} />
        <Pumpkin position={[-9.5, 0, -16]} scale={1.3} />
        <Pumpkin position={[-9, 0, 20]} scale={1.0} />
        <Pumpkin position={[-10, 0, 42]} scale={0.8} />
        <Rock position={[-9.5, 0, -12]} scale={1.5} />
        <Rock position={[-10, 0, -6]} scale={0.8} />
        <Rock position={[-9, 0, 28]} scale={1.0} />
        <Scarecrow position={[-13, 0, -7]} />
        <SpookyTree position={[-14, 0, 18]} />
        <SpookyTree position={[-19, 0, -26]} scale={1.1} />
        <SpookyTree position={[-15, 0, 40]} scale={0.9} />
      </>}

      {/* ── RIGHT — variant 0 ─────────────────────────── */}
      {variant === 0 && <>
        <Fence position={[7.5, 0, -35]} length={5} />
        <OldBarn position={[26, 0, 15]} />
        <Lantern position={[9, 0, -20]} />
        <Lantern position={[9, 0, 10]} />
        <Lantern position={[9, 0, 36]} />
        <Gravestone position={[10, 0, -30]} rotation={[0, -0.3, 0]} />
        <Gravestone position={[10.5, 0, -5]} rotation={[0, 0.2, 0]} />
        <Gravestone position={[9.5, 0, 28]} rotation={[0, -0.1, 0]} />
        <Pumpkin position={[9.5, 0, -14]} scale={1.1} />
        <Pumpkin position={[10, 0, 22]} scale={0.9} />
        <Pumpkin position={[9, 0, 40]} scale={0.75} />
        <Rock position={[10, 0, 8]} />
        <Rock position={[9.5, 0, -22]} scale={0.8} />
        <SpookyTree position={[16, 0, 0]} scale={1.1} />
        <SpookyTree position={[20, 0, -28]} />
        <SpookyTree position={[14, 0, 32]} scale={0.9} />
        <Scarecrow position={[18, 0, -12]} />
      </>}

      {/* ── RIGHT — variant 1 ─────────────────────────── */}
      {variant === 1 && <>
        <Fence position={[7.5, 0, 5]} length={4} />
        <Lantern position={[9, 0, -32]} />
        <Lantern position={[9, 0, 0]} />
        <Lantern position={[9, 0, 28]} />
        <Gravestone position={[10, 0, -20]} rotation={[0, 0.3, 0]} />
        <Gravestone position={[10.5, 0, 15]} rotation={[0, -0.4, 0]} />
        <Gravestone position={[9.5, 0, 38]} rotation={[0, 0.2, 0]} />
        <Pumpkin position={[10, 0, -26]} scale={1.2} />
        <Pumpkin position={[9.5, 0, 8]} scale={1.0} />
        <Pumpkin position={[10.5, 0, 34]} scale={0.85} />
        <BrokenWagon position={[12, 0, -12]} />
        <Rock position={[10.5, 0, 22]} scale={1.1} />
        <Rock position={[9.5, 0, -6]} scale={0.75} />
        <SpookyTree position={[15, 0, 10]} />
        <SpookyTree position={[22, 0, -22]} scale={1.3} />
        <SpookyTree position={[16, 0, 36]} scale={0.9} />
        <Scarecrow position={[14, 0, 24]} />
      </>}

      {/* ── RIGHT — variant 2 ─────────────────────────── */}
      {variant === 2 && <>
        <Fence position={[7.5, 0, -22]} length={5} />
        <OldBarn position={[30, 0, -20]} />
        <Lantern position={[9, 0, -36]} />
        <Lantern position={[9, 0, -8]} />
        <Lantern position={[9, 0, 14]} />
        <Gravestone position={[10, 0, -28]} rotation={[0, 0.2, 0]} />
        <Gravestone position={[10.5, 0, 6]} rotation={[0, -0.3, 0]} />
        <Gravestone position={[9.5, 0, 30]} rotation={[0, 0.15, 0]} />
        <Pumpkin position={[10, 0, -18]} scale={1.1} />
        <Pumpkin position={[9.5, 0, 20]} scale={0.9} />
        <Rock position={[10, 0, -14]} scale={1.3} />
        <Rock position={[9.5, 0, 36]} scale={0.85} />
        <SpookyTree position={[17, 0, -12]} scale={0.9} />
        <SpookyTree position={[14, 0, 28]} />
        <SpookyTree position={[21, 0, 2]} scale={1.1} />
        <Scarecrow position={[16, 0, -5]} />
      </>}
    </>
  )
}

// ─── World ────────────────────────────────────────────────────────────────────

export default function World() {
  const status = useGameStore(s => s.status)
  const statusRef = useRef(status)
  useEffect(() => { statusRef.current = status }, [status])

  const chunkRefs = [useRef(), useRef(), useRef()]
  const lowRefs   = useRef(Array.from({ length: POOL }, () => React.createRef()))
  const highRefs  = useRef(Array.from({ length: POOL }, () => React.createRef()))
  const trainRefs = useRef(Array.from({ length: POOL }, () => React.createRef()))
  const coinRefs  = useRef(Array.from({ length: POOL_COINS }, () => React.createRef()))

  const chunkZ       = useRef([0, -CHUNK_SIZE, -CHUNK_SIZE * 2])
  const obs          = useRef({
    low:   Array.from({ length: POOL }, () => ({ active: false, lane: 1, z: -300 })),
    high:  Array.from({ length: POOL }, () => ({ active: false, lane: 1, z: -300 })),
    train: Array.from({ length: POOL }, () => ({ active: false, lane: 1, z: -300 })),
  })
  const coins        = useRef(Array.from({ length: POOL_COINS }, () => ({ active: false, x: 0, baseY: 1.2, z: -300 })))
  const lastSpawn    = useRef(0)
  const distTraveled = useRef(0)
  const lastSpeedInc = useRef(0)
  const hitCooldown  = useRef(0)
  const scoreAccum   = useRef(0)
  const distAccum    = useRef(0)
  const lastFlush    = useRef(0)

  const resetPools = () => {
    chunkZ.current = [0, -CHUNK_SIZE, -CHUNK_SIZE * 2]
    ;['low', 'high', 'train'].forEach(t =>
      obs.current[t].forEach(o => { o.active = false; o.z = -300 })
    )
    coins.current.forEach(c => { c.active = false; c.z = -300 })
    lowRefs.current.forEach(r => { if (r.current) r.current.visible = false })
    highRefs.current.forEach(r => { if (r.current) r.current.visible = false })
    trainRefs.current.forEach(r => { if (r.current) r.current.visible = false })
    coinRefs.current.forEach(r => { if (r.current) r.current.visible = false })
    lastSpawn.current = 0; distTraveled.current = 0; lastSpeedInc.current = 0
    hitCooldown.current = 0; scoreAccum.current = 0; distAccum.current = 0; lastFlush.current = 0
  }

  useEffect(() => { if (status === 'PLAYING') resetPools() }, [status])

  // Spawn one obstacle of given type+lane. Returns true if slot found.
  const spawnObs = (type, lane, zOffset = 0) => {
    const pool = obs.current[type]
    const slot = pool.findIndex(o => !o.active)
    if (slot === -1) return false
    pool[slot].active = true; pool[slot].lane = lane; pool[slot].z = -145 + zOffset
    return true
  }

  // Spawn coins in a lane starting at baseZ
  const spawnCoins = (lane, count = 5) => {
    const cx = LANES[lane]
    let spawned = 0
    for (let i = 0; i < POOL_COINS && spawned < count; i++) {
      const c = coins.current[i]
      if (!c.active) { c.active = true; c.x = cx; c.baseY = 1.2; c.z = -115 - spawned * 3.5; spawned++ }
    }
  }

  useFrame((state, delta) => {
    if (statusRef.current !== 'PLAYING') return

    const dt    = Math.min(delta, 0.05)
    const speed = useGameStore.getState().speed
    const elapsed = state.clock.elapsedTime

    // ── Chunks ────────────────────────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      chunkZ.current[i] += speed * dt
      if (chunkZ.current[i] > CHUNK_SIZE * 0.5) chunkZ.current[i] -= CHUNK_SIZE * 3
      if (chunkRefs[i].current) chunkRefs[i].current.position.z = chunkZ.current[i]
    }

    // ── Score / distance ──────────────────────────────────────────────────────
    const dist = speed * dt
    distTraveled.current += dist
    scoreAccum.current   += dist * 0.5
    distAccum.current    += dist * 0.1
    if (elapsed - lastFlush.current > 0.4) {
      const store = useGameStore.getState()
      store.addScore(scoreAccum.current)
      store.addDistance(distAccum.current)
      scoreAccum.current = 0; distAccum.current = 0; lastFlush.current = elapsed
    }

    // Speed ramp — every 50 units (+2.5 each time, max 90)
    if (distTraveled.current - lastSpeedInc.current > 50) {
      useGameStore.getState().incrementSpeed()
      lastSpeedInc.current = distTraveled.current
    }

    // ── Spawn ─────────────────────────────────────────────────────────────────
    // Interval shrinks aggressively: starts at 2.2s, hits 0.65s at max speed
    const spawnInterval = Math.max(0.65, 2.2 / (speed / 20))
    if (elapsed - lastSpawn.current > spawnInterval) {
      lastSpawn.current = elapsed

      const types = ['low', 'high', 'train']
      const roll  = Math.random()

      if (roll < 0.35 && speed > 30) {
        // ── Double-block wave: 2 lanes blocked, 1 safe ───────────────────────
        // Player MUST be in the correct lane — highly reactive!
        const freeLane  = Math.floor(Math.random() * 3)
        const blocked   = [0, 1, 2].filter(l => l !== freeLane)
        const t1 = types[Math.floor(Math.random() * types.length)]
        const t2 = types[Math.floor(Math.random() * types.length)]
        spawnObs(t1, blocked[0])
        spawnObs(t2, blocked[1])
        // Coins down the free lane as a reward
        spawnCoins(freeLane, 4)
      } else if (roll < 0.55 && speed > 45) {
        // ── Staggered pair: same type, offset Z ──────────────────────────────
        const lane1 = Math.floor(Math.random() * 3)
        const lane2 = (lane1 + 1 + Math.floor(Math.random() * 2)) % 3
        const t = types[Math.floor(Math.random() * types.length)]
        spawnObs(t, lane1)
        spawnObs(t, lane2, 18)  // second one slightly behind
      } else {
        // ── Single obstacle ──────────────────────────────────────────────────
        const lane = Math.floor(Math.random() * 3)
        const type = types[Math.floor(Math.random() * types.length)]
        spawnObs(type, lane)
        // Coins in an adjacent lane
        const coinLane = (lane + 1 + Math.floor(Math.random() * 2)) % 3
        spawnCoins(coinLane, Math.random() < 0.4 ? 3 : 5)
      }
    }

    if (hitCooldown.current > 0) hitCooldown.current -= dt

    // ── Move obstacles + collision ────────────────────────────────────────────
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
            hitCooldown.current = 1.5
            useGameStore.getState().damage()
          }
        }
      }
    }

    processObs(obs.current.low,   lowRefs,   () => playerRef.y < 2.2)
    processObs(obs.current.high,  highRefs,  () => !playerRef.isSliding)
    processObs(obs.current.train, trainRefs, () => true)

    // ── Coins ─────────────────────────────────────────────────────────────────
    for (let i = 0; i < POOL_COINS; i++) {
      const c = coins.current[i]
      if (!c.active) continue
      c.z += speed * dt
      const mesh = coinRefs.current[i].current
      if (!mesh) continue
      if (c.z > 10) { c.active = false; mesh.visible = false; continue }
      mesh.position.set(c.x, c.baseY + Math.sin(elapsed * 4 + c.x) * 0.12, c.z)
      mesh.rotation.y += dt * 4
      mesh.visible = true
      if (Math.abs(c.z) < 1.2 && Math.abs(c.x - playerRef.x) < 1.5) {
        c.active = false; mesh.visible = false
        useGameStore.getState().addCoins(1)
      }
    }
  })

  return (
    <group>
      {/*
        Static near-ground fill — never moves, always covers z=-20 to z+20.
        The camera sits at z=11 so this permanently plugs the 1-2 frame gap
        that appears at the bottom of the screen when a chunk recycles.
        Sits at y=-0.005 so it never z-fights with the scrolling chunks.
      */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[140, 40]} />
        <meshLambertMaterial color="#140c20" />
      </mesh>

      <group ref={chunkRefs[0]}><FloorChunk variant={0} /></group>
      <group ref={chunkRefs[1]}><FloorChunk variant={1} /></group>
      <group ref={chunkRefs[2]}><FloorChunk variant={2} /></group>

      {lowRefs.current.map((r, i)   => <LowBarrierMesh key={`lo${i}`} ref={r} />)}
      {highRefs.current.map((r, i)  => <HighGateMesh   key={`hi${i}`} ref={r} />)}
      {trainRefs.current.map((r, i) => <TrainCarMesh   key={`tr${i}`} ref={r} />)}
      {coinRefs.current.map((r, i)  => <CoinMeshItem   key={`co${i}`} ref={r} />)}
    </group>
  )
}
