import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import { playerRef } from './gameState'
import * as THREE from 'three'

const LANES = [-4, 0, 4]
const BASE_Y = 1.4
const JUMP_VEL = 13
const GRAVITY = -32
const SLIDE_DURATION = 0.7

const PINK      = '#e87ab0'
const MID_PINK  = '#d060a0'
const DARK_PINK = '#b84080'
const CREAM     = '#f5e8e0'
const DARK      = '#111111'

// Rounded, organic Courage dog — spheres + cylinders, two-joint legs.
function CourageDog() {
  const bodyRef  = useRef()
  const headRef  = useRef()
  const hipRefs  = [useRef(), useRef(), useRef(), useRef()] // FL FR BL BR
  const kneeRefs = [useRef(), useRef(), useRef(), useRef()]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (playerRef.isSliding) return

    const sp = 13
    // Diagonal gait: FL+BR move together, FR+BL move together
    const phases = [0, Math.PI, Math.PI, 0]

    hipRefs.forEach((r, i) => {
      if (!r.current) return
      const s = Math.sin(t * sp + phases[i])
      r.current.rotation.x = s * 0.55
      if (kneeRefs[i].current) {
        // Knee bends on the forward lift (front legs tuck back, hind legs fold forward)
        kneeRefs[i].current.rotation.x = Math.max(0, s) * (i < 2 ? -0.8 : 0.7)
      }
    })

    // Subtle body bounce on each stride
    if (bodyRef.current)
      bodyRef.current.position.y = Math.abs(Math.sin(t * sp * 2)) * 0.05

    // Head tilts slightly with stride
    if (headRef.current)
      headRef.current.rotation.z = Math.sin(t * sp) * 0.04
  })

  return (
    <group>

      {/* ── TORSO ─────────────────────────────────────────── */}
      <group ref={bodyRef}>
        <mesh scale={[1, 1.1, 0.85]}>
          <sphereGeometry args={[0.65, 10, 8]} />
          <meshLambertMaterial color={PINK} />
        </mesh>
        {/* Belly */}
        <mesh position={[0, -0.08, 0.38]} scale={[0.8, 0.65, 0.4]}>
          <sphereGeometry args={[0.52, 8, 6]} />
          <meshLambertMaterial color={CREAM} />
        </mesh>
        {/* Tail */}
        <mesh position={[0, 0.3, -0.55]} rotation={[0.75, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.04, 0.48, 5]} />
          <meshLambertMaterial color={DARK_PINK} />
        </mesh>
      </group>

      {/* ── HEAD ──────────────────────────────────────────── */}
      <group ref={headRef} position={[0, 1.22, 0.12]}>
        {/* Cranium — large cartoon-proportion sphere */}
        <mesh scale={[1, 1.02, 0.96]}>
          <sphereGeometry args={[0.75, 12, 10]} />
          <meshLambertMaterial color={PINK} />
        </mesh>
        {/* Muzzle */}
        <mesh position={[0, -0.12, 0.62]} scale={[1, 0.72, 0.82]}>
          <sphereGeometry args={[0.32, 8, 6]} />
          <meshLambertMaterial color={CREAM} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.06, 0.91]}>
          <sphereGeometry args={[0.1, 7, 6]} />
          <meshLambertMaterial color={DARK} />
        </mesh>
        {/* Eyes — big expressive circles with catchlight */}
        {[[-0.3, 0.2, 0.64], [0.3, 0.2, 0.64]].map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[0.21, 8, 7]} />
              <meshLambertMaterial color="white" />
            </mesh>
            <mesh position={[0, 0, 0.16]}>
              <sphereGeometry args={[0.12, 6, 5]} />
              <meshLambertMaterial color={DARK} />
            </mesh>
            <mesh position={[0.07, 0.07, 0.23]}>
              <sphereGeometry args={[0.045, 4, 4]} />
              <meshLambertMaterial color="white" />
            </mesh>
          </group>
        ))}
        {/* Ears — rounded cylinders with sphere caps */}
        {[{ x: -0.65, tilt:  0.22 }, { x: 0.65, tilt: -0.22 }].map(({ x, tilt }, i) => (
          <group key={i} position={[x, 0.52, 0]} rotation={[0, 0, tilt]}>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.14, 0.21, 0.82, 6]} />
              <meshLambertMaterial color={MID_PINK} />
            </mesh>
            <mesh position={[0, 0.82, 0]}>
              <sphereGeometry args={[0.14, 6, 5]} />
              <meshLambertMaterial color={MID_PINK} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── LEGS (FL, FR, BL, BR) ─────────────────────────── */}
      {[
        { pos: [-0.34, -0.52,  0.30], hi: hipRefs[0], kr: kneeRefs[0] },
        { pos: [ 0.34, -0.52,  0.30], hi: hipRefs[1], kr: kneeRefs[1] },
        { pos: [-0.30, -0.52, -0.30], hi: hipRefs[2], kr: kneeRefs[2] },
        { pos: [ 0.30, -0.52, -0.30], hi: hipRefs[3], kr: kneeRefs[3] },
      ].map(({ pos, hi, kr }, i) => (
        <group key={i} position={pos} ref={hi}>
          {/* Upper leg — pivots at hip */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.13, 0.10, 0.44, 6]} />
            <meshLambertMaterial color={PINK} />
          </mesh>
          {/* Knee joint group — pivots at base of upper leg */}
          <group position={[0, -0.44, 0]} ref={kr}>
            <mesh position={[0, -0.19, 0]}>
              <cylinderGeometry args={[0.09, 0.07, 0.38, 6]} />
              <meshLambertMaterial color={MID_PINK} />
            </mesh>
            {/* Paw — slightly elongated forward */}
            <mesh position={[0, -0.40, 0.04]} scale={[1.2, 0.55, 1.5]}>
              <sphereGeometry args={[0.11, 8, 5]} />
              <meshLambertMaterial color={DARK_PINK} />
            </mesh>
          </group>
        </group>
      ))}

    </group>
  )
}

export default function Player() {
  const groupRef = useRef()
  const status = useGameStore(s => s.status)
  const health = useGameStore(s => s.health)

  const laneRef       = useRef(1)
  const jumpVelRef    = useRef(0)
  const isJumpingRef  = useRef(false)
  const slideTimerRef = useRef(0)
  const isSlidingRef  = useRef(false)
  const invincibleRef = useRef(0)

  useEffect(() => {
    const onKey = (e) => {
      if (status !== 'PLAYING') return
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') laneRef.current = Math.max(0, laneRef.current - 1)
      if (e.code === 'ArrowRight' || e.code === 'KeyD') laneRef.current = Math.min(2, laneRef.current + 1)
      if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !isJumpingRef.current) {
        isSlidingRef.current = false; slideTimerRef.current = 0
        isJumpingRef.current = true;  jumpVelRef.current = JUMP_VEL
      }
      if ((e.code === 'ArrowDown' || e.code === 'KeyS') && !isJumpingRef.current && !isSlidingRef.current) {
        isSlidingRef.current = true; slideTimerRef.current = SLIDE_DURATION
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status])

  useEffect(() => {
    let sx = 0, sy = 0
    const onStart = (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY }
    const onEnd = (e) => {
      if (status !== 'PLAYING') return
      const dx = e.changedTouches[0].clientX - sx
      const dy = e.changedTouches[0].clientY - sy
      const T = 40
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx >  T) laneRef.current = Math.min(2, laneRef.current + 1)
        if (dx < -T) laneRef.current = Math.max(0, laneRef.current - 1)
      } else {
        if (dy < -T && !isJumpingRef.current) {
          isSlidingRef.current = false; slideTimerRef.current = 0
          isJumpingRef.current = true;  jumpVelRef.current = JUMP_VEL
        }
        if (dy > T && !isJumpingRef.current && !isSlidingRef.current) {
          isSlidingRef.current = true; slideTimerRef.current = SLIDE_DURATION
        }
      }
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd) }
  }, [status])

  useEffect(() => {
    if (status !== 'START') return
    laneRef.current = 1; isJumpingRef.current = false; jumpVelRef.current = 0
    isSlidingRef.current = false; slideTimerRef.current = 0; invincibleRef.current = 0
    if (groupRef.current) { groupRef.current.position.set(LANES[1], BASE_Y, 0); groupRef.current.scale.setScalar(1) }
    playerRef.x = LANES[1]; playerRef.y = BASE_Y; playerRef.isSliding = false
  }, [status])

  useEffect(() => { invincibleRef.current = 2.0 }, [health])

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    const dt = Math.min(delta, 0.05)

    g.position.x = THREE.MathUtils.lerp(g.position.x, LANES[laneRef.current], 0.24)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, (LANES[laneRef.current] - g.position.x) * -0.06, 0.15)

    if (isJumpingRef.current) {
      jumpVelRef.current += GRAVITY * dt
      g.position.y += jumpVelRef.current * dt
      if (g.position.y <= BASE_Y) { g.position.y = BASE_Y; isJumpingRef.current = false; jumpVelRef.current = 0 }
    }

    if (isSlidingRef.current) {
      slideTimerRef.current -= dt
      g.scale.set(1, 0.45, 1)
      g.position.y = 0.6
      if (slideTimerRef.current <= 0) { isSlidingRef.current = false; g.scale.setScalar(1); g.position.y = BASE_Y }
    } else if (!isJumpingRef.current) {
      g.scale.set(1, 1, 1)
      g.position.y = THREE.MathUtils.lerp(g.position.y, BASE_Y, 0.2)
    }

    invincibleRef.current = Math.max(0, invincibleRef.current - dt)
    g.visible = invincibleRef.current > 0 ? Math.floor(state.clock.elapsedTime * 10) % 2 === 0 : true

    playerRef.x = g.position.x
    playerRef.y = g.position.y
    playerRef.isSliding = isSlidingRef.current
  })

  return (
    <group ref={groupRef} position={[LANES[1], BASE_Y, 0]}>
      <CourageDog />
    </group>
  )
}
