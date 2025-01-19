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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * @alpha
 */
export interface SettingsMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * @alpha
 */
export function SettingsMenu({ className, ...props }: SettingsMenuProps) {
  const layoutContext = useMaybeLayoutContext();
  const room = useRoomContext();
  const recordingEndpoint = process.env.NEXT_PUBLIC_LK_RECORD_ENDPOINT;

  const [activeTab, setActiveTab] = React.useState("media");

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
    <Dialog defaultOpen={true} onOpenChange={() => layoutContext?.widget.dispatch?.({ msg: 'toggle_settings' })}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="media" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            {recordingEndpoint && <TabsTrigger value="recording">Recording</TabsTrigger>}
          </TabsList>
          <TabsContent value="media" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Camera</Label>
                <div className="flex items-center gap-2">
                  <TrackToggle source={Track.Source.Camera} className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                    "h-9 px-4 py-2"
                  )}>
                    Camera
                  </TrackToggle>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      <MediaDeviceMenu kind="videoinput" />
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Microphone</Label>
                <div className="flex items-center gap-2">
                  <TrackToggle source={Track.Source.Microphone} className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                    "h-9 px-4 py-2"
                  )}>
                    Microphone
                  </TrackToggle>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      <MediaDeviceMenu kind="audioinput" />
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Speaker & Headphones</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select audio output" />
                  </SelectTrigger>
                  <SelectContent>
                    <MediaDeviceMenu kind="audiooutput" />
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="noise-filter">Enhanced Noise Cancellation</Label>
                <Switch
                  id="noise-filter"
                  checked={isNoiseFilterEnabled}
                  onCheckedChange={setNoiseFilterEnabled}
                  disabled={isNoiseFilterPending}
                />
              </div>
            </div>
          </TabsContent>

          {recordingEndpoint && (
            <TabsContent value="recording" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Record Meeting</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRecording
                      ? 'Meeting is currently being recorded'
                      : 'No active recordings for this meeting'}
                  </p>
                  <Button 
                    disabled={processingRecRequest}
                    onClick={toggleRoomRecording}
                    variant={isRecording ? "destructive" : "default"}
                  >
                    {isRecording ? 'Stop' : 'Start'} Recording
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
