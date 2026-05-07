import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import { playerRef } from './gameState'
import * as THREE from 'three'

const LANES = [-4, 0, 4]
const BASE_Y = 1.0
const JUMP_VEL = 12
const GRAVITY = -28
const SLIDE_DURATION = 0.8
const PINK = '#e87ab0'
const DARK_PINK = '#c0507a'

function CourageDog() {
  const legRefs = [useRef(), useRef(), useRef(), useRef()]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!playerRef.isSliding) {
      if (legRefs[0].current) legRefs[0].current.rotation.x = Math.sin(t * 12) * 0.7
      if (legRefs[1].current) legRefs[1].current.rotation.x = Math.sin(t * 12 + Math.PI) * 0.7
      if (legRefs[2].current) legRefs[2].current.rotation.x = Math.sin(t * 12 + Math.PI) * 0.7
      if (legRefs[3].current) legRefs[3].current.rotation.x = Math.sin(t * 12) * 0.7
    }
  })

  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 1.4, 0.9]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.35, 0.1]} castShadow>
        <boxGeometry args={[1.45, 1.35, 1.1]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>
      <mesh position={[-0.55, 2.3, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.9, 0.2]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>
      <mesh position={[0.55, 2.3, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.9, 0.2]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>
      <mesh position={[-0.35, 1.4, 0.61]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.35, 1.4, 0.63]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.35, 1.4, 0.61]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.35, 1.4, 0.63]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 1.1, 0.61]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <group ref={legRefs[0]} position={[-0.35, -0.65, 0.35]}>
        <mesh><cylinderGeometry args={[0.17, 0.13, 0.65, 6]} /><meshStandardMaterial color={DARK_PINK} /></mesh>
      </group>
      <group ref={legRefs[1]} position={[0.35, -0.65, 0.35]}>
        <mesh><cylinderGeometry args={[0.17, 0.13, 0.65, 6]} /><meshStandardMaterial color={DARK_PINK} /></mesh>
      </group>
      <group ref={legRefs[2]} position={[-0.35, -0.65, -0.35]}>
        <mesh><cylinderGeometry args={[0.17, 0.13, 0.65, 6]} /><meshStandardMaterial color={DARK_PINK} /></mesh>
      </group>
      <group ref={legRefs[3]} position={[0.35, -0.65, -0.35]}>
        <mesh><cylinderGeometry args={[0.17, 0.13, 0.65, 6]} /><meshStandardMaterial color={DARK_PINK} /></mesh>
      </group>
      <pointLight position={[0, 1, 0]} intensity={1.5} distance={6} color="#ff88cc" />
    </group>
  )
}

export default function Player() {
  const groupRef = useRef()
  const status = useGameStore(s => s.status)
  const health = useGameStore(s => s.health)

  const laneRef = useRef(1)
  const jumpVelRef = useRef(0)
  const isJumpingRef = useRef(false)
  const slideTimerRef = useRef(0)
  const isSlidingRef = useRef(false)
  const invincibleRef = useRef(0)

  // Input — keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (status !== 'PLAYING') return
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') laneRef.current = Math.max(0, laneRef.current - 1)
      if (e.code === 'ArrowRight' || e.code === 'KeyD') laneRef.current = Math.min(2, laneRef.current + 1)
      if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !isJumpingRef.current) {
        isSlidingRef.current = false; slideTimerRef.current = 0
        isJumpingRef.current = true; jumpVelRef.current = JUMP_VEL
      }
      if ((e.code === 'ArrowDown' || e.code === 'KeyS') && !isJumpingRef.current && !isSlidingRef.current) {
        isSlidingRef.current = true; slideTimerRef.current = SLIDE_DURATION
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status])

  // Input — touch
  useEffect(() => {
    let sx = 0, sy = 0
    const onStart = (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY }
    const onEnd = (e) => {
      if (status !== 'PLAYING') return
      const dx = e.changedTouches[0].clientX - sx
      const dy = e.changedTouches[0].clientY - sy
      const t = 40
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > t) laneRef.current = Math.min(2, laneRef.current + 1)
        else if (dx < -t) laneRef.current = Math.max(0, laneRef.current - 1)
      } else {
        if (dy < -t && !isJumpingRef.current) {
          isSlidingRef.current = false; slideTimerRef.current = 0
          isJumpingRef.current = true; jumpVelRef.current = JUMP_VEL
        } else if (dy > t && !isJumpingRef.current && !isSlidingRef.current) {
          isSlidingRef.current = true; slideTimerRef.current = SLIDE_DURATION
        }
      }
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd) }
  }, [status])

  // Reset on new game
  useEffect(() => {
    if (status === 'START') {
      laneRef.current = 1; isJumpingRef.current = false; jumpVelRef.current = 0
      isSlidingRef.current = false; slideTimerRef.current = 0; invincibleRef.current = 0
      if (groupRef.current) { groupRef.current.position.set(LANES[1], BASE_Y, 0); groupRef.current.scale.setScalar(1) }
      playerRef.x = LANES[1]; playerRef.y = BASE_Y; playerRef.isSliding = false
    }
  }, [status])

  // Trigger invincibility on health loss
  useEffect(() => { invincibleRef.current = 2.0 }, [health])

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    const dt = Math.min(delta, 0.05)

    // Lane
    g.position.x = THREE.MathUtils.lerp(g.position.x, LANES[laneRef.current], 0.18)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, (LANES[laneRef.current] - g.position.x) * -0.06, 0.15)

    // Jump
    if (isJumpingRef.current) {
      jumpVelRef.current += GRAVITY * dt
      g.position.y += jumpVelRef.current * dt
      if (g.position.y <= BASE_Y) { g.position.y = BASE_Y; isJumpingRef.current = false; jumpVelRef.current = 0 }
    }

    // Slide
    if (isSlidingRef.current) {
      slideTimerRef.current -= dt
      g.scale.set(1, 0.45, 1)
      g.position.y = 0.5
      if (slideTimerRef.current <= 0) {
        isSlidingRef.current = false
        g.scale.setScalar(1)
        g.position.y = BASE_Y
      }
    } else if (!isJumpingRef.current) {
      g.scale.set(1, 1, 1)
      g.position.y = THREE.MathUtils.lerp(g.position.y, BASE_Y, 0.2)
    }

    // Invincibility blink
    invincibleRef.current = Math.max(0, invincibleRef.current - dt)
    g.visible = invincibleRef.current > 0 ? Math.floor(state.clock.elapsedTime * 10) % 2 === 0 : true

    // Write to shared ref — NO Zustand calls here
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
