import { create } from 'zustand';
import { AtpAgent, BlobRef } from '@atproto/api';
import { useSettingsStore } from './settings';

interface BlueSkyState {
  agent: AtpAgent | null;
  isAuthenticated: boolean;
  handle: string | null;
  did: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  uploadRecording: (recordingBlob: Blob, title: string, description?: string) => Promise<void>;
}

export const useBlueSkyStore = create<BlueSkyState>((set, get) => ({
  agent: null,
  isAuthenticated: false,
  handle: null,
  did: null,

  login: async (identifier: string, password: string) => {
    try {
      const { settings } = useSettingsStore.getState();
      const agent = new AtpAgent({ 
        service: settings.pdsServer 
      });

      const session = await agent.login({ 
        identifier, 
        password 
      });

      const profile = await agent.api.app.bsky.actor.getProfile({ 
        actor: session.data.handle 
      });

      set({
        agent,
        isAuthenticated: true,
        handle: profile.data.handle,
        did: profile.data.did,
      });
    } catch (error) {
      console.error('Failed to login to BlueSky:', error);
      throw error;
    }
  },

  logout: () => {
    const { settings } = useSettingsStore.getState();
    const newAgent = new AtpAgent({ 
      service: settings.pdsServer 
    });
    
    set({
      agent: newAgent,
      isAuthenticated: false,
      handle: null,
      did: null,
    });
  },

  uploadRecording: async (recordingBlob: Blob, title: string, description?: string) => {
    const { agent, isAuthenticated } = get();
    
    if (!agent || !isAuthenticated) {
      throw new Error('Not authenticated with BlueSky');
    }

    try {
      // Upload to BlueSky's blob store
      const response = await agent.uploadBlob(recordingBlob, {
        encoding: 'video/webm'
      });

      if (!response.success) {
        throw new Error('Failed to upload blob');
      }

      const { data: { blob } } = response;

      // Create a post with the video
      await agent.post({
        text: `${title}${description ? `\n\n${description}` : ''}`,
        embed: {
          $type: 'app.bsky.embed.external',
          external: {
            uri: blob.ref.toString(),
            title,
            description: description || '',
            thumb: blob,
          }
        },
      });
    } catch (error) {
      console.error('Failed to upload recording to BlueSky:', error);
      throw error;
    }
  },
})); 