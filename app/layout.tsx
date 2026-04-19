import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ActiveSessionProvider } from "@/lib/active-session"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Hydrawav3 — Practitioner Recovery Platform",
  description:
    "Pre-session recovery assessments, live session control, and long-term patient progress — all in one practitioner workspace.",
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
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ActiveSessionProvider>{children}</ActiveSessionProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
