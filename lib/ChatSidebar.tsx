'use client';

import * as React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoomContext } from '@livekit/components-react';
import { useChatStore } from '@/store/chat';
import { useToast } from "@/components/ui/use-toast";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";

export function ChatSidebar() {
  const room = useRoomContext();
  const { toast } = useToast();
  const { 
    isOpen, 
    sendMessage, 
    setRoom,
    getMessagesForRoom,
    closeChat,
    currentRoomName 
  } = useChatStore();
  const [messageInput, setMessageInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  console.log('ChatSidebar render:', { 
    roomName: room.name,
    currentRoomName,
    isOpen,
    hasLocalParticipant: !!room.localParticipant
  });

  // Get messages for current room
  const messages = getMessagesForRoom(room.name);
  console.log('Current room messages:', { roomName: room.name, messages });

  // Set up room in store
  React.useEffect(() => {
    console.log('Setting up room in store:', room);
    setRoom(room);
  }, [room, setRoom]);

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with message:', messageInput);
    if (messageInput.trim()) {
      try {
        console.log('Attempting to send message');
        await sendMessage(messageInput);
        setMessageInput('');
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        toast({
          variant: "destructive",
          title: "Failed to send message",
          description: "Please check your connection and try again."
        });
      }
    }
  };

  const getStatusIcon = (status: 'sending' | 'sent' | 'error') => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
  };

  return (
    <SidebarProvider open={isOpen} onOpenChange={closeChat}>
      <Sidebar
        side="right"
        collapsible="offcanvas"
        variant="floating"
        className="w-[400px] border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h2 className="font-semibold">Chat</h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-muted"
              onClick={closeChat}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1",
                    msg.isSelf ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {msg.isSelf ? "You" : msg.from?.name || msg.from?.identity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-end gap-1">
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        msg.isSelf
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.message}
                    </div>
                    {msg.isSelf && (
                      <div className="mb-1 flex h-3 w-3">
                        {getStatusIcon(msg.status)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
} 