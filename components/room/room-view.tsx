'use client';

import React from "react"
import { useRoom } from "@/hooks/use-room"
import { VideoConference, GridLayout, useTracks, TrackReference, isTrackReference } from "@livekit/components-react"
import { RoomAudioRenderer } from "@livekit/components-react"
import { Track } from 'livekit-client'
import { CustomParticipantTile } from "./custom-participant-tile"

interface RoomViewProps {
  onStartPrivateChat: (participantIdentity: string) => void;
}

export function RoomView({ onStartPrivateChat }: RoomViewProps) {
  const { localUser } = useRoom()

  if (!localUser) {
    console.error('Missing local user data');
    return null;
  }

  const tracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.Microphone, withPlaceholder: true },
  ]);

  const screenShareTracks = tracks.filter(isTrackReference);
  const webcamTracks = tracks.filter(isTrackReference);

  return (
    <div className="flex-grow relative">
      <VideoConference
        className="h-full w-full"
      >
        <RoomAudioRenderer />
        {screenShareTracks.length > 0 ? (
          <div className="grid grid-cols-[1fr,300px] h-full gap-2">
            <div className="relative">
              <CustomParticipantTile
                key={screenShareTracks[0].participant.identity}
                participant={screenShareTracks[0].participant}
                trackRef={screenShareTracks[0]}
                onStartPrivateChat={onStartPrivateChat}
              />
            </div>
            <div className="grid grid-rows-2 gap-2 overflow-y-auto">
              {webcamTracks.map((track) => (
                <CustomParticipantTile
                  key={track.participant.identity}
                  participant={track.participant}
                  trackRef={track}
                  onStartPrivateChat={onStartPrivateChat}
                />
              ))}
            </div>
          </div>
        ) : (
          <GridLayout tracks={tracks} className="h-full w-full">
            {tracks.map((track) => (
              <CustomParticipantTile
                key={track.participant.identity}
                participant={track.participant}
                trackRef={isTrackReference(track) ? track : undefined}
                onStartPrivateChat={onStartPrivateChat}
              />
            ))}
          </GridLayout>
        )}
      </VideoConference>
    </div>
  )
}
