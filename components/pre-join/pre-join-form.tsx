"use client";

import * as React from "react";
import { PreJoin } from "@livekit/components-react";
import "@livekit/components-styles";
import { useAuth } from "@/hooks/use-auth";
import { useRoom } from "@/hooks/use-room";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PreJoinFormProps {
  roomName: string;
  error?: string;
}

export function PreJoinForm({ roomName, error }: PreJoinFormProps): JSX.Element {
  const { session } = useAuth();
  const { setLocalUser, joinRoom, initializeRoom, isInitializing, connectionDetails } = useRoom();
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Only initialize room once when the component mounts
  React.useEffect(() => {
    if (session?.handle && !hasInitialized) {
      initializeRoom(roomName, session.handle);
      setHasInitialized(true);
    }
  }, [session?.handle, roomName, hasInitialized, initializeRoom]);

  // Handle PreJoin submission
  const handlePreJoinSubmit = React.useCallback(async (data: any) => {
    try {
      await setLocalUser(data);
      await joinRoom();
    } catch (err) {
      toast.error('Failed to join room', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [setLocalUser, joinRoom]);

  if (isInitializing || !connectionDetails) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 space-y-4">
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold">Setting Up Your Room</h2>
          <p className="text-sm text-muted-foreground">
            {isInitializing ? 'Initializing room...' : 'Waiting for connection details...'}
          </p>
        </div>
        <Progress value={isInitializing ? 40 : 80} className="w-full" />
      </Card>
    );
  }

  if (error) {
    toast.error('Room Initialization Error', {
      description: error,
    });

    return (
      <Alert variant="destructive" className="w-full max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="block mt-2 text-sm underline hover:text-primary"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  const handleJoin = async (data: { username: string; videoEnabled: boolean; audioEnabled: boolean; videoDeviceId?: string; audioDeviceId?: string }) => {
    if (!session) return;
    setLocalUser({
      username: data.username || session.handle,
      videoEnabled: data.videoEnabled,
      audioEnabled: data.audioEnabled,
      videoDeviceId: data.videoDeviceId || "",
      audioDeviceId: data.audioDeviceId || "",
    });
    await joinRoom();
  };

  return (
    <PreJoin
      onSubmit={handleJoin}
      defaults={{
        username: session?.handle || "",
        videoEnabled: true,
        audioEnabled: true,
      }}
      style={{
        borderRadius: "var(--radius)",
        backgroundColor: "var(--card)",
        border: "var(--border)",
      }}
    />
  );
}
