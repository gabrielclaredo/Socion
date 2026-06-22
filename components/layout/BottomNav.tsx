"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Heart, Users, User } from "lucide-react"

const links = [
  { href: "/feed", icon: Home, label: "Início" },
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/favorites", icon: Heart, label: "Favoritos" },
  { href: "/partnerships", icon: Users, label: "Matches" },
  { href: "/settings", icon: User, label: "Perfil" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      maxWidth: 428, margin: "0 auto",
      background: "rgba(10,13,58,0.95)", backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      height: 64, display: "flex", alignItems: "stretch", zIndex: 20,
    }}>
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 3, textDecoration: "none",
          }}>
            <Icon size={20} color={active ? "#5865F2" : "#8B90A8"} />
            <span style={{ fontSize: 10, color: active ? "#5865F2" : "#8B90A8", fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
