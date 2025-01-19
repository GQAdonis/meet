import { create } from 'zustand';
import { Room, LocalParticipant, TrackPublication, Track } from 'livekit-client';
import { useBlueSkyStore } from './bluesky';

interface RecordingState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  recordedChunks: Blob[];
  currentRoom: Room | null;
  lastRecordingBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  setRoom: (room: Room | null) => void;
  saveRecording: (options: {
    title?: string;
    description?: string;
    saveLocal?: boolean;
    uploadToPDS?: boolean;
    customDirectory?: string;
  }) => Promise<void>;
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  isRecording: false,
  mediaRecorder: null,
  recordedChunks: [],
  currentRoom: null,
  lastRecordingBlob: null,

  setRoom: (room: Room | null) => {
    set({ currentRoom: room });
  },

  startRecording: async () => {
    const { currentRoom } = get();
    if (!currentRoom) {
      throw new Error('No active room found');
    }

    try {
      // Get all tracks from the room
      const mediaStreamTracks: MediaStreamTrack[] = [];
      
      // Get local participant tracks
      currentRoom.localParticipant.trackPublications.forEach((publication) => {
        const track = publication.track;
        if (track && (track.kind === 'video' || track.kind === 'audio')) {
          const mediaStreamTrack = track.mediaStreamTrack;
          if (mediaStreamTrack) {
            mediaStreamTracks.push(mediaStreamTrack);
          }
        }
      });

      // Get remote participant tracks
      currentRoom.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          const track = publication.track;
          if (track && (track.kind === 'video' || track.kind === 'audio')) {
            const mediaStreamTrack = track.mediaStreamTrack;
            if (mediaStreamTrack) {
              mediaStreamTracks.push(mediaStreamTrack);
            }
          }
        });
      });

      if (mediaStreamTracks.length === 0) {
        throw new Error('No media tracks found to record');
      }

      // Create a MediaStream from the tracks
      const mediaStream = new MediaStream(mediaStreamTracks);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm'
      });

      // Set up data handling
      const recordedChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
          set({ recordedChunks });
        }
      };

      // Start recording
      mediaRecorder.start();
      set({ 
        isRecording: true,
        mediaRecorder,
        recordedChunks: []
      });

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  },

  stopRecording: async () => {
    const { mediaRecorder, recordedChunks } = get();
    
    if (!mediaRecorder) {
      throw new Error('No active recording found');
    }

    return new Promise<void>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        try {
          // Create blob from recorded chunks
          const blob = new Blob(recordedChunks, {
            type: 'video/webm'
          });

          set({
            isRecording: false,
            mediaRecorder: null,
            recordedChunks: [],
            lastRecordingBlob: blob
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      mediaRecorder.stop();
    });
  },

  saveRecording: async ({ title, description, saveLocal = true, uploadToPDS = false, customDirectory }) => {
    const { lastRecordingBlob } = get();
    if (!lastRecordingBlob) {
      throw new Error('No recording available to save');
    }

    try {
      // Save locally if requested
      if (saveLocal) {
        const url = URL.createObjectURL(lastRecordingBlob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `recording-${title || new Date().toISOString()}.webm`;
        
        // If custom directory is provided, try to use it
        if (customDirectory) {
          try {
            // Check if File System Access API is supported
            if (!('showDirectoryPicker' in window)) {
              throw new Error('File System Access API not supported');
            }
            
            // Request permission to access local file system
            const handle = await window.showDirectoryPicker();
            const dirHandle = await handle.getDirectoryHandle(customDirectory, { create: true });
            const fileHandle = await dirHandle.getFileHandle(a.download, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(lastRecordingBlob);
            await writable.close();
          } catch (error) {
            console.warn('Failed to save to custom directory, falling back to downloads:', error);
            a.click(); // Fallback to regular download
          }
        } else {
          a.click(); // Regular download if no custom directory
        }
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      // Upload to PDS if requested and authenticated
      if (uploadToPDS) {
        const blueSkyStore = useBlueSkyStore.getState();
        if (!blueSkyStore.isAuthenticated) {
          throw new Error('Must be authenticated to upload to PDS');
        }

        await blueSkyStore.uploadRecording(lastRecordingBlob, title || 'Meeting Recording', description);
      }

      // Clear the last recording after successful save
      set({ lastRecordingBlob: null });
    } catch (error) {
      console.error('Failed to save recording:', error);
      throw error;
    }
  }
})); 