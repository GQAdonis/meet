'use client';

import React from "react"
import { useRoomContext } from "@livekit/components-react"
import { type RemoteParticipant } from "livekit-client"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChatMessage {
  id: string
  sender: string
  content: string
  isPrivate: boolean
  timestamp: number
  recipientId?: string
}

interface ChatSidebarProps {
  onStartPrivateChat?: (participantIdentity: string) => void;
  onUnreadMessages?: (hasUnread: boolean) => void;
}

export const ChatSidebar = React.forwardRef<{ startPrivateChat: (participantIdentity: string) => void }, ChatSidebarProps>((props, ref) => {
  const { onStartPrivateChat, onUnreadMessages } = props;
  const room = useRoomContext()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")
  const [privateTabs, setPrivateTabs] = React.useState<string[]>([])
  const [unreadCounts, setUnreadCounts] = React.useState<Record<string, number>>({"all": 0})

  React.useEffect(() => {
    if (!room) return;

    const handleData = (payload: Uint8Array, participant?: RemoteParticipant) => {
    if (!participant || !room) return;
    
    try {
      const decodedMessage = new TextDecoder().decode(payload);
      const parsedMessage = JSON.parse(decodedMessage) as ChatMessage;
      
      // Only process messages if they're public or meant for us
      if (!parsedMessage.isPrivate || parsedMessage.recipientId === room.localParticipant.identity) {
        const newMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: participant.identity,
          content: parsedMessage.content,
          isPrivate: parsedMessage.isPrivate,
          timestamp: Date.now(),
          recipientId: parsedMessage.recipientId
        };
        
        setMessages((prev) => [...prev, newMessage]);
        
        // Update unread counts
        if (parsedMessage.isPrivate) {
          if (activeTab !== participant.identity) {
            setUnreadCounts(prev => ({
              ...prev,
              [participant.identity]: (prev[participant.identity] || 0) + 1
            }));
            
            // Add private tab if it doesn't exist
            if (!privateTabs.includes(participant.identity)) {
              setPrivateTabs(prev => [...prev, participant.identity]);
            }
          }
        } else if (activeTab !== 'all') {
          setUnreadCounts(prev => ({
            ...prev,
            all: (prev.all || 0) + 1
          }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
    }

    room.on("dataReceived", handleData)
    return () => {
      room.off("dataReceived", handleData)
    }
  }, [room])

  // Notify parent component about unread messages
  React.useEffect(() => {
    const hasUnread = Object.values(unreadCounts).some(count => count > 0)
    onUnreadMessages?.(hasUnread)
  }, [unreadCounts, onUnreadMessages])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Clear unread count for the selected tab
    setUnreadCounts(prev => ({
      ...prev,
      [value]: 0
    }))
  }

  const sendMessage = async (to?: RemoteParticipant) => {
    if (!inputMessage.trim()) return;

    if (!room) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      content: inputMessage.trim(),
      sender: room.localParticipant.identity,
      isPrivate: !!to,
      timestamp: Date.now(),
      recipientId: to?.identity
    };

    const encodedMessage = new TextEncoder().encode(JSON.stringify(message));

    try {
      if (to) {
        room.localParticipant.publishData(encodedMessage, {
          reliable: true,
          destinationIdentities: [to.identity],
        });
      } else {
        room.localParticipant.publishData(encodedMessage, {
          reliable: true,
        });
      }
      setMessages((prev) => [...prev, { ...message, sender: "You" }]);
      setInputMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const startPrivateChat = (participantIdentity: string) => {
    if (!privateTabs.includes(participantIdentity)) {
      setPrivateTabs((prev) => [...prev, participantIdentity])
      setUnreadCounts(prev => ({
        ...prev,
        [participantIdentity]: 0
      }))
    }
    setActiveTab(participantIdentity)
    // Clear unread count when opening chat
    setUnreadCounts(prev => ({
      ...prev,
      [participantIdentity]: 0
    }))
    onStartPrivateChat?.(participantIdentity)
  }

  // Expose startPrivateChat through ref
  React.useImperativeHandle(ref, () => ({
    startPrivateChat
  }));

  return (
    <div className="flex flex-col h-full w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-grow flex flex-col">
        <TabsList className="w-full justify-start border-b border-border/50 rounded-none px-2">
          <TabsTrigger value="all" className="data-[state=active]:bg-muted/50 relative">
            All
            {unreadCounts.all > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCounts.all}
              </span>
            )}
          </TabsTrigger>
          {privateTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-muted/50 relative">
              {tab}
              {(unreadCounts[tab] || 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCounts[tab]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="flex-grow overflow-y-auto p-4 pt-2">
          {messages
            .filter((m) => !m.isPrivate)
            .map((message, index) => (
              <div key={index} className="mb-2 p-2 rounded-lg bg-muted/30">
                <strong className="text-sm text-muted-foreground">{message.sender}:</strong>
                <ReactMarkdown className="text-sm mt-1">{message.content}</ReactMarkdown>
              </div>
            ))}
        </TabsContent>
        {privateTabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="flex-grow overflow-y-auto p-4 pt-2">
            {messages
              .filter((m) => m.isPrivate && (m.sender === tab || m.sender === "You"))
              .map((message, index) => (
                <div key={index} className="mb-2 p-2 rounded-lg bg-muted/30">
                  <strong className="text-sm text-muted-foreground">{message.sender}:</strong>
                  <ReactMarkdown className="text-sm mt-1">{message.content}</ReactMarkdown>
                </div>
              ))}
          </TabsContent>
        ))}
      </Tabs>
      <div className="p-4 border-t border-border/50">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow bg-background/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!room) return;
                const participant = activeTab !== "all" ? room.getParticipantByIdentity(activeTab) : undefined;
                if (participant && !participant.isLocal) {
                  sendMessage(participant as RemoteParticipant);
                } else {
                  sendMessage(undefined);
                }
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              if (!room) return;
              const participant = activeTab !== "all" ? room.getParticipantByIdentity(activeTab) : undefined;
              if (participant && !participant.isLocal) {
                sendMessage(participant as RemoteParticipant);
              } else {
                sendMessage(undefined);
              }
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
})
