"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import styles from "./audio-meter.module.css"

interface AudioLevelMeterProps {
  audioDeviceId: string
}

export function AudioLevelMeter({ audioDeviceId }: AudioLevelMeterProps) {
  const [audioLevel, setAudioLevel] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const audioContext = React.useRef<AudioContext | null>(null)
  const analyser = React.useRef<AnalyserNode | null>(null)
  const dataArray = React.useRef<Uint8Array | null>(null)
  const animationFrame = React.useRef<number>()

  React.useEffect(() => {
    const initAudio = async () => {
      try {
        // First, check if we have microphone permission
        const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })
        if (permissionStatus.state === "denied") {
          throw new Error("Microphone permission denied. Please grant access in your browser settings.")
        }

        // If permission is granted or prompt, try to access the microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        })

        audioContext.current = new AudioContext()
        analyser.current = audioContext.current.createAnalyser()
        const source = audioContext.current.createMediaStreamSource(stream)
        source.connect(analyser.current)
        analyser.current.fftSize = 256
        const bufferLength = analyser.current.frequencyBinCount
        dataArray.current = new Uint8Array(bufferLength)

        const updateLevel = () => {
          if (!analyser.current || !dataArray.current) return
          analyser.current.getByteFrequencyData(dataArray.current)
          const average = dataArray.current.reduce((a, b) => a + b) / dataArray.current.length
          setAudioLevel(Math.min(100, (average / 128) * 100))
          animationFrame.current = requestAnimationFrame(updateLevel)
        }
        updateLevel()
        setError(null)
      } catch (err) {
        console.error("Error accessing microphone:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred while accessing the microphone")
      }
    }

    initAudio()

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [audioDeviceId])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Progress value={audioLevel} className={styles.progress}>
      <div
        className={`${styles.audioLevelBar} ${
          audioLevel > 75
            ? styles.audioLevelBarRed
            : audioLevel > 50
            ? styles.audioLevelBarYellow
            : styles.audioLevelBarGreen
        }`}
        style={{ [`--${styles.audioLevelBar}-audio-level`]: `${audioLevel}%` }}
      />
    </Progress>
  )
}
