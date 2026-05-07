import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function SpookyTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.2, 0.4, 4, 5]} />
        <meshLambertMaterial color="#2a1a0a" />
      </mesh>
      <mesh position={[0.5, 3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.1, 2, 4]} />
        <meshLambertMaterial color="#2a1a0a" />
      </mesh>
      <mesh position={[-0.5, 3.5, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <cylinderGeometry args={[0.05, 0.1, 1.5, 4]} />
        <meshLambertMaterial color="#2a1a0a" />
      </mesh>
    </group>
  )
}

export function Windmill({ position }) {
  const bladesRef = useRef()
  useFrame((_, delta) => {
    if (bladesRef.current) bladesRef.current.rotation.z += delta * 1.5
  })
  return (
    <group position={position}>
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.5, 1, 8, 4]} />
        <meshLambertMaterial color="#4a4a4a" />
      </mesh>
      <group ref={bladesRef} position={[0, 7.5, 0.6]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 1.5, 0]}>
            <boxGeometry args={[0.3, 3, 0.05]} />
            <meshLambertMaterial color="#333" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Fence({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.2, 1.5, 0.2]} />
        <meshLambertMaterial color="#3d2b1f" />
      </mesh>
      <mesh position={[0, 1, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshLambertMaterial color="#3d2b1f" />
      </mesh>
    </group>
  )
}
