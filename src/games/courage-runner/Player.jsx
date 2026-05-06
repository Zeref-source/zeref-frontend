import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'
import * as THREE from 'three'

const LANE_WIDTH = 4

export default function Player() {
  const mesh = useRef()
  const status = useGameStore(s => s.status)
  const setPlayerX = useGameStore(s => s.setPlayerX)
  
  const [lane, setLane] = useState(0) // -1, 0, 1
  const [jumping, setJumping] = useState(false)
  const jumpStartTime = useRef(0)
  
  const targetX = lane * LANE_WIDTH

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== 'PLAYING') return
      
      if (e.key === 'ArrowLeft' || e.key === 'a') setLane(l => Math.max(l - 1, -1))
      if (e.key === 'ArrowRight' || e.key === 'd') setLane(l => Math.min(l + 1, 1))
      if ((e.key === 'ArrowUp' || e.key === ' ') && !jumping) {
        setJumping(true)
        jumpStartTime.current = performance.now()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, jumping])

  // Mobile Swipe Detection
  useEffect(() => {
    let touchStart = null
    const handleTouchStart = (e) => touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const handleTouchEnd = (e) => {
      if (!touchStart || status !== 'PLAYING') return
      const dx = e.changedTouches[0].clientX - touchStart.x
      const dy = e.changedTouches[0].clientY - touchStart.y
      
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 50) setLane(l => Math.min(l + 1, 1))
        else if (dx < -50) setLane(l => Math.max(l - 1, -1))
      } else {
        if (dy < -50 && !jumping) {
          setJumping(true)
          jumpStartTime.current = performance.now()
        }
      }
      touchStart = null
    }
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [status, jumping])

  useFrame((state, delta) => {
    if (!mesh.current) return
    
    // Smooth lane transition
    mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetX, 0.15)
    setPlayerX(mesh.current.position.x)

    // Jump logic
    if (jumping) {
      const elapsed = (performance.now() - jumpStartTime.current) / 1000
      const duration = 0.6
      if (elapsed < duration) {
        const height = Math.sin((elapsed / duration) * Math.PI) * 3
        mesh.current.position.y = 1 + height
      } else {
        setJumping(false)
        mesh.current.position.y = 1
      }
    } else {
      mesh.current.position.y = 1
    }
    
    // Hover/Bobbing animation
    if (status === 'PLAYING') {
      mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 5) * 0.05
    }
  })

  return (
    <mesh ref={mesh} position={[0, 1, 0]} castShadow>
      {/* For now, a purple box representing Courage */}
      <boxGeometry args={[1.5, 2, 1]} />
      <meshStandardMaterial color="#d4a5ff" />
      
      {/* Ears / Placeholder detail */}
      <mesh position={[0.5, 1, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.2]} />
        <meshStandardMaterial color="#d4a5ff" />
      </mesh>
      <mesh position={[-0.5, 1, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.2]} />
        <meshStandardMaterial color="#d4a5ff" />
      </mesh>
    </mesh>
  )
}
