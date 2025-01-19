import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useSettingsStore } from '@/store/settings';
import { useRoomStore } from '@/store/room';
import { cn } from '@/lib/utils';

interface CustomSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomSettingsSheet({ open, onOpenChange }: CustomSettingsSheetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { settings, setSettings } = useSettingsStore();
  const { roomName, setRoomName } = useRoomStore();

  const [localSettings, setLocalSettings] = React.useState({
    pdsServer: settings.pdsServer,
    liveKitServer: settings.liveKitServer,
    token: settings.token,
    e2ee: settings.e2ee,
    passphrase: settings.passphrase,
    roomName: roomName,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serverUrl = formData.get('serverUrl') as string;
    const token = formData.get('token') as string;
    const roomName = formData.get('roomName') as string;

    const queryParams = new URLSearchParams({
      liveKitUrl: serverUrl,
      token: token,
      pdsUrl: localSettings.pdsServer,
    });

    const url = `/custom/?${queryParams.toString()}${localSettings.e2ee ? `#${encodeURIComponent(localSettings.passphrase)}` : ''}`;
    router.push(url);
  };

  const handleSave = () => {
    setSettings({
      pdsServer: localSettings.pdsServer,
      liveKitServer: localSettings.liveKitServer,
      token: localSettings.token,
      e2ee: localSettings.e2ee,
      passphrase: localSettings.passphrase,
    });
    setRoomName(localSettings.roomName);
    toast({
      title: "Settings saved",
      description: "Your custom settings have been saved successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl bg-background">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SheetHeader className="space-y-2">
            <SheetTitle>Custom Setup</SheetTitle>
            <SheetDescription>
              Connect Olympus Meet to your preferred LiveKit server while authenticating through your chosen AT Protocol PDS server.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                name="roomName"
                value={localSettings.roomName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, roomName: e.target.value }))}
                placeholder="Enter room name"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdsUrl">PDS Server URL</Label>
              <Input
                id="pdsUrl"
                name="pdsUrl"
                type="url"
                value={localSettings.pdsServer}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, pdsServer: e.target.value }))}
                placeholder="BlueSky PDS Server URL: https://bsky.social"
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverUrl">LiveKit Server URL</Label>
              <Input
                id="serverUrl"
                name="serverUrl"
                type="url"
                value={localSettings.liveKitServer}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, liveKitServer: e.target.value }))}
                placeholder="LiveKit Server URL: wss://*.livekit.cloud"
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Textarea
                id="token"
                name="token"
                value={localSettings.token}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, token: e.target.value }))}
                placeholder="Token"
                className="bg-background"
                required
                rows={5}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-e2ee"
                  checked={localSettings.e2ee}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, e2ee: checked as boolean }))}
                  className="border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <Label htmlFor="use-e2ee">Enable end-to-end encryption</Label>
              </div>

              {localSettings.e2ee && (
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    value={localSettings.passphrase}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, passphrase: e.target.value }))}
                    className="bg-background"
                    required={localSettings.e2ee}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Button
              type="button"
              onClick={handleSave}
              variant="secondary"
              className="w-full"
            >
              Save Settings
            </Button>
            <Button
              type="submit"
              className="w-full"
            >
              Connect
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
} 