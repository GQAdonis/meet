import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface CustomSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomSettingsSheet({ open, onOpenChange }: CustomSettingsSheetProps) {
  const router = useRouter();
  const [pdsServer, setPdsServer] = React.useState('https://bsky.social');
  const [e2ee, setE2ee] = React.useState(false);
  const [sharedPassphrase, setSharedPassphrase] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serverUrl = formData.get('serverUrl') as string;
    const token = formData.get('token') as string;

    const queryParams = new URLSearchParams({
      liveKitUrl: serverUrl,
      token: token,
      pdsUrl: pdsServer,
    });

    const url = `/custom/?${queryParams.toString()}${e2ee ? `#${encodeURIComponent(sharedPassphrase)}` : ''}`;
    router.push(url);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <SheetHeader className="mb-6">
            <SheetTitle className="text-white">Custom Setup</SheetTitle>
            <SheetDescription>
              Connect Olympus Meet to your preferred LiveKit server while authenticating through your chosen AT Protocol PDS server.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pdsUrl">PDS Server URL</Label>
              <Input
                id="pdsUrl"
                name="pdsUrl"
                type="url"
                value={pdsServer}
                onChange={(e) => setPdsServer(e.target.value)}
                placeholder="BlueSky PDS Server URL: https://bsky.social"
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverUrl">LiveKit Server URL</Label>
              <Input
                id="serverUrl"
                name="serverUrl"
                type="url"
                placeholder="LiveKit Server URL: wss://*.livekit.cloud"
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Textarea
                id="token"
                name="token"
                placeholder="Token"
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40"
                required
                rows={5}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-e2ee"
                  checked={e2ee}
                  onCheckedChange={(checked) => setE2ee(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-[#FFD700] data-[state=checked]:text-black"
                />
                <Label htmlFor="use-e2ee" className="text-white">Enable end-to-end encryption</Label>
              </div>

              {e2ee && (
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    value={sharedPassphrase}
                    onChange={(ev) => setSharedPassphrase(ev.target.value)}
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/40"
                    required={e2ee}
                  />
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button
              type="submit"
              className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
            >
              Connect
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
} 