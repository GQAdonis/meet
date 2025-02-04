'use client';

import React from "react"
import { useRoom } from "@/hooks/use-room"
import { DataPacket_Kind, type RemoteParticipant } from "livekit-client"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChatMessage {
  sender: string
  content: string
  isPrivate: boolean
}

export function ChatSidebar() {
  const { room } = useRoom()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")
  const [privateTabs, setPrivateTabs] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!room) return;

    const handleData = (payload: Uint8Array, participant?: RemoteParticipant) => {
      if (!participant) return; // Guard clause for undefined participant
      const decodedMessage = new TextDecoder().decode(payload)
      const { content, isPrivate } = JSON.parse(decodedMessage)
      setMessages((prev) => [...prev, { sender: participant.identity, content, isPrivate }])
    }

    room.on("dataReceived", handleData)
    return () => {
      room.off("dataReceived", handleData)
    }
  }, [room])

  const sendMessage = (to?: RemoteParticipant) => {
    if (!room) return; // Add guard clause
    
    const message = {
      content: inputMessage,
      isPrivate: !!to,
    }
    const encodedMessage = new TextEncoder().encode(JSON.stringify(message))
    if (to) {
      room.localParticipant.publishData(encodedMessage, {
        destinationIdentities: [to.identity],
        reliable: true,
      })
    } else {
      room.localParticipant.publishData(encodedMessage, {
        reliable: true,
      })
    }
    setMessages((prev) => [...prev, { sender: "You", ...message }])
    setInputMessage("")
  }

  const startPrivateChat = (participantIdentity: string) => {
    if (!privateTabs.includes(participantIdentity)) {
      setPrivateTabs((prev) => [...prev, participantIdentity])
    }
    setActiveTab(participantIdentity)
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {privateTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="flex-grow overflow-y-auto p-4">
          {messages
            .filter((m) => !m.isPrivate)
            .map((message, index) => (
              <div key={index} className="mb-2">
                <strong>{message.sender}:</strong>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ))}
        </TabsContent>
        {privateTabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="flex-grow overflow-y-auto p-4">
            {messages
              .filter((m) => m.isPrivate && (m.sender === tab || m.sender === "You"))
              .map((message, index) => (
                <div key={index} className="mb-2">
                  <strong>{message.sender}:</strong>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ))}
          </TabsContent>
        ))}
      </Tabs>
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <Button
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
}
