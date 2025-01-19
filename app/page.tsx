'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import styles from '@/styles/Home.module.css';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

interface TabChildProps {
  label: string;
}

interface TabsProps {
  children: React.ReactElement<TabChildProps>[];
}

function Tabs({ children }: TabsProps): React.ReactElement {
  const searchParams = useSearchParams();
  const tabIndex = searchParams?.get('tab') === 'custom' ? 1 : 0;

  const router = useRouter();
  function onTabSelected(index: number) {
    const tab = index === 1 ? 'custom' : 'demo';
    router.push(`/?tab=${tab}`);
  }

  const tabs = React.Children.map(children, (child, index) => {
    if (!React.isValidElement<TabChildProps>(child)) return null;
    return (
      <Button
        variant={tabIndex === index ? "default" : "secondary"}
        onClick={() => onTabSelected(index)}
        className="w-full"
        size="lg"
      >
        {child.props.label}
      </Button>
    );
  });

  return (
    <Card className={styles.tabContainer}>
      <div className={styles.tabSelect}>{tabs}</div>
      {React.Children.toArray(children)[tabIndex]}
    </Card>
  );
}

function DemoMeetingTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  
  const startMeeting = () => {
    if (e2ee) {
      router.push(`/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`);
    } else {
      router.push(`/rooms/${generateRoomId()}`);
    }
  };
  
  return (
    <div className={styles.tabContent}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Try Olympus Meet for free using your BlueSky account
        </h3>
        <p className="text-sm text-muted-foreground">
          Start a meeting and invite your friends to join. Use the custom button to change servers.
        </p>
      </div>
      <Button 
        size="lg"
        className="w-full"
        onClick={startMeeting}
      >
        Start Meeting
      </Button>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-e2ee"
            checked={e2ee}
            onCheckedChange={(checked) => setE2ee(checked as boolean)}
          />
          <Label htmlFor="use-e2ee">Enable end-to-end encryption</Label>
        </div>
        {e2ee && (
          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CustomConnectionTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const [pdsServer, setPdsServer] = useState('https://bsky.social');

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const serverUrl = formData.get('serverUrl');
    const token = formData.get('token');
    const pdsUrl = formData.get('pdsUrl');
    if (e2ee) {
      router.push(
        `/custom/?liveKitUrl=${serverUrl}&token=${token}&pdsUrl=${pdsUrl}#${encodePassphrase(sharedPassphrase)}`,
      );
    } else {
      router.push(`/custom/?liveKitUrl=${serverUrl}&token=${token}&pdsUrl=${pdsUrl}`);
    }
  };
  
  return (
    <form className={styles.tabContent} onSubmit={onSubmit}>
      <p className="text-lg text-muted-foreground">
        Connect Olympus Meet to your preferred LiveKit server while authenticating through your chosen AT Protocol PDS server for a fully customized experience.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdsUrl">PDS Server URL</Label>
          <Input
            id="pdsUrl"
            name="pdsUrl"
            type="url"
            value={pdsServer}
            onChange={(e) => setPdsServer(e.target.value)}
            placeholder="BlueSky PDS Server URL: https://bsky.social"
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
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <Textarea
            id="token"
            name="token"
            placeholder="Token"
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
            />
            <Label htmlFor="use-e2ee">Enable end-to-end encryption</Label>
          </div>
          {e2ee && (
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                value={sharedPassphrase}
                onChange={(ev) => setSharedPassphrase(ev.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      <Button
        size="lg"
        className="w-full"
        type="submit"
      >
        Connect
      </Button>
    </form>
  );
}

export default function Page() {
  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-2xl text-[#FFD700]">⚡</span>
          <span className='text-2xl text-white'>Olympus Meet</span>
        </Link>
        </div>
      </nav>
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.header}>
            <h1 className='text-4xl text-white'>Olympus Meet</h1>
            <h2 className='text-lg text-white'>
              Experience enterprise-grade video conferencing built for the Olympus social network. 
              Connect, collaborate, and communicate with unparalleled security and clarity.
            </h2>
          </div>
        </div>
        <div className={styles.content}>
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <Tabs>
              <DemoMeetingTab label="Start" />
              <CustomConnectionTab label="Custom" />
            </Tabs>
          </Suspense>
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
        <Link href="https://olympus.prometheus-platform.io" className="flex items-center gap-2 font-semibold">
          <span className="text-2xl text-[#FFD700]">⚡</span>
          <span className='text-2xl text-white'>Olympus Social</span>
        </Link>
          <div className={styles.footerLinks}>
            <a href="https://olympus.social" rel="noopener">Olympus Social</a>
            <a href="https://meet.olympus.social" rel="noopener">Olympus Meet</a>
            <a href="https://github.com/gqadonis/meet" rel="noopener">GitHub</a>
          </div>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} Olympus. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
