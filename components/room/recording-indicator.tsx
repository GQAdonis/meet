'use client';

import { Circle } from "lucide-react";

interface RecordingIndicatorProps {
  isRecording: boolean;
}

export function RecordingIndicator({ isRecording }: RecordingIndicatorProps) {
  if (!isRecording) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full border border-red-500/20">
      <Circle className="w-3 h-3 fill-red-500 animate-pulse" />
      <span className="text-sm font-medium">Recording</span>
    </div>
  );
}
