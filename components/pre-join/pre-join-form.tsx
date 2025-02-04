"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AudioLevelMeter } from "./audio-meter"
import { AudioTest } from "./audio-test"
import type { LocalUserChoices } from "@livekit/components-react"
import { Camera, Mic, Monitor } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRoom } from "@/hooks/use-room"

const preJoinSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  videoDeviceId: z.string().optional(),
  audioDeviceId: z.string().optional(),
  audioOutputDeviceId: z.string().optional(),
})

type PreJoinFormValues = z.infer<typeof preJoinSchema>

interface PreJoinFormProps {
  roomName: string
}

export function PreJoinForm({ roomName }: PreJoinFormProps) {
  const videoDevicesRef = React.useRef<MediaDeviceInfo[]>([])
  const audioDevicesRef = React.useRef<MediaDeviceInfo[]>([])
  const audioOutputDevicesRef = React.useRef<MediaDeviceInfo[]>([])
  const videoPreviewRef = React.useRef<MediaStream | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const { session } = useAuth()
  const { setLocalUser, joinRoom } = useRoom()
  const [videoError, setVideoError] = React.useState<string | null>(null)

  const form = useForm<PreJoinFormValues>({
    resolver: zodResolver(preJoinSchema),
    defaultValues: {
      displayName: "",
      videoDeviceId: "",
      audioDeviceId: "",
      audioOutputDeviceId: "",
    },
  })

  const defaultValuesRef = React.useRef<PreJoinFormValues>({
    displayName: "",
    videoDeviceId: "",
    audioDeviceId: "",
    audioOutputDeviceId: "",
  })

  React.useEffect(() => {
    const getDevices = async () => {
      if (typeof window === 'undefined') return;
      setIsLoading(true);
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevicesRef.current = devices.filter((device: MediaDeviceInfo) => device.kind === "videoinput");
        audioDevicesRef.current = devices.filter((device: MediaDeviceInfo) => device.kind === "audioinput");
        audioOutputDevicesRef.current = devices.filter((device: MediaDeviceInfo) => device.kind === "audiooutput");

        // Set default values for device selections
        defaultValuesRef.current = {
          displayName: session?.handle || "",
          videoDeviceId: videoDevicesRef.current[0]?.deviceId ?? "",
          audioDeviceId: audioDevicesRef.current[0]?.deviceId ?? "",
          audioOutputDeviceId: audioOutputDevicesRef.current[0]?.deviceId ?? "",
        };

        // Update form with default values
        Object.entries(defaultValuesRef.current).forEach(([key, value]) => {
          form.setValue(key as keyof PreJoinFormValues, value);
        });

        // Start video preview with the first available camera
        if (videoDevicesRef.current.length > 0 && defaultValuesRef.current.videoDeviceId) {
          await updateVideoPreview(defaultValuesRef.current.videoDeviceId);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setVideoError(error instanceof Error ? error.message : "Failed to access media devices");
      }
    };

    getDevices();

    return () => {
      videoPreviewRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    };
  }, [form, session]);

  const handleSubmit = async (values: PreJoinFormValues) => {
    try {
      // Set local user preferences for media devices
      const localUserChoices: LocalUserChoices = {
        username: values.displayName,
        videoEnabled: true,
        audioEnabled: true,
        videoDeviceId: values.videoDeviceId ?? '',
        audioDeviceId: values.audioDeviceId ?? '',
      }
      setLocalUser(localUserChoices)

      // Mark that we're joining the room
      joinRoom()
    } catch (error) {
      console.error('Error preparing media:', error)
    }
  }

  const handleDeviceChange = (deviceType: "video" | "audio" | "audioOutput", deviceId: string) => {
    form.setValue(
      deviceType === "video" ? "videoDeviceId" : deviceType === "audio" ? "audioDeviceId" : "audioOutputDeviceId",
      deviceId,
    )

    if (deviceType === "video") {
      setVideoError(null) // Reset video error when changing device
      updateVideoPreview(deviceId)
    }
  }

  const updateVideoPreview = async (deviceId: string) => {
    if (videoPreviewRef.current) {
      videoPreviewRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      })
      videoPreviewRef.current = newStream
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (error) {
      console.error("Error updating video preview:", error)

      if (error instanceof OverconstrainedError) {
        // If the exact deviceId constraint fails, try without it
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true })
          videoPreviewRef.current = fallbackStream
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream
          }
          setVideoError("Unable to use the selected camera. Using default camera instead.")
        } catch (fallbackError) {
          setVideoError("Failed to access any camera. Please check your camera permissions.")
        }
      } else {
        setVideoError(
          "Failed to access the selected camera. Please ensure you've granted the necessary permissions and try again."
        )
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Preparing Your Meeting</CardTitle>
          <CardDescription>Setting up your camera and microphone...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Please allow access to your devices when prompted</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Meeting</CardTitle>
        <CardDescription>Room: {roomName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              {videoError ? (
                <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center">
                  <p>{videoError}</p>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoDeviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera</FormLabel>
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <Select onValueChange={(value) => handleDeviceChange("video", value)} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select camera" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {videoDevicesRef.current
                            .filter((device) => device.deviceId !== '')
                            .map((device) => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${device.deviceId.slice(0, 4)}`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="audioDeviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Microphone</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <Select onValueChange={(value) => handleDeviceChange("audio", value)} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select microphone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {audioDevicesRef.current
                              .filter((device) => device.deviceId !== '')
                              .map((device) => (
                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                  {device.label || `Microphone ${device.deviceId.slice(0, 4)}`}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <AudioLevelMeter audioDeviceId={field.value || ""} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="audioOutputDeviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speakers</FormLabel>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <Select onValueChange={(value) => handleDeviceChange("audioOutput", value)} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select speakers" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {audioOutputDevicesRef.current
                            .filter((device) => device.deviceId !== '')
                            .map((device) => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label || `Speaker ${device.deviceId.slice(0, 4)}`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <AudioTest audioDeviceId={field.value || ''} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Join Room
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
