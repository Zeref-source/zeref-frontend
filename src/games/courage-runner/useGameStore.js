import { create } from 'zustand'

export const useGameStore = create((set) => ({
  status: 'START',
  score: 0,
  highScore: 0,
  coins: 0,
  distance: 0,
  speed: 10,
  health: 3,
  isMuted: false,

  startGame: () => set({ status: 'PLAYING', score: 0, coins: 0, distance: 0, speed: 10, health: 3 }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  endGame: () => set((s) => ({ status: 'GAME_OVER', highScore: Math.max(s.highScore, s.score) })),
  addScore: (pts) => set((s) => ({ score: s.score + pts })),
  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
  addDistance: (d) => set((s) => ({ distance: s.distance + d })),
  incrementSpeed: () => set((s) => ({ speed: Math.min(s.speed + 0.5, 50) })),
  damage: () => set((s) => {
    const next = s.health - 1
    return next <= 0 ? { health: 0, status: 'GAME_OVER' } : { health: next }
  }),
  reset: () => set({ status: 'START', score: 0, coins: 0, distance: 0, speed: 10, health: 3 }),
}))
