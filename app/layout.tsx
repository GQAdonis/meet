import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { RoomContextProvider } from "@/components/providers/room-context-provider"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkyTok Meet - Video Conferencing with AT Protocol",
  description: "Decentralized video conferencing platform built on the AT Protocol",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RoomContextProvider>
            {children}
          </RoomContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

