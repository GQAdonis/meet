'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black/70 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Image src="/images/skytok-long.png" alt="SkyTok Logo" width={150} height={50} />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-white">Login</Button>
        <Button variant="ghost" className="text-white">Register</Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="/images/avatar-placeholder.png" alt="User Avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <span className="flex items-center gap-2">
                <i className="lucide lucide-user" /> Profile
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="flex items-center gap-2">
                <i className="lucide lucide-settings" /> Settings
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="flex items-center gap-2">
                <i className="lucide lucide-log-out" /> Logout
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
