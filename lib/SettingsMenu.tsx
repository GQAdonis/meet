'use client';
import * as React from 'react';
import { Track } from 'livekit-client';
import {
  useMaybeLayoutContext,
  MediaDeviceMenu,
  TrackToggle,
  useRoomContext,
  useIsRecording,
} from '@livekit/components-react';
import { useKrispNoiseFilter } from '@livekit/components-react/krisp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * @alpha
 */
export interface SettingsMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * @alpha
 */
export function SettingsMenu(props: SettingsMenuProps) {
  const layoutContext = useMaybeLayoutContext();
  const room = useRoomContext();
  const recordingEndpoint = process.env.NEXT_PUBLIC_LK_RECORD_ENDPOINT;

  const settings = React.useMemo(() => {
    return {
      media: { camera: true, microphone: true, label: 'Media Devices', speaker: true },
      effects: { label: 'Effects' },
      recording: recordingEndpoint ? { label: 'Recording' } : undefined,
    };
  }, []);

  const tabs = React.useMemo(
    () => Object.keys(settings).filter((t) => t !== undefined) as Array<keyof typeof settings>,
    [settings],
  );
  const [activeTab, setActiveTab] = React.useState(tabs[0]);

  const { isNoiseFilterEnabled, setNoiseFilterEnabled, isNoiseFilterPending } =
    useKrispNoiseFilter();

  React.useEffect(() => {
    // enable Krisp by default
    setNoiseFilterEnabled(true);
  }, []);

  const isRecording = useIsRecording();
  const [initialRecStatus, setInitialRecStatus] = React.useState(isRecording);
  const [processingRecRequest, setProcessingRecRequest] = React.useState(false);

  React.useEffect(() => {
    if (initialRecStatus !== isRecording) {
      setProcessingRecRequest(false);
    }
  }, [isRecording, initialRecStatus]);

  const toggleRoomRecording = async () => {
    if (!recordingEndpoint) {
      throw TypeError('No recording endpoint specified');
    }
    if (room.isE2EEEnabled) {
      throw Error('Recording of encrypted meetings is currently not supported');
    }
    setProcessingRecRequest(true);
    setInitialRecStatus(isRecording);
    let response: Response;
    if (isRecording) {
      response = await fetch(recordingEndpoint + `/stop?roomName=${room.name}`);
    } else {
      response = await fetch(recordingEndpoint + `/start?roomName=${room.name}`);
    }
    if (response.ok) {
    } else {
      console.error(
        'Error handling recording request, check server logs:',
        response.status,
        response.statusText,
      );
      setProcessingRecRequest(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg" {...props}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={(value: string) => {
            if (value === "media" || value === "effects" || value === "recording") {
              setActiveTab(value);
            }
          }} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 gap-4">
            {tabs.map(
              (tab) =>
                settings[tab] && (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {
                      // @ts-ignore
                      settings[tab].label
                    }
                  </TabsTrigger>
                ),
            )}
          </TabsList>
          <div className="mt-6 space-y-6">
            {activeTab === 'media' && (
              <>
                {settings.media && settings.media.camera && (
                  <>
                    <h3>Camera</h3>
                    <div className="flex items-center justify-between gap-4">
                      <TrackToggle source={Track.Source.Camera}>
                        <Button variant="outline" className="w-32">Camera</Button>
                      </TrackToggle>
                      <div className="flex-1">
                        <MediaDeviceMenu kind="videoinput" />
                      </div>
                    </div>
                  </>
                )}
                {settings.media && settings.media.microphone && (
                  <>
                    <h3>Microphone</h3>
                    <div className="flex items-center justify-between gap-4">
                      <TrackToggle source={Track.Source.Microphone}>
                        <Button variant="outline" className="w-32">Microphone</Button>
                      </TrackToggle>
                      <div className="flex-1">
                        <MediaDeviceMenu kind="audioinput" />
                      </div>
                    </div>
                  </>
                )}
                {settings.media && settings.media.speaker && (
                  <>
                    <h3>Speaker & Headphones</h3>
                    <div className="flex items-center justify-between gap-4">
                      <Button variant="outline" className="w-32">Audio Output</Button>
                      <div className="flex-1">
                        <MediaDeviceMenu kind="audiooutput" />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {activeTab === 'effects' && (
              <>
                <h3>Audio</h3>
                <div className="flex items-center justify-between py-4">
                  <label htmlFor="noise-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Enhanced Noise Cancellation
                  </label>
                  <Switch
                    id="noise-filter"
                    checked={isNoiseFilterEnabled}
                    onCheckedChange={setNoiseFilterEnabled}
                    disabled={isNoiseFilterPending}
                  />
                </div>
              </>
            )}
            {activeTab === 'recording' && (
              <>
                <h3>Record Meeting</h3>
                <section>
                  <p>
                    {isRecording
                      ? 'Meeting is currently being recorded'
                      : 'No active recordings for this meeting'}
                  </p>
                  <Button 
                    variant={isRecording ? "destructive" : "default"}
                    disabled={processingRecRequest} 
                    onClick={() => toggleRoomRecording()}
                    className="mt-4"
                  >
                    {isRecording ? 'Stop' : 'Start'} Recording
                  </Button>
                </section>
              </>
            )}
          </div>
        </Tabs>
        <div className="flex justify-end mt-6 px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => layoutContext?.widget.dispatch?.({ msg: 'toggle_settings' })}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
