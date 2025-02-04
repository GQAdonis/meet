'use client';

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card } from "@/components/ui/card"
import { Camera, MessageSquare, Users, Video, Shield, User, Settings, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { RoomCreator } from "@/components/meeting/room-creator"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import '@/styles/home.css'

export default function Home() {
  const { isAuthenticated, logout, profile } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/skytok-long.png"
              alt="SkyTok Meet Logo"
              width={120}
              height={30}
              className="h-8 w-auto"
            />
            <span className="font-semibold text-xl text-foreground">Meet</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6">
              <Link href="#features" className="text-sm font-medium text-foreground hover:text-primary">
                Features
              </Link>
              <Link href="#about" className="text-sm font-medium text-foreground hover:text-primary">
                About
              </Link>
              <Link href="#contact" className="text-sm font-medium text-foreground hover:text-primary">
                Contact
              </Link>
            </nav>
            <ThemeToggle />
            {isAuthenticated() && profile && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
                      <AvatarImage src={profile.avatar} alt={profile.displayName} />
                      <AvatarFallback>{profile.displayName?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-md border-zinc-800">
                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()} className="text-white hover:bg-white/10 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            {!isAuthenticated() && (
              <Link href="/login">
                <Button variant="default">
                  Sign In with BlueSky
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="bg-background">
        <section className="relative min-h-[800px] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-background"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-6xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Video Conferencing for the <span className="text-primary">Decentralized Web</span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                Join the future of communication with SkyTok Meet. Powered by the AT Protocol for secure, decentralized
                video conferencing.
              </p>

              <div className="mt-8 mb-12">
                <RoomCreator />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose SkyTok Meet?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <Video className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">HD Video Conferencing</h3>
                <p className="text-muted-foreground">
                  Crystal clear video and audio quality for seamless communication.
                </p>
              </Card>
              <Card className="p-6">
                <Shield className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-2">AT Protocol Security</h3>
                <p className="text-muted-foreground">Decentralized authentication and end-to-end encryption.</p>
              </Card>
              <Card className="p-6">
                <Camera className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">Meeting Recording</h3>
                <p className="text-muted-foreground">Record and save your meetings for future reference.</p>
              </Card>
              <Card className="p-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Virtual Rooms</h3>
                <p className="text-muted-foreground">Create dedicated spaces for teams and communities.</p>
              </Card>
              <Card className="p-6">
                <MessageSquare className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Built-in Chat</h3>
                <p className="text-muted-foreground">Real-time messaging powered by the AT Protocol.</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12 text-foreground">Ready to Get Started?</h2>
            <Link href="/login">
              <Button size="lg" variant="default">
                Join SkyTok Meet Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/skytok-long.png"
                alt="SkyTok Meet Logo"
              width={80}
              height={20}
              className="h-6 w-auto"
              />
              <span className="text-sm text-muted-foreground"> 2024 SkyTok Meet. All rights reserved.</span>
            </div>
            <nav className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
