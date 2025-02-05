"use client"

import { useRoom } from "@/hooks/use-room"
import { PreJoinForm } from "@/components/pre-join/pre-join-form"
import { RoomView } from "@/components/room/room-view"
import { LiveKitRoom } from "@livekit/components-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import { CustomControlBar } from "@/components/room/custom-control-bar"
import { ChatSidebar } from "@/components/room/chat-sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { RecordingIndicator } from "@/components/room/recording-indicator"
import { useLocalParticipant } from "@livekit/components-react"

export default function Page({ params }: { params: { roomName: string } }) {
  const { connectionDetails, isInRoom, error, localUser } = useRoom()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { localParticipant } = useLocalParticipant()
  const [isLoading, setIsLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [isRoomCreator, setIsRoomCreator] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    // Set room creator status based on participant identity matching room name prefix
    if (localParticipant?.identity) {
      setIsRoomCreator(localParticipant.identity === params.roomName.split('-')[0])
    }
  }, [localParticipant?.identity, params.roomName])
  const chatSidebarRef = useRef<{ startPrivateChat: (participantIdentity: string) => void } | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev)
  }, [])

  const handleStartPrivateChat = useCallback((participantIdentity: string) => {
    setIsChatOpen(true);
    if (chatSidebarRef.current?.startPrivateChat) {
      chatSidebarRef.current.startPrivateChat(participantIdentity);
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated()) {
          await router.push("/login")
          return
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </main>
    )
  }

  return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
          {!isInRoom || !connectionDetails ? (
            <div className="w-full max-w-md">
              <PreJoinForm 
                roomName={params.roomName}
                error={error || undefined}
              />
            </div>
          ) : (
            <LiveKitRoom
              serverUrl={connectionDetails.serverUrl}
              token={connectionDetails.participantToken}
              connect={isInRoom}
              onDisconnected={() => {
                // Handle disconnection if needed
              }}
            >
              <div className="h-screen w-screen flex overflow-hidden bg-background relative">
                <RecordingIndicator isRecording={isRecording} />
                <div className={cn(
                  "flex-grow relative flex flex-col pointer-events-none",
                  isChatOpen && !isMobile && "mr-80"
                )}>
                  <div className="pointer-events-auto flex-grow">
                    <RoomView onStartPrivateChat={handleStartPrivateChat} />
                  </div>
                  <CustomControlBar 
                    onChatToggle={toggleChat} 
                    hasUnreadMessages={hasUnreadMessages}
                    isRoomCreator={isRoomCreator}
                    onRecordingChange={setIsRecording}
                  />
                </div>

                {/* For desktop, render chat sidebar inline */}
                {!isMobile && isChatOpen && (
                  <div className="fixed right-0 top-0 bottom-0 w-80 border-l border-border/50 bg-background/80 backdrop-blur-sm z-50 pointer-events-auto">
                    <div className="h-full pointer-events-auto">
                      <ChatSidebar
                        ref={chatSidebarRef}
                        onStartPrivateChat={handleStartPrivateChat}
                        onUnreadMessages={setHasUnreadMessages}
                      />
                    </div>
                  </div>
                )}

                {/* For mobile, render chat sidebar as a sheet */}
                {isMobile && (
                  <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <SheetContent side="right" className="w-full max-w-[100vw] border-l border-border/50 bg-background/80 backdrop-blur-sm sm:max-w-[350px] pointer-events-auto z-50">
                      <div className="h-full pointer-events-auto">
                        <ChatSidebar
                          ref={chatSidebarRef}
                          onStartPrivateChat={handleStartPrivateChat}
                          onUnreadMessages={setHasUnreadMessages}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </LiveKitRoom>
          )}
      </main>
  )
}
