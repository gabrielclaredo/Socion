"use client"
// nav
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, MessageSquare, User } from "lucide-react"

const links = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/partnerships", icon: Users, label: "Parcerias" },
  { href: "/dashboard", icon: MessageSquare, label: "Mensagens" },
  { href: "/settings", icon: User, label: "Perfil" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto flex items-center z-20"
      style={{ background: "var(--color-canvas)", borderTop: "1px solid var(--color-hairline)", height: 64 }}>
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center py-3 gap-0.5"
          >
            <Icon
              className="w-5 h-5 transition-colors"
              style={{ color: active ? "var(--color-block-navy)" : "rgba(0,0,0,0.35)" }}
            />
            <span
              className="text-[10px] transition-colors"
              style={{ color: active ? "var(--color-block-navy)" : "rgba(0,0,0,0.35)" }}
            >{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
