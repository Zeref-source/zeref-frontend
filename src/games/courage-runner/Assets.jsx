import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from './useGameStore'

export function SpookyTree({ position }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.4, 4, 6]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      {/* Twisted branches */}
      <mesh position={[0.5, 3, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.05, 0.1, 2, 4]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
      <mesh position={[-0.5, 3.5, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.05, 0.1, 1.5, 4]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
    </group>
  )
}

export function Windmill({ position }) {
  const bladesRef = useRef()
  useFrame((state, delta) => {
    if (bladesRef.current) bladesRef.current.rotation.z += delta * 2
  })

  return (
    <group position={position}>
      {/* Tower */}
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 1, 8, 4]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Blades */}
      <group ref={bladesRef} position={[0, 7.5, 0.6]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[0.3, 3, 0.05]} />
            <meshStandardMaterial color="#222" emissive="#111" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Farmhouse({ position }) {
  return (
    <group position={position}>
      {/* Main Body */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[6, 5, 6]} />
        <meshStandardMaterial color="#3d2b1f" roughness={1} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5.5, 3, 4]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
      {/* Glowing Windows */}
      <mesh position={[0, 3, 3.05]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 3, 4]} intensity={2} color="#ffcc00" distance={10} />
      
      {/* Porch placeholder */}
      <mesh position={[0, 0.5, 3.5]} castShadow>
        <boxGeometry args={[7, 1, 2]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
    </group>
  )
}


export function Fence({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 1.5, 0.2]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      <mesh position={[0, 1, 1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
    </group>
  )
}
