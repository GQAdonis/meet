import { useCallback, useEffect, useState } from 'react'
import { Room, RoomEvent, ConnectionState, ConnectionQuality, Track, RemoteParticipant, SubscriptionError } from 'livekit-client'
import { toast } from 'sonner'

export interface RoomStats {
  connectionQuality: ConnectionQuality
  networkLatency: number
  packetsLost: number
  jitter: number
  serverRegion?: string
  activeSpeakers: number
  publishedTracks: number
  subscribedTracks: number
  cpuUsage?: number
  memoryUsage?: number
}

export function useRoomMonitoring(room: Room | null) {
  const [stats, setStats] = useState<RoomStats>({
    connectionQuality: ConnectionQuality.Unknown,
    networkLatency: 0,
    packetsLost: 0,
    jitter: 0,
    serverRegion: undefined,
    activeSpeakers: room?.activeSpeakers.length ?? 0,
    publishedTracks: room?.localParticipant?.trackPublications.size ?? 0,
    subscribedTracks: room ? Array.from(room.remoteParticipants.values())
        .reduce((sum, p) => sum + p.trackPublications.size, 0) : 0,
  })

  const handleError = useCallback((message: string) => {
    console.error('Room error:', message)
    let userMessage = 'An error occurred in the meeting.'
    let action = 'Please try refreshing the page.'

    // Categorize errors and provide specific guidance
    if (message.includes('ICE')) {
      userMessage = 'Connection issue detected.'
      action = 'Please check your internet connection and try again.'
    } else if (message.includes('getUserMedia')) {
      userMessage = 'Cannot access camera or microphone.'
      action = 'Please check your device permissions and ensure no other app is using your camera/mic.'
    } else if (message.includes('disconnect')) {
      userMessage = 'You were disconnected from the meeting.'
      action = 'Attempting to reconnect automatically...'
    }

    toast.error(userMessage, {
      description: action,
      duration: 5000,
    })
  }, [])

  const updateStats = useCallback(async () => {
    if (!room) return

    const newStats: RoomStats = {
      connectionQuality: room.localParticipant.connectionQuality,
      networkLatency: 0,
      packetsLost: 0,
      jitter: 0,
      serverRegion: undefined,
      activeSpeakers: room.activeSpeakers.length,
      publishedTracks: room.localParticipant.trackPublications.size,
      subscribedTracks: Array.from(room.remoteParticipants.values())
        .reduce((sum, p) => sum + p.trackPublications.size, 0),
    }

    // Get WebRTC stats
    const audioTracks = Array.from(room.localParticipant.trackPublications.values())
      .filter(pub => pub.track?.kind === Track.Kind.Audio)

    await Promise.all(audioTracks.map(async (pub) => {
      if (pub.track && 'getStats' in pub.track) {
        try {
          const stats = await (pub.track as any).getStats()
          stats.forEach((stat: RTCStats) => {
            if ('jitter' in stat) {
              newStats.jitter = Math.max(newStats.jitter, (stat as any).jitter * 1000)
            }
            if ('packetsLost' in stat) {
              newStats.packetsLost += (stat as any).packetsLost
            }
            if ('currentRoundTripTime' in stat) {
              newStats.networkLatency = Math.max(
                newStats.networkLatency,
                (stat as any).currentRoundTripTime * 1000
              )
            }
          })
        } catch (e) {
          console.warn('Failed to get track stats:', e)
        }
      }
    }))

    // Get system stats if available
    const perf = performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
    if (perf.memory) {
      newStats.memoryUsage = perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit
    }

    setStats(newStats)
  }, [room])

  useEffect(() => {
    if (!room) return

    const updateInterval = setInterval(() => {
      void updateStats()
    }, 2000)

    const handleConnectionState = (state: ConnectionState) => {
      switch (state) {
        case ConnectionState.Connected:
          toast.success('Connected to meeting room')
          break
        case ConnectionState.Connecting:
          toast.info('Connecting to meeting room...')
          break
        case ConnectionState.Disconnected:
          toast.warning('Disconnected from meeting room', {
            description: 'Attempting to reconnect...'
          })
          break
        case ConnectionState.Reconnecting:
          toast.info('Reconnecting to meeting room...')
          break
      }
    }

    const handleConnectionQuality = (quality: ConnectionQuality) => {
      if (quality === ConnectionQuality.Poor) {
        toast.warning('Poor connection quality', {
          description: 'You may experience issues with audio/video'
        })
      }
    }

    const handleTrackSubscriptionFailed = (
      trackSid: string,
      participant: RemoteParticipant,
      reason?: SubscriptionError
    ) => {
      handleError(`Failed to subscribe to track: ${reason || 'Unknown error'}`)
    }

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      handleError(`Participant ${participant.identity} disconnected`)
    }

    room.on(RoomEvent.ConnectionStateChanged, handleConnectionState)
    room.on(RoomEvent.ConnectionQualityChanged, handleConnectionQuality)
    room.on(RoomEvent.TrackSubscriptionFailed, handleTrackSubscriptionFailed)
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)

    return () => {
      clearInterval(updateInterval)
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionState)
      room.off(RoomEvent.ConnectionQualityChanged, handleConnectionQuality)
      room.off(RoomEvent.TrackSubscriptionFailed, handleTrackSubscriptionFailed)
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
    }
  }, [room, updateStats, handleError])

  return stats
}
