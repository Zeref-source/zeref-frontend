import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function SpookyTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.18, 0.42, 4.5, 5]} />
        <meshLambertMaterial color="#1e1208" />
      </mesh>
      <mesh position={[0.6, 3.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.04, 0.12, 2.2, 4]} />
        <meshLambertMaterial color="#1e1208" />
      </mesh>
      <mesh position={[-0.55, 3.8, 0]} rotation={[0, 0, -Math.PI / 3.5]}>
        <cylinderGeometry args={[0.04, 0.1, 1.8, 4]} />
        <meshLambertMaterial color="#1e1208" />
      </mesh>
      <mesh position={[0.2, 4.5, 0.3]} rotation={[0.3, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.07, 1.2, 4]} />
        <meshLambertMaterial color="#1e1208" />
      </mesh>
    </group>
  )
}

export function Gravestone({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 1.1, 0.18]} />
        <meshLambertMaterial color="#3a3a4a" />
      </mesh>
      {/* Rounded arch top */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.18, 8, 1, false, 0, Math.PI]} />
        <meshLambertMaterial color="#3a3a4a" />
      </mesh>
      {/* Cross etching */}
      <mesh position={[0, 0.7, 0.1]}>
        <boxGeometry args={[0.08, 0.55, 0.04]} />
        <meshLambertMaterial color="#2a2a38" />
      </mesh>
      <mesh position={[0, 0.82, 0.1]}>
        <boxGeometry args={[0.32, 0.08, 0.04]} />
        <meshLambertMaterial color="#2a2a38" />
      </mesh>
    </group>
  )
}

export function Lantern({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 2.2, 4]} />
        <meshLambertMaterial color="#2a1a0a" />
      </mesh>
      {/* Hook arm */}
      <mesh position={[0.18, 2.05, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 4]} />
        <meshLambertMaterial color="#2a1a0a" />
      </mesh>
      {/* Lantern box */}
      <mesh position={[0.28, 2.25, 0]}>
        <boxGeometry args={[0.28, 0.36, 0.28]} />
        <meshLambertMaterial color="#ffcc44" emissive="#ff7700" />
      </mesh>
    </group>
  )
}

export function Scarecrow({ position }) {
  return (
    <group position={position}>
      {/* Main post */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 3.2, 4]} />
        <meshLambertMaterial color="#4a3010" />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 2.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 4]} />
        <meshLambertMaterial color="#4a3010" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[0.32, 6, 6]} />
        <meshLambertMaterial color="#c8a832" />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 3.95, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.5, 6]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Shirt puff left */}
      <mesh position={[-0.55, 2.55, 0]} rotation={[0, 0, Math.PI / 5]}>
        <boxGeometry args={[0.5, 0.28, 0.3]} />
        <meshLambertMaterial color="#8b3a1a" />
      </mesh>
      {/* Shirt puff right */}
      <mesh position={[0.55, 2.55, 0]} rotation={[0, 0, -Math.PI / 5]}>
        <boxGeometry args={[0.5, 0.28, 0.3]} />
        <meshLambertMaterial color="#8b3a1a" />
      </mesh>
    </group>
  )
}

export function OldBarn({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[6, 5, 5]} />
        <meshLambertMaterial color="#5a2218" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 5.4, 0]}>
        <coneGeometry args={[4.5, 2.5, 4]} />
        <meshLambertMaterial color="#2a1208" />
      </mesh>
      {/* Dark door */}
      <mesh position={[0, 1.2, 2.52]}>
        <boxGeometry args={[1.4, 2.4, 0.04]} />
        <meshLambertMaterial color="#1a0808" />
      </mesh>
      {/* Window with glow */}
      <mesh position={[-1.6, 3, 2.52]}>
        <boxGeometry args={[0.8, 0.8, 0.04]} />
        <meshLambertMaterial color="#ffdd55" emissive="#cc8800" />
      </mesh>
    </group>
  )
}

export function Rock({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale * 0.7, scale]}>
      <mesh rotation={[0, Math.random() * Math.PI, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshLambertMaterial color="#3a3840" />
      </mesh>
    </group>
  )
}

export function BrokenWagon({ position }) {
  return (
    <group position={position}>
      {/* Wheel 1 */}
      <mesh position={[-0.5, 0.6, 0]} rotation={[Math.PI / 2, 0, 0.4]}>
        <torusGeometry args={[0.6, 0.08, 6, 10]} />
        <meshLambertMaterial color="#4a2a08" />
      </mesh>
      {/* Wheel 2 (fallen) */}
      <mesh position={[0.8, 0.08, 0.3]} rotation={[0, 0.5, 0]}>
        <torusGeometry args={[0.55, 0.08, 6, 10]} />
        <meshLambertMaterial color="#4a2a08" />
      </mesh>
      {/* Axle */}
      <mesh position={[0.15, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 1.5, 5]} />
        <meshLambertMaterial color="#3a1a04" />
      </mesh>
    </group>
  )
}

export function Windmill({ position }) {
  const bladesRef = useRef()
  useFrame((_, delta) => {
    if (bladesRef.current) bladesRef.current.rotation.z += delta * 1.8
  })
  return (
    <group position={position}>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.45, 1.1, 10, 5]} />
        <meshLambertMaterial color="#4a4040" />
      </mesh>
      <group ref={bladesRef} position={[0, 9, 0.7]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 1.8, 0]}>
            <boxGeometry args={[0.28, 3.5, 0.06]} />
            <meshLambertMaterial color="#2a2020" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Pumpkin({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.45, 8, 6]} />
        <meshLambertMaterial color="#e05500" />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.28, 4]} />
        <meshLambertMaterial color="#1a4a08" />
      </mesh>
      <mesh position={[-0.16, 0.42, 0.38]}>
        <boxGeometry args={[0.14, 0.1, 0.02]} />
        <meshLambertMaterial color="#ff9900" emissive="#ff5500" />
      </mesh>
      <mesh position={[0.16, 0.42, 0.38]}>
        <boxGeometry args={[0.14, 0.1, 0.02]} />
        <meshLambertMaterial color="#ff9900" emissive="#ff5500" />
      </mesh>
    </group>
  )
}

export function Fence({ position, length = 1 }) {
  return (
    <group position={position}>
      {Array.from({ length }).map((_, i) => (
        <group key={i} position={[0, 0, i * 2]}>
          <mesh position={[-1, 0.55, 0]}>
            <boxGeometry args={[0.18, 1.3, 0.18]} />
            <meshLambertMaterial color="#3a2510" />
          </mesh>
          <mesh position={[1, 0.55, 0]}>
            <boxGeometry args={[0.18, 1.3, 0.18]} />
            <meshLambertMaterial color="#3a2510" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[2.2, 0.12, 0.1]} />
            <meshLambertMaterial color="#3a2510" />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.2, 0.12, 0.1]} />
            <meshLambertMaterial color="#3a2510" />
          </mesh>
        </group>
      ))}
    </group>
  )
}
