import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { ReactNode } from 'react';

interface LiveKitProviderProps {
  children: ReactNode;
  token: string;
  serverUrl: string;
  connect?: boolean;
  video?: boolean;
  audio?: boolean;
}

export function LiveKitProvider({
  children,
  token,
  serverUrl,
  connect = true,
  video = false,
  audio = false,
}: LiveKitProviderProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={connect}
      video={video}
      audio={audio}
      data-lk-theme="default"
    >
      {children}
    </LiveKitRoom>
  );
}

export function LiveKitVideoConference() {
  return <VideoConference />;
}
