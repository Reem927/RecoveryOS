import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { ActiveSessionProvider } from "@/lib/active-session"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "RecoveryOS — The Operating System for Modern Recovery",
  description:
    "RecoveryOS turns every pre-session check, live session, and long-term progress trend into one connected workspace — built for clinics, sports rehab, and performance teams.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#162532",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} bg-background`}>
        <body className="font-sans antialiased">
          <ActiveSessionProvider>
            {children}
            {process.env.NODE_ENV === "production" && <Analytics />}
          </ActiveSessionProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}