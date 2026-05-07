import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import { playerRef } from './gameState'
import * as THREE from 'three'

const LANES = [-4, 0, 4]
const BASE_Y = 1.0
const JUMP_VEL = 13
const GRAVITY = -32
const SLIDE_DURATION = 0.7
const PINK = '#e87ab0'
const DARK_PINK = '#c05880'

// All meshLambertMaterial — no PBR, no roughness/metalness calculations.
// No castShadow — no shadow render pass needed.
function CourageDog() {
  const legRefs = [useRef(), useRef(), useRef(), useRef()]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (playerRef.isSliding) return
    const swing = Math.sin(t * 12) * 0.7
    if (legRefs[0].current) legRefs[0].current.rotation.x =  swing
    if (legRefs[1].current) legRefs[1].current.rotation.x = -swing
    if (legRefs[2].current) legRefs[2].current.rotation.x = -swing
    if (legRefs[3].current) legRefs[3].current.rotation.x =  swing
  })

  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.4, 0.9]} />
        <meshLambertMaterial color={PINK} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.35, 0.1]}>
        <boxGeometry args={[1.45, 1.35, 1.1]} />
        <meshLambertMaterial color={PINK} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.55, 2.3, 0.1]}>
        <boxGeometry args={[0.3, 0.9, 0.2]} />
        <meshLambertMaterial color={PINK} />
      </mesh>
      <mesh position={[0.55, 2.3, 0.1]}>
        <boxGeometry args={[0.3, 0.9, 0.2]} />
        <meshLambertMaterial color={PINK} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.35, 1.4, 0.61]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshLambertMaterial color="white" />
      </mesh>
      <mesh position={[-0.35, 1.4, 0.63]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshLambertMaterial color="#111" />
      </mesh>
      <mesh position={[0.35, 1.4, 0.61]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshLambertMaterial color="white" />
      </mesh>
      <mesh position={[0.35, 1.4, 0.63]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshLambertMaterial color="#111" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.1, 0.61]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshLambertMaterial color="#111" />
      </mesh>
      {/* Legs */}
      {[
        { ref: legRefs[0], pos: [-0.35, -0.65,  0.35] },
        { ref: legRefs[1], pos: [ 0.35, -0.65,  0.35] },
        { ref: legRefs[2], pos: [-0.35, -0.65, -0.35] },
        { ref: legRefs[3], pos: [ 0.35, -0.65, -0.35] },
      ].map(({ ref, pos }, i) => (
        <group key={i} ref={ref} position={pos}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.12, 0.65, 6]} />
            <meshLambertMaterial color={DARK_PINK} />
          </mesh>
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
      g.position.y = 0.5
      if (slideTimerRef.current <= 0) { isSlidingRef.current = false; g.scale.setScalar(1); g.position.y = BASE_Y }
    } else if (!isJumpingRef.current) {
      g.scale.set(1, 1, 1)
      g.position.y = THREE.MathUtils.lerp(g.position.y, BASE_Y, 0.2)
    }

    invincibleRef.current = Math.max(0, invincibleRef.current - dt)
    g.visible = invincibleRef.current > 0 ? Math.floor(state.clock.elapsedTime * 10) % 2 === 0 : true

    // Write to shared ref — zero Zustand calls
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
