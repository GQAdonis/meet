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

export function PreJoinForm({ roomName }: PreJoinFormProps): JSX.Element {
  const videoDevicesRef = React.useRef<MediaDeviceInfo[]>([])
  const audioDevicesRef = React.useRef<MediaDeviceInfo[]>([])
  const audioOutputDevicesRef = React.useRef<MediaDeviceInfo[]>([])
  const videoPreviewRef = React.useRef<MediaStream | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [connectionDetails, setConnectionDetails] = React.useState<any>(null)

  const { session } = useAuth()
  const { setLocalUser, joinRoom, lastUsedDevices, setLastUsedDevices, skipPreJoin, setSkipPreJoin } = useRoom()
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

  const startVideoPreview = React.useCallback(async (deviceId?: string): Promise<void> => {
    console.log('Starting video preview with device:', deviceId);
    try {
      // Stop any existing tracks
      if (videoPreviewRef.current) {
        videoPreviewRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }

      const constraints = deviceId 
        ? { video: { deviceId: { exact: deviceId } } }
        : { video: true };

      console.log('Requesting video with constraints:', constraints);
      
      // Get new stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got video stream:', stream.getVideoTracks()[0].label);
      
      videoPreviewRef.current = stream;

      // Set up video element
      if (videoRef.current) {
        console.log('Setting up video element');
        
        // Reset video element
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
        
        // Configure video element
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        // Set stream and play
        videoRef.current.srcObject = stream;
        
        try {
          console.log('Attempting to play video');
          await videoRef.current.play();
          console.log('Video playing successfully');
          setVideoError(null);
        } catch (playError: unknown) {
          console.error('Play failed:', playError);
          if (playError instanceof Error) {
            if (playError.name === 'NotAllowedError') {
              const playOnClick = async () => {
                if (videoRef.current) {
                  try {
                    await videoRef.current.play();
                    setVideoError(null);
                  } catch (retryError) {
                    console.error('Manual play failed:', retryError);
                    setVideoError('Could not start video. Please check permissions.');
                  }
                }
              };
              
              videoRef.current.addEventListener('click', playOnClick, { once: true });
              setVideoError('Click video area to start camera preview');
            } else {
              setVideoError('Could not start video preview. Please try refreshing.');
            }
          }
        }
      }
    } catch (error) {
      console.error('Video preview error:', error);
      setVideoError('Could not access camera. Please check permissions.');
    }
  }, [setVideoError]);

  const updateVideoPreview = React.useCallback(async (deviceId: string): Promise<void> => {
    await startVideoPreview(deviceId);
  }, [startVideoPreview]);

  const handleDeviceChange = React.useCallback((deviceType: "video" | "audio" | "audioOutput", deviceId: string): void => {
    form.setValue(
      deviceType === "video" ? "videoDeviceId" : deviceType === "audio" ? "audioDeviceId" : "audioOutputDeviceId",
      deviceId
    );

    if (deviceType === "video") {
      setVideoError(null); // Reset video error when changing device
      updateVideoPreview(deviceId);
    }
  }, [form, setVideoError, updateVideoPreview]);

  // Initialize room and devices
  React.useEffect(() => {
    const initialize = async () => {
      if (!session?.handle) return;
      if (typeof window === 'undefined') return;
      setIsLoading(true);
      setVideoError(null);

      try {
        // First create the room
        console.log('Creating room...');
        const response = await fetch(`/api/connection-details?roomName=${roomName}&participantName=${encodeURIComponent(session.handle)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to get connection details: ${await response.text()}`);
        }

        const details = await response.json();
        console.log('Room created with details:', details);
        setConnectionDetails(details);

        // Then initialize devices
        console.log('Initializing devices...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        videoDevicesRef.current = devices.filter((device: MediaDeviceInfo) => device.kind === "videoinput");
        audioDevicesRef.current = devices.filter((device: MediaDeviceInfo) => device.kind === "audioinput");
        audioOutputDevicesRef.current = devices.filter((device: MediaDeviceInfo) => device.kind === "audiooutput");

        console.log('Setting default values with devices:', {
          video: videoDevicesRef.current,
          audio: audioDevicesRef.current,
          audioOutput: audioOutputDevicesRef.current
        });
        const defaultValues = {
          displayName: session?.handle || "",
          videoDeviceId: videoDevicesRef.current[0]?.deviceId ?? "",
          audioDeviceId: audioDevicesRef.current[0]?.deviceId ?? "",
          audioOutputDeviceId: audioOutputDevicesRef.current[0]?.deviceId ?? "",
        };

        console.log('Setting form values:', defaultValues);
        Object.entries(defaultValues).forEach(([key, value]) => {
          form.setValue(key as keyof PreJoinFormValues, value);
        });

        console.log('Starting video preview with device:', defaultValues.videoDeviceId);
        if (videoDevicesRef.current.length > 0) {
          await startVideoPreview(defaultValues.videoDeviceId);
        } else {
          setVideoError('No cameras detected');
        }

        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure devices are ready
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing:', error);
        setVideoError('Could not initialize devices and room');
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      videoPreviewRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    };
  }, [form, session, startVideoPreview, setVideoError, roomName]);

  const handleSubmit = async (values: PreJoinFormValues): Promise<void> => {
    if (!connectionDetails) {
      console.error('No connection details available');
      return;
    }
    try {
      // Save the last used devices
      setLastUsedDevices({
        videoDeviceId: values.videoDeviceId || '',
        audioDeviceId: values.audioDeviceId || '',
      });

      // Enable skip pre-join for future visits
      setSkipPreJoin(true);

      // Set local user preferences for media devices
      const localUserChoices: LocalUserChoices = {
        username: values.displayName,
        videoEnabled: true,
        audioEnabled: true,
        videoDeviceId: values.videoDeviceId ?? '',
        audioDeviceId: values.audioDeviceId ?? '',
      }
      
      // Then set local user
      await new Promise<void>((resolve) => {
        setLocalUser(localUserChoices);
        resolve();
      });
      
      console.log('Joining room with:', { connectionDetails, localUserChoices });
      // Finally mark that we're joining the room
      await joinRoom();
    } catch (error) {
      console.error('Error preparing media:', error)
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
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover cursor-pointer"
                  style={{ transform: 'rotateY(180deg)' }} // Mirror the video
                />
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
