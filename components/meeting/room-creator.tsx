"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RefreshCw, Lock, Video } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { randomString, encodePassphrase } from "@/lib/client-utils"
import { cn } from "@/lib/utils"

const roomSchema = z.object({
  roomName: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
})

// Function to generate a random room name
const generateRoomName = () => {
  const adjectives = ["Swift", "Bright", "Cosmic", "Digital", "Quantum", "Stellar", "Cyber", "Neon", "Astro", "Techno"]
  const nouns = ["Nexus", "Hub", "Sphere", "Matrix", "Pulse", "Orbit", "Core", "Link", "Node", "Grid"]
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNumber = Math.floor(Math.random() * 1000)
  return `${randomAdjective}${randomNoun}${randomNumber}`.toLowerCase()
}

export function RoomCreator() {
  const router = useRouter()
  const [roomName, setRoomName] = React.useState(generateRoomName())
  const [e2ee, setE2ee] = React.useState(false)
  const [sharedPassphrase, setSharedPassphrase] = React.useState(randomString(64))
  const [validationError, setValidationError] = React.useState("")

  const startMeeting = async () => {
    try {
      // 1. Validate room name format
      roomSchema.parse({ roomName })

      // 2. Create room on server
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          e2ee,
          sharedPassphrase: e2ee ? sharedPassphrase : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      // 3. Navigate to room
      const targetUrl = e2ee ? `/rooms/${roomName}#${encodePassphrase(sharedPassphrase)}` : `/rooms/${roomName}`
      router.push(targetUrl)
    } catch (error) {
      console.error('Error starting meeting:', error)
      if (error instanceof z.ZodError) {
        setValidationError("Room name must contain only lowercase letters, numbers, and hyphens")
      } else {
        setValidationError(error instanceof Error ? error.message : "Failed to create room")
      }
    }
  }

  const refreshRoomName = () => {
    const newName = generateRoomName()
    setRoomName(newName)
    setValidationError("")
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-background/10 backdrop-blur-sm border-white/10">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-white" />
          <CardTitle className="text-white">Start a Meeting</CardTitle>
        </div>
        <CardDescription className="text-white/70">Create a secure video meeting room instantly</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex flex-row gap-2 items-center">
              <div className="flex-grow">
                <Input
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value)
                    setValidationError("")
                  }}
                  placeholder="Room Name"
                  className={cn(
                  "font-mono text-sm transition-colors bg-white/10 border-white/20 text-white placeholder:text-white/50",
                  validationError ? "border-destructive" : ""
                )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={refreshRoomName}
                className="flex-shrink-0 hover:bg-white/20 border-white/20 text-black dark:text-white"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {validationError && (
              <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">{validationError}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="use-e2ee" checked={e2ee} onCheckedChange={(checked) => setE2ee(checked as boolean)} />
              <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="use-e2ee"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 text-white"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Enable end-to-end encryption
                </Label>
              </div>
            </div>

            {e2ee && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="passphrase" className="text-sm text-white">
                  Passphrase
                </Label>
                <Input
                  id="passphrase"
                  type="password"
                  value={sharedPassphrase}
                  onChange={(ev) => setSharedPassphrase(ev.target.value)}
                  className="font-mono text-sm bg-white/10 border-white/20 text-white"
                />
              </div>
            )}
          </div>

          <Button variant="default" size="lg" className="w-full font-medium bg-white text-black hover:bg-white/90 dark:bg-background dark:text-white dark:hover:bg-background/90" onClick={startMeeting}>
            Start Meeting
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
