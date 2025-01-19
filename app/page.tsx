'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRoomStore } from '@/store/room';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { CustomSettingsSheet } from '@/app/components/ui/custom-settings-sheet';

export default function Home() {
  const router = useRouter();
  const { roomName, setRoomName, generateNewRoomName } = useRoomStore();
  const [customSettingsOpen, setCustomSettingsOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      router.push(`/rooms/${roomName}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="container flex h-16 items-center px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-2xl text-[#FFD700]">⚡</span>
            <span className="text-2xl text-white">Olympus Meet</span>
          </Link>
        </div>
      </nav>

      <main className="flex min-h-screen flex-col">
        <div className="relative flex-1">
          {/* Hero Section */}
          <div 
            className="absolute inset-0 bg-[url('/images/cover.png')] bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/cover.png')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
          </div>
          
          {/* Content */}
          <div className="relative flex min-h-screen flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-4 text-center mb-8 px-4">
              <h1 className="text-6xl font-bold tracking-tighter text-white">
                Olympus Meet
              </h1>
              <p className="text-xl text-white/80 max-w-[600px]">
                Experience enterprise-grade video conferencing built for the Olympus social network. 
                Connect, collaborate, and communicate with unparalleled security and clarity.
              </p>
            </div>

            <div className="w-full max-w-md px-4">
              <Card className="bg-black/70 backdrop-blur-sm border-white/10">
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle className="text-white">Start or Join Meeting</CardTitle>
                    <CardDescription className="text-white/60">
                      Enter a room name or use the generated one
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="roomName" className="text-white/80">Room Name</Label>
                        <div className="flex gap-2">
                          <Input
                            id="roomName"
                            placeholder="Enter room name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/40"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={generateNewRoomName}
                            className="bg-black border-white/20 text-white hover:bg-black/80"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      Start Meeting
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-black border-white/20 text-white hover:bg-black/80"
                      onClick={() => setCustomSettingsOpen(true)}
                    >
                      Custom Setup
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/50">
        <div className="container mx-auto px-8">
          <div className="flex h-24 items-center justify-between">
            <Link href="https://olympus.prometheus-platform.io" className="flex items-center gap-2 font-semibold">
              <span className="text-2xl text-[#FFD700]">⚡</span>
              <span className="text-2xl text-white">Olympus Social</span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="https://olympus.social" className="text-sm text-white hover:text-[#FFD700]">
                Olympus Social
              </Link>
              <Link href="https://meet.olympus.social" className="text-sm text-white hover:text-[#FFD700]">
                Olympus Meet
              </Link>
              <Link href="https://github.com/gqadonis/meet" className="text-sm text-white hover:text-[#FFD700]">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <CustomSettingsSheet 
        open={customSettingsOpen}
        onOpenChange={setCustomSettingsOpen}
      />
    </>
  );
}
