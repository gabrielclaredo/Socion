"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { LogOut, Shield, CreditCard, ChevronRight } from "lucide-react"
import { BottomNav } from "@/components/layout/BottomNav"

const ROLES = ["Tecnologia", "Marketing", "Produto", "Vendas", "Operações", "Finanças", "Design"]
const AVAILABILITY = ["10h/semana", "20h/semana", "40h/semana (Full Time)"]

interface Profile {
  id: string; name: string | null; image: string | null; headline: string | null
  location: string | null; trustScore: number; availability: string | null
  offeredRoles: string[]; plan: string; trialEndsAt: string | null
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark"
    setTheme(saved)
    document.documentElement.setAttribute("data-theme", saved)
  }, [])
  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
    document.documentElement.setAttribute("data-theme", next)
  }
  return (
    <button onClick={toggle} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 16 }}>{theme === "dark" ? "🌙" : "☀️"}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Tema {theme === "dark" ? "Escuro" : "Claro"}</span>
      </div>
      <div style={{
        width: 44, height: 24, borderRadius: 12, padding: 2,
        background: theme === "dark" ? "var(--accent)" : "var(--border)",
        display: "flex", alignItems: "center", transition: "background 0.2s",
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          transform: theme === "dark" ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.2s",
        }} />
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ headline: "", location: "", availability: "", offeredRoles: [] as string[] })

  useEffect(() => {
    fetch("/api/users/profile").then((r) => r.json()).then((d) => {
      setProfile(d)
      setForm({ headline: d.headline ?? "", location: d.location ?? "", availability: d.availability ?? "", offeredRoles: d.offeredRoles ?? [] })
    })
  }, [])

  function toggle(value: string) {
    setForm((f) => ({
      ...f,
      offeredRoles: f.offeredRoles.includes(value) ? f.offeredRoles.filter((v) => v !== value) : [...f.offeredRoles, value],
    }))
  }

  async function save() {
    setSaving(true)
    await fetch("/api/users/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    const updated = await fetch("/api/users/profile").then((r) => r.json())
    setProfile(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) {
    return (
      <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin 0.9s linear infinite" }} />
      </div>
    )
  }

  const daysLeft = profile.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(profile.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0

  const trustColor = profile.trustScore >= 80 ? "var(--success)" : profile.trustScore >= 60 ? "var(--accent)" : "var(--danger)"

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", maxWidth: 428, margin: "0 auto", paddingBottom: 80 }}>

      {/* Profile hero — accent gradient */}
      <div style={{ background: "linear-gradient(135deg, #5865F2 0%, #7B4DFF 50%, #EC48BD 100%)", padding: "52px 20px 28px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {profile.image ? (
              <Image src={profile.image} alt={profile.name ?? ""} width={72} height={72}
                style={{ borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.3)" }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(255,255,255,0.3)" }}>
                <span style={{ fontWeight: 700, fontSize: 28, color: "#fff" }}>{profile.name?.[0] ?? "?"}</span>
              </div>
            )}
            {/* Trust badge */}
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--bg-card)", border: `2px solid ${trustColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontWeight: 700, fontSize: 10, color: "var(--text)" }}>{profile.trustScore}</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.25, fontFamily: "var(--font-space, system-ui)" }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {session?.user?.email}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{
                padding: "3px 10px", fontSize: 11, fontWeight: 600,
                background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 50,
                letterSpacing: "0.05em", textTransform: "uppercase" as const,
              }}>
                {profile.plan === "PRO" ? "PRO" : `Trial · ${daysLeft}d`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trial banner */}
      {profile.plan === "TRIAL" && daysLeft > 0 && (
        <div style={{ margin: "16px 16px 0", padding: "14px 16px", background: "var(--success-light)", borderRadius: 24, border: "1px solid var(--success)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Trial ativo</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{daysLeft} dias restantes</div>
          </div>
          <a href="/settings/billing" style={{
            padding: "8px 16px", background: "var(--accent)", color: "#fff",
            fontSize: 13, fontWeight: 600, borderRadius: 50, textDecoration: "none",
          }}>Upgrade</a>
        </div>
      )}

      {/* Edit form */}
      <div style={{ margin: "16px 16px 0", background: "var(--bg-card)", borderRadius: 24, border: "1px solid var(--border)", padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", marginBottom: 16 }}>Editar Perfil</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Headline</label>
            <input value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              placeholder="Ex: CTO buscando co-fundador"
              style={{ width: "100%", padding: "10px 14px", fontSize: 14, color: "var(--text)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, outline: "none", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Localização</label>
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Ex: São Paulo, SP"
              style={{ width: "100%", padding: "10px 14px", fontSize: 14, color: "var(--text)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, outline: "none", boxSizing: "border-box" as const }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Disponibilidade</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {AVAILABILITY.map((a) => (
                <button key={a} onClick={() => setForm((f) => ({ ...f, availability: a }))}
                  style={{
                    textAlign: "left", padding: "10px 14px", fontSize: 14, fontWeight: 500,
                    borderRadius: 8, border: `1px solid ${form.availability === a ? "var(--accent)" : "var(--border)"}`,
                    background: form.availability === a ? "var(--accent-light)" : "var(--bg-elevated)",
                    color: form.availability === a ? "var(--accent)" : "var(--text)",
                    cursor: "pointer",
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Minhas habilidades</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ROLES.map((r) => (
                <button key={r} onClick={() => toggle(r)}
                  style={{
                    padding: "6px 14px", fontSize: 13, fontWeight: 500,
                    borderRadius: 50, border: `1px solid ${form.offeredRoles.includes(r) ? "var(--accent)" : "var(--border)"}`,
                    background: form.offeredRoles.includes(r) ? "var(--accent-light)" : "var(--bg-elevated)",
                    color: form.offeredRoles.includes(r) ? "var(--accent)" : "var(--text)",
                    cursor: "pointer",
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{
          width: "100%", marginTop: 20, padding: "13px 0",
          fontWeight: 600, fontSize: 15,
          background: saved ? "var(--success)" : "var(--accent)",
          color: "#fff", borderRadius: 50, border: "none",
          cursor: "pointer", opacity: saving ? 0.5 : 1,
          transition: "background 0.2s",
        }}>
          {saved ? "✓ Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      {/* Menu */}
      <div style={{ margin: "16px 16px 0", background: "var(--bg-card)", borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden" }}>
        <ThemeToggle />
        <a href="/settings/billing" style={{
          display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
          borderBottom: "1px solid var(--border)", textDecoration: "none",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={16} color="var(--accent)" />
          </div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Plano e cobrança</span>
          <ChevronRight size={16} color="var(--text-muted)" />
        </a>
        <button style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
          borderBottom: "1px solid var(--border)", background: "none", border: "none",
          borderBottom: "1px solid var(--border)", cursor: "pointer",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--success-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={16} color="var(--success)" />
          </div>
          <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Verificação de identidade</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Em breve</span>
        </button>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
          background: "none", border: "none", cursor: "pointer",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--danger-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={16} color="var(--danger)" />
          </div>
          <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 500, color: "var(--danger)" }}>Sair</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
