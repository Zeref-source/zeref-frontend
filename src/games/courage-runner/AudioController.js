import React, { useEffect, useRef, useState } from 'react'
import { useGameStore } from './useGameStore'

const BGM_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a7345a.mp3'

export default function AudioController() {
  const audioRef = useRef(new Audio(BGM_URL))
  const { status } = useGameStore()
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    audio.loop = true
    audio.volume = 0.4

    const playAudio = () => {
      if (!isMuted && status === 'PLAYING') {
        audio.play().catch(e => console.log("Autoplay prevented", e))
      } else if (status === 'GAME_OVER' || status === 'START') {
        // Optionally lower volume or stop
        audio.volume = 0.2
      }
    }

    playAudio()

    return () => {
      audio.pause()
    }
  }, [status, isMuted])

  // Sync mute state to the store if we want to control it from UI
  useEffect(() => {
    audioRef.current.muted = isMuted
  }, [isMuted])

  // Exposed for UI
  return { isMuted, setIsMuted }
}
