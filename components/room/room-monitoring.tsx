"use client"

import * as React from "react"
import { useRoomMonitoring } from "@/hooks/use-room-monitoring"
import { ConnectionQuality } from "livekit-client"
import { Wifi, WifiOff, Activity, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useRoomContext } from "@livekit/components-react"

export function RoomMonitoring() {
  const room = useRoomContext()
  const stats = useRoomMonitoring(room)

  const getConnectionIcon = () => {
    switch (stats.connectionQuality) {
      case ConnectionQuality.Excellent:
        return <Wifi className="h-4 w-4 text-green-500" />
      case ConnectionQuality.Good:
        return <Wifi className="h-4 w-4 text-yellow-500" />
      case ConnectionQuality.Poor:
        return <Wifi className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getConnectionQualityText = () => {
    switch (stats.connectionQuality) {
      case ConnectionQuality.Excellent:
        return "Excellent"
      case ConnectionQuality.Good:
        return "Good"
      case ConnectionQuality.Poor:
        return "Poor"
      default:
        return "Unknown"
    }
  }

  if (!room) return null

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            {getConnectionIcon()}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="top">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Connection Status</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Quality</div>
              <div>{getConnectionQualityText()}</div>
              <div className="text-muted-foreground">Latency</div>
              <div>{Math.round(stats.networkLatency)}ms</div>
              <div className="text-muted-foreground">Packet Loss</div>
              <div>{stats.packetsLost} packets</div>
              <div className="text-muted-foreground">Jitter</div>
              <div>{Math.round(stats.jitter)}ms</div>
              {stats.serverRegion && (
                <>
                  <div className="text-muted-foreground">Region</div>
                  <div>{stats.serverRegion}</div>
                </>
              )}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Activity className="h-4 w-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="top">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Room Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Active Speakers</div>
              <div>{stats.activeSpeakers}</div>
              <div className="text-muted-foreground">Published Tracks</div>
              <div>{stats.publishedTracks}</div>
              <div className="text-muted-foreground">Subscribed Tracks</div>
              <div>{stats.subscribedTracks}</div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {stats.cpuUsage && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Cpu className="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" side="top">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">System Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">CPU Usage</div>
                <div>{Math.round(stats.cpuUsage * 100)}%</div>
                {stats.memoryUsage && (
                  <>
                    <div className="text-muted-foreground">Memory Usage</div>
                    <div>{Math.round(stats.memoryUsage * 100)}%</div>
                  </>
                )}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  )
}
