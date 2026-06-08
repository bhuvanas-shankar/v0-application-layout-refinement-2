import type { Metadata } from "next"
import { Inter, Ubuntu } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ContentToolbar } from "@/components/content-toolbar"
import { ReportsProvider } from "@/contexts/reports-context"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const ubuntu = Ubuntu({ 
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
})

export const metadata: Metadata = {
  title: "TRM 2.0",
  description: "Tax Report Management",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ubuntu.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReportsProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="transition-opacity duration-150 ease-out bg-background flex flex-col h-screen overflow-hidden">
                <Suspense fallback={<div className="h-12 border-b border-border bg-card" />}>
                  <ContentToolbar />
                </Suspense>
                <div className="flex-1 overflow-hidden">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </ReportsProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
