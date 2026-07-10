import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { AmbientCanvas } from "@/components/ambient-canvas"
import Footer from "@/components/footer"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

import { siteConf } from "@/config/conf"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: new URL("https://cgnews.app"),
  title: {
    template: `%s | ${siteConf.title}`,
    default: siteConf.title,
  },
  description: siteConf.description,
  keywords: [
    "Next.js",
    "Shadcn",
    "React",
    "Tailwind CSS",
    "Server Components",
    "CGNews",
  ],
  authors: siteConf.authors,
  creator: siteConf.authors[0].name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConf.title,
    title: siteConf.title,
    description: siteConf.description,
    url: "https://cgnews.app",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontMono.variable
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <div className="command-shell flex min-h-screen flex-col items-center">
              <AmbientCanvas />
              <Header />
              <div className="flex w-full flex-1">
                <div className="container relative z-10 flex max-w-5xl flex-1">
                  <div className="page-surface w-full">
                    <main className="flex flex-1 flex-col pb-12 pt-5 sm:pt-7">
                      {children}
                    </main>
                  </div>
                </div>
              </div>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
