'use client';
import * as React from 'react';
import { Track } from 'livekit-client';
import {
  useMaybeLayoutContext,
  MediaDeviceMenu,
  TrackToggle,
  useRoomContext,
  useIsRecording,
  useMediaDevices,
} from '@livekit/components-react';
import { useKrispNoiseFilter } from '@livekit/components-react/krisp';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';
import { useRecordingStore } from '@/store/recording';
import { Card } from '@/components/ui/card';
import { useBlueSkyStore } from '@/store/bluesky';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("media");

  const { isNoiseFilterEnabled, setNoiseFilterEnabled, isNoiseFilterPending } =
    useKrispNoiseFilter();

  const [isRecording, setIsRecording] = React.useState(false);
  const { startRecording, stopRecording, isRecording: storeIsRecording } = useRecordingStore();

  const { isAuthenticated, handle, login, logout } = useBlueSkyStore();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [recordingTitle, setRecordingTitle] = React.useState('');
  const [recordingDescription, setRecordingDescription] = React.useState('');
  const [saveLocal, setSaveLocal] = React.useState(true);
  const [uploadToPDS, setUploadToPDS] = React.useState(false);
  const [customDirectory, setCustomDirectory] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    // enable Krisp by default
    setNoiseFilterEnabled(true);
  }, []);

  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast({
        title: "Recording Started",
        description: "Local recording has started. The file will be saved in your downloads when you stop.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Failed to start recording. Please check your permissions.",
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
      setShowSaveDialog(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Failed to stop recording.",
      });
    }
  };

  const handleSaveRecording = async () => {
    try {
      setIsSaving(true);
      await useRecordingStore.getState().saveRecording({
        title: recordingTitle,
        description: recordingDescription,
        saveLocal,
        uploadToPDS,
        customDirectory: customDirectory || undefined
      });

      toast({
        title: "Recording Saved",
        description: uploadToPDS 
          ? "Recording has been saved and uploaded to your PDS."
          : "Recording has been saved locally.",
      });

      // Reset form
      setRecordingTitle('');
      setRecordingDescription('');
      setCustomDirectory('');
      setShowSaveDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save recording.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRoomRecording = async () => {
    if (!recordingEndpoint) {
      throw TypeError('No recording endpoint specified');
    }
    if (room.isE2EEEnabled) {
      throw Error('Recording of encrypted meetings is currently not supported');
    }
    setIsRecording(true);
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
      setIsRecording(false);
    }
  };

  const handleBlueSkyLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await login(identifier, password);
      toast({
        title: "Login Successful",
        description: "Successfully connected to BlueSky.",
      });
      setIdentifier('');
      setPassword('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Failed to login');
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Failed to connect to BlueSky. Please check your credentials.",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Card className="fixed right-4 top-4 z-50 w-80 p-4 shadow-lg">
        <div className="space-y-4">
          <div>
            <Label>Camera</Label>
            <MediaDeviceMenu kind="videoinput" />
          </div>

          <div>
            <Label>Microphone</Label>
            <MediaDeviceMenu kind="audioinput" />
          </div>

          <div className="space-y-2">
            <Label>Local Recording</Label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Record Meeting</Label>
                <p className="text-sm text-muted-foreground">
                  Save recording locally in your browser
                </p>
              </div>
              <Button
                variant={storeIsRecording ? "destructive" : "default"}
                onClick={storeIsRecording ? handleStopRecording : handleStartRecording}
              >
                {storeIsRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>BlueSky Integration</Label>
            {isAuthenticated ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Connected as</Label>
                  <p className="text-sm text-muted-foreground">{handle}</p>
                </div>
                <Button variant="outline" onClick={logout}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-2 rounded-lg border p-3">
                <div className="space-y-2">
                  <Label>BlueSky Handle</Label>
                  <Input
                    type="text"
                    placeholder="your.handle"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-destructive">{loginError}</p>
                )}
                <Button
                  className="w-full"
                  onClick={handleBlueSkyLogin}
                  disabled={isLoggingIn || !identifier || !password}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect to BlueSky'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Recording</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Meeting Recording"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={recordingDescription}
                onChange={(e) => setRecordingDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save-local"
                  checked={saveLocal}
                  onCheckedChange={(checked) => setSaveLocal(checked as boolean)}
                />
                <Label htmlFor="save-local">Save locally</Label>
              </div>

              {saveLocal && (
                <div className="space-y-2 pl-6">
                  <Label>Custom Save Directory (optional)</Label>
                  <Input
                    placeholder="/path/to/directory"
                    value={customDirectory}
                    onChange={(e) => setCustomDirectory(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="upload-pds"
                  checked={uploadToPDS}
                  onCheckedChange={(checked) => setUploadToPDS(checked as boolean)}
                  disabled={!isAuthenticated}
                />
                <Label htmlFor="upload-pds">
                  Upload to PDS
                  {!isAuthenticated && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Requires BlueSky login)
                    </span>
                  )}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRecording}
              disabled={isSaving || (!saveLocal && !uploadToPDS)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Recording'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
