import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/footer"
import { Header } from "@/components/header"
import { SignalField } from "@/components/signal-field"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

import { siteConf } from "@/config/conf"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
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
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="command-shell flex min-h-screen flex-col items-center bg-background">
              <SignalField />
              <Header />
              <div className="flex w-full flex-1">
                <div className="container relative z-10 flex max-w-5xl flex-1">
                  <div className="page-surface -mt-2 mb-4 w-full rounded-b-md rounded-t-none border-t-0 sm:mb-6">
                    <main className="flex flex-1 flex-col px-2 pb-3 pt-6 sm:px-4 sm:pt-7">
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
