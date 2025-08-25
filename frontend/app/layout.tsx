import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/app/contexts/theme-context'
import { ThemeToggleButton } from '@/components/ui/theme-toggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'S2S Tracker',
  description: 'Minimal affiliate postback tracking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="s2s-tracker-theme">
          <div className="min-h-screen bg-background transition-colors">
            <header className="bg-card shadow-sm border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <h1 className="text-xl font-semibold text-foreground">
                    S2S Tracker
                  </h1>
                  <nav className="flex items-center space-x-4">
                    <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                      Home
                    </a>
                    <ThemeToggleButton />
                  </nav>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
