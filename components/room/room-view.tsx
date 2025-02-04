'use client';

import React from "react"
import { useRoom } from "@/hooks/use-room"
import { VideoConference, GridLayout, useTracks } from "@livekit/components-react"

import { ChatSidebar } from "@/components/room/chat-sidebar"
import { CustomParticipantTile } from "./custom-participant-tile"
import type { ConnectionDetails } from "@/lib/types"
import { LiveKitProvider } from "@/components/providers/livekit-provider"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { CustomControlBar } from "./custom-control-bar"

export function RoomView({ roomName }: { roomName: string }) {
  const { localUser } = useRoom()
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [hasUnreadMessages, setHasUnreadMessages] = React.useState(false)
  const chatSidebarRef = React.useRef<{ startPrivateChat: (participantIdentity: string) => void } | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails | null>(null)

  React.useEffect(() => {
    const fetchConnectionDetails = async () => {
      try {
        const url = new URL("/api/connection-details", window.location.origin)
        url.searchParams.append("roomName", roomName)
        url.searchParams.append("participantName", localUser?.username || "Anonymous")

        const response = await fetch(url.toString())
        if (!response.ok) {
          throw new Error("Failed to fetch connection details")
        }
        const details: ConnectionDetails = await response.json()
        setConnectionDetails(details)
      } catch (error) {
        console.error("Error fetching connection details:", error)
        // Handle error (e.g., show error message to user)
      }
    }

    if (localUser) {
      fetchConnectionDetails()
    }
  }, [roomName, localUser])

  const toggleChat = React.useCallback(() => {
    setIsChatOpen(prev => !prev)
  }, [])

  if (!localUser || !connectionDetails) return null

  const tracks = useTracks();
  const handleStartPrivateChat = (participantIdentity: string) => {
    setIsChatOpen(true);
    if (chatSidebarRef.current?.startPrivateChat) {
      chatSidebarRef.current.startPrivateChat(participantIdentity);
    }
  };

  return (
    <LiveKitProvider
      serverUrl={connectionDetails.serverUrl}
      token={connectionDetails.participantToken}
      connect={true}
      audio={localUser.audioEnabled}
      video={localUser.videoEnabled}
    >
      <div className="h-screen w-screen flex overflow-hidden">
        {/* For desktop, render chat sidebar inline */}
        {!isMobile && isChatOpen && (
          <div className="w-80 border-l border-border/50 bg-background/80 backdrop-blur-sm">
            <ChatSidebar />
          </div>
        )}
        {/* For mobile, render chat sidebar as a sheet */}
        {isMobile && (
          <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
            <SheetContent side="right" className="w-full max-w-[100vw] border-l border-border/50 bg-background/80 backdrop-blur-sm sm:max-w-[350px]">
              <ChatSidebar
                ref={chatSidebarRef}
                onStartPrivateChat={handleStartPrivateChat}
                onUnreadMessages={setHasUnreadMessages}
              />
            </SheetContent>
          </Sheet>
        )}
        <div className="flex-grow relative flex flex-col">
          <div className="flex-grow relative overflow-hidden">
            <VideoConference
              className={cn("h-full w-full", {
                "max-h-[calc(100vh-80px)]": isMobile, // Account for control bar on mobile
              })}
            >
              <GridLayout tracks={tracks}>
                {tracks.map((track) => (
                  <CustomParticipantTile
                    key={track.participant.identity}
                    participant={track.participant}
                    onStartPrivateChat={handleStartPrivateChat}
                  />
                ))}
              </GridLayout>
            </VideoConference>
          </div>
          <div className="relative z-50 bg-gradient-to-t from-black/50 to-transparent">
            <CustomControlBar onChatToggle={toggleChat} hasUnreadMessages={hasUnreadMessages} />
          </div>
        </div>
      </div>
    </LiveKitProvider>
  )
}
