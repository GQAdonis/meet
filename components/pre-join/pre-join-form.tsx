"use client";

import * as React from "react";
import { PreJoin } from "@livekit/components-react";
import "@livekit/components-styles";
import styles from "./pre-join.module.css";
import { useAuth } from "@/hooks/use-auth";
import { useRoom } from "@/hooks/use-room";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

import { useRouter } from "next/navigation";

interface PreJoinFormProps {
  roomName: string;
  error?: string;
}

export function PreJoinForm({ roomName, error }: PreJoinFormProps): JSX.Element {
  const { session: sessionFunc } = useAuth();
  const { setLocalUser, joinRoom, initialized } = useRoom();
  const router = useRouter();

  if (!initialized) {
    toast.error("Something went wrong")
    router.push("/")
    return (
      <div className={styles["lk-prejoin-container"]}>
        <Progress />
      </div>
    )
  }

  const session = sessionFunc();

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
    <div className={styles["lk-prejoin-container"]}>
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
    </div>
  );
}
