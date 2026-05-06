import { create } from 'zustand'

export const useGameStore = create((set) => ({
  status: 'START', // START, PLAYING, GAME_OVER
  score: 0,
  highScore: 0,
  speed: 10,
  health: 3,
  playerX: 0,
  isMuted: false,
  
  startGame: () => set({ status: 'PLAYING', score: 0, speed: 10, health: 3, playerX: 0 }),
  setPlayerX: (x) => set({ playerX: x }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  endGame: () => set((state) => ({ 
    status: 'GAME_OVER', 
    highScore: Math.max(state.highScore, state.score) 
  })),
  addScore: (pts) => set((state) => ({ score: state.score + pts })),
  incrementSpeed: () => set((state) => ({ speed: Math.min(state.speed + 0.05, 50) })),
  damage: () => set((state) => {
    const nextHealth = state.health - 1
    if (nextHealth <= 0) return { health: 0, status: 'GAME_OVER' }
    return { health: nextHealth }
  }),
  reset: () => set({ status: 'START', score: 0, speed: 10, health: 3, playerX: 0 }),
}))


