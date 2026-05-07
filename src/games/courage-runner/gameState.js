// Shared mutable state for the 60fps game loop.
// Plain object — no React, no Zustand. Updated by Player, read by World + CameraRig.
export const playerRef = {
  x: 0,
  y: 1.0,
  isSliding: false,
}
