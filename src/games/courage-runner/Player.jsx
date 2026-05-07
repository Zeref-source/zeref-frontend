import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import * as THREE from 'three'

const LANES = [-4, 0, 4]
const BASE_Y = 1.0
const JUMP_VEL = 12
const GRAVITY = -28
const SLIDE_DURATION = 0.8
const INVINCIBLE_DURATION = 2.0

const PINK = '#e87ab0'
const DARK_PINK = '#c0507a'
const BLACK = '#111111'

function CourageDog({ isSliding }) {
  const legRefs = [useRef(), useRef(), useRef(), useRef()]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!isSliding) {
      legRefs[0].current && (legRefs[0].current.rotation.x = Math.sin(t * 12) * 0.7)
      legRefs[1].current && (legRefs[1].current.rotation.x = Math.sin(t * 12 + Math.PI) * 0.7)
      legRefs[2].current && (legRefs[2].current.rotation.x = Math.sin(t * 12 + Math.PI) * 0.7)
      legRefs[3].current && (legRefs[3].current.rotation.x = Math.sin(t * 12) * 0.7)
    } else {
      legRefs.forEach(r => { if (r.current) r.current.rotation.x = 0 })
    }
  })

  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 1.4, 0.9]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.35, 0.1]} castShadow>
        <boxGeometry args={[1.45, 1.35, 1.1]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.55, 2.3, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.9, 0.2]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.55, 2.3, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.9, 0.2]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.35, 1.4, 0.61]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.35, 1.4, 0.61]}>
        <sphereGeometry args={[0.10, 8, 8]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      <mesh position={[0.35, 1.4, 0.61]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.35, 1.4, 0.61]}>
        <sphereGeometry args={[0.10, 8, 8]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 1.1, 0.61]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>

      {/* Front legs */}
      <group ref={legRefs[0]} position={[-0.35, -0.65, 0.35]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.14, 0.65, 6]} />
          <meshStandardMaterial color={DARK_PINK} roughness={0.8} />
        </mesh>
      </group>
      <group ref={legRefs[1]} position={[0.35, -0.65, 0.35]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.14, 0.65, 6]} />
          <meshStandardMaterial color={DARK_PINK} roughness={0.8} />
        </mesh>
      </group>

      {/* Back legs */}
      <group ref={legRefs[2]} position={[-0.35, -0.65, -0.35]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.14, 0.65, 6]} />
          <meshStandardMaterial color={DARK_PINK} roughness={0.8} />
        </mesh>
      </group>
      <group ref={legRefs[3]} position={[0.35, -0.65, -0.35]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.14, 0.65, 6]} />
          <meshStandardMaterial color={DARK_PINK} roughness={0.8} />
        </mesh>
      </group>

      {/* Tail */}
      <mesh position={[0, 0.2, -0.55]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.04, 0.8, 5]} />
        <meshStandardMaterial color={PINK} roughness={0.7} />
      </mesh>

      {/* Glow */}
      <pointLight position={[0, 1, 0]} intensity={1.5} distance={6} color="#ff88cc" />
    </group>
  )
}

export default function Player() {
  const groupRef = useRef()

  const status = useGameStore(s => s.status)
  const setPlayerX = useGameStore(s => s.setPlayerX)
  const setPlayerY = useGameStore(s => s.setPlayerY)
  const setSliding = useGameStore(s => s.setSliding)

  const laneRef = useRef(1) // 0=left, 1=center, 2=right
  const jumpVelRef = useRef(0)
  const isJumpingRef = useRef(false)
  const isLandedRef = useRef(true)
  const slideTimerRef = useRef(0)
  const isSlidingRef = useRef(false)
  const invincibleRef = useRef(0)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== 'PLAYING') return

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        laneRef.current = Math.max(0, laneRef.current - 1)
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        laneRef.current = Math.min(2, laneRef.current + 1)
      }
      if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !isJumpingRef.current) {
        if (isSlidingRef.current) {
          isSlidingRef.current = false
          slideTimerRef.current = 0
          setSliding(false)
        }
        isJumpingRef.current = true
        isLandedRef.current = false
        jumpVelRef.current = JUMP_VEL
      }
      if ((e.code === 'ArrowDown' || e.code === 'KeyS') && !isJumpingRef.current && !isSlidingRef.current) {
        isSlidingRef.current = true
        slideTimerRef.current = SLIDE_DURATION
        setSliding(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, setSliding])

  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0

    const onTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }
    const onTouchEnd = (e) => {
      if (status !== 'PLAYING') return
      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = e.changedTouches[0].clientY - touchStartY
      const threshold = 40

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > threshold) laneRef.current = Math.min(2, laneRef.current + 1)
        else if (dx < -threshold) laneRef.current = Math.max(0, laneRef.current - 1)
      } else {
        if (dy < -threshold && !isJumpingRef.current) {
          if (isSlidingRef.current) { isSlidingRef.current = false; slideTimerRef.current = 0; setSliding(false) }
          isJumpingRef.current = true; isLandedRef.current = false; jumpVelRef.current = JUMP_VEL
        } else if (dy > threshold && !isJumpingRef.current && !isSlidingRef.current) {
          isSlidingRef.current = true; slideTimerRef.current = SLIDE_DURATION; setSliding(true)
        }
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [status, setSliding])

  // Reset on game start
  useEffect(() => {
    if (status === 'START') {
      laneRef.current = 1
      isJumpingRef.current = false
      isLandedRef.current = true
      jumpVelRef.current = 0
      isSlidingRef.current = false
      slideTimerRef.current = 0
      invincibleRef.current = 0
      if (groupRef.current) {
        groupRef.current.position.set(LANES[1], BASE_Y, 0)
        groupRef.current.scale.setScalar(1)
      }
    }
  }, [status])

  // Expose damage trigger from store — watch health changes
  const health = useGameStore(s => s.health)
  useEffect(() => {
    invincibleRef.current = INVINCIBLE_DURATION
  }, [health])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const g = groupRef.current

    // --- Lane X movement ---
    const targetX = LANES[laneRef.current]
    g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, 0.18)

    // --- Jump physics ---
    if (isJumpingRef.current) {
      jumpVelRef.current += GRAVITY * delta
      g.position.y += jumpVelRef.current * delta
      if (g.position.y <= BASE_Y) {
        g.position.y = BASE_Y
        isJumpingRef.current = false
        isLandedRef.current = true
        jumpVelRef.current = 0
      }
    }

    // --- Slide ---
    if (isSlidingRef.current) {
      slideTimerRef.current -= delta
      g.scale.set(1, 0.45, 1)
      g.position.y = 0.5
      if (slideTimerRef.current <= 0) {
        isSlidingRef.current = false
        setSliding(false)
        g.scale.setScalar(1)
        g.position.y = BASE_Y
      }
    } else if (!isJumpingRef.current) {
      g.scale.set(1, 1, 1)
      g.position.y = THREE.MathUtils.lerp(g.position.y, BASE_Y, 0.2)
    }

    // --- Invincibility blink ---
    invincibleRef.current = Math.max(0, invincibleRef.current - delta)
    if (invincibleRef.current > 0) {
      g.visible = Math.floor(state.clock.elapsedTime * 10) % 2 === 0
    } else {
      g.visible = true
    }

    // --- Lean on lane switch ---
    const leanTarget = (LANES[laneRef.current] - g.position.x) * -0.08
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, leanTarget, 0.15)

    setPlayerX(g.position.x)
    setPlayerY(g.position.y)
  })

  return (
    <group ref={groupRef} position={[LANES[1], BASE_Y, 0]}>
      <CourageDog isSliding={false} />
    </group>
  )
}
