import type { Metadata } from "next"
import { Inter, Outfit, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/SessionProvider"
import { Toaster } from "@/components/ui/sonner"
import { ThemeInitializer } from "@/components/ThemeInitializer"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })

export const metadata: Metadata = {
  title: "SocioN — Encontre seu Sócio Ideal",
  description: "Plataforma de formação de sociedades com validação de competências e reputação",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <ThemeInitializer />
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
