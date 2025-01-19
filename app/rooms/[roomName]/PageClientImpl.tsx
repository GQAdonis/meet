'use client';

import { decodePassphrase } from '@/lib/client-utils';
import { DebugMode } from '@/lib/Debug';
import { RecordingIndicator } from '@/lib/RecordingIndicator';
import { SettingsMenu } from '@/lib/SettingsMenu';
import { ChatSidebar } from '@/lib/ChatSidebar';
import { ConnectionDetails } from '@/lib/types';
import {
  formatChatMessageLinks,
  LiveKitRoom,
  LocalUserChoices,
  VideoConference,
  useMaybeLayoutContext,
} from '@livekit/components-react';
import {
  ExternalE2EEKeyProvider,
  RoomOptions,
  VideoCodec,
  VideoPresets,
  Room,
  DeviceUnsupportedError,
  RoomConnectOptions,
} from 'livekit-client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Settings, LogOut } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useChatStore } from '@/store/chat';

const preJoinFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  videoEnabled: z.boolean().default(true),
  audioEnabled: z.boolean().default(true),
  videoDeviceId: z.string().optional(),
  audioDeviceId: z.string().optional(),
});

type PreJoinFormValues = z.infer<typeof preJoinFormSchema>;

const CONN_DETAILS_ENDPOINT =
  process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details';
const SHOW_SETTINGS_MENU = process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU == 'true';

export function PageClientImpl(props: {
  roomName: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
}) {
  const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices | undefined>(
    undefined,
  );
  const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const form = useForm<PreJoinFormValues>({
    resolver: zodResolver(preJoinFormSchema),
    defaultValues: {
      username: '',
      videoEnabled: true,
      audioEnabled: true,
    },
  });

  const onSubmit = async (values: PreJoinFormValues) => {
    try {
      setIsLoading(true);
      const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
      url.searchParams.append('roomName', props.roomName);
      url.searchParams.append('participantName', values.username);
      if (props.region) {
        url.searchParams.append('region', props.region);
      }
      const connectionDetailsResp = await fetch(url.toString());
      const connectionDetailsData = await connectionDetailsResp.json();
      setConnectionDetails(connectionDetailsData);
      // Convert form values to LocalUserChoices
      setPreJoinChoices({
        username: values.username,
        videoEnabled: values.videoEnabled,
        audioEnabled: values.audioEnabled,
        videoDeviceId: values.videoDeviceId ?? '',
        audioDeviceId: values.audioDeviceId ?? '',
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      form.setError('root', {
        type: 'server',
        message: 'Failed to join the room. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="relative flex h-screen flex-col">
        {connectionDetails === undefined || preJoinChoices === undefined ? (
          <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">Join Meeting</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your details to join {props.roomName}
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
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
                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="videoEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Camera</FormLabel>
                              <FormDescription>
                                Enable your camera when joining
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="audioEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Microphone</FormLabel>
                              <FormDescription>
                                Enable your microphone when joining
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Join Room
                    </Button>
                    <FormMessage className="text-center" />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <VideoConferenceComponent
            connectionDetails={connectionDetails}
            userChoices={preJoinChoices}
            options={{ codec: props.codec, hq: props.hq }}
          />
        )}
      </div>
    </main>
  );
}

function VideoConferenceComponent(props: {
  userChoices: LocalUserChoices;
  connectionDetails: ConnectionDetails;
  options: {
    hq: boolean;
    codec: VideoCodec;
  };
}) {
  const { toast } = useToast();
  const layoutContext = useMaybeLayoutContext();
  const e2eePassphrase =
    typeof window !== 'undefined' && decodePassphrase(location.hash.substring(1));

  const worker =
    typeof window !== 'undefined' &&
    e2eePassphrase &&
    new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
  const e2eeEnabled = !!(e2eePassphrase && worker);
  const keyProvider = new ExternalE2EEKeyProvider();
  const [e2eeSetupComplete, setE2eeSetupComplete] = React.useState(false);
  
  // Track participant media states
  const [isCameraEnabled, setIsCameraEnabled] = React.useState(props.userChoices.videoEnabled);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = React.useState(props.userChoices.audioEnabled);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { isOpen: isChatOpen, toggleChat } = useChatStore();

  // Settings menu ref
  const settingsMenuRef = React.useRef<HTMLDivElement>(null);

  // Handle clicks outside settings menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const roomOptions = React.useMemo((): RoomOptions => {
    let videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9';
    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }
    return {
      videoCaptureDefaults: {
        deviceId: props.userChoices.videoDeviceId ?? undefined,
        resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
      },
      publishDefaults: {
        dtx: false,
        videoSimulcastLayers: props.options.hq
          ? [VideoPresets.h1080, VideoPresets.h720]
          : [VideoPresets.h540, VideoPresets.h216],
        red: !e2eeEnabled,
        videoCodec,
      },
      audioCaptureDefaults: {
        deviceId: props.userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true,
      e2ee: e2eeEnabled
        ? {
            keyProvider,
            worker,
          }
        : undefined,
    };
  }, [props.userChoices, props.options.hq, props.options.codec, e2eeEnabled]);

  const room = React.useMemo(() => new Room(roomOptions), [roomOptions]);

  // Handle E2EE setup
  React.useEffect(() => {
    const setupE2EE = async () => {
      if (e2eeEnabled) {
        try {
          await keyProvider.setKey(decodePassphrase(e2eePassphrase));
          await room.setE2EEEnabled(true);
        } catch (e) {
          if (e instanceof DeviceUnsupportedError) {
            toast({
              variant: "destructive",
              title: "Browser Not Supported",
              description: "You're trying to join an encrypted meeting, but your browser does not support it. Please update to the latest version and try again.",
            });
            console.error(e);
          } else {
            throw e;
          }
        }
      }
      setE2eeSetupComplete(true);
    };

    setupE2EE();
  }, [e2eeEnabled, e2eePassphrase, keyProvider, room, toast]);

  // Monitor room participant state changes
  React.useEffect(() => {
    const handleParticipantUpdated = () => {
      if (room.localParticipant) {
        setIsCameraEnabled(room.localParticipant.isCameraEnabled);
        setIsMicrophoneEnabled(room.localParticipant.isMicrophoneEnabled);
        setIsScreenShareEnabled(room.localParticipant.isScreenShareEnabled);
      }
    };

    room.on('connected', handleParticipantUpdated);
    room.on('localTrackPublished', handleParticipantUpdated);
    room.on('localTrackUnpublished', handleParticipantUpdated);
    room.localParticipant?.on('trackMuted', handleParticipantUpdated);
    room.localParticipant?.on('trackUnmuted', handleParticipantUpdated);

    return () => {
      room.off('connected', handleParticipantUpdated);
      room.off('localTrackPublished', handleParticipantUpdated);
      room.off('localTrackUnpublished', handleParticipantUpdated);
      room.localParticipant?.off('trackMuted', handleParticipantUpdated);
      room.localParticipant?.off('trackUnmuted', handleParticipantUpdated);
    };
  }, [room]);

  // Handle media toggles
  const toggleCamera = React.useCallback(async () => {
    try {
      await room.localParticipant.setCameraEnabled(!isCameraEnabled);
      setIsCameraEnabled(!isCameraEnabled);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to toggle camera. Please check your permissions.",
      });
    }
  }, [isCameraEnabled, room.localParticipant, toast]);

  const toggleMicrophone = React.useCallback(async () => {
    try {
      await room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      setIsMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Failed to toggle microphone. Please check your permissions.",
      });
    }
  }, [isMicrophoneEnabled, room.localParticipant, toast]);

  const toggleScreenShare = React.useCallback(async () => {
    try {
      await room.localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
      setIsScreenShareEnabled(!isScreenShareEnabled);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Screen Share Error",
        description: "Failed to toggle screen share. Please check your permissions.",
      });
    }
  }, [isScreenShareEnabled, room.localParticipant, toast]);

  const connectOptions = React.useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  const router = useRouter();
  const handleOnLeave = React.useCallback(() => router.push('/'), [router]);
  const handleError = React.useCallback((error: Error) => {
    console.error(error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Encountered an unexpected error: ${error.message}`,
    });
  }, [toast]);
  
  const handleEncryptionError = React.useCallback((error: Error) => {
    console.error(error);
    toast({
      variant: "destructive",
      title: "Encryption Error",
      description: `Encountered an encryption error: ${error.message}`,
    });
  }, [toast]);

  return (
    <Card className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-background/95 to-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <LiveKitRoom
        connect={e2eeSetupComplete}
        room={room}
        token={props.connectionDetails.participantToken}
        serverUrl={props.connectionDetails.serverUrl}
        connectOptions={connectOptions}
        video={isCameraEnabled}
        audio={isMicrophoneEnabled}
        onDisconnected={handleOnLeave}
        onEncryptionError={handleEncryptionError}
        onError={handleError}
        className={cn("flex-1 [&>div]:h-full [&>div]:w-full")}
      >
        <div className="relative flex h-full w-full flex-col">
          <VideoConference
            chatMessageFormatter={formatChatMessageLinks}
            SettingsComponent={isSettingsOpen ? SettingsMenu : undefined}
            className={cn(
              // Container
              "relative flex h-full flex-1 flex-col overflow-hidden",
              // Hide LiveKit controls
              "[&_.lk-control-bar]:hidden",
              // Video grid
              "[&_.lk-video-grid]:grid [&_.lk-video-grid]:h-full [&_.lk-video-grid]:w-full [&_.lk-video-grid]:grid-cols-1 [&_.lk-video-grid]:gap-4 [&_.lk-video-grid]:p-4 md:[&_.lk-video-grid]:grid-cols-2 lg:[&_.lk-video-grid]:grid-cols-3",
              // Participant tiles
              "[&_.lk-participant]:relative [&_.lk-participant]:flex [&_.lk-participant]:aspect-video [&_.lk-participant]:overflow-hidden [&_.lk-participant]:rounded-xl [&_.lk-participant]:bg-muted [&_.lk-participant]:shadow-sm dark:[&_.lk-participant]:bg-muted/20",
              // Participant metadata (name and controls overlay)
              "[&_.lk-participant-metadata]:absolute [&_.lk-participant-metadata]:bottom-0 [&_.lk-participant-metadata]:left-0 [&_.lk-participant-metadata]:right-0 [&_.lk-participant-metadata]:flex [&_.lk-participant-metadata]:items-center [&_.lk-participant-metadata]:justify-between [&_.lk-participant-metadata]:gap-2 [&_.lk-participant-metadata]:px-4 [&_.lk-participant-metadata]:py-2 [&_.lk-participant-metadata]:bg-gradient-to-t [&_.lk-participant-metadata]:from-black/50 [&_.lk-participant-metadata]:to-transparent",
              // Participant name
              "[&_.lk-participant-metadata-container]:bg-transparent",
              "[&_.lk-participant-name]:inline-flex [&_.lk-participant-name]:items-center [&_.lk-participant-name]:rounded-full [&_.lk-participant-name]:bg-black/50 [&_.lk-participant-name]:px-2.5 [&_.lk-participant-name]:py-1 [&_.lk-participant-name]:text-sm [&_.lk-participant-name]:font-medium [&_.lk-participant-name]:text-white [&_.lk-participant-name]:backdrop-blur-sm",
              // Connection quality
              "[&_.lk-connection-quality]:inline-flex [&_.lk-connection-quality]:items-center [&_.lk-connection-quality]:rounded-full [&_.lk-connection-quality]:px-2 [&_.lk-connection-quality]:py-0.5 [&_.lk-connection-quality]:text-xs [&_.lk-connection-quality]:font-medium [&_.lk-connection-quality]:bg-black/50 [&_.lk-connection-quality]:backdrop-blur-sm",
              "[&_.lk-connection-quality-good]:text-green-400",
              "[&_.lk-connection-quality-poor]:text-yellow-400",
              "[&_.lk-connection-quality-lost]:text-red-400",
              // Full screen button
              "[&_.lk-fullscreen]:absolute [&_.lk-fullscreen]:right-4 [&_.lk-fullscreen]:top-4 [&_.lk-fullscreen]:z-10 [&_.lk-fullscreen]:rounded-full [&_.lk-fullscreen]:bg-black/50 [&_.lk-fullscreen]:p-2 [&_.lk-fullscreen]:text-white [&_.lk-fullscreen]:backdrop-blur-sm [&_.lk-fullscreen]:hover:bg-black/70",
              // Audio meter
              "[&_.lk-audio-meter]:ml-2 [&_.lk-audio-meter]:h-4 [&_.lk-audio-meter]:w-8 [&_.lk-audio-meter]:rounded-full [&_.lk-audio-meter]:bg-black/50 [&_.lk-audio-meter]:backdrop-blur-sm",
              "[&_.lk-audio-meter-bar]:bg-primary [&_.lk-audio-meter-bar]:rounded-full",
              // Track muted overlay
              "[&_.lk-track-muted-overlay]:flex [&_.lk-track-muted-overlay]:h-full [&_.lk-track-muted-overlay]:w-full [&_.lk-track-muted-overlay]:items-center [&_.lk-track-muted-overlay]:justify-center [&_.lk-track-muted-overlay]:bg-background/80 [&_.lk-track-muted-overlay]:backdrop-blur-sm",
            )}
          />
          
          {/* Custom Control Bar */}
          <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border bg-background/95 p-2.5 shadow-lg backdrop-blur-sm dark:bg-zinc-900/90">
            <div className="flex items-center gap-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-full transition-colors",
                        isCameraEnabled 
                          ? "bg-primary/20 hover:bg-primary/30" 
                          : "bg-destructive/20 hover:bg-destructive/30"
                      )}
                      onClick={toggleCamera}
                    >
                      {isCameraEnabled ? (
                        <Video className="h-5 w-5 text-foreground" />
                      ) : (
                        <VideoOff className="h-5 w-5 text-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>{isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-full transition-colors",
                        isMicrophoneEnabled 
                          ? "bg-primary/20 hover:bg-primary/30" 
                          : "bg-destructive/20 hover:bg-destructive/30"
                      )}
                      onClick={toggleMicrophone}
                    >
                      {isMicrophoneEnabled ? (
                        <Mic className="h-5 w-5 text-foreground" />
                      ) : (
                        <MicOff className="h-5 w-5 text-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>{isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-full transition-colors",
                        isScreenShareEnabled 
                          ? "bg-primary/20 hover:bg-primary/30" 
                          : "bg-zinc-500/20 hover:bg-zinc-500/30"
                      )}
                      onClick={toggleScreenShare}
                    >
                      <MonitorUp className={cn("h-5 w-5", isScreenShareEnabled ? "text-foreground" : "text-foreground")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>{isScreenShareEnabled ? 'Stop sharing' : 'Share screen'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-full transition-colors",
                        isChatOpen 
                          ? "bg-primary/20 hover:bg-primary/30" 
                          : "bg-zinc-500/20 hover:bg-zinc-500/30"
                      )}
                      onClick={toggleChat}
                    >
                      <MessageSquare className={cn("h-5 w-5", "text-foreground")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>{isChatOpen ? 'Close chat' : 'Open chat'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-full transition-colors",
                        isSettingsOpen
                          ? "bg-primary/20 hover:bg-primary/30"
                          : "bg-zinc-500/20 hover:bg-zinc-500/30"
                      )}
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    >
                      <Settings className={cn("h-5 w-5", "text-foreground")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="mx-2 h-8" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-destructive/20 hover:bg-destructive/30"
                      onClick={handleOnLeave}
                    >
                      <LogOut className="h-5 w-5 text-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>Leave room</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Settings Menu */}
          {isSettingsOpen && <SettingsMenu />}

          {/* Room Status */}
          <div className="absolute bottom-16 right-4 z-50 flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex gap-2">
                    <DebugMode />
                    <RecordingIndicator />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Room Status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Add ChatSidebar */}
          <ChatSidebar />
        </div>
      </LiveKitRoom>
      <Toaster />
    </Card>
  );
}
