import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/ui/themes"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Real-time collaborative system design workspace",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "var(--accent-primary)",
          colorPrimaryForeground: "var(--bg-base)",
          colorForeground: "var(--text-primary)",
          colorMutedForeground: "var(--text-muted)",
          colorBackground: "var(--bg-elevated)",
          colorInput: "var(--bg-subtle)",
          colorInputForeground: "var(--text-primary)",
          colorBorder: "var(--border-default)",
          colorRing: "var(--accent-primary)",
          colorNeutral: "var(--border-subtle)",
        },
        elements: {
          rootBox: "font-sans antialiased",
          card: "font-sans",
          formButtonPrimary:
            "!bg-[var(--accent-primary)] !text-[var(--bg-base)] hover:!opacity-90",
          footerActionLink: "!text-[var(--accent-primary)] font-medium",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
