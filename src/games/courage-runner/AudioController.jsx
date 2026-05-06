import React, { useEffect, useRef } from 'react'
import { useGameStore } from './useGameStore'

const BGM_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a7345a.mp3'

export default function AudioController() {
  const audioRef = useRef(new Audio(BGM_URL))
  const { status, isMuted } = useGameStore()

  useEffect(() => {
    const audio = audioRef.current
    audio.loop = true
    audio.volume = 0.3

    const playAudio = () => {
      // Browsers require a user interaction to play audio. 
      // The "LETS GO" button click will trigger the store status change to 'PLAYING'.
      if (!isMuted && status === 'PLAYING') {
        audio.play().catch(e => console.warn("Autoplay prevented. Music will start on interaction.", e))
      }
    }

    playAudio()

    return () => {
      // Don't stop on component unmount if we want persistent music, 
      // but here we stop to clean up.
      audio.pause()
    }
  }, [status, isMuted])

  useEffect(() => {
    audioRef.current.muted = isMuted
  }, [isMuted])

  return null // This component doesn't render anything visible
}
