'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { RefreshCw, Lock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { generateRoomName, randomString, encodePassphrase } from '@/lib/client-utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const roomSchema = z.object({
  roomName: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
});

function MeetingSettings(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const roomNameRef = useRef<HTMLInputElement>(null);
  const [roomName, setRoomName] = useState(generateRoomName());
  const [validationError, setValidationError] = useState('');

  const refreshRoomName = () => {
    const newName = generateRoomName();
    setRoomName(newName);
    setValidationError('');
  };

  const startMeeting = () => {
    try {
      roomSchema.parse({ roomName });
      if (e2ee) {
        router.push(`/rooms/${roomName}#${encodePassphrase(sharedPassphrase)}`);
      } else {
        router.push(`/rooms/${roomName}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError('Room name must contain only lowercase letters, numbers, and hyphens');
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          <CardTitle>Start a Meeting</CardTitle>
        </div>
        <CardDescription>
          Create a secure video meeting room instantly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex flex-row gap-2 items-center">
              <div className="flex-grow">
                <Input
                  ref={roomNameRef}
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="Room Name"
                  className={cn(
                    "font-mono text-sm transition-colors",
                    validationError ? 'border-destructive' : ''
                  )}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshRoomName}
                className="flex-shrink-0 hover:bg-muted"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {validationError && (
              <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                {validationError}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-e2ee"
                checked={e2ee}
                onCheckedChange={(checked) => setE2ee(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="use-e2ee"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Enable end-to-end encryption
                </Label>
              </div>
            </div>

            {e2ee && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="passphrase" className="text-sm">
                  Passphrase
                </Label>
                <Input
                  id="passphrase"
                  type="password"
                  value={sharedPassphrase}
                  onChange={(ev) => setSharedPassphrase(ev.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </div>

          <Button
            variant="default"
            size="lg"
            className="w-full font-medium"
            onClick={startMeeting}
          >
            Start Meeting
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MeetingSettings;
